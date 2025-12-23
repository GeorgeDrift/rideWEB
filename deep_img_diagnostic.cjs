const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Manually require sequelize from backend/node_modules
const sequelizePath = path.join(__dirname, 'backend', 'node_modules', 'sequelize');
const { Op } = require(sequelizePath);

const { HirePost, RideSharePost, Vehicle } = require('./backend/models');

async function run() {
    try {
        console.log('--- Database Image Check ---');
        const hpWithImg = await HirePost.findAll({ where: { imageUrl: { [Op.ne]: null } } });
        console.log(`HirePosts with imageUrl: ${hpWithImg.length}`);
        hpWithImg.forEach(p => console.log(`  HP ${p.id}: ${p.imageUrl}`));

        const rspWithImg = await RideSharePost.findAll({ where: { imageUrl: { [Op.ne]: null } } });
        console.log(`RideSharePosts with imageUrl: ${rspWithImg.length}`);
        rspWithImg.forEach(p => console.log(`  RSP ${p.id}: ${p.imageUrl}`));

        const vWithImg = await Vehicle.findAll({ where: { imageUrl: { [Op.ne]: null } } });
        console.log(`Vehicles with imageUrl: ${vWithImg.length}`);
        vWithImg.forEach(v => console.log(`  V ${v.id}: ${v.imageUrl}`));

        console.log('\n--- Final Directory Listing ---');
        const uploadDirs = ['uploads', 'uploads/posts', 'uploads/vehicles'];
        uploadDirs.forEach(dir => {
            const fullDir = path.join(__dirname, 'backend', dir);
            if (fs.existsSync(fullDir)) {
                console.log(`Contents of ${dir}:`);
                const files = fs.readdirSync(fullDir);
                files.forEach(f => {
                    const stats = fs.statSync(path.join(fullDir, f));
                    if (stats.isFile()) console.log(`  [FILE] ${f}`);
                    else console.log(`  [DIR ] ${f}`);
                });
            } else {
                console.log(`Directory ${dir} DOES NOT EXIST at ${fullDir}`);
            }
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
