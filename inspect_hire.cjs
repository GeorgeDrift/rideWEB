const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { HirePost } = require('./backend/models');

async function run() {
    try {
        const posts = await HirePost.findAll({ limit: 10 });
        console.log('--- Hire Posts Inspection ---');
        posts.forEach(p => {
            console.log(`ID: ${p.id}, vehicleId: ${p.vehicleId}, imageUrl: ${p.imageUrl}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
