const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./models');
const fs = require('fs');

async function runStatusFix() {
    try {
        console.log('🔄 Running status constraint update...\n');

        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'update_rides_status_check.sql'),
            'utf8'
        );

        console.log('📋 Executing: update_rides_status_check.sql');
        await sequelize.query(sql);
        console.log('✅ Migration complete!\n');

        // Verification
        const [constraints] = await sequelize.query(`
            SELECT pg_get_constraintdef(oid) AS constraint_def
            FROM pg_constraint
            WHERE conrelid = '"Rides"'::regclass
            AND conname = 'Rides_status_check';
        `);

        if (constraints.length > 0) {
            console.log('✅ New constraint definition:');
            console.log(constraints[0].constraint_def);
        } else {
            console.log('⚠️  Could not verify constraint.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runStatusFix();
