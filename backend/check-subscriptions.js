const { Sequelize } = require('sequelize');
const { Transaction, Subscription, User } = require('./models');
require('dotenv').config();

async function checkSubscriptionData() {
    console.log('\n📊 CHECKING SUBSCRIPTION DATABASE\n');
    console.log('='.repeat(60));

    try {
        // 1. Check Transactions for subscription payments
        console.log('\n1️⃣ CHECKING TRANSACTIONS TABLE:');
        const subscriptionTransactions = await Transaction.findAll({
            where: {
                type: {
                    [Sequelize.Op.like]: '%Subscription%'
                }
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        console.log(`   Found ${subscriptionTransactions.length} subscription transactions`);

        if (subscriptionTransactions.length > 0) {
            subscriptionTransactions.forEach((txn, i) => {
                console.log(`\n   Transaction ${i + 1}:`);
                console.log(`   - ID: ${txn.id}`);
                console.log(`   - Type: ${txn.type}`);
                console.log(`   - Amount: MWK ${txn.amount}`);
                console.log(`   - Status: ${txn.status}`);
                console.log(`   - Description: ${txn.description}`);
                console.log(`   - Reference: ${txn.reference}`);
                console.log(`   - Created: ${txn.createdAt}`);
            });
        } else {
            console.log('   ❌ NO SUBSCRIPTION TRANSACTIONS FOUND');
        }

        // 2. Check Subscriptions table
        console.log('\n\n2️⃣ CHECKING SUBSCRIPTIONS TABLE:');
        const subscriptions = await Subscription.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'subscriptionStatus']
            }]
        });

        console.log(`   Found ${subscriptions.length} subscription records`);

        if (subscriptions.length > 0) {
            subscriptions.forEach((sub, i) => {
                console.log(`\n   Subscription ${i + 1}:`);
                console.log(`   - ID: ${sub.id}`);
                console.log(`   - User: ${sub.User?.name} (${sub.User?.email})`);
                console.log(`   - Plan: ${sub.plan}`);
                console.log(`   - Amount: MWK ${sub.amount}`);
                console.log(`   - Status: ${sub.status}`);
                console.log(`   - Start Date: ${sub.startDate}`);
                console.log(`   - End Date: ${sub.endDate}`);
                console.log(`   - User Status: ${sub.User?.subscriptionStatus}`);
                console.log(`   - Created: ${sub.createdAt}`);
            });
        } else {
            console.log('   ❌ NO SUBSCRIPTION RECORDS FOUND');
        }

        // 3. Check Users with active subscriptions
        console.log('\n\n3️⃣ CHECKING USERS WITH SUBSCRIPTION STATUS:');
        const activeUsers = await User.findAll({
            where: {
                subscriptionStatus: {
                    [Sequelize.Op.ne]: null
                }
            },
            attributes: ['id', 'name', 'email', 'role', 'subscriptionStatus', 'subscriptionExpiry']
        });

        console.log(`   Found ${activeUsers.length} users with subscription status`);

        if (activeUsers.length > 0) {
            activeUsers.forEach((user, i) => {
                console.log(`\n   User ${i + 1}:`);
                console.log(`   - Name: ${user.name}`);
                console.log(`   - Email: ${user.email}`);
                console.log(`   - Role: ${user.role}`);
                console.log(`   - Subscription Status: ${user.subscriptionStatus}`);
                console.log(`   - Expiry: ${user.subscriptionExpiry}`);
            });
        } else {
            console.log('   ❌ NO USERS WITH SUBSCRIPTION STATUS');
        }

        // 4. Check for old "Subscription" type transactions
        console.log('\n\n4️⃣ CHECKING OLD TRANSACTION TYPES:');
        const oldTypeTransactions = await Transaction.findAll({
            where: {
                type: 'Subscription'
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        console.log(`   Found ${oldTypeTransactions.length} old-type subscription transactions`);
        if (oldTypeTransactions.length > 0) {
            console.log('   ⚠️  These use old type "Subscription" instead of "Subscription Payment"');
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ DATABASE CHECK COMPLETE\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    } finally {
        process.exit(0);
    }
}

checkSubscriptionData();
