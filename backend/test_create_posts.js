require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('./models');
const { JWT_SECRET } = require('./middleware/auth');

async function ensureDriver() {
  await sequelize.authenticate();
  // find or create a driver user
  const email = 'dev-driver@example.com';
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ name: 'Dev Driver', email, password: 'password', role: 'driver' });
    console.log('Created driver user:', user.id);
  } else {
    console.log('Found existing driver user:', user.id);
  }
  return user;
}

async function run() {
  try {
    const user = await ensureDriver();
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '12h' });

    const headers = { Authorization: `Bearer ${token}` };

    // POST a rideshare post
    const sharePayload = {
      origin: 'City A',
      destination: 'City B',
      date: '2025-12-10',
      time: '09:00',
      price: 1200,
      seats: 4,
      availableSeats: 4,
      description: 'Test rideshare post',
      vehicleId: null
    };

    const hirePayload = {
      title: 'Test Hire Job',
      category: 'Moving',
      location: 'City Center',
      rate: 'per day',
      rateAmount: 5000,
      rateUnit: 'day',
      description: 'Test hire post',
      vehicleId: null
    };

    console.log('Creating RideShare post...');
    const shareRes = await axios.post('http://localhost:5000/api/driver/posts/share', sharePayload, { headers });
    console.log('RideShare post response status:', shareRes.status);
    console.log('RideShare post id:', shareRes.data && shareRes.data.id);

    console.log('Creating Hire post...');
    const hireRes = await axios.post('http://localhost:5000/api/driver/posts/hire', hirePayload, { headers });
    console.log('Hire post response status:', hireRes.status);
    console.log('Hire post id:', hireRes.data && hireRes.data.id);

    // Fetch my share posts
    const myShares = await axios.get('http://localhost:5000/api/driver/posts/share', { headers });
    console.log('My share posts count:', Array.isArray(myShares.data) ? myShares.data.length : 'N/A');

    // Fetch my hire posts
    const myHires = await axios.get('http://localhost:5000/api/driver/posts/hire', { headers });
    console.log('My hire posts count:', Array.isArray(myHires.data) ? myHires.data.length : 'N/A');

    process.exit(0);
  } catch (err) {
    console.error('Test script error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
