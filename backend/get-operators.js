const http = require('http');

const BACKEND_URL = 'localhost';
const BACKEND_PORT = 5000;

const testDriver = {
    email: 'driver@ridex.com',
    password: 'driver123'
};

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

async function getOperators() {
    console.log('\n📱 Fetching Mobile Money Operators from PayChangu...\n');

    try {
        // Login first
        const loginRes = await makeRequest('/api/auth/login', 'POST', testDriver);
        if (!loginRes.ok) {
            throw new Error('Login failed');
        }
        const authToken = loginRes.data.token;

        // Get operators
        const operatorsRes = await makeRequest('/api/payment/mobile-money-operators', 'GET', null, {
            'Authorization': `Bearer ${authToken}`
        });

        if (operatorsRes.ok) {
            console.log('✅ Operators Retrieved!\n');
            console.log(JSON.stringify(operatorsRes.data, null, 2));

            console.log('\n📋 OPERATOR IDS TO USE:\n');
            if (Array.isArray(operatorsRes.data)) {
                operatorsRes.data.forEach(op => {
                    console.log(`   ${op.name}: "${op.ref_id || op.id}"`);
                });
            }
        } else {
            console.log('❌ Failed to get operators');
            console.log('Response:', operatorsRes.data);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

getOperators();
