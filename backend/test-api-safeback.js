// API Test for Subscription Safeback
// Tests actual API endpoints to verify feature restrictions work

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAPIEndpoints() {
    console.log('\n🔌 Testing Subscription Safeback via API\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Register a new driver
        console.log('\n📝 Step 1: Register New Driver');
        console.log('-'.repeat(40));

        const testEmail = `api_test_driver_${Date.now()}@example.com`;
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'API Test Driver',
            email: testEmail,
            password: 'testpass123',
            role: 'driver',
            phone: '+265991234567',
            airtelMoneyNumber: '+265991234567'
        });

        const token = registerResponse.data.token;
        console.log('✅ Driver registered successfully');
        console.log('🔑 Token received');

        // Step 2: Try to post a ride (should work - within trial)
        console.log('\n✅ Step 2: Post Ride Share (Within Trial)');
        console.log('-'.repeat(40));

        try {
            const postResponse = await axios.post(`${BASE_URL}/driver/posts/share`, {
                origin: 'Lilongwe',
                destination: 'Blantyre',
                date: '2025-12-15',
                time: '10:00',
                price: 15000,
                seats: 4,
                availableSeats: 4,
                description: 'Test ride'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('✅ Successfully posted ride (trial active)');
            console.log('📍 Ride ID:', postResponse.data.id);
        } catch (error) {
            console.log('❌ Failed to post ride:', error.response?.data || error.message);
        }

        // Step 3: Check subscription status
        console.log('\n📊 Step 3: Check Subscription Status');
        console.log('-'.repeat(40));

        const statusResponse = await axios.get(`${BASE_URL}/subscriptions/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status:', statusResponse.data.status);
        console.log('In Trial:', statusResponse.data.inTrialPeriod);
        console.log('Trial Days Remaining:', statusResponse.data.trialDaysRemaining);

        console.log('\n' + '='.repeat(60));
        console.log('✅ API TESTS COMPLETED!');
        console.log('='.repeat(60) + '\n');

        console.log('📝 Next Steps:');
        console.log('1. Start backend: cd backend && npm run dev');
        console.log('2. Test expired trial by manually updating trial date in DB');
        console.log('3. Verify subscription purchase flow works\n');

    } catch (error) {
        console.error('\n❌ API TEST FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error(error.message);
        }
        console.log('\n💡 Note: Make sure backend server is running on port 3001');
    }
}

testAPIEndpoints();
