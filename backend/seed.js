
const { sequelize, User, Vehicle, Ride, SystemSetting } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        console.log('🌱 Connecting to PostgreSQL...');
        await sequelize.sync({ force: true }); // WARNING: DROPS ALL TABLES
        console.log('✅ Tables Created');

        // 1. Create Super Admin
        const adminPass = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Super Admin',
            email: 'admin@ridex.com',
            password: adminPass,
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=FACC15&color=000',
            permissions: ['all']
        });
        console.log('✅ Admin Created');

        // 2. Create Driver
        const driverPass = await bcrypt.hash('driver123', 10);
        const driver = await User.create({
            name: 'John Driver',
            email: 'driver@ridex.com',
            password: driverPass,
            role: 'driver',
            phone: '+265999123456',
            avatar: 'https://ui-avatars.com/api/?name=John+Driver&background=333&color=fff',
            rating: 4.8,
            walletBalance: 50000,
            subscriptionStatus: 'active',
            vehicleModel: 'Toyota Corolla',
            vehiclePlate: 'MC 1234',
            isOnline: true
        });
        console.log('✅ Driver Created');

        // 3. Create Rider
        const riderPass = await bcrypt.hash('rider123', 10);
        const rider = await User.create({
            name: 'Alice Passenger',
            email: 'rider@ridex.com',
            password: riderPass,
            role: 'rider',
            phone: '+265888654321',
            avatar: 'https://ui-avatars.com/api/?name=Alice+Rider&background=random',
            rating: 5.0,
            walletBalance: 0
        });
        console.log('✅ Rider Created');

        // 4. Create Vehicle Inventory
        await Vehicle.create({
            driverId: driver.id,
            name: '5-Ton Truck',
            plate: 'MC 9988',
            category: 'Trucks & Logistics',
            rate: 'MWK 150,000/day',
            status: 'Available',
            features: ['GPS', 'Insured', 'Driver Included']
        });
        console.log('✅ Vehicles Added');

        // 5. Initial System Settings
        await SystemSetting.bulkCreate([
            { key: 'baseFare', value: '5.00', description: 'Base starting price for rides' },
            { key: 'perKm', value: '1.50', description: 'Price per kilometer' },
            { key: 'perMin', value: '0.50', description: 'Price per minute' },
            { key: 'currency', value: 'MWK', description: 'System currency' }
        ]);
        console.log('✅ System Settings Configured');

        console.log('🚀 Database Seeding Complete!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDatabase();
