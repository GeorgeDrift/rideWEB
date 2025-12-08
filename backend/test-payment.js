require('dotenv').config();
const payChanguService = require('./services/payChanguService');
const crypto = require('crypto');

async function runTest() {
    console.log('🚀 Starting Backend Payment Test...');

    // Airtel UUID defined in previous steps
    const OPERATOR_ID = '20be6c20-adeb-4b5b-a7ba-0769820df4fb';
    const MOBILE = '265992661958';
    const AMOUNT = 500;
    const CHARGE_ID = crypto.randomUUID();

    const payload = {
        mobile: MOBILE,
        amount: AMOUNT,
        mobile_money_operator_ref_id: OPERATOR_ID,
        charge_id: CHARGE_ID
    };

    console.log('📦 Sending Payload:', payload);

    try {
        const response = await payChanguService.initiatePayment(payload);
        console.log('\n✅ API REQUEST SUCCESSFUL');
        console.log('-------------------------');
        console.log(JSON.stringify(response, null, 2));
        console.log('-------------------------');
        console.log('👉 Check your phone (' + MOBILE + ') for the prompt!');
    } catch (error) {
        console.error('\n❌ API REQUEST FAILED');
        console.error('---------------------');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('API Status:', error.response.status);
            console.error('API Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

runTest();
