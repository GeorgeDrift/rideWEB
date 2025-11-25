
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
        // Assuming response.data contains charge_id or similar
        // Based on user snippet: response.data might be the charge object directly or nested
        // Let's assume response.data.charge_id or response.data.data.charge_id
        // We'll log it to be sure in dev, but for now map what we can.

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
                        const driverShare = transaction.amount * 0.9; // 90% to driver

                        await ride.update({
                            status: 'Completed',
                            paymentStatus: 'paid',
                            transactionRef: chargeId,
                            driverEarnings: driverShare
                        });

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
