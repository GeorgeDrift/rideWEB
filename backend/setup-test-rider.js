const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function setupTestRider() {
    try {
        const email = 'testrider_unique_123@example.com';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('Test rider already exists. Updating...');
            user.password = hashedPassword;
            user.role = 'rider';
            user.accountStatus = 'active';
            await user.save();
            console.log('Test rider updated.');
        } else {
            console.log('Creating test rider...');
            user = await User.create({
                name: 'Test Rider',
                email,
                password: hashedPassword,
                role: 'rider',
                phone: '0999123456',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Test+Rider&background=random'
            });
            console.log('Test rider created.');
        }
    } catch (err) {
        console.error('Error setting up test rider:', err);
    }
}

setupTestRider();
