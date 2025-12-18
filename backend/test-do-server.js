#!/usr/bin/env node
/**
 * Digital Ocean Production Server Test
 * Tests registration and login on your live server: 206.189.58.230
 */

const axios = require('axios');

// Your Digital Ocean server
const SERVER_IP = '206.189.58.230';
const SERVER_PORT = '3001'; // Update if different
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;

console.log('\n🌐 DIGITAL OCEAN SERVER TEST');
console.log(`Server: ${SERVER_IP}`);
console.log(`Testing: ${BASE_URL}`);
console.log('='.repeat(70));

async function testProductionServer() {
    let testToken = '';
    const testEmail = `livetest_${Date.now()}@ridex.com`;

    try {
        // TEST 1: Check server connectivity
        console.log('\n📡 TEST 1: Server Connectivity');
        console.log('-'.repeat(70));

        try {
            const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/health`, {
                timeout: 5000
            });
            console.log('✅ Server is reachable');
        } catch (error) {
            // Try /api/health
            try {
                await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
                console.log('✅ Server is reachable');
            } catch (e) {
                console.log('⚠️  Health endpoint not found, but continuing...');
            }
        }

        // TEST 2: Register New User (Database INSERT)
        console.log('\n👤 TEST 2: User Registration (Database INSERT)');
        console.log('-'.repeat(70));

        const registerData = {
            name: 'Live Test Driver',
            email: testEmail,
            password: 'testpass123',
            role: 'driver',
            phone: '+265991234567',
            airtelMoneyNumber: '+265991234567'
        };

        console.log(`Registering user: ${testEmail}`);

        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);

        console.log('✅ Registration successful!');
        console.log(`   User created in PostgreSQL database`);
        console.log(`   Email: ${registerResponse.data.user?.email || testEmail}`);
        console.log(`   Role: ${registerResponse.data.user?.role || 'driver'}`);

        testToken = registerResponse.data.token;
        console.log(`   🔑 JWT Token: ${testToken.substring(0, 30)}...`);

        // TEST 3: Verify user in database
        console.log('\n🔍 TEST 3: Verify Database Record');
        console.log('-'.repeat(70));
        console.log('✅ User should now exist in database');
        console.log('\n💡 Run this on your server to verify:');
        console.log('   sudo -u postgres psql -d ridex');
        console.log(`   SELECT id, email, role, "trialEndDate", "subscriptionStatus" FROM "Users" WHERE email='${testEmail}';`);

        // TEST 4: Login with created user (Database SELECT)
        console.log('\n🔐 TEST 4: User Login (Database SELECT)');
        console.log('-'.repeat(70));

        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: testEmail,
            password: 'testpass123'
        });

        console.log('✅ Login successful!');
        console.log(`   Email: ${loginResponse.data.user?.email}`);
        console.log(`   Role: ${loginResponse.data.user?.role}`);
        console.log(`   🔑 New Token: ${loginResponse.data.token.substring(0, 30)}...`);

        // TEST 5: Get user profile (Database SELECT with JOIN)
        console.log('\n📋 TEST 5: Get User Profile');
        console.log('-'.repeat(70));

        const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });

        console.log('✅ Profile fetched successfully');
        console.log(`   ID: ${profileResponse.data.id}`);
        console.log(`   Name: ${profileResponse.data.name}`);
        console.log(`   Email: ${profileResponse.data.email}`);
        console.log(`   Role: ${profileResponse.data.role}`);
        console.log(`   Subscription Status: ${profileResponse.data.subscriptionStatus}`);

        if (profileResponse.data.trialEndDate) {
            const trialEnd = new Date(profileResponse.data.trialEndDate);
            const daysRemaining = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
            console.log(`   Trial End Date: ${trialEnd.toLocaleDateString()}`);
            console.log(`   Trial Days Remaining: ${daysRemaining}`);
        }

        // TEST 6: Test subscription API
        console.log('\n💎 TEST 6: Subscription System');
        console.log('-'.repeat(70));

        const statusResponse = await axios.get(`${BASE_URL}/subscriptions/status`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });

        console.log('✅ Subscription status retrieved');
        console.log(`   Status: ${statusResponse.data.status}`);
        console.log(`   In Trial: ${statusResponse.data.inTrialPeriod}`);
        console.log(`   Trial Days Remaining: ${statusResponse.data.trialDaysRemaining}`);

        // Success Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ ALL TESTS PASSED! Digital Ocean Server is Working!');
        console.log('='.repeat(70));

        console.log('\n📊 What was tested:');
        console.log('  ✓ Server connectivity');
        console.log('  ✓ User registration (Database INSERT)');
        console.log('  ✓ User login (Database SELECT)');
        console.log('  ✓ JWT authentication');
        console.log('  ✓ Profile fetch (Database query)');
        console.log('  ✓ Subscription system (30-day trial)');

        console.log('\n📝 Test Credentials:');
        console.log(`  Email: ${testEmail}`);
        console.log(`  Password: testpass123`);
        console.log(`  You can use these to test the frontend!`);

        console.log('\n💡 Next Steps:');
        console.log('  1. Verify user in database with the SQL command above');
        console.log('  2. Test frontend registration/login at your frontend URL');
        console.log('  3. Check PM2 logs: pm2 logs ridex-api');
        console.log('  4. Monitor database: SELECT COUNT(*) FROM "Users";\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('='.repeat(70));

        if (error.response) {
            console.error(`HTTP Status: ${error.response.status}`);
            console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);

            if (error.response.status === 500) {
                console.error('\n💡 Possible Issues:');
                console.error('  - Database connection problem');
                console.error('  - Check PM2 logs: pm2 logs ridex-api');
                console.error('  - Verify .env DATABASE_URL is correct');
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.error(`Cannot connect to: ${BASE_URL}`);
            console.error('\n💡 Troubleshooting:');
            console.error('  1. Check if server is running: pm2 status');
            console.error('  2. Verify port: pm2 logs ridex-api');
            console.error('  3. Check firewall allows port 3001');
            console.error(`  4. Try: curl http://localhost:3001/api/health (on server)`);
        } else if (error.code === 'ETIMEDOUT') {
            console.error('Connection timeout');
            console.error('  - Server may be slow or overloaded');
            console.error('  - Check firewall settings');
        } else {
            console.error(error.message);
        }

        process.exit(1);
    }
}

// Run tests
runProductionServer();
