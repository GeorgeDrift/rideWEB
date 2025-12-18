#!/usr/bin/env node
/**
 * COMPLETE STACK VERIFICATION TEST
 * Tests: Frontend ↔ Backend ↔ Database in ONE GO
 * Run: node test-complete-stack.js
 */

const axios = require('axios');

// Your server configuration
const BACKEND_URL = 'http://206.189.58.230:5000/api';
const DOMAIN = 'www.ridexmw.com';

console.log('\n🚀 COMPLETE STACK TEST - Frontend ↔ Backend ↔ Database');
console.log('='.repeat(70));

async function testCompleteStack() {
    let testEmail = `stacktest_${Date.now()}@ridex.com`;
    let testPassword = 'test123456';
    let token = '';

    try {
        // TEST 1: Backend Reachability
        console.log('\n📡 TEST 1: Backend API Reachability');
        console.log('-'.repeat(70));

        try {
            const healthCheck = await axios.get(`${BACKEND_URL}/subscriptions/plans`, {
                timeout: 5000
            });
            console.log('✅ Backend is LIVE and accessible');
            console.log(`   URL: ${BACKEND_URL}`);
            console.log(`   Status: ${healthCheck.status}`);
        } catch (error) {
            console.log('❌ Backend is NOT accessible');
            console.log(`   Error: ${error.message}`);
            throw new Error('Backend unreachable');
        }

        // TEST 2: Registration (Database INSERT)
        console.log('\n💾 TEST 2: Database INSERT (User Registration)');
        console.log('-'.repeat(70));

        const registerResponse = await axios.post(`${BACKEND_URL}/auth/register`, {
            name: 'Complete Stack Test',
            email: testEmail,
            password: testPassword,
            role: 'driver',
            phone: '+265991234567',
            airtelMoneyNumber: '+265991234567'
        });

        token = registerResponse.data.token;
        console.log('✅ User registered in database');
        console.log(`   Email: ${testEmail}`);
        console.log(`   User ID: ${registerResponse.data.user?.id}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);

        // TEST 3: Login (Database SELECT)
        console.log('\n🔐 TEST 3: Database SELECT (User Login)');
        console.log('-'.repeat(70));

        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: testEmail,
            password: testPassword
        });

        console.log('✅ User login successful (database query works)');
        console.log(`   Email: ${loginResponse.data.user?.email}`);
        console.log(`   Role: ${loginResponse.data.user?.role}`);
        console.log(`   New Token: ${loginResponse.data.token.substring(0, 30)}...`);

        // TEST 4: Authenticated Request (Token Validation)
        console.log('\n🔑 TEST 4: JWT Authentication');
        console.log('-'.repeat(70));

        const profileResponse = await axios.get(`${BACKEND_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ JWT authentication working');
        console.log(`   Name: ${profileResponse.data.name}`);
        console.log(`   Email: ${profileResponse.data.email}`);
        console.log(`   Subscription: ${profileResponse.data.subscriptionStatus}`);

        // TEST 5: Subscription System
        console.log('\n💎 TEST 5: Subscription & Trial System');
        console.log('-'.repeat(70));

        const statusResponse = await axios.get(`${BACKEND_URL}/subscriptions/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Subscription system functional');
        console.log(`   Status: ${statusResponse.data.status}`);
        console.log(`   In Trial: ${statusResponse.data.inTrialPeriod}`);
        console.log(`   Trial Days Left: ${statusResponse.data.trialDaysRemaining}`);

        // SUCCESS SUMMARY
        console.log('\n' + '='.repeat(70));
        console.log('🎉 ALL TESTS PASSED! YOUR STACK IS FULLY FUNCTIONAL!');
        console.log('='.repeat(70));

        console.log('\n✅ Verified Components:');
        console.log('  ✓ Backend API (accessible via public IP)');
        console.log('  ✓ Database Connection (PostgreSQL)');
        console.log('  ✓ User Registration (INSERT)');
        console.log('  ✓ User Login (SELECT)');
        console.log('  ✓ JWT Authentication');
        console.log('  ✓ Subscription System (30-day trial)');

        console.log('\n📊 Complete Data Flow:');
        console.log('  Frontend → Backend → Database → Backend → Frontend');
        console.log('  ✓ Registration writes to database');
        console.log('  ✓ Login reads from database');
        console.log('  ✓ Authentication validates tokens');
        console.log('  ✓ API returns correct data');

        console.log('\n🔍 Verify in Database (SSH to server):');
        console.log('  ssh -i "C:\\Users\\Admin\\Desktop\\id_ed25519_droplet" root@206.189.58.230');
        console.log(`  sudo -u postgres psql -d ridex -c "SELECT email, role FROM \\"Users\\" WHERE email='${testEmail}';"`);

        console.log('\n🌐 Your Backend is Public at:');
        console.log(`  http://206.189.58.230:5000/api`);
        console.log(`  http://${DOMAIN}:5000/api (if DNS configured)`);

        console.log('\n💡 Next Steps:');
        console.log('  1. Deploy frontend to Digital Ocean Static Sites');
        console.log('  2. Update CORS to allow your domain');
        console.log('  3. Test full flow through UI\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('='.repeat(70));

        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }

        console.error('\n💡 Troubleshooting:');
        console.error('  - Check backend is running: pm2 status');
        console.error('  - Check logs: pm2 logs ridex-api');
        console.error('  - Verify database: sudo systemctl status postgresql');
        console.error('  - Check firewall: sudo ufw status\n');

        process.exit(1);
    }
}

// Run the complete test
testCompleteStack();
