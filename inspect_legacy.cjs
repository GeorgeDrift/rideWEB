const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { RideShareVehicle, HireVehicle } = require('./backend/models');

async function run() {
    try {
        const rsVehicles = await RideShareVehicle.findAll();
        const hVehicles = await HireVehicle.findAll();

        console.log('--- Legacy RideShareVehicles ---');
        rsVehicles.forEach(v => {
            console.log(`ID: ${v.id}, Model: ${v.model}, Image: ${v.imageUrl}`);
        });

        console.log('\n--- Legacy HireVehicles ---');
        hVehicles.forEach(v => {
            console.log(`ID: ${v.id}, Model: ${v.model}, Image: ${v.imageUrl}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
