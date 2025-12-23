const http = require('http');

async function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:5000/api${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`Endpoint: ${path}`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(`Results: ${Array.isArray(json) ? json.length : 'Object'}`);
                    if (Array.isArray(json) && json.length > 0) {
                        console.log('First result ID:', json[0].id);
                    } else if (!Array.isArray(json)) {
                        console.log('Keys:', Object.keys(json));
                    }
                } catch (e) {
                    console.log('Data:', data.substring(0, 100));
                }
                console.log('---');
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error ${path}:`, err.message);
            resolve();
        });
    });
}

async function runTests() {
    await testEndpoint('/marketplace/rideshare');
    await testEndpoint('/marketplace/hire');
    await testEndpoint('/marketplace/all');
    process.exit(0);
}

runTests();
