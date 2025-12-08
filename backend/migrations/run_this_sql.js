require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const file = process.argv[2] || '20251202_add_negotiation_columns_to_plural_table.sql';
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    console.log('Running:', file);
    await sequelize.query(sql);
    console.log('SQL executed successfully');
    process.exit(0);
  } catch (e) {
    console.error('SQL run failed:', e.message || e);
    process.exit(1);
  }
})();
