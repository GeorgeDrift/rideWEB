const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
});

async function updateEnums() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        const valuesToAdd = [
            'Awaiting Payment Selection',
            'Waiting for Pickup',
            'Handover Pending'
        ];

        for (const value of valuesToAdd) {
            try {
                // Check if value actually missing (Postgres doesn't support IF NOT EXISTS for enum values easily, so we rely on catch)
                console.log(`Adding '${value}' to enum_Rides_status...`);
                await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE '${value}';`);
                console.log(`Successfully added '${value}'.`);
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log(`Value '${value}' already exists in enum.`);
                } else {
                    console.error(`Error adding '${value}':`, err.message);
                }
            }
        }

        console.log('Enum update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

updateEnums();
