const payChanguService = require('./services/payChanguService');
require('dotenv').config();

async function testPayChangu() {
    console.log('🚀 Starting PayChangu Integration Test...');
    console.log('----------------------------------------');

    try {
        // 1. Test Get Operators
        console.log('\n1. Fetching Mobile Money Operators...');
        const operators = await payChanguService.getMobileMoneyOperators();
        console.log('✅ Operators Retrieved:', JSON.stringify(operators, null, 2));

        if (!operators || operators.data.length === 0) {
            console.error('❌ No operators found. Aborting payment test.');
            return;
        }

        // Pick the first operator (usually Airtel or TNM)
        const operator = operators.data[1]; // Index 1 is often Airtel in Malawi context, but check list
        console.log(`\n👉 Selected Operator: ${operator.name} (${operator.ref_id})`);

        // 2. Test Initiate Payment (Optional - requires real mobile number)
        // Uncomment to test payment initiation
        /*
        const testMobile = '0999123456'; // REPLACE WITH REAL NUMBER FOR TESTING
        const amount = 50; // Small amount

        console.log(`\n2. Initiating Payment of MWK ${amount} to ${testMobile}...`);
        const payment = await payChanguService.initiatePayment({
            mobile: testMobile,
            amount: amount,
            mobile_money_operator_ref_id: operator.ref_id
        });
        console.log('✅ Payment Initiated:', payment);

        const chargeId = payment.data?.charge_id;
        if (chargeId) {
            // 3. Verify Payment
            console.log(`\n3. Verifying Charge ID: ${chargeId}...`);
            const verification = await payChanguService.verifyPayment(chargeId);
            console.log('✅ Verification Result:', verification);
        }
        */

        console.log('\n----------------------------------------');
        console.log('🎉 Basic Connection Test Passed!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testPayChangu();
