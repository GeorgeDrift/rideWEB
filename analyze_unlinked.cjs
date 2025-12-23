const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Vehicle, HirePost, User } = require('./backend/models');

async function run() {
    try {
        const drivers = await User.findAll({ where: { role: 'driver' } });
        console.log(`Found ${drivers.length} drivers.`);

        for (const d of drivers) {
            const vehicles = await Vehicle.findAll({ where: { driverId: d.id } });
            const posts = await HirePost.findAll({ where: { driverId: d.id, vehicleId: null, imageUrl: null } });

            console.log(`Driver: ${d.name} (${d.id})`);
            console.log(`  Vehicles: ${vehicles.length}`);
            console.log(`  Unlinked Hire Posts: ${posts.length}`);

            if (vehicles.length === 1 && posts.length > 0) {
                console.log(`  SUGGESTION: Link ${posts.length} posts to vehicle ${vehicles[0].name} (${vehicles[0].id})`);
            } else if (vehicles.length > 1 && posts.length > 0) {
                console.log(`  CONFLICT: Driver has multiple vehicles. Cannot auto-link search.`);
            }
            console.log('---');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
