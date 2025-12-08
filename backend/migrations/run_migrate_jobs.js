require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '20251201_migrate_jobs_to_rides.sql'), 'utf8');
    console.log('Running Jobs -> Rides migration...');
    await sequelize.query(sql);
    console.log('Migration complete. You can now run the drop script (run_drop_jobs.js) if you want to delete the Jobs table.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migration script:', err.message || err);
    process.exit(1);
  }
})();