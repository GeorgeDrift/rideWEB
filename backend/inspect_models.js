const path = require('path');
const m = require(path.resolve(__dirname, './models'));
console.log('models keys:', Object.keys(m));
console.log('RideSharePost associations:', Object.keys(m.RideSharePost.associations || {}));
console.log('RideShareVehicle associations:', Object.keys(m.RideShareVehicle.associations || {}));
console.log('HirePost associations:', Object.keys(m.HirePost.associations || {}));
console.log('HireVehicle associations:', Object.keys(m.HireVehicle.associations || {}));
