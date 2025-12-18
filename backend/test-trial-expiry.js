// Quick Test: Verify Trial Expiry Message
// This simulates what happens when trial expires

const { User, sequelize } = require('./models');

async function testTrialExpiry() {
    console.log('\n🧪 Testing Trial Expiry Flow\n');
    console.log('='.repeat(60));

    try {
        // Find a test user
        const testUser = await User.findOne({
            where: {
                email: { [sequelize.Sequelize.Op.like]: '%test%' },
                role: 'driver'
            }
        });

        if (!testUser) {
            console.log('❌ No test user found');
            return;
        }

        console.log(`\n📝 Found user: ${testUser.email}`);
        console.log(`Trial End: ${testUser.trialEndDate}`);
        console.log(`Subscription Status: ${testUser.subscriptionStatus}`);
        console.log(`Subscription Expiry: ${testUser.subscriptionExpiry || 'None'}`);

        // Check if trial is expired
        const now = new Date();
        const trialExpired = testUser.trialEndDate && new Date(testUser.trialEndDate) < now;
        const hasActiveSub = testUser.subscriptionStatus === 'active' &&
            testUser.subscriptionExpiry &&
            new Date(testUser.subscriptionExpiry) > now;

        console.log('\n📊 Status Check:');
        console.log(`  Trial Expired: ${trialExpired ? '❌ YES' : '✅ NO'}`);
        console.log(`  Has Active Subscription: ${hasActiveSub ? '✅ YES' : '❌ NO'}`);

        if (trialExpired && !hasActiveSub) {
            console.log('\n🚫 USER SHOULD SEE SUBSCRIPTION REQUIRED MESSAGE');
            console.log('Expected Error Response:');
            console.log(JSON.stringify({
                error: 'Subscription Required',
                message: 'Your 30-day free trial has expired. Please purchase a subscription to continue using this feature.',
                code: 'SUBSCRIPTION_EXPIRED',
                trialExpired: true
            }, null, 2));
        } else {
            console.log('\n✅ User has access (trial active or subscription valid)');
        }

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

testTrialExpiry();
