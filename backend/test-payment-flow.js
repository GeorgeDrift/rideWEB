const { sequelize, User, Ride, Transaction } = require('./models');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function testPaymentFlow() {
    console.log('🚀 Starting Payment Flow Test (PayChangu Integration)...');
    console.log('----------------------------------------');

    try {
        // 1. Connect to DB
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // 2. Create Dummy Users
        const riderEmail = `test_rider_${Date.now()}@example.com`;
        const driverEmail = `test_driver_${Date.now()}@example.com`;

        const rider = await User.create({
            name: 'Test Rider',
            email: riderEmail,
            password: 'password123',
            role: 'rider',
            phone: '0999111111'
        });
        console.log(`✅ Created Rider: ${rider.email} (${rider.id})`);

        const driver = await User.create({
            name: 'Test Driver',
            email: driverEmail,
            password: 'password123',
            role: 'driver',
            phone: '0999222222',
            walletBalance: 0
        });
        console.log(`✅ Created Driver: ${driver.email} (${driver.id})`);

        // 3. Create Dummy Ride
        const ride = await Ride.create({
            type: 'share',
            origin: 'Lilongwe',
            destination: 'Blantyre',
            price: 5000,
            driverId: driver.id,
            riderId: rider.id,
            status: 'Payment Due',
            paymentStatus: 'pending'
        });
        console.log(`✅ Created Ride: ${ride.id} - Price: ${ride.price}`);

        // 4. Simulate Payment Initiation (Transaction Creation)
        const amount = ride.price;
        const transactionRef = `TEST-REF-${uuidv4()}`;

        console.log('\n4. Simulating PayChangu Payment Initiation...');
        const transaction = await Transaction.create({
            userId: rider.id,
            type: 'Ride Payment',
            amount: amount,
            direction: 'debit',
            status: 'pending',
            reference: transactionRef,
            relatedId: ride.id,
            description: `Payment for Ride ${ride.id}`
        });
        console.log(`✅ Created Pending Transaction: ${transaction.id}`);

        // 5. Simulate Payment Verification (Success)
        console.log('\n5. Simulating PayChangu Payment Success...');

        // Update Transaction
        await transaction.update({ status: 'completed' });
        console.log('✅ Transaction marked as completed.');

        // Update Ride
        // 100% to Driver (No Platform Fee)
        const driverShare = amount;
        await ride.update({
            status: 'Completed',
            paymentStatus: 'paid',
            transactionRef: transactionRef,
            platformFee: 0,
            driverEarnings: driverShare
        });
        console.log(`✅ Ride updated to Completed. Driver Earnings: ${driverShare} (100%)`);

        // Credit Driver
        await driver.increment('walletBalance', { by: driverShare });
        // Reload driver to get new balance
        await driver.reload();
        console.log(`✅ Driver Wallet Credited. New Balance: ${driver.walletBalance}`);

        // 6. Final Verification
        console.log('\n6. Verifying Final State...');
        const finalTransaction = await Transaction.findByPk(transaction.id);
        const finalRide = await Ride.findByPk(ride.id);
        const finalDriver = await User.findByPk(driver.id);

        if (finalTransaction.status === 'completed' &&
            finalRide.paymentStatus === 'paid' &&
            finalDriver.walletBalance === driverShare) {
            console.log('🎉 SUCCESS: All records updated correctly!');
        } else {
            console.error('❌ FAILURE: State mismatch.');
            console.log('Transaction Status:', finalTransaction.status);
            console.log('Ride Payment Status:', finalRide.paymentStatus);
            console.log('Driver Balance:', finalDriver.walletBalance);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testPaymentFlow();
