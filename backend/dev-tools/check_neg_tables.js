require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize } = require('../models');
(async () => {
  try {
    const [rows] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE 'negotiation%';");
    console.log(rows);
  } catch (e) {
    console.error('err', e.message || e);
  } finally { process.exit(0); }
})();
