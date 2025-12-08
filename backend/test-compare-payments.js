const http = require('http');

const BACKEND_URL = 'localhost';
const BACKEND_PORT = 5000;

const testDriver = {
    email: 'driver@ridex.com',
    password: 'driver123'
};

let authToken = '';

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

async function comparePayments() {
    console.log('\n🧪 =====================================================');
    console.log('   COMPARING FOR HIRE vs SUBSCRIPTION PAYMENT');
    console.log('=====================================================\n');

    try {
        // Login
        console.log('📝 Step 1: Logging in...');
        const loginRes = await makeRequest('/api/auth/login', 'POST', testDriver);
        authToken = loginRes.data.token;
        console.log('✅ Login successful\n');

        // Test FOR HIRE Payment
        console.log('💰 Step 2: Testing FOR HIRE Payment...');
        const forHireRes = await makeRequest('/api/payment/initiate', 'POST', {
            rideId: 'test-ride-123',
            amount: 5000,
            mobileNumber: '+265991234567',
            providerRefId: 'airtel-money-ref-id'
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        if (forHireRes.ok) {
            console.log('✅ FOR HIRE Payment SUCCESS!');
            console.log('   Status:', forHireRes.data.status);
            console.log('   Message:', forHireRes.data.message);
            console.log('   Response:', JSON.stringify(forHireRes.data, null, 2), '\n');
        } else {
            console.log('❌ FOR HIRE Payment FAILED!');
            console.log('   Status Code:', forHireRes.status);
            console.log('   Error:', JSON.stringify(forHireRes.data, null, 2), '\n');
        }

        // Test SUBSCRIPTION Payment (with REAL operator IDs)
        console.log('💰 Step 3: Testing SUBSCRIPTION Payment...');
        const subscriptionRes = await makeRequest('/api/subscriptions/initiate', 'POST', {
            plan: 'monthly',
            mobileNumber: '+265991234567',
            providerRefId: '20be6c20-adeb-4b5b-a7ba-0769820df4fb' // Real Airtel Money ID from PayChangu
        }, {
            'Authorization': `Bearer ${authToken}`
        });

        if (subscriptionRes.ok) {
            console.log('✅ SUBSCRIPTION Payment SUCCESS!');
            console.log('   Status:', subscriptionRes.data.status);
            console.log('   Message:', subscriptionRes.data.message);
            console.log('   Response:', JSON.stringify(subscriptionRes.data, null, 2), '\n');
        } else {
            console.log('❌ SUBSCRIPTION Payment FAILED!');
            console.log('   Status Code:', subscriptionRes.status);
            console.log('   Error:', JSON.stringify(subscriptionRes.data, null, 2), '\n');
        }

        // Compare Results
        console.log('\n📊 COMPARISON RESULTS:');
        console.log('=====================================================');
        console.log('For Hire Payment:', forHireRes.ok ? '✅ WORKS' : '❌ FAILS');
        console.log('Subscription Payment:', subscriptionRes.ok ? '✅ WORKS' : '❌ FAILS');

        if (forHireRes.ok && subscriptionRes.ok) {
            console.log('\n🎉 BOTH PAYMENTS WORKING!');
        } else if (forHireRes.ok && !subscriptionRes.ok) {
            console.log('\n⚠️  For Hire works but Subscription fails - logic mismatch');
        } else if (!forHireRes.ok && !subscriptionRes.ok) {
            console.log('\n⚠️  Both fail - PayChangu configuration issue');
        }
        console.log('=====================================================\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

setTimeout(() => {
    comparePayments();
}, 500);
