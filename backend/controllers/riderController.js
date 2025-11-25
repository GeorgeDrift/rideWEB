
const riderService = require('../services/riderService');
const { Transaction } = require('../models');

exports.getRiderProfile = async (req, res) => {
    try {
        const user = await riderService.getProfile(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRiderProfile = async (req, res) => {
    try {
        const user = await riderService.updateProfile(req.user.id, req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRiderStats = async (req, res) => {
    try {
        const stats = await riderService.getStats(req.user.id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceShares = async (req, res) => {
    try {
        const rides = await riderService.getMarketplaceShares(req.query);
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceHire = async (req, res) => {
    try {
        const vehicles = await riderService.getMarketplaceHire(req.query);
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bookRide = async (req, res) => {
    try {
        const ride = await riderService.bookRide(req.user.id, req.body);
        
        // Notify Driver via Socket
        if (ride.driverId) {
            const io = req.app.get('io');
            io.to(`user_${ride.driverId}`).emit('notification', {
                title: 'New Ride Request',
                msg: `New ${ride.type} request from ${req.user.name || 'Rider'}`,
                time: 'Just now'
            });
        }
        
        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getActiveTrip = async (req, res) => {
    try {
        const trip = await riderService.getActiveTrip(req.user.id);
        res.json(trip); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await riderService.getHistory(req.user.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rateDriver = async (req, res) => {
    try {
        const { rideId, rating, review } = req.body;
        const ride = await riderService.rateDriver(req.user.id, rideId, rating, review);
        res.json({ message: 'Rating submitted successfully', ride });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
