const { Vehicle, RideShareVehicle, HireVehicle, User } = require('../models');
const { Op } = require('sequelize');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
    try {
        const { name, plate, licensePlate, category, make, model, rate, status, pricing, capacity, color, year } = req.body;
        const driverId = req.user.id; // From auth middleware

        const vehiclePlate = plate || licensePlate;

        // Determine if it's a Ride Share or Hire vehicle
        // Ride Share categories: Sedan, Hatchback, SUV (if used for rides), etc.
        // Hire categories: Truck, Tractor, Construction, etc.
        const rideShareCategories = ['Sedan', 'Hatchback', 'SUV', 'Minibus', 'Van', 'Motorcycle'];
        const isRideShare = rideShareCategories.includes(category);

        if (isRideShare) {
            // Create RideShareVehicle
            const vehicle = await RideShareVehicle.create({
                make: make || 'Unknown',
                model: model || 'Unknown',
                year: year || new Date().getFullYear(),
                plate: vehiclePlate,
                color: color || 'Black',
                seats: capacity?.passengers || 4,
                status: status === 'Available' ? 'active' : 'inactive', // Map status
                driverId
            });
            return res.status(201).json({ ...vehicle.toJSON(), type: 'share', licensePlate: vehicle.plate });
        } else {
            // Create HireVehicle
            const vehicle = await HireVehicle.create({
                name: name || `${make} ${model}`,
                make: make || 'Unknown',
                model: model || 'Unknown',
                plate: vehiclePlate,
                category,
                rate: typeof rate === 'string' ? rate : `MWK ${pricing?.perDay}/day`,
                rateAmount: pricing?.perDay || 0,
                rateUnit: 'day',
                status: status || 'Available',
                driverId
            });
            return res.status(201).json({ ...vehicle.toJSON(), type: 'hire', licensePlate: vehicle.plate });
        }

    } catch (error) {
        console.error('Create Vehicle Error:', error);
        res.status(500).json({ message: 'Error creating vehicle', error: error.message });
    }
};

// Get all vehicles for the authenticated driver
exports.getDriverVehicles = async (req, res) => {
    try {
        const driverId = req.user.id; // From auth middleware

        const [rideShareVehicles, hireVehicles] = await Promise.all([
            RideShareVehicle.findAll({ where: { driverId }, order: [['createdAt', 'DESC']] }),
            HireVehicle.findAll({ where: { driverId }, order: [['createdAt', 'DESC']] })
        ]);

        // Normalize and combine
        const combined = [
            ...rideShareVehicles.map(v => ({
                id: v.id,
                name: `${v.make} ${v.model}`,
                make: v.make,
                model: v.model,
                plate: v.plate,
                category: 'Sedan', // Default or infer
                status: v.status === 'active' ? 'Available' : 'Unavailable',
                type: 'share',
                rate: '' // Ride share doesn't have a daily rate usually
            })),
            ...hireVehicles.map(v => ({
                id: v.id,
                name: v.name,
                make: v.make,
                model: v.model,
                plate: v.plate,
                category: v.category,
                status: v.status,
                type: 'hire',
                rate: v.rate
            }))
        ];

        res.json(combined);
    } catch (error) {
        console.error('Get Driver Vehicles Error:', error);
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id; // From auth middleware

        // Try to find in both tables
        const rideShare = await RideShareVehicle.findOne({ where: { id, driverId } });
        if (rideShare) {
            await rideShare.destroy();
            return res.json({ message: 'Vehicle deleted successfully' });
        }

        const hire = await HireVehicle.findOne({ where: { id, driverId } });
        if (hire) {
            await hire.destroy();
            return res.json({ message: 'Vehicle deleted successfully' });
        }

        return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    } catch (error) {
        console.error('Delete Vehicle Error:', error);
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
};

// Search vehicles (public or for riders)
exports.searchVehicles = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search in HireVehicles mostly, as RideShare is usually matched by ride request
        const vehicles = await HireVehicle.findAll({
            where: {
                status: 'Available',
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { category: { [Op.iLike]: `%${query}%` } },
                    { make: { [Op.iLike]: `%${query}%` } },
                    { model: { [Op.iLike]: `%${query}%` } }
                ]
            },
            include: [{
                model: User,
                as: 'driver',
                attributes: ['id', 'name', 'rating', 'avatar']
            }]
        });

        res.json(vehicles);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Error searching vehicles' });
    }
};

// Get all available vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        // Return HireVehicles for the "Hire" section
        const vehicles = await HireVehicle.findAll({
            where: { status: 'Available' },
            include: [{
                model: User,
                as: 'driver',
                attributes: ['id', 'name', 'rating', 'avatar']
            }]
        });
        res.json(vehicles);
    } catch (error) {
        console.error('Get All Vehicles Error:', error);
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
};
