
const { Transaction, Ride, User, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const payChanguService = require('../services/payChanguService');

/**
 * Get supported mobile money operators
 */
exports.getOperators = async (req, res) => {
    try {
        const operators = await payChanguService.getMobileMoneyOperators();
        res.json(operators);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Initiate Payment
 */
exports.initiatePayment = async (req, res) => {
    const { rideId, amount, mobileNumber, providerRefId } = req.body;
    const io = req.app.get('io');

    console.log(`💰 [PayChangu] Initiating charge: ${amount} to ${mobileNumber} for Ride ${rideId}`);

    try {
        // 1. Create Pending Transaction in DB
        const transaction = await Transaction.create({
            userId: req.user.id,
            type: 'Ride Payment',
            amount: amount,
            direction: 'debit',
            status: 'pending',
            reference: `PENDING-${uuidv4()}`, // Temporary ref until we get one from PayChangu
            relatedId: rideId,
            description: `Payment for Ride ${rideId}`
        });

        // 2. Call PayChangu API
        const paymentResponse = await payChanguService.initiatePayment({
            mobile: mobileNumber,
            amount: amount,
            mobile_money_operator_ref_id: providerRefId
        });

        // 3. Update Transaction with PayChangu details
        const chargeId = paymentResponse.data?.charge_id || paymentResponse.charge_id;

        await transaction.update({
            reference: chargeId || transaction.reference,
            description: `PayChangu Charge ID: ${chargeId}`
        });

        res.json({
            status: 'success',
            message: 'Payment initiated. Please approve on your phone.',
            data: paymentResponse
        });

    } catch (err) {
        console.error("Payment Initiation Error:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Verify Payment (Polled by client or called via webhook)
 */
exports.verifyPayment = async (req, res) => {
    const { chargeId } = req.params;
    const io = req.app.get('io');

    try {
        const verification = await payChanguService.verifyPayment(chargeId);
        const status = verification.data?.status; // 'success', 'pending', 'failed'

        if (status === 'success') {
            // Find transaction by reference (chargeId)
            const transaction = await Transaction.findOne({ where: { reference: chargeId } });

            if (transaction && transaction.status !== 'completed') {
                await transaction.update({ status: 'completed' });

                // Update Ride
                if (transaction.relatedId) {
                    const ride = await Ride.findByPk(transaction.relatedId);
                    if (ride) {
                        // 100% to Driver (No Platform Fee)
                        const driverShare = transaction.amount;

                        // UPDATE LOGIC: Split based on type
                        // Hire: Payment just marks as paid. Completion happens at Return.
                        // Share: Payment marks as Completed (end of trip).
                        const updates = {
                            paymentStatus: 'paid',
                            transactionRef: chargeId,
                            platformFee: 0,
                            driverEarnings: driverShare
                        };

                        if (ride.type === 'share') {
                            updates.status = 'Completed';
                        }
                        // For 'hire', we do NOT change status to Completed here. 
                        // It stays as 'Scheduled' or 'Awaiting Payment Selection' until Handover.

                        await ride.update(updates);

                        // Credit Driver
                        const driver = await User.findByPk(ride.driverId);
                        if (driver) {
                            await driver.increment('walletBalance', { by: driverShare });

                            // Notify Driver
                            io.to(`user_${ride.driverId}`).emit('notification', {
                                title: 'Payment Received',
                                msg: `You received MWK ${driverShare} for Ride #${ride.id}`,
                                time: new Date().toISOString()
                            });
                        }

                        // Notify Rider/Room
                        io.to(`ride_${ride.id}`).emit('payment_success', {
                            amount: transaction.amount,
                            transactionRef: chargeId
                        });
                    }
                }
            }
        }

        res.json(verification);

    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Handle PayChangu Webhook
 */
exports.handleWebhook = async (req, res) => {
    const crypto = require('crypto');
    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    try {
        // 1. Validate Signature
        const signature = req.headers['signature'];

        if (!webhookSecret) {
            console.error('❌ Webhook Secret not configured');
            return res.status(500).send('Server Configuration Error');
        }

        if (!signature) {
            console.warn('⚠️ Webhook missing signature');
            return res.status(400).send('Missing signature header');
        }

        // Use rawBody captured in server.js middleware
        const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

        const computedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');

        if (computedSignature !== signature) {
            console.warn('⚠️ Invalid Webhook Signature');
            return res.status(403).send('Invalid webhook request');
        }

        // 2. Process Webhook Data
        const webhookData = req.body;
        console.log('🔔 Received Webhook:', JSON.stringify(webhookData, null, 2));

        const { charge_id, status } = webhookData;
        // Adjust based on actual PayChangu webhook structure. 
        // User snippet just logs it. We should update the transaction.

        // Example structure assumption based on typical gateways:
        // { event: 'charge.success', data: { charge_id: '...', ... } }
        // Or flat: { charge_id: '...', status: 'success', ... }

        // We'll use the charge_id to find the transaction
        const refId = charge_id || webhookData.data?.charge_id;
        const newStatus = status || webhookData.data?.status;

        if (refId && newStatus === 'success') {
            const transaction = await Transaction.findOne({
                where: {
                    [sequelize.Sequelize.Op.or]: [
                        { reference: refId },
                        { description: { [sequelize.Sequelize.Op.like]: `%${refId}%` } }
                    ]
                }
            });

            if (transaction && transaction.status !== 'completed') {
                await transaction.update({ status: 'completed' });

                // Update Ride
                if (transaction.relatedId) {
                    const ride = await Ride.findByPk(transaction.relatedId);
                    if (ride) {
                        const driverShare = transaction.amount * 0.9;
                        await ride.update({
                            status: 'Completed',
                            paymentStatus: 'paid',
                            transactionRef: refId,
                            driverEarnings: driverShare
                        });

                        const driver = await User.findByPk(ride.driverId);
                        if (driver) {
                            await driver.increment('walletBalance', { by: driverShare });

                            req.app.get('io').to(`user_${ride.driverId}`).emit('notification', {
                                title: 'Payment Received',
                                msg: `Ride #${ride.id} paid via Webhook`,
                                time: new Date().toISOString()
                            });
                        }

                        req.app.get('io').to(`ride_${ride.id}`).emit('payment_success', {
                            amount: transaction.amount,
                            transactionRef: refId
                        });
                    }
                }
            }
        }

        res.status(200).send('Webhook processed successfully');

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Request Payout (Driver Withdrawal)
 */
exports.requestPayout = async (req, res) => {
    const { amount, mobileNumber, providerRefId, payoutMethod } = req.body;
    const userId = req.user.id;

    console.log(`💸 [Payout] Driver ${userId} requesting ${amount} via ${payoutMethod || 'mobile'} to ${mobileNumber || 'Bank'}`);

    try {
        // 1. Validate Driver Role and fetch user data
        const user = await User.findByPk(userId);
        if (!user || user.role !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can request payouts' });
        }

        // 2. Check Subscription Status (must have active subscription or be within trial)
        const now = new Date();
        let hasActiveAccess = false;

        // Check paid subscription
        if (user.subscriptionStatus === 'active' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now) {
            hasActiveAccess = true;
        }

        // Check trial period
        if (!hasActiveAccess) {
            if (user.trialEndDate && new Date(user.trialEndDate) > now) {
                hasActiveAccess = true;
            } else {
                // Fallback: calculate from registration (30 days)
                const registrationDate = new Date(user.createdAt);
                const trialEndDate = new Date(registrationDate);
                trialEndDate.setDate(trialEndDate.getDate() + 30);
                if (trialEndDate > now) {
                    hasActiveAccess = true;
                }
            }
        }

        if (!hasActiveAccess) {
            return res.status(403).json({
                error: 'Subscription Required',
                message: 'Your 30-day free trial has expired. Please purchase a subscription to withdraw funds.',
                code: 'SUBSCRIPTION_EXPIRED'
            });
        }

        // 3. Check Wallet Balance
        if (user.walletBalance < amount) {
            return res.status(400).json({
                error: 'Insufficient balance',
                currentBalance: user.walletBalance,
                requestedAmount: amount
            });
        }

        // 3. Deduct from Wallet (Optimistic)
        await user.decrement('walletBalance', { by: amount });

        // 4. Create Payout Transaction
        const chargeId = `PAYOUT-${uuidv4()}`;
        const transaction = await Transaction.create({
            userId: userId,
            type: 'Payout',
            amount: amount,
            direction: 'credit',
            status: 'pending',
            reference: chargeId,
            description: payoutMethod === 'bank'
                ? `Manual Bank Payout to ${user.bankName} - ${user.payoutAccountNumber}`
                : `Payout to ${mobileNumber}`
        });

        // 5. Process Payout based on Method
        if (payoutMethod === 'bank') {
            // Manual Process for Bank
            // In a real app, this might trigger an email to admin or add to a batch queue.
            // For now, we leave it as 'pending' for admin review, or mark auto-complete for demo.
            // Let's mark as 'pending' and return success message.

            res.json({
                status: 'success',
                message: 'Bank withdrawal requested. Processing time: 1-3 business days.',
                data: { reference: chargeId },
                newBalance: user.walletBalance - amount
            });
            return;
        }

        // DEFAULT: Mobile Money via PayChangu
        try {
            // Auto-resolve operator if providerRefId is missing or invalid (e.g., 'AIRTEL' string)
            let operatorRefId = providerRefId;

            if (!operatorRefId || typeof operatorRefId === 'string' && operatorRefId.length < 10) {
                console.log(`🔍 [Payout] Invalid operator ID "${operatorRefId}", fetching from PayChangu...`);

                // Fetch valid operators
                const operators = await payChanguService.getMobileMoneyOperators();
                console.log('📋 [Payout] Available operators:', JSON.stringify(operators, null, 2));

                // Match by name (case-insensitive) or default to first operator
                const carrierName = providerRefId || user.payoutMethod || 'AIRTEL';
                const matchedOperator = operators.find(op =>
                    op.name?.toUpperCase().includes(carrierName.toUpperCase()) ||
                    op.operator_name?.toUpperCase().includes(carrierName.toUpperCase())
                );

                if (matchedOperator) {
                    operatorRefId = matchedOperator.ref_id || matchedOperator.id;
                    console.log(`✅ [Payout] Matched operator: ${matchedOperator.name} (${operatorRefId})`);
                } else {
                    console.warn(`⚠️ [Payout] No operator matched "${carrierName}", using first available`);
                    operatorRefId = operators[0]?.ref_id || operators[0]?.id;
                }
            }

            const payoutResponse = await payChanguService.initiatePayout({
                mobile: mobileNumber,
                amount: amount,
                mobile_money_operator_ref_id: operatorRefId,
                charge_id: chargeId,
                email: user.email,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ')[1] || ''
            });

            // 6. Update Transaction Status
            await transaction.update({
                status: 'completed',
                description: `Payout completed: ${payoutResponse.data?.ref_id || chargeId}`
            });

            res.json({
                status: 'success',
                message: 'Payout processed successfully',
                data: payoutResponse,
                newBalance: user.walletBalance - amount
            });

        } catch (payoutError) {
            // 7. Rollback on Failure
            console.error('Payout failed, rolling back:', payoutError);
            await user.increment('walletBalance', { by: amount });
            await transaction.update({ status: 'failed' });

            res.status(500).json({
                error: 'Payout failed',
                message: payoutError.message,
                balanceRestored: true
            });
        }

    } catch (err) {
        console.error("Payout Request Error:", err);
        res.status(500).json({ error: err.message });
    }
};

