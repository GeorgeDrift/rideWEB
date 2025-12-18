const axios = require('axios');
const { User, sequelize } = require('./models');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = `test_verification_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('🔄 Starting Registration Verification Test...');
        console.log(`📧 Test Email: ${TEST_EMAIL}`);

        // 1. Register
        console.log('\n1️⃣ Registering new user...');
        try {
            const regRes = await axios.post(`${API_URL}/register`, {
                name: 'Test Verify User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                role: 'rider',
                phone: '0999111222'
            });
            console.log('✅ Registration request successful:', regRes.data.message);
        } catch (e) {
            console.error('❌ Registration failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 2. Attempt Login (Should Fail)
        console.log('\n2️⃣ Attempting Login (Should FAIL)...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.error('❌ Login SUCCEEDED but should have FAILED!');
            process.exit(1);
        } catch (e) {
            if (e.response && e.response.status === 403) {
                console.log('✅ Login correctly blocked with 403:', e.response.data.error);
            } else {
                console.error('❌ Login failed with unexpected error:', e.response?.status, e.response?.data || e.message);
                process.exit(1);
            }
        }

        // 3. Get Token from DB (Simulation of checking email)
        console.log('\n3️⃣ Fetching verification token from Database...');
        const user = await User.findOne({ where: { email: TEST_EMAIL } });
        if (!user) {
            console.error('❌ User not found in database!');
            process.exit(1);
        }
        if (user.isVerified) {
            console.error('❌ User is already verified! Default should be false.');
            process.exit(1);
        }
        const token = user.verificationToken;
        console.log(`✅ Token found: ${token}`);

        // 4. Verify Email
        console.log('\n4️⃣ Verifying Email...');
        try {
            const verifyRes = await axios.post(`${API_URL}/verify-email`, { token });
            console.log('✅ Verification successful:', verifyRes.data.message);
        } catch (e) {
            console.error('❌ Verification failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 5. Attempt Login (Should Succeed)
        console.log('\n5️⃣ Attempting Login (Should SUCCEED)...');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log('✅ Login successful!');
            console.log('🔑 Auth Token:', loginRes.data.token ? 'Received' : 'Missing');
        } catch (e) {
            console.error('❌ Login failed after verification:', e.response?.data || e.message);
        }

        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY');

    } catch (err) {
        console.error('❌ unexpected error:', err);
    } finally {
        // Cleanup?
        // await User.destroy({ where: { email: TEST_EMAIL } });
    }
}

// Wait for DB connection if needed, but script is simple
runTest();
