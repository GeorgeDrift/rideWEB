require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize } = require('../models');
(async () => {
  try {
    const [rows] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'NegotiationHistories' ORDER BY column_name;");
    console.log('NegotiationHistories columns:');
    rows.forEach(r => console.log(' -', r.column_name));
  } catch (e) {
    console.error('Error:', e.message || e);
  } finally { process.exit(0); }
})();
