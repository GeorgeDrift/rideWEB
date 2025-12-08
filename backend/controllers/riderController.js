
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

// Combined marketplace endpoint returning both ride-share posts and hire posts
exports.getMarketplaceAll = async (req, res) => {
    try {
        const { sequelize } = require('../models');
        const [shares] = await sequelize.query(`SELECT * FROM "RideSharePosts" WHERE status = 'active' ORDER BY date ASC LIMIT 200`);
        const [hires] = await sequelize.query(`SELECT * FROM "HirePosts" WHERE status = 'available' ORDER BY "createdAt" DESC LIMIT 200`);
        res.json({ shares, hires });
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
            io.to(`user_${ride.driverId}`).emit('new_ride_request', ride);
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

// --- NEW: Search Ride Share Vehicles by Location ---
exports.searchRideShareVehicles = async (req, res) => {
    try {
        // Pass full query to allow pagination (page, limit) and filters
        const filters = req.query || {};
        if (!filters.pickupLocation && !filters.destination) return res.status(400).json({ error: 'pickupLocation or destination is required' });
        const result = await riderService.searchRideShareVehicles(filters.pickupLocation, filters.destination, filters);
        // service returns { total, page, limit, results }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Submit Ride Request ---
exports.submitRideRequest = async (req, res) => {
    try {
        const ride = await riderService.submitRideRequest(req.user.id, req.body);

        // Notify driver via socket
        if (ride.driverId) {
            const io = req.app.get('io');
            io.to(`user_${ride.driverId}`).emit('ride_request', {
                rideId: ride.id,
                title: 'New Ride Request',
                message: `New ride request from ${ride.origin} to ${ride.destination}`
            });
        }

        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Submit Hire Request ---
exports.submitHireRequest = async (req, res) => {
    try {
        const ride = await riderService.submitHireRequest(req.user.id, req.body);

        // Notify driver via socket
        if (ride.driverId) {
            const io = req.app.get('io');
            io.to(`user_${ride.driverId}`).emit('hire_request', {
                rideId: ride.id,
                title: 'New Hire Request',
                message: 'New vehicle hire request received'
            });
        }

        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Make Counter Offer ---
exports.makeCounterOffer = async (req, res) => {
    try {
        const { rideId } = req.params;
        const ride = await riderService.makeCounterOffer(req.user.id, rideId, req.body);
        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Get Pending Requests ---
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await riderService.getPendingRequests(req.user.id);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
