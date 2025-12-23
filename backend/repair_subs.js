const { User, Subscription, Transaction, SubscriptionPlans } = require('./models');
const { Op } = require('sequelize');

(async () => {
    try {
        // Find all completed transactions of type Subscription that don't have a record in the Subscriptions table
        const completedTransactions = await Transaction.findAll({
            where: {
                type: 'Subscription',
                status: 'completed'
            }
        });

        console.log(`Found ${completedTransactions.length} completed subscription transactions.`);

        for (const tx of completedTransactions) {
            // Check if subscription exists for this transaction reference
            const existingSub = await Subscription.findOne({ where: { transactionId: tx.id } });

            if (!existingSub) {
                console.log(`\nRepairing subscription for User ID: ${tx.userId} (Transaction Ref: ${tx.reference})`);

                const user = await User.findByPk(tx.userId);
                if (!user) {
                    console.log(`❌ User not found for ID: ${tx.userId}`);
                    continue;
                }

                const plan = await SubscriptionPlans.findOne({ where: { price: tx.amount } });
                const duration = plan ? plan.duration : 30;
                const planName = plan ? plan.name : 'Repair Mode Plan';

                const now = new Date();
                const newExpiry = new Date(now);
                newExpiry.setDate(newExpiry.getDate() + duration);

                await Subscription.create({
                    userId: user.id,
                    plan: planName,
                    amount: tx.amount,
                    status: 'active',
                    startDate: now,
                    endDate: newExpiry,
                    paymentMethod: 'PayChangu (Restored)',
                    transactionId: tx.id
                });

                await user.update({
                    subscriptionStatus: 'active',
                    subscriptionExpiry: newExpiry
                });

                console.log(`✅ Activated! Email: ${user.email}, Expiry: ${newExpiry}`);
            } else {
                console.log(`Subscription already exists for transaction ${tx.id}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Repair failed:', error);
        process.exit(1);
    }
})();
