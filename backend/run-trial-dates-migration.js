// Migration script to add trial dates to Users table
// Run with: node run-trial-dates-migration.js

const { sequelize } = require('./models');

async function runMigration() {
    try {
        console.log('🔧 Starting trial dates migration...');

        // Add trialStartDate column
        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP;
        `);
        console.log('✅ Added trialStartDate column');

        // Add trialEndDate column
        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP;
        `);
        console.log('✅ Added trialEndDate column');

        // Backfill existing users: set trial_start_date to created_at
        await sequelize.query(`
            UPDATE "Users" 
            SET "trialStartDate" = "createdAt"
            WHERE "trialStartDate" IS NULL;
        `);
        console.log('✅ Backfilled trialStartDate for existing users');

        // Backfill existing users: set trial_end_date to created_at + 30 days
        await sequelize.query(`
            UPDATE "Users" 
            SET "trialEndDate" = "createdAt" + INTERVAL '30 days'
            WHERE "trialEndDate" IS NULL;
        `);
        console.log('✅ Backfilled trialEndDate for existing users');

        // Create index for faster lookups
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_users_trial_end_date 
            ON "Users" ("trialEndDate");
        `);
        console.log('✅ Created index on trialEndDate');

        // Verify the migration
        const [results] = await sequelize.query(`
            SELECT 
                id, 
                email, 
                role,
                "createdAt",
                "trialStartDate",
                "trialEndDate",
                "subscriptionStatus"
            FROM "Users" 
            LIMIT 5;
        `);

        console.log('\n📊 Sample data after migration:');
        console.table(results);

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
