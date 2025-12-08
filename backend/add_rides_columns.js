const { sequelize } = require('./models');

async function up() {
  try {
    await sequelize.query(`ALTER TABLE "Rides" ADD COLUMN IF NOT EXISTS distance_km FLOAT DEFAULT 0;`);
    await sequelize.query(`ALTER TABLE "Rides" ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;`);
    console.log('✅ Added distance_km and duration_minutes to Rides');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

up();
