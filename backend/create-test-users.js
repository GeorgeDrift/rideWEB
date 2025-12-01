const { sequelize, User } = require('./models');
require('dotenv').config();

async function createTestUsers() {
    console.log('🚀 Creating Test Users...');
    console.log('----------------------------------------');

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // Simple password for testing
        const testPassword = 'password123';

        // 1. Create Test Passenger
        const passenger = await User.create({
            name: 'Test Passenger',
            email: 'passenger@test.com',
            password: testPassword,
            role: 'rider',
            phone: '0999111111'
        });
        console.log('\n✅ Created Passenger:');
        console.log(`   Email: ${passenger.email}`);
        console.log(`   Password: password123`);
        console.log(`   ID: ${passenger.id}`);

        // 2. Create Test Driver
        const driver = await User.create({
            name: 'Test Driver',
            email: 'driver@test.com',
            password: testPassword,
            role: 'driver',
            phone: '0999222222',
            walletBalance: 0,
            vehicleModel: 'Toyota Corolla',
            vehiclePlate: 'MWI 1234',
            airtelMoneyNumber: '0999222222',
            subscriptionStatus: 'active',
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        console.log('\n✅ Created Driver:');
        console.log(`   Email: ${driver.email}`);
        console.log(`   Password: password123`);
        console.log(`   ID: ${driver.id}`);
        console.log(`   Wallet Balance: ${driver.walletBalance}`);

        console.log('\n🎉 Test users created successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('   Passenger: passenger@test.com / password123');
        console.log('   Driver: driver@test.com / password123');

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log('\n⚠️ Users already exist. Fetching...');
            const passenger = await User.findOne({ where: { email: 'passenger@test.com' } });
            const driver = await User.findOne({ where: { email: 'driver@test.com' } });

            console.log('\n✅ Passenger:', passenger.email, passenger.id);
            console.log('✅ Driver:', driver.email, driver.id, `Balance: ${driver.walletBalance}`);
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await sequelize.close();
    }
}

createTestUsers();
