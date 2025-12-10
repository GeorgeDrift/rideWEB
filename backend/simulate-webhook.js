const http = require('http');

// Test webhook for latest subscription transaction
const webhookData = {
    charge_id: 'eb56a8f2-a033-452c-b7c9-500ca856c77f', // Latest transaction reference
    status: 'successful',
    tx_ref: 'eb56a8f2-a033-452c-b7c9-500ca856c77f',
    metadata: {
        plan: 'monthly',
        duration: 30
    }
};

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/subscriptions/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(webhookData).length
    }
};

console.log('📲 Simulating PayChangu webhook...');
console.log('Charge ID:', webhookData.charge_id);
console.log('Status:', webhookData.status);

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\n✅ Webhook Response:');
        console.log('Status Code:', res.statusCode);
        try {
            console.log('Body:', JSON.parse(data));
        } catch {
            console.log('Body:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(JSON.stringify(webhookData));
req.end();
