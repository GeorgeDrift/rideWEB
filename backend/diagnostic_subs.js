const { User, Subscription, Transaction, SubscriptionPlans } = require('./models');

(async () => {
    try {
        const users = await User.findAll({ limit: 10, order: [['createdAt', 'DESC']] });
        console.log('--- Recent Users ---');
        users.forEach(u => console.log(`${u.id}: ${u.email} (${u.role})`));

        const subs = await Subscription.findAll({ include: [{ model: User, as: 'user' }] });
        console.log('\n--- All Subscriptions ---');
        subs.forEach(s => {
            console.log(`User: ${s.user?.email || 'N/A'}, Plan: ${s.plan}, Status: ${s.status}, End: ${s.endDate}`);
        });

        const txs = await Transaction.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log('\n--- Recent Transactions ---');
        txs.forEach(t => {
            console.log(`User ID: ${t.userId}, Amount: ${t.amount}, Type: ${t.type}, Status: ${t.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
})();
