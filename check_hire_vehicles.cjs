const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { HirePost, Vehicle, HireVehicle } = require('./backend/models');

async function run() {
    try {
        const posts = await HirePost.findAll();
        console.log('--- Hire Posts Vehicle Check ---');
        for (const p of posts) {
            if (p.vehicleId) {
                const inV = await Vehicle.findByPk(p.vehicleId);
                const inHV = await HireVehicle.findByPk(p.vehicleId);
                console.log(`Post ${p.id}: vehicleId=${p.vehicleId}, in Vehicle=${!!inV}, in HireVehicle=${!!inHV}`);
            } else {
                console.log(`Post ${p.id}: vehicleId is NULL`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
