const { Ride, User } = require('./models');

async function fetchApprovedRides() {
    try {
        console.log('Connecting to DB and fetching APPROVED rides...');
        const rides = await Ride.findAll({
            where: { status: 'Approved' },
            attributes: ['id', 'status', 'riderId', 'driverId', 'price', 'type', 'origin', 'destination', 'createdAt'],
            include: [
                { model: User, as: 'rider', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'driver', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`--- FOUND ${rides.length} APPROVED RIDES ---`);
        if (rides.length === 0) {
            console.log('No APPROVED rides found in the database.');
        } else {
            rides.forEach(r => {
                console.log(JSON.stringify({
                    id: r.id,
                    type: r.type,
                    status: r.status,
                    origin: r.origin,
                    destination: r.destination,
                    rider: r.rider ? `${r.rider.name} (${r.rider.email})` : 'NULL',
                    driver: r.driver ? `${r.driver.name} (${r.driver.email})` : 'NULL',
                    price: r.price,
                    createdAt: r.createdAt
                }, null, 2));
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error querying DB:', error);
        process.exit(1);
    }
}

fetchApprovedRides();
