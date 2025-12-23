const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { sequelize } = require('./backend/models');

async function patch() {
    console.log('--- Applying Manual FK Patch ---');
    try {
        await sequelize.query(`
            ALTER TABLE "HirePosts" DROP CONSTRAINT IF EXISTS "HirePosts_vehicleId_fkey";
            ALTER TABLE "HirePosts" ADD CONSTRAINT "HirePosts_vehicleId_fkey" 
            FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

            ALTER TABLE "RideSharePosts" DROP CONSTRAINT IF EXISTS "RideSharePosts_vehicleId_fkey";
            ALTER TABLE "RideSharePosts" ADD CONSTRAINT "RideSharePosts_vehicleId_fkey" 
            FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        console.log('✅ Marketplace FK constraints updated to point to Vehicles table');
        process.exit(0);
    } catch (e) {
        console.error('❌ Patch failed:', e.message);
        process.exit(1);
    }
}
patch();
