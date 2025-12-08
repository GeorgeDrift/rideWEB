const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function reset() {
    try {
        const email = 'dev-driver@example.com';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ where: { email } });
        if (user) {
            user.password = hashedPassword;
            user.accountStatus = 'active'; // Ensure active
            await user.save();
            console.log(`Password for ${email} reset to '${password}' and status set to active.`);
        } else {
            console.log(`User ${email} not found. Creating...`);
            await User.create({
                name: 'Dev Driver',
                email: email,
                password: hashedPassword,
                role: 'driver',
                phone: '+265999123456',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Dev+Driver',
                driverLicenseUrl: 'https://example.com/license.jpg',
                airtelMoneyNumber: '+265999123456'
            });
            console.log(`User ${email} created.`);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

reset();
