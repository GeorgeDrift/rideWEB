const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function setupUser() {
    try {
        const email = 'cen-01-16-21@unilia.ac.mw';
        const password = 'qwerty';
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log(`User ${email} found. Updating...`);
            user.password = hashedPassword;
            user.role = 'driver'; // Ensure role is driver
            user.accountStatus = 'active';
            await user.save();
            console.log(`User updated: Role=${user.role}, Status=${user.accountStatus}`);
        } else {
            console.log(`User ${email} not found. Creating...`);
            user = await User.create({
                name: 'Test Driver Unilia',
                email: email,
                password: hashedPassword,
                role: 'driver',
                phone: '+265999999999',
                accountStatus: 'active',
                avatar: `https://ui-avatars.com/api/?name=Test+Driver`,
                // Driver specific fields
                driverLicenseUrl: 'placeholder.jpg',
                airtelMoneyNumber: '+265999999999'
            });
            console.log(`User created with ID: ${user.id}`);
        }
    } catch (err) {
        console.error('Error setting up user:', err);
    }
}

setupUser();
