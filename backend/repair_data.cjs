const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { HirePost, RideSharePost, Vehicle, HireVehicle, RideShareVehicle, User } = require('./models');

async function repair() {
    console.log('--- Starting Marketplace Data Repair ---');
    try {
        const drivers = await User.findAll({ where: { role: 'driver' } });
        console.log(`Found ${drivers.length} drivers.`);

        for (const driver of drivers) {
            console.log(`\nProcessing Driver: ${driver.name} (${driver.id})`);

            // 1. Ensure driver has records in the main Vehicles table
            let vehicles = await Vehicle.findAll({ where: { driverId: driver.id } });

            if (vehicles.length === 0) {
                console.log('  No main vehicles found. Checking legacy tables...');
                const legacyHire = await HireVehicle.findAll({ where: { driverId: driver.id } });
                const legacyShare = await RideShareVehicle.findAll({ where: { driverId: driver.id } });

                for (const lv of legacyHire) {
                    console.log(`    Migrating legacy HireVehicle: ${lv.name || lv.model}`);
                    await Vehicle.create({
                        id: lv.id,
                        name: lv.name || lv.model || 'Legacy Vehicle',
                        plate: lv.plate || 'Unknown',
                        category: lv.category || 'General',
                        make: lv.make || lv.model,
                        model: lv.model,
                        rate: lv.rate || '0',
                        imageUrl: lv.imageUrl,
                        driverId: driver.id,
                        status: 'Available'
                    });
                }

                for (const lv of legacyShare) {
                    console.log(`    Migrating legacy RideShareVehicle: ${lv.model}`);
                    await Vehicle.create({
                        id: lv.id,
                        name: lv.name || lv.model || 'Legacy Vehicle',
                        plate: lv.plate || 'Unknown',
                        category: 'General',
                        make: lv.make || lv.model,
                        model: lv.model,
                        imageUrl: lv.imageUrl,
                        seats: lv.seats || 4,
                        color: lv.color,
                        driverId: driver.id,
                        status: 'Available',
                        rate: '0'
                    });
                }
                // Refresh vehicle list
                vehicles = await Vehicle.findAll({ where: { driverId: driver.id } });
            }

            // 2. Auto-link unlinked Posts if driver has exactly ONE vehicle
            if (vehicles.length === 1) {
                const targetVehicleId = vehicles[0].id;
                console.log(`  Driver has exactly one vehicle (${vehicles[0].name}). Auto-linking...`);

                const unlinkedHire = await HirePost.update(
                    { vehicleId: targetVehicleId },
                    { where: { driverId: driver.id, vehicleId: null } }
                );
                console.log(`    Linked ${unlinkedHire[0]} HirePosts.`);

                const unlinkedShare = await RideSharePost.update(
                    { vehicleId: targetVehicleId },
                    { where: { driverId: driver.id, vehicleId: null } }
                );
                console.log(`    Linked ${unlinkedShare[0]} RideSharePosts.`);
            } else if (vehicles.length > 1) {
                console.log(`  Driver has ${vehicles.length} vehicles. Skipping auto-link to avoid ambiguity.`);
            } else {
                console.log('  No vehicles available to link.');
            }
        }

        console.log('\n--- Repair Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
}

repair();
