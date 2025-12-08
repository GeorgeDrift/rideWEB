
require('dotenv').config({ path: './backend/.env' });
const { Ride, User } = require('./backend/models');
const { Op } = require('sequelize');

async function checkApprovedRides() {
    try {
        console.log('🔎 Searching for Approved/Scheduled rides...');

        const rides = await Ride.findAll({
            where: {
                [Op.or]: [
                    { negotiationStatus: 'approved' },
                    { status: { [Op.in]: ['Approved', 'Scheduled', 'Awaiting Payment Selection', 'Waiting for Pickup'] } }
                ]
            },
            include: [
                { model: User, as: 'driver', attributes: ['name', 'email'] },
                { model: User, as: 'rider', attributes: ['name', 'email'] }
            ],
            raw: true,
            nest: true
        });

        if (rides.length === 0) {
            console.log('❌ No approved rides found in the database.');
        } else {
            console.log(`✅ Found ${rides.length} approved ride(s):`);
            rides.forEach(r => {
                console.log(`- Ride ID: ${r.id}`);
                console.log(`  Type: ${r.type}`);
                console.log(`  Status: ${r.status}`);
                console.log(`  Negotiation: ${r.negotiationStatus}`);
                console.log(`  Driver: ${r.driver?.name}`);
                console.log(`  Rider: ${r.rider?.name}`);
                console.log(`  Price: ${r.acceptedPrice || r.price}`);
                console.log('---');
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking rides:', error);
        process.exit(1);
    }
}

checkApprovedRides();
