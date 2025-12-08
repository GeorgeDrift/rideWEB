const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
(async function(){
  try{
    const models = require(path.join(__dirname,'..','models'));
    await models.sequelize.authenticate();
    console.log('DB connected');

    const { RideSharePost, HirePost } = models;

    const shares = await RideSharePost.findAll({ order: [['createdAt','DESC']], limit: 10 });
    const hires = await HirePost.findAll({ order: [['createdAt','DESC']], limit: 10 });

    console.log('Recent RideSharePosts:');
    console.log(JSON.stringify(shares.map(s => ({ id: s.id, origin: s.origin, destination: s.destination, driverId: s.driverId, vehicleId: s.vehicleId, createdAt: s.createdAt })), null, 2));

    console.log('Recent HirePosts:');
    console.log(JSON.stringify(hires.map(h => ({ id: h.id, title: h.title, location: h.location, driverId: h.driverId, vehicleId: h.vehicleId, createdAt: h.createdAt })), null, 2));

    await models.sequelize.close();
  } catch (err){
    console.error('Error querying DB', err);
    process.exit(1);
  }
})();
