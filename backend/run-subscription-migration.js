const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

async function runSubscriptionMigration() {
    try {
        console.log('🔄 Running Subscription & Disputes migration...\n');

        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_subscription_plans_and_disputes.sql'),
            'utf8'
        );

        console.log('📋 Executing: add_subscription_plans_and_disputes.sql');
        await sequelize.query(sql);
        console.log('✅ Migration complete!\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runSubscriptionMigration();
