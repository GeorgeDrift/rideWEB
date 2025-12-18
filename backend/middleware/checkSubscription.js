
const { User } = require('../models');

/**
 * Middleware to check if user has an active subscription or is within trial period.
 * Blocks access to premium features if subscription expired and trial period ended.
 * 
 * Features protected:
 * - Creating ride share posts
 * - Creating hire posts
 * - Accepting ride requests
 * - Withdrawing funds
 */
const requireActiveSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Admin users bypass subscription checks
        if (userRole === 'admin') {
            return next();
        }

        // Only drivers need subscriptions
        if (userRole !== 'driver') {
            return next();
        }

        // Fetch user data
        const user = await User.findByPk(userId, {
            attributes: ['id', 'subscriptionStatus', 'subscriptionExpiry', 'trialStartDate', 'trialEndDate', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();

        // Check 1: Active paid subscription
        if (user.subscriptionStatus === 'active' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now) {
            console.log(`[Subscription Check] User ${userId} has active paid subscription until ${user.subscriptionExpiry}`);
            return next();
        }

        // Check 2: Within trial period (30 days from registration or trialEndDate)
        let inTrialPeriod = false;

        if (user.trialEndDate) {
            // Use trialEndDate if available
            inTrialPeriod = new Date(user.trialEndDate) > now;
        } else {
            // Fallback: calculate from registration date (30 days)
            const registrationDate = new Date(user.createdAt);
            const trialEndDate = new Date(registrationDate);
            trialEndDate.setDate(trialEndDate.getDate() + 30);
            inTrialPeriod = trialEndDate > now;
        }

        if (inTrialPeriod) {
            console.log(`[Subscription Check] User ${userId} is within 30-day trial period`);
            return next();
        }

        // Check 3: No active subscription and trial expired
        console.log(`[Subscription Check] User ${userId} subscription expired and trial period ended`);

        return res.status(403).json({
            error: 'Subscription Required',
            message: 'Your 30-day free trial has expired. Please purchase a subscription to continue using this feature.',
            code: 'SUBSCRIPTION_EXPIRED',
            trialExpired: true,
            subscriptionStatus: user.subscriptionStatus
        });

    } catch (error) {
        console.error('Subscription check middleware error:', error);
        // In case of error, fail open (allow access) to prevent blocking legitimate users
        return next();
    }
};

module.exports = { requireActiveSubscription };
