
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function seedCustomUsers() {
    try {
        console.log('Seeding custom users...');

        // 1. Create Driver (cen-01-16-21@unilia.ac.mw / qwerty)
        const driverEmail = 'cen-01-16-21@unilia.ac.mw';
        let driver = await User.findOne({ where: { email: driverEmail } });
        if (!driver) {
            driver = await User.create({
                name: 'Custom Driver',
                email: driverEmail,
                password: await bcrypt.hash('qwerty', 10),
                role: 'driver',
                phone: '0990000001',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Custom+Driver',
                airtelMoneyNumber: '0990000001',
                bankName: 'National Bank',
                bankAccountNumber: '1000000'
            });
            console.log(`Created Driver: ${driverEmail}`);
        } else {
            console.log(`Driver already exists: ${driverEmail}`);
            // Update password to ensure it matches
            await driver.update({
                password: await bcrypt.hash('qwerty', 10),
                accountStatus: 'active'
            });
        }

        // 2. Create Rider (pasenger@test.com / password123)
        const riderEmail = 'pasenger@test.com';
        let rider = await User.findOne({ where: { email: riderEmail } });
        if (!rider) {
            rider = await User.create({
                name: 'Custom Passenger',
                email: riderEmail,
                password: await bcrypt.hash('password123', 10),
                role: 'rider',
                phone: '0880000001',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Custom+Passenger'
            });
            console.log(`Created Rider: ${riderEmail}`);
        } else {
            console.log(`Rider already exists: ${riderEmail}`);
            await rider.update({ password: await bcrypt.hash('password123', 10) });
        }

        console.log('Seeding custom users complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding custom users:', err);
        process.exit(1);
    }
}

seedCustomUsers();
