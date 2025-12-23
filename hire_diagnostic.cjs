const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { HirePost, Vehicle, HireVehicle } = require('./backend/models');

async function run() {
    try {
        const posts = await HirePost.findAll({
            include: [{ model: Vehicle, as: 'vehicle' }]
        });

        console.log('--- Hire Posts Detail ---');
        posts.forEach(p => {
            console.log(`ID: ${p.id}`);
            console.log(`  Title: ${p.title}`);
            console.log(`  Post Image: ${p.imageUrl}`);
            console.log(`  Vehicle ID: ${p.vehicleId}`);
            if (p.vehicle) {
                console.log(`  Vehicle Name: ${p.vehicle.name}`);
                console.log(`  Vehicle Image: ${p.vehicle.imageUrl}`);
            } else {
                console.log(`  Vehicle: NOT FOUND`);
            }
            console.log('---');
        });

        // Also check if any IDs in HirePosts point to HireVehicle table instead of Vehicle table
        console.log('\n--- Checking Cross-Table Referencing ---');
        const allPosts = await HirePost.findAll();
        for (const p of allPosts) {
            if (p.vehicleId) {
                const hv = await HireVehicle.findByPk(p.vehicleId);
                if (hv) {
                    console.log(`Post ${p.id} points to ID ${p.vehicleId} in HireVehicle table!`);
                    console.log(`  HireVehicle Image: ${hv.imageUrl}`);
                }
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
