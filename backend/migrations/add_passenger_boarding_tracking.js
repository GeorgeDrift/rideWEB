/**
 * Migration: Add passenger boarding tracking fields to Rides table
 * 
 * This migration adds fields to track multi-passenger pickup for ride share trips.
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
        console.log('Starting migration: Add passenger boarding tracking fields...\n');

        // Check if columns already exist
        const [existingColumns] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Rides' 
            AND column_name IN ('totalPassengers', 'boardedPassengers', 'passengerBoardingList');
        `);

        if (existingColumns.length > 0) {
            console.log('✓ Columns already exist. Skipping migration.');
            await sequelize.close();
            return;
        }

        // Add totalPassengers column
        await sequelize.query(`
            ALTER TABLE "Rides" 
            ADD COLUMN IF NOT EXISTS "totalPassengers" INTEGER DEFAULT 1;
        `);
        console.log('✓ Added totalPassengers column');

        // Add boardedPassengers column
        await sequelize.query(`
            ALTER TABLE "Rides" 
            ADD COLUMN IF NOT EXISTS "boardedPassengers" INTEGER DEFAULT 0;
        `);
        console.log('✓ Added boardedPassengers column');

        // Add passengerBoardingList column (JSONB for better querying in PostgreSQL)
        await sequelize.query(`
            ALTER TABLE "Rides" 
            ADD COLUMN IF NOT EXISTS "passengerBoardingList" JSONB;
        `);
        console.log('✓ Added passengerBoardingList column');

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
