const { User, Transaction, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');
const payChanguService = require('../services/payChanguService');

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
    monthly: {
        name: 'Monthly Plan',
        price: 5000, // MWK 5,000
        duration: 30, // days
        description: 'Full access for 30 days'
    },
    yearly: {
        name: 'Yearly Plan',
        price: 50000, // MWK 50,000 (2 months free)
        duration: 365, // days
        description: 'Full access for 365 days - Save 2 months!'
    }
};

// Get available subscription plans
exports.getPlans = async (req, res) => {
    try {
        res.json({
            plans: SUBSCRIPTION_PLANS,
            trialDays: 7 // 7 days free trial for new drivers
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
};

// Initiate subscription payment
exports.initiateSubscriptionPayment = async (req, res) => {
    try {
        const { plan, mobileNumber, providerRefId } = req.body;
        const userId = req.user.id;

        // Validate plan
        if (!SUBSCRIPTION_PLANS[plan]) {
            return res.status(400).json({ error: 'Invalid subscription plan' });
        }

        // Verify user is a driver
        const user = await User.findByPk(userId);
        if (!user || user.role !== 'driver') {
            return res.status(403).json({ error: 'Only drivers can purchase subscriptions' });
        }

        const selectedPlan = SUBSCRIPTION_PLANS[plan];

        // Create transaction record
        const transaction = await Transaction.create({
            userId,
            type: 'Subscription',
            amount: selectedPlan.price,
            direction: 'debit',
            status: 'pending',
            description: `${selectedPlan.name} - ${selectedPlan.description}`,
            relatedId: userId // Link to user for subscription
        });

        // Initiate payment via PayChangu
        const paymentResult = await payChanguService.initiatePayment({
            amount: selectedPlan.price,
            currency: 'MWK',
            email: user.email,
            first_name: user.name.split(' ')[0] || user.name,
            last_name: user.name.split(' ')[1] || '',
            callback_url: `${process.env.BACKEND_URL}/api/subscriptions/webhook`,
            return_url: `${process.env.FRONTEND_URL}/driver/dashboard?tab=subscription`,
            tx_ref: transaction.id,
            title: selectedPlan.name,
            description: selectedPlan.description,
            mobile_number: mobileNumber,
            provider_ref_id: providerRefId,
            metadata: {
                userId,
                plan,
                duration: selectedPlan.duration,
                transactionId: transaction.id
            }
        });

        if (!paymentResult.success) {
            await transaction.update({ status: 'failed' });
            return res.status(400).json({
                error: 'Payment initiation failed',
                message: paymentResult.message
            });
        }

        // Update transaction with PayChangu reference
        await transaction.update({
            reference: paymentResult.data.charge_id
        });

        res.json({
            success: true,
            chargeId: paymentResult.data.charge_id,
            status: paymentResult.data.status,
            amount: selectedPlan.price,
            plan: selectedPlan.name,
            message: 'Payment initiated. Please check your phone to complete the payment.'
        });

    } catch (error) {
        console.error('Subscription payment error:', error);
        res.status(500).json({ error: 'Failed to initiate subscription payment' });
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
                const plan = metadata?.plan || 'monthly';
                const duration = metadata?.duration || SUBSCRIPTION_PLANS[plan].duration;

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
                    plan: plan,
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
                        plan: SUBSCRIPTION_PLANS[plan].name
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
                    const metadata = verification.data.metadata || {};
                    const plan = metadata.plan || 'monthly';
                    const duration = metadata.duration || SUBSCRIPTION_PLANS[plan].duration;

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
                        plan: plan,
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
            expiry: expiry,
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
