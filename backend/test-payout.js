const { sequelize, User, Transaction } = require('./models');
const { v4: uuidv4 } = require('uuid');
const payChanguService = require('./services/payChanguService');
require('dotenv').config();

async function testPayout() {
    console.log('🚀 Starting Payout Test...');
    console.log('----------------------------------------');

    try {
        // 1. Connect to DB
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // 2. Find a driver with balance (or create one)
        let driver = await User.findOne({
            where: { role: 'driver' },
            order: [['walletBalance', 'DESC']]
        });

        if (!driver || driver.walletBalance === 0) {
            console.log('⚠️ No driver with balance found. Creating test driver...');
            driver = await User.create({
                name: 'Test Driver Payout',
                email: `test_driver_payout_${Date.now()}@example.com`,
                password: 'password123',
                role: 'driver',
                phone: '0999222222',
                walletBalance: 10000 // 10,000 MWK
            });
            console.log(`✅ Created Driver: ${driver.email} with balance: ${driver.walletBalance}`);
        } else {
            console.log(`✅ Found Driver: ${driver.email} with balance: ${driver.walletBalance}`);
        }

        // 3. Simulate Payout Request
        const payoutAmount = 1000; // 1,000 MWK
        const mobileNumber = '0999000000'; // Test number
        const operatorRefId = '20be6c20-adeb-4b5b-a7ba-0769820df4fb'; // Airtel Money

        console.log(`\n💸 Requesting payout of ${payoutAmount} to ${mobileNumber}...`);

        // Check balance
        if (driver.walletBalance < payoutAmount) {
            console.error('❌ Insufficient balance for payout test');
            return;
        }

        // Deduct from wallet
        const initialBalance = driver.walletBalance;
        await driver.decrement('walletBalance', { by: payoutAmount });
        await driver.reload();
        console.log(`✅ Wallet debited: ${initialBalance} → ${driver.walletBalance}`);

        // Create transaction
        const chargeId = `PAYOUT-${uuidv4()}`;
        const transaction = await Transaction.create({
            userId: driver.id,
            type: 'Payout',
            amount: payoutAmount,
            direction: 'credit',
            status: 'pending',
            reference: chargeId,
            description: `Payout to ${mobileNumber}`
        });
        console.log(`✅ Created Payout Transaction: ${transaction.id}`);

        // Call PayChangu API
        console.log('\n📡 Calling PayChangu Payout API...');
        try {
            const payoutResponse = await payChanguService.initiatePayout({
                mobile: mobileNumber,
                amount: payoutAmount,
                mobile_money_operator_ref_id: operatorRefId,
                charge_id: chargeId,
                email: driver.email,
                first_name: driver.name.split(' ')[0],
                last_name: driver.name.split(' ')[1] || '',
                transaction_status: 'successful' // Sandbox mode
            });

            console.log('✅ PayChangu Response:', JSON.stringify(payoutResponse, null, 2));

            // Update transaction
            await transaction.update({
                status: 'completed',
                description: `Payout completed: ${payoutResponse.data?.ref_id || chargeId}`
            });
            console.log('✅ Transaction marked as completed');

            console.log('\n🎉 SUCCESS: Payout processed successfully!');
            console.log(`Final Balance: ${driver.walletBalance}`);

        } catch (payoutError) {
            console.error('❌ Payout API Error:', payoutError.message);
            console.log('Rolling back wallet...');
            await driver.increment('walletBalance', { by: payoutAmount });
            await transaction.update({ status: 'failed' });
            console.log('✅ Wallet restored');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

testPayout();
