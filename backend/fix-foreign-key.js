require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

async function runMigration() {
    try {
        console.log('🔄 Fixing RideSharePosts foreign key constraint...\n');

        // Drop the incorrect foreign key constraint
        await sequelize.query(`
            ALTER TABLE "RideSharePosts" 
            DROP CONSTRAINT IF EXISTS "RideSharePosts_vehicleId_fkey";
        `);
        console.log('✅ Dropped old foreign key constraint');

        // Add the correct foreign key constraint pointing to Vehicles table
        await sequelize.query(`
            ALTER TABLE "RideSharePosts" 
            ADD CONSTRAINT "RideSharePosts_vehicleId_fkey" 
            FOREIGN KEY ("vehicleId") 
            REFERENCES "Vehicles"("id") 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;
        `);
        console.log('✅ Added correct foreign key constraint to Vehicles table');

        // Verify the constraint
        const [results] = await sequelize.query(`
            SELECT 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.table_name = 'RideSharePosts' 
              AND tc.constraint_type = 'FOREIGN KEY'
              AND kcu.column_name = 'vehicleId';
        `);

        console.log('\n✅ Verified foreign key:');
        results.forEach(row => {
            console.log(`   - ${row.column_name} -> ${row.foreign_table_name}`);
        });

        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration error:', err.message);
        process.exit(1);
    }
}

runMigration();
