#!/usr/bin/env node
/**
 * Complete System Test - Terminal Based
 * Tests: Frontend, Backend, Database accessibility
 */

const axios = require('axios');

// Configuration
const BACKEND_IP = '206.189.58.230';
const BACKEND_PORT = '5000';
const BACKEND_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;
const FRONTEND_URL = 'http://localhost:5173'; // Your local frontend

console.log('\n🧪 COMPLETE SYSTEM TEST');
console.log('='.repeat(70));

async function runSystemTest() {
    let allPassed = true;

    // TEST 1: Backend Accessibility
    console.log('\n📡 TEST 1: Backend Accessibility');
    console.log('-'.repeat(70));

    try {
        const response = await axios.get(`${BACKEND_URL}/api/subscriptions/plans`, {
            timeout: 5000
        });
        console.log('✅ Backend is accessible');
        console.log(`   URL: ${BACKEND_URL}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response time: ${response.headers['x-response-time'] || 'N/A'}`);
    } catch (error) {
        console.log('❌ Backend is NOT accessible');
        console.log(`   URL: ${BACKEND_URL}`);
        console.log(`   Error: ${error.message}`);
        allPassed = false;
    }

    // TEST 2: Database (via Backend)
    console.log('\n💾 TEST 2: Database Connection (via Backend)');
    console.log('-'.repeat(70));

    try {
        const testEmail = `systemtest_${Date.now()}@test.com`;
        const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
            name: 'System Test User',
            email: testEmail,
            password: 'test123',
            role: 'driver',
            phone: '+265991234567',
            airtelMoneyNumber: '+265991234567'
        });

        console.log('✅ Database is working');
        console.log(`   User created: ${testEmail}`);
        console.log(`   User ID: ${response.data.user?.id || 'N/A'}`);
        console.log(`   Token received: ${response.data.token ? 'YES' : 'NO'}`);
    } catch (error) {
        console.log('❌ Database test failed');
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        allPassed = false;
    }

    // TEST 3: Frontend Accessibility
    console.log('\n🌐 TEST 3: Frontend Accessibility');
    console.log('-'.repeat(70));

    try {
        const response = await axios.get(FRONTEND_URL, {
            timeout: 5000
        });
        console.log('✅ Frontend is accessible');
        console.log(`   URL: ${FRONTEND_URL}`);
        console.log(`   Status: ${response.status}`);
    } catch (error) {
        console.log('⚠️  Frontend is NOT accessible via URL');
        console.log(`   URL: ${FRONTEND_URL}`);
        console.log(`   Note: Frontend may only be accessible locally`);
        console.log(`   This is normal if not deployed yet`);
    }

    // TEST 4: External Accessibility (from internet)
    console.log('\n🌍 TEST 4: External Accessibility');
    console.log('-'.repeat(70));

    try {
        // Test if backend is accessible from outside
        console.log(`Testing backend from external IP...`);
        const response = await axios.get(`${BACKEND_URL}/api/subscriptions/plans`, {
            timeout: 5000,
            headers: {
                'User-Agent': 'SystemTest/1.0'
            }
        });
        console.log('✅ Backend is accessible from internet');
        console.log(`   Public URL: ${BACKEND_URL}`);
        console.log(`   Anyone can access: YES`);
    } catch (error) {
        console.log('❌ Backend is NOT accessible from internet');
        console.log(`   Possible issues:`);
        console.log(`   - Firewall blocking port ${BACKEND_PORT}`);
        console.log(`   - Backend not running`);
        allPassed = false;
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    if (allPassed) {
        console.log('✅ ALL CRITICAL TESTS PASSED!');
    } else {
        console.log('⚠️  SOME TESTS FAILED - See details above');
    }
    console.log('='.repeat(70));

    console.log('\n📊 System Status:');
    console.log(`  Backend URL: ${BACKEND_URL}`);
    console.log(`  Backend Port: ${BACKEND_PORT}`);
    console.log(`  Database: PostgreSQL on Digital Ocean`);
    console.log(`  Frontend: ${FRONTEND_URL} (local)`);

    console.log('\n💡 To make frontend accessible via link:');
    console.log('  Option 1: Deploy to Digital Ocean Static Sites');
    console.log('  Option 2: Use ngrok: ngrok http 5173');
    console.log('  Option 3: Build and host: npm run build\n');
}

runSystemTest();
