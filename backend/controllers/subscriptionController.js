const { User, Transaction, Subscription, SubscriptionPlans, sequelize } = require('../models');
const { Op } = require('sequelize');
const payChanguService = require('../services/payChanguService');

// Get available subscription plans
exports.getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlans.findAll({
            where: { isActive: true },
            order: [['price', 'ASC']]
        });
        res.json({
            plans: plans, // Returns array of plan objects
            trialDays: 7
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
};

// Admin: Create a new plan
exports.createPlan = async (req, res) => {
    try {
        const { name, price, duration, description } = req.body;
        const newPlan = await SubscriptionPlans.create({ name, price, duration, description });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update a plan
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlans.findByPk(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        await plan.update(req.body);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Initiate subscription payment
exports.initiateSubscriptionPayment = async (req, res) => {
    const { planId, mobileNumber, providerRefId } = req.body; // Changed 'plan' to 'planId' for clarity, but support both if needed
    const userId = req.user.id;

    console.log(`💰 [SUBSCRIPTION] Initiating payment for plan ID: ${planId} for user ${userId}`);

    try {
        // Fetch plan from DB
        const selectedPlan = await SubscriptionPlans.findByPk(planId);

        if (!selectedPlan) {
            return res.status(400).json({ error: 'Invalid subscription plan' });
        }

        // Verify user is a driver
        const user = await User.findByPk(userId);
        if (!user || user.role !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can purchase subscriptions' });
        }

        // 1. Create Pending Transaction in DB
        const transaction = await Transaction.create({
            userId,
            type: 'Subscription',
            amount: selectedPlan.price,
            direction: 'debit',
            status: 'pending',
            reference: `PENDING-SUB-${Date.now()}`,
            relatedId: userId,
            description: `${selectedPlan.name} Subscription (${selectedPlan.duration} days)`
        });

        console.log('✅ Transaction created:', transaction.id);

        // 2. Call PayChangu API
        const paymentResponse = await payChanguService.initiatePayment({
            mobile: mobileNumber,
            amount: selectedPlan.price,
            mobile_money_operator_ref_id: providerRefId
        });

        console.log('📥 PayChangu response received');

        // 3. Update Transaction with PayChangu details
        const chargeId = paymentResponse.data?.charge_id || paymentResponse.charge_id;

        await transaction.update({
            reference: chargeId || transaction.reference,
            description: `PayChangu Charge ID: ${chargeId} | Plan: ${selectedPlan.id}`
        });

        console.log('✅ Payment initiated successfully. Charge ID:', chargeId);

        res.json({
            status: 'success',
            message: 'Payment initiated. Please approve on your phone.',
            chargeId: chargeId,
            data: paymentResponse
        });

    } catch (err) {
        console.error("Subscription Payment Initiation Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Webhook handler for PayChangu notifications
exports.handleWebhook = async (req, res) => {
    try {
        const payload = req.body;

        console.log('Subscription webhook received:', payload);

        // Validate webhook (implement signature verification in production)
        // const isValid = payChanguService.verifyWebhookSignature(req);
        // if (!isValid) {
        //     return res.status(401).json({ error: 'Invalid webhook signature' });
        // }

        const { charge_id, status, metadata, tx_ref } = payload;

        // Find transaction
        const transaction = await Transaction.findOne({
            where: { reference: charge_id }
        });

        if (!transaction) {
            console.error('Transaction not found for charge_id:', charge_id);
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Process based on payment status
        if (status === 'successful' || status === 'success') {
            // Update transaction status
            await transaction.update({ status: 'completed' });

            // Activate subscription
            const user = await User.findByPk(transaction.userId);
            if (user) {
                // Parse Plan ID from transaction description "PayChangu Charge ID: ... | Plan: 123"
                let planId = null;
                const match = transaction.description.match(/Plan:\s*(\d+)/);
                if (match) {
                    planId = match[1];
                }

                // Fallback: Find plan by amount if not found in description
                let plan = null;
                if (planId) {
                    plan = await SubscriptionPlans.findByPk(planId);
                } else {
                    plan = await SubscriptionPlans.findOne({ where: { price: transaction.amount } });
                }

                // If still no plan found, default to 30 days (Manual override safe guard)
                const duration = plan ? plan.duration : 30;
                const planName = plan ? plan.name : 'Unknown Plan';

                // Calculate new expiry date
                // Check for existing active subscription
                const activeSub = await Subscription.findOne({
                    where: {
                        userId: user.id,
                        status: 'active',
                        endDate: { [Op.gt]: new Date() }
                    },
                    order: [['endDate', 'DESC']]
                });

                const currentExpiry = activeSub ? new Date(activeSub.endDate) : new Date();
                const newExpiry = new Date(currentExpiry);
                newExpiry.setDate(newExpiry.getDate() + duration);

                // Create Subscription Record
                await Subscription.create({
                    userId: user.id,
                    plan: planName, // Storing Name as 'plan' field is string/enum (we relaxed enum constraint)
                    amount: transaction.amount,
                    status: 'active',
                    startDate: new Date(),
                    endDate: newExpiry,
                    paymentMethod: 'PayChangu',
                    transactionId: transaction.id
                });

                // Update user status for quick access (optional, but good for caching)
                await user.update({
                    subscriptionStatus: 'active',
                    subscriptionExpiry: newExpiry
                });

                console.log(`Subscription activated for user ${user.id} until ${newExpiry}`);

                // Emit socket event for real-time update
                const io = req.app.get('io');
                if (io) {
                    io.to(user.id).emit('subscription_activated', {
                        status: 'active',
                        expiry: newExpiry,
                        plan: planName
                    });
                }
            }

            res.json({ success: true, message: 'Subscription activated' });

        } else if (status === 'failed' || status === 'cancelled') {
            await transaction.update({ status: 'failed' });
            res.json({ success: true, message: 'Payment failed' });

        } else {
            // Pending or other status
            res.json({ success: true, message: 'Payment status updated' });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Verify subscription payment status
exports.verifyPayment = async (req, res) => {
    try {
        const { chargeId } = req.params;
        const userId = req.user.id;

        // Find transaction
        const transaction = await Transaction.findOne({
            where: {
                reference: chargeId,
                userId
            }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Verify with PayChangu
        const verification = await payChanguService.verifyPayment(chargeId);

        if (!verification.success) {
            return res.status(400).json({
                error: 'Verification failed',
                message: verification.message
            });
        }

        const status = verification.data.status;

        // Update transaction if status changed
        if (status === 'successful' || status === 'success') {
            if (transaction.status !== 'completed') {
                await transaction.update({ status: 'completed' });

                // Activate subscription if not already done
                // Check if subscription record exists for this transaction
                const existingSub = await Subscription.findOne({ where: { transactionId: transaction.id } });

                if (!existingSub) {
                    const user = await User.findByPk(userId);

                    // Logic to find plan details similar to webhook
                    let planId = null;
                    const match = transaction.description.match(/Plan:\s*(\d+)/);
                    if (match) planId = match[1];

                    let plan = null;
                    if (planId) {
                        plan = await SubscriptionPlans.findByPk(planId);
                    } else {
                        plan = await SubscriptionPlans.findOne({ where: { price: transaction.amount } });
                    }

                    const duration = plan ? plan.duration : 30;
                    const planName = plan ? plan.name : 'Monthly Plan';

                    // Check for existing active subscription
                    const activeSub = await Subscription.findOne({
                        where: {
                            userId: userId,
                            status: 'active',
                            endDate: { [Op.gt]: new Date() }
                        },
                        order: [['endDate', 'DESC']]
                    });

                    const currentExpiry = activeSub ? new Date(activeSub.endDate) : new Date();
                    const newExpiry = new Date(currentExpiry);
                    newExpiry.setDate(newExpiry.getDate() + duration);

                    // Create Subscription Record
                    await Subscription.create({
                        userId: userId,
                        plan: planName,
                        amount: transaction.amount,
                        status: 'active',
                        startDate: new Date(),
                        endDate: newExpiry,
                        paymentMethod: 'PayChangu',
                        transactionId: transaction.id
                    });

                    await user.update({
                        subscriptionStatus: 'active',
                        subscriptionExpiry: newExpiry
                    });
                }
            }

            // Get updated expiry
            const latestSub = await Subscription.findOne({
                where: { userId, status: 'active' },
                order: [['endDate', 'DESC']]
            });

            return res.json({
                status: 'success',
                message: 'Subscription activated successfully',
                subscriptionExpiry: latestSub ? latestSub.endDate : null
            });

        } else if (status === 'failed' || status === 'cancelled') {
            await transaction.update({ status: 'failed' });
            return res.json({
                status: 'failed',
                message: 'Payment failed'
            });

        } else {
            return res.json({
                status: 'pending',
                message: 'Payment is still pending'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// Get current subscription status
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check Subscription table
        const activeSub = await Subscription.findOne({
            where: {
                userId,
                status: 'active',
                endDate: { [Op.gt]: new Date() }
            },
            order: [['endDate', 'DESC']]
        });

        const user = await User.findByPk(userId, {
            attributes: ['createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const expiry = activeSub ? new Date(activeSub.endDate) : null;
        const isActive = !!activeSub;

        // Calculate days remaining
        let daysRemaining = 0;
        if (expiry && expiry > now) {
            daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        }

        // Check if in trial period (7 days from registration)
        const accountAge = Math.ceil((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
        const inTrialPeriod = accountAge <= 7 && !isActive; // Only show trial if no active sub

        res.json({
            status: isActive || inTrialPeriod ? 'active' : 'inactive',
            plan: activeSub ? activeSub.plan : null,
            startDate: activeSub ? activeSub.startDate : null,
            expiryDate: expiry,
            daysRemaining: isActive ? daysRemaining : 0,
            inTrialPeriod,
            trialDaysRemaining: inTrialPeriod ? Math.max(0, 7 - accountAge) : 0,
            needsRenewal: daysRemaining > 0 && daysRemaining <= 7
        });

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

// Get subscription payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.findAll({
            where: {
                userId,
                type: 'Subscription'
            },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json(transactions);

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

module.exports = exports;
