
const { Vehicle, Ride, sequelize } = require('../models');

exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({ where: { driverId: req.user.id } });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create({ ...req.body, driverId: req.user.id });
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        // SQL Aggregation
        const stats = await Ride.findAll({
            where: { 
                driverId: req.user.id,
                status: 'Completed'
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('driverEarnings')), 'totalEarnings'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                // Mock rating calc as it is on User model or separate table usually
            ],
            raw: true
        });

        const result = stats[0];
        
        res.json({ 
            totalEarnings: result.totalEarnings || 0, 
            count: parseInt(result.count) || 0, 
            avgRating: 4.9 // Static or fetch from User.rating
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceHire = async (req, res) => {
    try {
        const { User } = require('../models');
        // Returns available vehicles for riders to see
        const vehicles = await Vehicle.findAll({ 
            where: { status: 'Available' },
            include: [
                { model: User, as: 'driver', attributes: ['name', 'rating', 'avatar'] }
            ]
        });
        res.json(vehicles);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};
