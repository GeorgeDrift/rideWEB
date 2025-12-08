/**
 * Fix Test Rider Login
 * 
 * This script ensures the test rider account has a properly hashed password
 * so that login works correctly.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixTestRider() {
    try {
        console.log('🔧 Fixing test rider login...\n');

        // Test rider credentials
        const testRiders = [
            { email: 'passenger@test.com', password: 'password123', name: 'Test Passenger' },
            { email: 'testrider_unique_123@example.com', password: 'password', name: 'Test Rider' }
        ];

        for (const riderInfo of testRiders) {
            let user = await User.findOne({ where: { email: riderInfo.email } });

            // Hash the password
            const hashedPassword = await bcrypt.hash(riderInfo.password, 10);

            if (user) {
                console.log(`✓ Found existing user: ${riderInfo.email}`);

                // Update with hashed password and ensure active status
                user.password = hashedPassword;
                user.role = 'rider';
                user.accountStatus = 'active';
                await user.save();

                console.log(`  ✓ Updated password (hashed with bcrypt)`);
                console.log(`  ✓ Role: ${user.role}`);
                console.log(`  ✓ Status: ${user.accountStatus}`);
            } else {
                console.log(`✓ Creating new user: ${riderInfo.email}`);

                user = await User.create({
                    name: riderInfo.name,
                    email: riderInfo.email,
                    password: hashedPassword,
                    role: 'rider',
                    phone: '0999123456',
                    accountStatus: 'active',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(riderInfo.name)}&background=random`
                });

                console.log(`  ✓ Created with hashed password`);
            }

            // Verify the password works
            const passwordWorks = await bcrypt.compare(riderInfo.password, user.password);
            console.log(`  ✓ Password verification: ${passwordWorks ? 'PASS' : 'FAIL'}`);
            console.log('');
        }

        console.log('✅ Test rider accounts are ready!\n');
        console.log('📝 Login Credentials:');
        console.log('   Email: passenger@test.com');
        console.log('   Password: password123\n');
        console.log('   Email: testrider_unique_123@example.com');
        console.log('   Password: password\n');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

// Run the fix
fixTestRider().then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
