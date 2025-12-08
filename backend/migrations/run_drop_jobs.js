require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '20251201_drop_jobs.sql'), 'utf8');
    console.log('Running SQL drop for Jobs...');
    await sequelize.query(sql);
    console.log('Jobs table dropped (if it existed).');
    process.exit(0);
  } catch (err) {
    console.error('Error running drop script:', err.message || err);
    process.exit(1);
  }
})();
