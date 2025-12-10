const { sequelize, Transaction, Ride } = require('./models');

const markPendingAsCompleted = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find all pending transactions
        const pending = await Transaction.findAll({ where: { status: 'pending' } });
        console.log(`Found ${pending.length} pending transactions.`);

        for (const trx of pending) {
            await trx.update({ status: 'completed' });

            // If it has a related Ride, update that too
            if (trx.relatedId) {
                const ride = await Ride.findByPk(trx.relatedId);
                if (ride) {
                    await ride.update({
                        paymentStatus: 'paid',
                        status: 'Completed'
                    });
                }
            }
        }

        console.log('✅ All pending transactions marked as COMPLETED.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

markPendingAsCompleted();
