const { User, RideSharePost, HirePost, Vehicle, RideShareVehicle, HireVehicle } = require('./models');
const bcrypt = require('bcryptjs');

async function setupFilterTestData() {
    try {
        // 1. Ensure Driver Exists
        const email = 'filter_driver@example.com';
        let driver = await User.findOne({ where: { email } });
        if (!driver) {
            driver = await User.create({
                name: 'Filter Test Driver',
                email,
                password: await bcrypt.hash('password', 10),
                role: 'driver',
                phone: '0999999999',
                accountStatus: 'active',
                avatar: 'https://ui-avatars.com/api/?name=Filter+Driver'
            });
        }

        // 2. Create Vehicles
        // Sedan
        let sedan = await RideShareVehicle.create({
            driverId: driver.id,
            make: 'Toyota',
            model: 'Corolla Sedan',
            year: 2020,
            plate: 'SDN-001',
            seats: 4,
            status: 'active'
        });

        // Hatchback
        let hatchback = await RideShareVehicle.create({
            driverId: driver.id,
            make: 'Honda',
            model: 'Fit Hatchback',
            year: 2018,
            plate: 'HTC-001',
            seats: 4,
            status: 'active'
        });

        // Tractor (Hire)
        let tractor = await HireVehicle.create({
            driverId: driver.id,
            name: 'John Deere Tractor',
            make: 'John Deere',
            model: '5050D',
            plate: 'TRC-001',
            category: 'Tractor',
            rate: '50000/day',
            rateAmount: 50000,
            status: 'Available'
        });

        // 3. Create Posts
        // Sedan Post
        await RideSharePost.create({
            driverId: driver.id,
            vehicleId: sedan.id,
            origin: 'Lilongwe',
            destination: 'Mzuzu',
            date: '2025-12-15',
            time: '08:00',
            price: 15000,
            seats: 3,
            availableSeats: 3,
            description: 'Comfortable Sedan ride',
            status: 'active'
        });

        // Hatchback Post
        await RideSharePost.create({
            driverId: driver.id,
            vehicleId: hatchback.id,
            origin: 'Blantyre',
            destination: 'Zomba',
            date: '2025-12-16',
            time: '09:00',
            price: 5000,
            seats: 3,
            availableSeats: 3,
            description: 'Quick Hatchback trip',
            status: 'active'
        });

        // Tractor Hire Post
        await HirePost.create({
            driverId: driver.id,
            vehicleId: tractor.id,
            title: 'Farm Tractor for Hire',
            category: 'Tractor',
            location: 'Kasungu',
            rate: '50000/day',
            rateAmount: 50000,
            description: 'Heavy duty tractor available',
            status: 'available'
        });

        console.log('Filter test data created successfully.');

    } catch (err) {
        console.error('Error creating filter test data:', err);
    }
}

setupFilterTestData();
