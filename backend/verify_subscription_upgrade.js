const axios = require('axios');
const { User, Transaction, SubscriptionPlans, sequelize } = require('./models');

const API_URL = 'http://localhost:5000/api/auth';
const SUB_API_URL = 'http://localhost:5000/api/subscriptions';

async function runTest() {
    console.log('🔄 Starting Subscription Upgrade Verification...');
    
    // 1. Register a new driver
    const email = `driver_upgrade_${Date.now()}@test.com`;
    const password = 'password123';
    
    console.log(`\n1️⃣ Registering Driver: ${email}`);
    try {
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Upgrade Test Driver',
            email,
            password,
            role: 'driver',
            phone: '0999111222',
            driverLicenseUrl: 'http://test.com/license.jpg',
            airtelMoneyNumber: '0999111222'
        });
        
        const token = regRes.data.token;
        console.log('✅ Driver registered & Auto-logged in.');
        
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Check Initial Status (Should be Trial)
        console.log('\n2️⃣ Checking Initial Subscription Status...');
        const statusRes = await axios.get(`${SUB_API_URL}/status`, { headers });
        const { inTrialPeriod, trialDaysRemaining, status } = statusRes.data;
        
        console.log(`   Status: ${status}`);
        console.log(`   In Trial: ${inTrialPeriod}`);
        console.log(`   Days Remaining: ${trialDaysRemaining}`);
        
        if (!inTrialPeriod) console.error('❌ Expected to be in trial period!');
        else console.log('✅ Correctly in trial period.');

        // 3. Fetch Plans
        console.log('\n3️⃣ Fetching Subscription Plans...');
        const plansRes = await axios.get(`${SUB_API_URL}/plans`, { headers });
        const plans = plansRes.data.plans || plansRes.data;
        
        if (plans.length === 0) {
            console.error('❌ No plans found! Cannot test upgrade.');
            return;
        }
        console.log(`✅ Found ${plans.length} plans.`);
        const targetPlan = plans[0];
        console.log(`   Targeting Plan: ${targetPlan.name} (MWK ${targetPlan.price})`);

        // 4. Initiate Upgrade
        console.log('\n4️⃣ Initiating Upgrade Payment...');
        try {
            const initRes = await axios.post(`${SUB_API_URL}/pay`, {
                planId: targetPlan.id,
                mobileNumber: '0999111222',
                providerRefId: 'test-provider-ref' // Mock ref
            }, { headers });
            
            console.log('✅ Payment Initiated:', initRes.data.message);
            const chargeId = initRes.data.chargeId;
            console.log(`   Charge ID: ${chargeId}`);

            // 5. Verify Transaction in DB
            console.log('\n5️⃣ Verifying Transaction Record in DB...');
            const tx = await Transaction.findOne({ 
                where: { reference: chargeId },
                order: [['createdAt', 'DESC']]
            });
            
            if (tx) {
                console.log(`✅ Transaction found in DB! Status: ${tx.status}, Amount: ${tx.amount}`);
                if (tx.amount !== targetPlan.price) console.error('❌ Amount mismatch!');
            } else {
                console.error('❌ Transaction record not found!');
            }

        } catch (payErr) {
            console.error('❌ Payment Initiation Failed:', payErr.response?.data || payErr.message);
        }

    } catch (err) {
        console.error('❌ Test Failed:', err.response?.data || err.message);
    }
}

runTest();
