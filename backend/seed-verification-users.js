
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function seedVerificationUsers() {
    try {
        console.log('Seeding verification users...');

        // 1. Create Driver
        const driverEmail = 'driver@ridex.com';
        let driver = await User.findOne({ where: { email: driverEmail } });
        if (!driver) {
            driver = await User.create({
                name: 'John Driver',
                email: driverEmail,
                password: await bcrypt.hash('driver123', 10),
                role: 'driver',
                phone: '0991234567',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=John+Driver',
                // Driver specific fields needed for active status sometimes
                airtelMoneyNumber: '0991234567'
            });
            console.log('Created Driver: driver@ridex.com');
        } else {
            console.log('Driver already exists: driver@ridex.com');
            // Ensure password is correct if existing (optional, but good for testing)
            // await driver.update({ password: await bcrypt.hash('driver123', 10) });
        }

        // 2. Create Rider
        const riderEmail = 'rider@ridex.com';
        let rider = await User.findOne({ where: { email: riderEmail } });
        if (!rider) {
            rider = await User.create({
                name: 'Alice Passenger',
                email: riderEmail,
                password: await bcrypt.hash('rider123', 10),
                role: 'rider',
                phone: '0881234567',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Alice+Passenger'
            });
            console.log('Created Rider: rider@ridex.com');
        } else {
            console.log('Rider already exists: rider@ridex.com');
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
}

seedVerificationUsers();
