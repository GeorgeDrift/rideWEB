const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

async function runVehicleMigration() {
    try {
        console.log('🔄 Running vehicle ID migration...\n');

        const migrationSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_vehicle_id_to_posts.sql'),
            'utf8'
        );

        console.log('📋 Executing: add_vehicle_id_to_posts.sql');
        await sequelize.query(migrationSql);
        console.log('✅ Migration complete!\n');

        // Verify columns
        const [columns] = await sequelize.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_name IN ('RideSharePosts', 'HirePosts') 
            AND column_name = 'vehicleId'
            ORDER BY table_name;
        `);

        console.log('✅ Verified columns:');
        columns.forEach(c => console.log(`   - ${c.table_name}.${c.column_name}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runVehicleMigration();
