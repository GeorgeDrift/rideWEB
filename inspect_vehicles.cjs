const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Vehicle } = require('./backend/models');

async function run() {
    try {
        const vehicles = await Vehicle.findAll();
        console.log('--- Main Vehicles ---');
        vehicles.forEach(v => {
            console.log(`ID: ${v.id}, Name: ${v.name}, Image: ${v.imageUrl}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
