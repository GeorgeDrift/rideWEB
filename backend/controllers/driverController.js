
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

/**
 * Get driver payout details for payment processing
 */
exports.getDriverPayoutDetails = async (req, res) => {
    try {
        const { User } = require('../models');
        const { driverId } = req.params;

        // Fetch driver from database
        const driver = await User.findByPk(driverId);

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Check if driver has configured payout details
        if (!driver.payoutMethod) {
            return res.status(404).json({
                error: 'Driver has not configured payout details yet'
            });
        }

        // Return payout details based on method
        const payoutDetails = {
            driverId: driver.id,
            driverName: driver.name,
            payoutMethod: driver.payoutMethod
        };

        if (driver.payoutMethod === 'Bank') {
            payoutDetails.bankName = driver.bankName;
            payoutDetails.payoutAccountNumber = driver.payoutAccountNumber;
            payoutDetails.accountHolderName = driver.accountHolderName || driver.name;
        } else {
            // Airtel Money or Mpamba
            payoutDetails.payoutMobileNumber = driver.payoutMobileNumber;
        }

        res.json(payoutDetails);
    } catch (err) {
        console.error('Error fetching driver payout details:', err);
        res.status(500).json({ error: err.message });
    }
};

