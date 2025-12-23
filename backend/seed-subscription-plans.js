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
                name: 'Basic - 1 Month',
                price: 5000,
                duration: 30,
                description: 'Full access to RideX marketplace and driver tools for 30 days',
                isActive: true
            },
            {
                name: 'Standard - 3 Months',
                price: 13500,
                duration: 90,
                description: 'Save 10% - Full access for 3 months',
                isActive: true
            },
            {
                name: 'Premium - 6 Months',
                price: 25000,
                duration: 180,
                description: 'Save 15% - Best value for long term drivers',
                isActive: true
            },
            {
                name: 'Real Payment Test',
                price: 50,
                duration: 30,
                description: 'Testing purposes only - Small real payment (MWK 50)',
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
