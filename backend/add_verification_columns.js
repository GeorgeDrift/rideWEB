const { sequelize } = require('./models');

async function migrate() {
    try {
        console.log('🔄 Adding verification columns to Users table...');

        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
        `);
        console.log('✅ Added "isVerified" column');

        await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN IF NOT EXISTS "verificationToken" VARCHAR(255);
        `);
        console.log('✅ Added "verificationToken" column');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
