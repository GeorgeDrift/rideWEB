require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize } = require('../models');

(async () => {
  try {
    console.log('Checking Jobs table existence...');
    const [[{ to_regclass }]] = await sequelize.query("SELECT to_regclass('public.\"Jobs\"')");
    console.log('Jobs table presence (to_regclass):', to_regclass);

    const [[{ hire_count }]] = await sequelize.query("SELECT COUNT(*)::int as hire_count FROM \"Rides\" WHERE type = 'hire'");
    console.log('Rides with type=hire count:', hire_count);

    console.log('Showing up to 5 recent hire rides:');
    const [rows] = await sequelize.query("SELECT id, origin, destination, price, status, \"driverId\", \"riderId\", \"createdAt\" FROM \"Rides\" WHERE type = 'hire' ORDER BY \"createdAt\" DESC LIMIT 5");
    console.table(rows || []);

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err.message || err);
    process.exit(1);
  }
})();
