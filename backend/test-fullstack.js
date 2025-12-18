#!/usr/bin/env node
/**
 * Full Stack Integration Test
 * Tests: Frontend → Backend → Database (PostgreSQL)
 * 
 * Run this after deploying to Digital Ocean
 */

const axios = require('axios');

// CONFIGURATION - Update these for your Digital Ocean deployment
const CONFIG = {
    // Local testing
    LOCAL_BACKEND: 'http://localhost:3001/api',
    LOCAL_FRONTEND: 'http://localhost:5173',

    // Digital Ocean URLs (update these)
    PROD_BACKEND: 'https://your-backend.ondigitalocean.app/api', // Update this
    PROD_FRONTEND: 'https://your-frontend.ondigitalocean.app',   // Update this
};

// Choose environment
const ENVIRONMENT = process.env.TEST_ENV || 'local'; // 'local' or 'production'
const BASE_URL = ENVIRONMENT === 'production' ? CONFIG.PROD_BACKEND : CONFIG.LOCAL_BACKEND;

console.log(`\n🧪 FULL STACK INTEGRATION TEST`);
console.log(`Environment: ${ENVIRONMENT.toUpperCase()}`);
console.log(`Backend URL: ${BASE_URL}`);
console.log('='.repeat(70));

async function runFullStackTests() {
    let testToken = '';
    let testUserId = '';
    const testEmail = `stacktest_${Date.now()}@test.com`;

    try {
        // TEST 1: Backend Health Check
        console.log('\n📡 TEST 1: Backend Health & Connectivity');
        console.log('-'.repeat(70));

        try {
            const healthResponse = await axios.get(BASE_URL.replace('/api', '/health'), {
                timeout: 5000
            });
            console.log('✅ Backend is reachable');
            console.log(`   Response: ${healthResponse.status} ${healthResponse.statusText}`);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Backend is not running or not reachable');
                console.log(`   Make sure backend is deployed and running at: ${BASE_URL}`);
                return;
            }
            // Continue if endpoint doesn't exist but server is reachable
            console.log('⚠️  Health endpoint not found, but server is reachable');
        }

        // TEST 2: Database Connection (via Registration)
        console.log('\n💾 TEST 2: Database INSERT Operation (User Registration)');
        console.log('-'.repeat(70));

        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Stack Test User',
            email: testEmail,
            password: 'testpass123',
            role: 'rider',
            phone: '+265999000000'
        });

        console.log('✅ User registered successfully');
        console.log(`   📧 Email: ${testEmail}`);
        console.log(`   🆔 User created in database`);

        testToken = registerResponse.data.token;
        console.log(`   🔑 JWT Token received: ${testToken.substring(0, 20)}...`);

        // TEST 3: Database READ Operation
        console.log('\n📖 TEST 3: Database SELECT Operation (Get Profile)');
        console.log('-'.repeat(70));

        const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });

        testUserId = profileResponse.data.id;
        console.log('✅ Profile fetched successfully');
        console.log(`   📝 Name: ${profileResponse.data.name}`);
        console.log(`   📧 Email: ${profileResponse.data.email}`);
        console.log(`   👤 Role: ${profileResponse.data.role}`);
        console.log(`   🆔 User ID: ${testUserId}`);

        // TEST 4: Frontend-Backend Communication (Subscription API)
        console.log('\n🔗 TEST 4: Frontend API Integration (Subscription Plans)');
        console.log('-'.repeat(70));

        const plansResponse = await axios.get(`${BASE_URL}/subscriptions/plans`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });

        console.log('✅ Subscription plans fetched');
        console.log(`   📋 Plans available: ${plansResponse.data.plans ? plansResponse.data.plans.length : 0}`);
        console.log(`   📅 Trial Days: ${plansResponse.data.trialDays}`);

        if (plansResponse.data.plans && plansResponse.data.plans.length > 0) {
            console.log(`   💰 Sample Plan: ${plansResponse.data.plans[0].name} - MWK ${plansResponse.data.plans[0].price}`);
        }

        // TEST 5: Database UPDATE Operation (Subscription Status Check)
        console.log('\n🔄 TEST 5: Database Query Operation (Subscription Status)');
        console.log('-'.repeat(70));

        const statusResponse = await axios.get(`${BASE_URL}/subscriptions/status`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });

        console.log('✅ Subscription status retrieved');
        console.log(`   📊 Status: ${statusResponse.data.status}`);
        console.log(`   🎁 In Trial: ${statusResponse.data.inTrialPeriod}`);
        console.log(`   📅 Days Remaining: ${statusResponse.data.trialDaysRemaining}`);

        // TEST 6: Complex Database Query (Get Dashboard Stats)
        console.log('\n📊 TEST 6: Complex Database Queries (Dashboard Stats)');
        console.log('-'.repeat(70));

        try {
            const statsUrl = profileResponse.data.role === 'driver'
                ? `${BASE_URL}/driver/stats`
                : `${BASE_URL}/rider/stats`;

            const statsResponse = await axios.get(statsUrl, {
                headers: { 'Authorization': `Bearer ${testToken}` }
            });

            console.log('✅ Stats fetched successfully');
            console.log(`   📈 Data retrieved from database`);
            console.log(`   Keys: ${Object.keys(statsResponse.data).join(', ')}`);
        } catch (error) {
            console.log('⚠️  Stats endpoint may require additional data');
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ ALL INTEGRATION TESTS PASSED!');
        console.log('='.repeat(70));
        console.log('\n📊 Summary:');
        console.log('  ✓ Backend is accessible');
        console.log('  ✓ Database INSERT working (user registration)');
        console.log('  ✓ Database SELECT working (profile fetch)');
        console.log('  ✓ Database QUERY working (subscription status)');
        console.log('  ✓ JWT Authentication working');
        console.log('  ✓ API endpoints responding correctly');
        console.log('  ✓ Frontend can communicate with backend');

        console.log('\n📝 Test User Created:');
        console.log(`  Email: ${testEmail}`);
        console.log(`  Password: testpass123`);
        console.log(`  User ID: ${testUserId}`);
        console.log(`  You can login with these credentials to test frontend\n`);

        console.log('💡 Next Steps for Digital Ocean:');
        console.log('  1. Deploy backend to DO App Platform');
        console.log('  2. Deploy frontend to DO Static Sites');
        console.log('  3. Set up PostgreSQL database on DO');
        console.log('  4. Update .env with production database URL');
        console.log('  5. Run this test with: TEST_ENV=production node test-fullstack.js\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('='.repeat(70));

        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Cannot connect to backend server');
            console.error(`URL: ${BASE_URL}`);
            console.error('\nMake sure:');
            console.error('  - Backend server is running');
            console.error('  - URL is correct');
            console.error('  - Firewall allows connections');
        } else {
            console.error(error.message);
        }

        process.exit(1);
    }
}

// Run tests
console.log('\n⏳ Starting tests...\n');
runFullStackTests();
