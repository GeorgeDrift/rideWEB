const { Ride, User } = require('./models');

async function checkRides() {
    try {
        const rides = await Ride.findAll({
            attributes: ['id', 'status', 'riderId', 'driverId', 'price', 'type', 'createdAt'],
            include: [{ model: User, as: 'rider', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        console.log('--- LATEST 5 RIDES IN DB ---');
        if (rides.length === 0) {
            console.log('No rides found in the database.');
        } else {
            rides.forEach(r => {
                console.log(JSON.stringify({
                    id: r.id,
                    type: r.type,
                    status: r.status,
                    riderId: r.riderId,
                    riderName: r.rider ? r.rider.name : 'NULL (No Rider Linked)',
                    price: r.price
                }, null, 2));
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error querying DB:', error);
        process.exit(1);
    }
}

checkRides();
