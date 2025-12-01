const { sequelize, User, Ride, Transaction } = require('./models');

async function fetchLatestData() {
    console.log('🔍 Fetching latest data from database...');
    console.log('----------------------------------------');

    try {
        await sequelize.authenticate();

        // Fetch latest Driver
        const driver = await User.findOne({
            where: { role: 'driver' },
            order: [['createdAt', 'DESC']]
        });

        if (driver) {
            console.log('\n👤 LATEST DRIVER DETAILS:');
            console.log('-------------------------');
            console.log(`ID: ${driver.id}`);
            console.log(`Name: ${driver.name}`);
            console.log(`Email: ${driver.email}`);
            console.log(`Role: ${driver.role}`);
            console.log(`Phone: ${driver.phone}`);
            console.log(`Wallet Balance: ${driver.walletBalance}`);
            console.log(`Created At: ${driver.createdAt}`);
        } else {
            console.log('\n❌ No drivers found.');
        }

        // Fetch latest Ride
        const ride = await Ride.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (ride) {
            console.log('\nCX LATEST RIDE DETAILS:');
            console.log('-------------------------');
            console.log(`ID: ${ride.id}`);
            console.log(`Status: ${ride.status}`);
            console.log(`Payment Status: ${ride.paymentStatus}`);
            console.log(`Price: ${ride.price}`);
            console.log(`Driver Earnings: ${ride.driverEarnings}`);
            console.log(`Driver ID: ${ride.driverId}`);
        } else {
            console.log('\n❌ No rides found.');
        }

    } catch (error) {
        console.error('❌ Error fetching data:', error);
    } finally {
        await sequelize.close();
    }
}

fetchLatestData();
