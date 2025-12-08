const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../.env' });

const base = process.env.BASE_URL || 'http://localhost:5000';

async function ensureLogin(email, password, role, name) {
  try {
    const res = await axios.post(`${base}/api/auth/login`, { email, password });
    return res.data;
    } catch (err) {
    try {
      // If creating a driver account include a default payment method so registration succeeds.
      const payload = { email, password, role, name };
      if (role === 'driver') payload.airtelMoneyNumber = '999000111';
      await axios.post(`${base}/api/auth/register`, payload);
      const res2 = await axios.post(`${base}/api/auth/login`, { email, password });
      return res2.data;
    } catch (e) {
      console.error('Auth failed', e.response ? e.response.data : e.message);
      throw e;
    }
  }
}

async function run() {
  try {
    console.log('=== Integration test starting ===');

    // Use existing CI users if available (created by smoke tests): dev_driver_ci / dev_rider_ci
    const driverCreds = { email: 'dev_driver_ci@example.com', password: 'Password123!', role: 'driver', name: 'CI Driver' };
    const riderCreds = { email: 'dev_rider_ci@example.com', password: 'Password123!', role: 'rider', name: 'CI Rider' };

    const drv = await ensureLogin(driverCreds.email, driverCreds.password, driverCreds.role, driverCreds.name);
    const drvToken = drv.token;
    const drvId = drv.user?.id || drv.user?.id || (drv.id ? drv.id : null);
    console.log('Driver logged in:', drv.user ? drv.user.id : drvId);

    // Create a hire post (driver)
    const hirePayload = { title: 'Integration Hire Post', category: 'Mover', location: 'TestTown', rate: 'per day', rateAmount: 1200, description: 'Integration test hire post', status: 'available' };
    const postHire = await axios.post(`${base}/api/driver/posts/hire`, hirePayload, { headers: { Authorization: `Bearer ${drvToken}` } });
    console.log('Created hire post:', postHire.data.id);

    const rdr = await ensureLogin(riderCreds.email, riderCreds.password, riderCreds.role, riderCreds.name);
    const rdrToken = rdr.token;
    const rdrId = rdr.user?.id || rdr.id;
    console.log('Rider logged in:', rdr.user ? rdr.user.id : rdrId);

    // Rider submits a hire request targeted at the driver
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 24*3600*1000);
    const hireRequest = {
      vehicleId: null,
      offeredPrice: 2000,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      message: 'Need help moving boxes',
      driverId: drv.user?.id || drvId,
      location: 'TestTown'
    };

    const reqRes = await axios.post(`${base}/api/rider/hire/request`, hireRequest, { headers: { Authorization: `Bearer ${rdrToken}` } });
    console.log('Hire request created (rider):', reqRes.data.id);
    const rideId = reqRes.data.id;

    // Check rider pending requests
    const pending = await axios.get(`${base}/api/rider/requests/pending`, { headers: { Authorization: `Bearer ${rdrToken}` } });
    console.log('/api/rider/requests/pending result count:', Array.isArray(pending.data) ? pending.data.length : JSON.stringify(pending.data));

    // Check rider my-rides
    const myrides = await axios.get(`${base}/api/rides/my-rides`, { headers: { Authorization: `Bearer ${rdrToken}` } });
    console.log('/api/rides/my-rides count:', Array.isArray(myrides.data) ? myrides.data.length : JSON.stringify(myrides.data));

    // Check driver contracted jobs (should include the created ride)
    const drvJobs = await axios.get(`${base}/api/driver/jobs`, { headers: { Authorization: `Bearer ${drvToken}` } });
    console.log('/api/driver/jobs count:', Array.isArray(drvJobs.data) ? drvJobs.data.length : JSON.stringify(drvJobs.data));

    // Check the driver jobs contain created ride id
    const found = Array.isArray(drvJobs.data) && drvJobs.data.some(j => j.id === rideId);
    console.log('Driver jobs contains new ride:', found);

    // Also check rider marketplace shows driver hire posts
    const mpHire = await axios.get(`${base}/api/rider/marketplace/hire`, { headers: { Authorization: `Bearer ${rdrToken}` } });
    console.log('/api/rider/marketplace/hire count:', Array.isArray(mpHire.data) ? mpHire.data.length : JSON.stringify(mpHire.data));

      // --- Negotiation workflow: driver sees pending approval and can counter-offer ---
      const drvPending = await axios.get(`${base}/api/driver/requests/pending`, { headers: { Authorization: `Bearer ${drvToken}` } });
      console.log('/api/driver/requests/pending count:', Array.isArray(drvPending.data) ? drvPending.data.length : JSON.stringify(drvPending.data));

      // Driver makes a counter-offer
      const counterRes = await axios.post(`${base}/api/driver/requests/${rideId}/counter-offer`, { counterPrice: 2500, message: 'I can do it for MWK 2500' }, { headers: { Authorization: `Bearer ${drvToken}` } });
      console.log('Driver counter-offer result:', counterRes.data.message || JSON.stringify(counterRes.data));

      // Rider checks pending requests and makes a counter back (negotiate)
      const rdrPendingAfter = await axios.get(`${base}/api/rider/requests/pending`, { headers: { Authorization: `Bearer ${rdrToken}` } });
      console.log('/api/rider/requests/pending after counter count:', Array.isArray(rdrPendingAfter.data) ? rdrPendingAfter.data.length : JSON.stringify(rdrPendingAfter.data));

      // Rider makes a counter-back offer
      const riderCounter = await axios.post(`${base}/api/rider/rides/${rideId}/negotiate`, { offeredPrice: 2300, message: 'Can you accept MWK 2300?' }, { headers: { Authorization: `Bearer ${rdrToken}` } });
      console.log('Rider made counter offer:', riderCounter.data.id || JSON.stringify(riderCounter.data));

      // Driver inspects the pending request object (debug)
      const drvPendingObj = Array.isArray(drvPending.data) ? drvPending.data.find(r => r.id === rideId) : drvPending.data;
      console.log('Driver pending object (before approve):', drvPendingObj);

      // Driver approves the request after negotiation
      const approveRes = await axios.post(`${base}/api/driver/requests/${rideId}/approve`, { approved: true, counterOffer: 2300 }, { headers: { Authorization: `Bearer ${drvToken}` } });
      console.log('Driver approve result:', approveRes.data.message || JSON.stringify(approveRes.data));

      // Check ride status for rider and driver
      const myridesAfter = await axios.get(`${base}/api/rides/my-rides`, { headers: { Authorization: `Bearer ${rdrToken}` } });
      console.log('/api/rides/my-rides count after approve:', Array.isArray(myridesAfter.data) ? myridesAfter.data.length : JSON.stringify(myridesAfter.data));

    console.log('=== Integration test completed ===');
  } catch (err) {
    console.error('Integration test failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
