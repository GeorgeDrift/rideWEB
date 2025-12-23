const { User, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        console.log('--- Seeding New Admin ---');

        const email = 'Ridexmalawi@gmail.com';
        const password = 'RidexAdmin2024!';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            console.log(`User ${email} already exists. Updating to Admin...`);
            await existing.update({
                role: 'admin',
                password: hashedPassword,
                isVerified: true,
                accountStatus: 'active'
            });
            console.log('✅ Admin updated successfully.');
        } else {
            await User.create({
                name: 'RideX Malawi Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                accountStatus: 'active'
            });
            console.log('✅ Admin created successfully.');
        }

        console.log('-------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-------------------------');

        process.exit(0);
    } catch (e) {
        console.error('❌ Seeding failed:', e.message);
        process.exit(1);
    }
})();
