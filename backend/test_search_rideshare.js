require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('./models');
const { JWT_SECRET } = require('./middleware/auth');

async function ensureRider() {
  await sequelize.authenticate();
  const email = 'dev-rider@example.com';
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ name: 'Dev Rider', email, password: 'password', role: 'rider' });
    console.log('Created rider user:', user.id);
  } else {
    console.log('Found existing rider user:', user.id);
  }
  return user;
}

async function run() {
  try {
    const user = await ensureRider();
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '12h' });
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Verifying auth by calling /marketplace/all');
    try {
      const ok = await axios.get('http://localhost:5000/api/rider/marketplace/all', { headers });
      console.log('/marketplace/all ok, shares:', (ok.data.shares || []).length, 'hires:', (ok.data.hires || []).length);
    } catch (e) {
      console.error('Error calling /marketplace/all:', e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }

    console.log('Searching rideshare for pickupLocation=City A');
    try {
      const res1 = await axios.get('http://localhost:5000/api/rider/rideshare/search?pickupLocation=City%20A', { headers });
      console.log('Results count:', Array.isArray(res1.data) ? res1.data.length : JSON.stringify(res1.data).slice(0,200));
    } catch (e) {
      console.error('Error querying pickupLocation:', e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }

    console.log('Searching rideshare for destination=City B');
    try {
      const res2 = await axios.get('http://localhost:5000/api/rider/rideshare/search?destination=City%20B', { headers });
      console.log('Results count:', Array.isArray(res2.data) ? res2.data.length : JSON.stringify(res2.data).slice(0,200));
    } catch (e) {
      console.error('Error querying destination:', e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Search test error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
