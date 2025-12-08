const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize, User, Transaction } = require('./models');
const driverController = require('./controllers/driverController');

async function verifyTransactions() {
    try {
        console.log('🔄 Connecting to Database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        // 1. Find a driver
        const driver = await User.findOne({ where: { role: 'driver' } });
        if (!driver) {
            console.error('❌ No driver found. Please run seed.js first.');
            process.exit(1);
        }
        console.log(`👤 Found Driver: ${driver.email} (${driver.id})`);

        // 2. Create a mock transaction if none exist
        const count = await Transaction.count({ where: { userId: driver.id } });
        if (count === 0) {
            console.log('➕ Creating mock transaction...');
            await Transaction.create({
                userId: driver.id,
                type: 'Ride Payment',
                amount: 15000,
                direction: 'credit',
                status: 'completed',
                description: 'Mock Payment for Testing',
                reference: 'MOCK-REF-123'
            });
        }

        // 3. Mock Req and Res
        const req = {
            user: { id: driver.id }
        };
        const res = {
            json: (data) => {
                console.log('\n📊 getTransactions Result:');
                console.log(JSON.stringify(data, null, 2));
            },
            status: (code) => {
                console.log(`\n❌ Status Code: ${code}`);
                return {
                    json: (data) => console.log(JSON.stringify(data, null, 2))
                };
            }
        };

        // 4. Call Controller
        console.log('\n🚀 Calling driverController.getTransactions...');
        await driverController.getTransactions(req, res);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sequelize.close();
    }
}

verifyTransactions();
