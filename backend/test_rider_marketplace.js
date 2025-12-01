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

    console.log('Fetching combined marketplace posts (shares + hires)...');
    const res = await axios.get('http://localhost:5000/api/rider/marketplace/all', { headers });
    const shares = res.data.shares || [];
    const hires = res.data.hires || [];
    console.log('Shares count:', shares.length);
    console.log('Hires count:', hires.length);

    console.log('Sample share item:', shares[0] ? shares[0].id || shares[0] : 'none');
    console.log('Sample hire item:', hires[0] ? hires[0].id || hires[0] : 'none');

    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
