const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Vehicle, RideShareVehicle, HireVehicle, HirePost, RideSharePost } = require('./backend/models');

async function run() {
    try {
        const [v, rsv, hv, hp, rsp] = await Promise.all([
            Vehicle.count(),
            RideShareVehicle.count(),
            HireVehicle.count(),
            HirePost.count(),
            RideSharePost.count()
        ]);
        console.log('--- Statistics ---');
        console.log('Vehicles (Main):', v);
        console.log('RideShareVehicles (Legacy):', rsv);
        console.log('HireVehicles (Legacy):', hv);
        console.log('HirePosts:', hp);
        console.log('RideSharePosts:', rsp);

        // Sample one HirePost to see its vehicleId
        const sampleHp = await HirePost.findOne();
        if (sampleHp) {
            console.log('Sample HirePost vehicleId:', sampleHp.vehicleId);
            const inV = await Vehicle.findByPk(sampleHp.vehicleId);
            const inHV = await HireVehicle.findByPk(sampleHp.vehicleId);
            console.log('Found in Vehicle Table:', !!inV);
            console.log('Found in HireVehicle Table:', !!inHV);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
