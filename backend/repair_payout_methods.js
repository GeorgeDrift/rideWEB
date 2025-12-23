const { User } = require('./models');

(async () => {
    try {
        const drivers = await User.findAll({ where: { role: 'driver', payoutMethod: null } });
        console.log(`Found ${drivers.length} drivers with null payoutMethod.`);

        for (const driver of drivers) {
            let method = null;
            if (driver.bankName) method = 'Bank';
            else if (driver.airtelMoneyNumber) method = 'Airtel Money';
            else if (driver.mpambaNumber) method = 'Mpamba';

            if (method) {
                driver.payoutMethod = method;
                await driver.save();
                console.log(`✅ Updated ${driver.email} -> ${method}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Repair failed:', error);
        process.exit(1);
    }
})();
