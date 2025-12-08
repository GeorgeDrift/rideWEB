/**
 * Migration: Add payoutMethod column to Users table
 * 
 * This migration adds the payoutMethod field to support driver payout preferences.
 * The field stores which payment method the driver prefers: Bank, Airtel Money, or Mpamba.
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: console.log
    });

    try {
        console.log('Starting migration: Add payoutMethod to Users table...\n');

        // Check if column already exists
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Users' 
            AND column_name = 'payoutMethod';
        `);

        if (results.length > 0) {
            console.log('✓ Column payoutMethod already exists. Skipping migration.');
            await sequelize.close();
            return;
        }

        // Create ENUM type if it doesn't exist
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "enum_Users_payoutMethod" AS ENUM ('Bank', 'Airtel Money', 'Mpamba');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✓ Created ENUM type for payoutMethod');

        // Add the column
        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN "payoutMethod" "enum_Users_payoutMethod";
        `);
        console.log('✓ Added payoutMethod column to Users table');

        // Verify the migration
        const [verifyResults] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Users' 
            AND column_name = 'payoutMethod';
        `);

        if (verifyResults.length > 0) {
            console.log('✓ Migration verified successfully');
            console.log('  Column details:', verifyResults[0]);
        }

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    runMigration().then(() => {
        console.log('\nMigration script finished.');
        process.exit(0);
    }).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

module.exports = { runMigration };
