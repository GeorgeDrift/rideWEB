
const { Ride, User } = require('../models');

exports.createRide = async (req, res) => {
    try {
        const ride = await Ride.create({ ...req.body, riderId: req.user.id });
        
        const io = req.app.get('io');
        
        // If directed at specific driver
        if (ride.driverId) {
            io.to(`user_${ride.driverId}`).emit('new_job_request', ride);
        } else {
            // Broadcast to all available drivers
            io.to('drivers_online').emit('new_pool_request', ride);
        }
        
        res.status(201).json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyRides = async (req, res) => {
    try {
        const query = req.user.role === 'driver' ? { driverId: req.user.id } : { riderId: req.user.id };
        
        const rides = await Ride.findAll({
            where: query,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'driver', attributes: ['name', 'phone', 'avatar', 'rating'] },
                { model: User, as: 'rider', attributes: ['name', 'phone', 'avatar', 'rating'] }
            ]
        });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceShares = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const rides = await Ride.findAll({ 
            where: {
                type: 'share', 
                status: { [Op.or]: ['Pending', 'Scheduled'] }
            },
            include: [
                { model: User, as: 'driver', attributes: ['name', 'rating', 'avatar'] }
            ]
        });
        res.json(rides);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

exports.updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ride = await Ride.findByPk(req.params.id);
        
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        await ride.update({ status });

        const io = req.app.get('io');
        io.to(`ride_${ride.id}`).emit('ride_status_update', { status });
        
        // Notify counterpart
        const targetId = req.user.role === 'driver' ? ride.riderId : ride.driverId;
        if(targetId) {
            io.to(`user_${targetId}`).emit('notification', { 
                title: 'Ride Update', 
                msg: `Status updated to: ${status}`,
                time: 'Just now'
            });
        }

        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
