const { User, RideShareVehicle } = require('./models');
const bcrypt = require('bcryptjs');

async function setupSpecificTestUsers() {
    try {
        console.log('Starting specific test user setup...');

        // 1. Setup Driver: cen-01-16-21@unilia.ac.mw / qwerty
        const driverEmail = 'cen-01-16-21@unilia.ac.mw';
        const driverPassword = 'qwerty';
        let driver = await User.findOne({ where: { email: driverEmail } });

        if (!driver) {
            console.log(`Creating driver: ${driverEmail}`);
            driver = await User.create({
                name: 'Test Driver',
                email: driverEmail,
                password: await bcrypt.hash(driverPassword, 10),
                role: 'driver',
                phone: '0991234567',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Test+Driver'
            });
        } else {
            console.log(`Updating driver password: ${driverEmail}`);
            driver.password = await bcrypt.hash(driverPassword, 10);
            driver.accountStatus = 'active'; // Ensure active
            await driver.save();
        }

        // Ensure Driver has a vehicle
        let vehicle = await RideShareVehicle.findOne({ where: { driverId: driver.id } });
        if (!vehicle) {
            console.log('Creating vehicle for driver...');
            await RideShareVehicle.create({
                driverId: driver.id,
                make: 'Toyota',
                model: 'Corolla',
                year: 2020,
                plate: 'TEST-001',
                seats: 4,
                status: 'active'
            });
        }

        // 2. Setup Rider: passenger@test.com / password123
        const riderEmail = 'passenger@test.com';
        const riderPassword = 'password123';
        let rider = await User.findOne({ where: { email: riderEmail } });

        if (!rider) {
            console.log(`Creating rider: ${riderEmail}`);
            rider = await User.create({
                name: 'Test Passenger',
                email: riderEmail,
                password: await bcrypt.hash(riderPassword, 10),
                role: 'rider',
                phone: '0881234567',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Test+Passenger'
            });
        } else {
            console.log(`Updating rider password: ${riderEmail}`);
            rider.password = await bcrypt.hash(riderPassword, 10);
            rider.accountStatus = 'active'; // Ensure active
            await rider.save();
        }

        console.log('Specific test users setup complete.');
        process.exit(0);

    } catch (err) {
        console.error('Error setting up specific test users:', err);
        process.exit(1);
    }
}

setupSpecificTestUsers();
