const { SubscriptionPlans, Subscription, Transaction } = require('./models');

(async () => {
    try {
        console.log('Resetting subscription plans and wiping legacy data...');

        // Wipe existing plans and legacy subscription/transaction records
        await Subscription.destroy({ where: {}, truncate: true });
        await Transaction.destroy({ where: { type: 'Subscription' } });
        await SubscriptionPlans.destroy({ where: {}, truncate: true });

        console.log('🗑️ Legacy subscription data wiped.');

        await SubscriptionPlans.bulkCreate([
            {
                name: 'Real Payment Test',
                price: 50, // MWK 50 for real small payment testing
                duration: 30,
                description: 'Testing purposes only - Small real payment',
                isActive: true
            },
            {
                name: 'RideX Subscription',
                price: 5000, // MWK 5,000
                duration: 30,
                description: 'Full access to RideX marketplace and driver tools',
                isActive: true
            }
        ]);

        console.log('✅ Standard MWK 5000 plan created successfully!');

        // Display all plans
        const plans = await SubscriptionPlans.findAll({ where: { isActive: true } });
        console.log('\nCurrent active plans:');
        console.log(JSON.stringify(plans, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
