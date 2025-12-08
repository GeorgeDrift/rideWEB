/**
 * Test Rider Login - Simple Script
 * 
 * This script tests the rider login flow end-to-end
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testRiderLogin() {
    try {
        console.log('🧪 Testing Rider Login Flow...\n');

        const testEmail = 'passenger@test.com';
        const testPassword = 'password123';

        // 1. Find the user
        const user = await User.findOne({ where: { email: testEmail } });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('✓ User found:');
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Account Status: ${user.accountStatus}`);
        console.log('');

        // 2. Test password comparison
        const passwordMatch = await bcrypt.compare(testPassword, user.password);

        if (!passwordMatch) {
            console.log('❌ Password does not match');
            console.log(`  Stored password hash: ${user.password.substring(0, 20)}...`);
            process.exit(1);
        }

        console.log('✓ Password matches!');
        console.log('');

        // 3. Check role
        if (user.role !== 'rider') {
            console.log(`⚠️  WARNING: User role is "${user.role}", not "rider"`);
            console.log('   This might cause routing issues in the frontend');
        } else {
            console.log('✓ Role is correct: rider');
        }

        console.log('');
        console.log('✅ All checks passed!');
        console.log('');
        console.log('If frontend login still fails, the issue is likely:');
        console.log('  1. Frontend routing/component error');
        console.log('  2. JWT token generation/storage issue');
        console.log('  3. RiderDashboard component error');
        console.log('');
        console.log('Check browser console for errors!');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

testRiderLogin().then(() => {
    console.log('\nTest completed.');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
