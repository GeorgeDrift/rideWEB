const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { sequelize } = require('./backend/models');

async function run() {
    try {
        const [hp] = await sequelize.query('SELECT * FROM "HirePosts" LIMIT 1');
        const [rsp] = await sequelize.query('SELECT * FROM "RideSharePosts" LIMIT 1');

        console.log('--- HirePosts Columns ---');
        if (hp[0]) console.log(Object.keys(hp[0]).join(', '));
        else console.log('No HirePosts records to inspect columns.');

        console.log('\n--- RideSharePosts Columns ---');
        if (rsp[0]) console.log(Object.keys(rsp[0]).join(', '));
        else console.log('No RideSharePosts records to inspect columns.');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
