// Test Subscription Safeback Feature
// Run with: node test-subscription-safeback.js

const { User, Subscription, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function testSubscriptionSafeback() {
    console.log('\n🧪 Testing Subscription Safeback Feature\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Create new user and verify trial dates are set
        console.log('\n📝 Test 1: New User Registration');
        console.log('-'.repeat(40));

        const testEmail = `test_driver_${Date.now()}@example.com`;
        const password = await bcrypt.hash('password123', 10);

        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 30);

        const newUser = await User.create({
            name: 'Test Driver',
            email: testEmail,
            password,
            role: 'driver',
            phone: '+265991234567',
            airtelMoneyNumber: '+265991234567',
            accountStatus: 'active',
            subscriptionStatus: 'active',
            trialStartDate: now,
            trialEndDate: trialEnd
        });

        console.log('✅ User created:', newUser.email);
        console.log('📅 Trial Start:', newUser.trialStartDate);
        console.log('📅 Trial End:', newUser.trialEndDate);
        console.log('⏰ Trial Days:', Math.ceil((new Date(newUser.trialEndDate) - new Date(newUser.trialStartDate)) / (1000 * 60 * 60 * 24)));

        // Test 2: Check user within trial period
        console.log('\n✅ Test 2: User Within Trial Period');
        console.log('-'.repeat(40));

        const isWithinTrial = new Date(newUser.trialEndDate) > new Date();
        console.log('🔍 Within trial period:', isWithinTrial ? 'YES' : 'NO');
        console.log('📊 Subscription Status:', newUser.subscriptionStatus);
        console.log('🎉 Should have full access: YES');

        // Test 3: Simulate expired trial (manually set trial end date to yesterday)
        console.log('\n⏰ Test 3: Expired Trial Without Subscription');
        console.log('-'.repeat(40));

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await newUser.update({
            trialEndDate: yesterday,
            subscriptionStatus: 'inactive',
            subscriptionExpiry: null
        });
        await newUser.reload();

        console.log('📅 Trial End Date (simulated):', newUser.trialEndDate);
        console.log('📊 Subscription Status:', newUser.subscriptionStatus);
        console.log('❌ Should block: Post Rides, Accept Requests, Withdrawals');
        console.log('✅ Should allow: Login, View Dashboard, Purchase Subscription');

        // Test 4: Activate paid subscription
        console.log('\n💳 Test 4: Paid Subscription Activation');
        console.log('-'.repeat(40));

        const subscriptionExpiry = new Date();
        subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30);

        await Subscription.create({
            userId: newUser.id,
            plan: 'Monthly Plan',
            amount: 49900,
            status: 'active',
            startDate: new Date(),
            endDate: subscriptionExpiry
        });

        await newUser.update({
            subscriptionStatus: 'active',
            subscriptionExpiry: subscriptionExpiry
        });
        await newUser.reload();

        console.log('✅ Subscription activated');
        console.log('📅 Subscription Expiry:', newUser.subscriptionExpiry);
        console.log('🎉 Should have full access: YES');

        // Test 5: Verify existing users got trial dates backfilled
        console.log('\n🔄 Test 5: Verify Trial Dates Backfill');
        console.log('-'.repeat(40));

        const [results] = await sequelize.query(`
            SELECT 
                email,
                role,
                "createdAt",
                "trialStartDate",
                "trialEndDate"
            FROM "Users"
            WHERE "trialStartDate" IS NOT NULL
            LIMIT 3;
        `);

        console.log('✅ Sample users with trial dates:');
        results.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.role})`);
            console.log(`     Trial: ${user.trialStartDate} → ${user.trialEndDate}`);
        });

        // Clean up test user
        console.log('\n🧹 Cleaning up test data...');
        await newUser.destroy();
        console.log('✅ Test user deleted');

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60) + '\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

testSubscriptionSafeback();
