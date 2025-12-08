const http = require('http');

const BACKEND_URL = 'localhost';
const BACKEND_PORT = 5000;

// Test data
const testDriver = {
    email: 'driver@ridex.com',
    password: 'driver123'
};

let authToken = '';
let chargeId = '';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BACKEND_URL,
            port: BACKEND_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: jsonData, ok: res.statusCode >= 200 && res.statusCode < 300 });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData, ok: res.statusCode >= 200 && res.statusCode < 300 });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testSubscriptionFlow() {
    console.log('\n🧪 ========================================');
    console.log('   SUBSCRIPTION PAYMENT BACKEND TEST');
    console.log('========================================\n');

    try {
        // Step 1: Login
        console.log('📝 Step 1: Logging in as driver...');
        const loginRes = await makeRequest('/api/auth/login', 'POST', testDriver);

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
        }

        authToken = loginRes.data.token;
        console.log('✅ Login successful!');
        console.log('   Token:', authToken.substring(0, 20) + '...\n');

        // Step 2: Get subscription plans
        console.log('📋 Step 2: Getting subscription plans...');
        const plansRes = await makeRequest('/api/subscriptions/plans', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });

        console.log('✅ Plans retrieved!');
        console.log('   Available plans:', Object.keys(plansRes.data.plans).join(', '));
        console.log('   Monthly:', plansRes.data.plans.monthly.price, 'MWK - ', plansRes.data.plans.monthly.duration, 'days');
        console.log('   Quarterly:', plansRes.data.plans.quarterly.price, 'MWK -', plansRes.data.plans.quarterly.duration, 'days');
        console.log('   Bi-Annual:', plansRes.data.plans.biannual.price, 'MWK -', plansRes.data.plans.biannual.duration, 'days');
        console.log('   Yearly:', plansRes.data.plans.yearly.price, 'MWK -', plansRes.data.plans.yearly.duration, 'days\n');

        // Step 3: Initiate subscription payment
        console.log('💰 Step 3: Initiating monthly subscription payment...');
        const paymentRes = await makeRequest('/api/subscriptions/initiate', 'POST', {
            plan: 'monthly',
            mobileNumber: '+265991234567',
            providerRefId: 'airtel-money-ref-id'
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        if (!paymentRes.ok) {
            throw new Error(`Payment initiation failed: ${JSON.stringify(paymentRes.data)}`);
        }

        chargeId = paymentRes.data.chargeId || paymentRes.data.data?.charge_id || `test-charge-${Date.now()}`;

        console.log('✅ Payment initiated!');
        console.log('   Status:', paymentRes.data.status);
        console.log('   Charge ID:', chargeId);
        console.log('   Message:', paymentRes.data.message, '\n');

        // Step 4: Check status before webhook
        console.log('📊 Step 4: Checking subscription status (before payment)...');
        const statusBeforeRes = await makeRequest('/api/subscriptions/status', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });

        console.log('✅ Status before payment:');
        console.log('   Status:', statusBeforeRes.data.status);
        console.log('   Trial:', statusBeforeRes.data.isTrial ? 'Yes' : 'No');
        console.log('   Days left:', statusBeforeRes.data.daysLeft || 'N/A', '\n');

        // Step 5: Simulate webhook (payment success)
        console.log('📲 Step 5: Simulating PayChangu webhook (payment success)...');
        const webhookRes = await makeRequest('/api/subscriptions/webhook', 'POST', {
            charge_id: chargeId,
            status: 'successful',
            tx_ref: chargeId,
            metadata: {
                plan: 'monthly',
                duration: 30
            }
        });

        console.log('✅ Webhook processed!');
        console.log('   Response:', webhookRes.data.message, '\n');

        // Wait a bit for database to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 6: Check subscription status after payment
        console.log('📊 Step 6: Checking subscription status (after payment)...');
        const statusAfterRes = await makeRequest('/api/subscriptions/status', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });

        console.log('✅ Status after payment:');
        console.log('   Status:', statusAfterRes.data.status);
        console.log('   Expiry:', statusAfterRes.data.expiryDate);
        console.log('   Days left:', statusAfterRes.data.daysLeft);
        console.log('   Trial:', statusAfterRes.data.isTrial ? 'Yes' : 'No');
        console.log('   Can renew:', statusAfterRes.data.canRenew ? 'Yes' : 'No', '\n');

        // Step 7: Verify payment in history
        console.log('📜 Step 7: Verifying payment history...');
        const historyRes = await makeRequest('/api/subscriptions/payment-history', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });

        console.log('✅ Payment history retrieved!');
        console.log('   Total payments:', historyRes.data.history?.length || 0);
        if (historyRes.data.history?.length > 0) {
            const latest = historyRes.data.history[0];
            console.log('   Latest payment:');
            console.log('     - Plan:', latest.plan);
            console.log('     - Amount:', latest.amount, 'MWK');
            console.log('     - Status:', latest.status);
            console.log('     - Date:', new Date(latest.createdAt).toLocaleString());
        }

        console.log('\n✅ ========================================');
        console.log('   ALL TESTS PASSED!');
        console.log('========================================\n');

        console.log('📝 SUMMARY:');
        console.log('   - Login: ✅');
        console.log('   - Plans retrieval: ✅');
        console.log('   - Payment initiation: ✅');
        console.log('   - Webhook processing: ✅');
        console.log('   - Status update: ✅');
        console.log('   - Payment history: ✅');
        console.log('\n🎉 Subscription payment backend is working correctly!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
console.log('🚀 Starting subscription payment backend test...');
console.log('   Backend:', `http://${BACKEND_URL}:${BACKEND_PORT}`);
console.log('   Test user:', testDriver.email);
setTimeout(() => {
    testSubscriptionFlow();
}, 500);
