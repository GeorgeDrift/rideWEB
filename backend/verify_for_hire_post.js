const axios = require('axios');
const { User, HirePost, sequelize } = require('./models');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('🔄 Starting For Hire Post Verification...');

        // 1. Create Test Driver
        const testEmail = `driver_hire_${Date.now()}@test.com`;
        const driver = await User.create({
            name: 'Hire Test Driver',
            email: testEmail,
            password: 'password123',
            role: 'driver',
            isVerified: true,
            accountStatus: 'active',
            subscriptionStatus: 'active', // Ensure distinct from trial issues
            subscriptionExpiry: new Date(Date.now() + 86400000) // 1 day future
        });
        console.log(`✅ Test Driver created: ${driver.email}`);

        // 2. Mock Login (Generate Token) - we can just use the user ID if we bypass auth or use JWT
        // Let's generate a token properly to test the route
        const jwt = require('jsonwebtoken');
        // Need JWT_SECRET fromenv or hardcoded fallbak from controller file view
        const JWT_SECRET = process.env.JWT_SECRET || 'ridex_secure_super_secret_key_2024';
        const token = jwt.sign({ id: driver.id, role: 'driver' }, JWT_SECRET);

        // 3. Post a "For Hire" Job
        console.log('\n3️⃣ Posting For Hire Job...');
        const postData = {
            vehicleId: null, // Optional in some flows, or we might need to create a vehicle first
            // Wait, looking at controller `addDriverHirePost`
            title: 'Luxury SUV for Wedding',
            category: 'Wedding',
            location: 'Lilongwe',
            rate: 50000,
            rateUnit: 'day',
            description: 'Beautiful white SUV available for weddings.',
            imageUrl: 'http://example.com/suv.jpg',
            available: true,
            status: 'available'
        };

        try {
            const res = await axios.post(`${API_URL}/driver/hire-posts`, postData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Job Posted Successfully:', res.data.title);
        } catch (e) {
            console.error('❌ Post failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 4. Verify in DB
        console.log('\n4️⃣ Verifying in Database...');
        const posts = await HirePost.findAll({ where: { userId: driver.id } });
        if (posts.length > 0) {
            console.log(`✅ Found ${posts.length} post(s) in DB.`);
            console.log(`   - Title: ${posts[0].title}`);
            console.log(`   - Status: ${posts[0].status}`);
        } else {
            console.error('❌ No posts found in DB!');
            process.exit(1);
        }

        // 5. Verify Public Retrieval (Marketplace)
        // Usually /api/rides/for-hire or similar?
        // Let's check `riderRoutes` or `rideRoutes`. Assuming /api/rides/for-hire
        // Just checking DB is enough for "Posting" verification.
        
        console.log('\n🎉 FOR HIRE POSTING VERIFIED');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    } finally {
        process.exit();
    }
}

runTest();
