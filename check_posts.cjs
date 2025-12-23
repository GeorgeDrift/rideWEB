const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { RideSharePost } = require('./backend/models');

async function checkData() {
    try {
        const posts = await RideSharePost.findAll({ limit: 5 });
        console.log('Posts found:', posts.length);
        posts.forEach(p => {
            console.log(`ID: ${p.id}, Date: ${p.date}, Time: ${p.time}`);
        });
        process.exit(0);
    } catch (e) {
        console.error('Error during query:', e);
        process.exit(1);
    }
}

checkData();
