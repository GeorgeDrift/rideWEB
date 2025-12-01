// Run ONLY the negotiation workflow migration
// (Skips the missing tables migration if already run)
const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

async function runNegotiationMigration() {
    try {
        console.log('🔄 Running negotiation workflow migration...\n');

        // Check if NegotiationHistory table already exists
        const [existingTables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'NegotiationHistory';
        `);

        if (existingTables.length > 0) {
            console.log('⚠️  NegotiationHistory table already exists. Migration may have been run before.');
            console.log('   Skipping migration to avoid errors.\n');

            // Verify the table structure
            const [columns] = await sequelize.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'NegotiationHistory'
                ORDER BY column_name;
            `);

            console.log('✅ NegotiationHistory columns:');
            columns.forEach(c => console.log(`   - ${c.column_name}`));

            process.exit(0);
        }

        // Run the negotiation workflow migration
        const negotiationSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_negotiation_workflow.sql'),
            'utf8'
        );

        console.log('📋 Executing: add_negotiation_workflow.sql');
        await sequelize.query(negotiationSql);
        console.log('✅ Migration complete!\n');

        // Verify Rides table columns
        const [rideColumns] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Rides' 
            AND column_name IN ('negotiationStatus', 'offeredPrice', 'paymentType', 'acceptedPrice')
            ORDER BY column_name;
        `);

        console.log('✅ Rides table new columns:');
        rideColumns.forEach(c => console.log(`   - ${c.column_name}`));

        // Verify NegotiationHistory table
        const [negotiationTable] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'NegotiationHistory';
        `);

        if (negotiationTable.length > 0) {
            console.log('\n✅ NegotiationHistory table created successfully!');
        }

        console.log('\n🎉 Negotiation workflow migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);

        // Check if it's a "column already exists" error
        if (error.message.includes('already exists')) {
            console.log('\n⚠️  Some columns already exist. This is OK if migration was partially run before.');
            console.log('   Verifying current state...\n');

            try {
                const [columns] = await sequelize.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'Rides' 
                    AND column_name IN ('negotiationStatus', 'offeredPrice', 'paymentType')
                    ORDER BY column_name;
                `);

                console.log('✅ Current Rides table columns:');
                columns.forEach(c => console.log(`   - ${c.column_name}`));
                process.exit(0);
            } catch (verifyError) {
                console.error('Error verifying:', verifyError.message);
                process.exit(1);
            }
        } else {
            console.error(error);
            process.exit(1);
        }
    }
}

runNegotiationMigration();
