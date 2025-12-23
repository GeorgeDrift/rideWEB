const { sequelize } = require('./models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const queryInterface = sequelize.getQueryInterface();

        // Add isVerified
        try {
            await queryInterface.addColumn('Users', 'isVerified', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false
            });
            console.log('✅ Added column: isVerified');
        } catch (e) {
            console.log('ℹ️ Column isVerified likely exists:', e.message);
        }

        // Add verificationToken
        try {
            await queryInterface.addColumn('Users', 'verificationToken', {
                type: sequelize.Sequelize.STRING,
                allowNull: true
            });
            console.log('✅ Added column: verificationToken');
        } catch (e) {
            console.log('ℹ️ Column verificationToken likely exists:', e.message);
        }

        // Add accountStatus
        try {
            await queryInterface.addColumn('Users', 'accountStatus', {
                type: sequelize.Sequelize.ENUM('pending', 'active', 'suspended'),
                defaultValue: 'active'
            });
            console.log('✅ Added column: accountStatus');
        } catch (e) {
            console.log('ℹ️ Column accountStatus likely exists:', e.message);
        }

        console.log('✅ Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
