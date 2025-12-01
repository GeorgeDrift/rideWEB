
const { Ride, Job, User, Transaction } = require('../models');
const { Op } = require('sequelize');
const mapService = require('../services/mapService');

exports.createRide = async (req, res) => {
    try {
        const { type } = req.body;

        if (type === 'hire') {
            // Create a Job for Hire
            const job = await Job.create({
                ...req.body,
                clientId: req.user.id,
                status: 'Open'
            });

            const io = req.app.get('io');
            // Broadcast to drivers with HireVehicles (could be refined)
            io.to('drivers_online').emit('new_job_request', job);

            return res.status(201).json(job);
        } else {
            // Create a Ride Share
            const ride = await Ride.create({ ...req.body, riderId: req.user.id });

            const io = req.app.get('io');

            // If directed at specific driver
            if (ride.driverId) {
                io.to(`user_${ride.driverId}`).emit('new_job_request', ride);
            } else {
                // Broadcast to all available drivers
                io.to('drivers_online').emit('new_pool_request', ride);
            }

            return res.status(201).json(ride);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyRides = async (req, res) => {
    try {
        const isDriver = req.user.role === 'driver';
        const userId = req.user.id;

        // Fetch Rides
        const rideQuery = isDriver ? { driverId: userId } : { riderId: userId };
        const rides = await Ride.findAll({
            where: rideQuery,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'driver', attributes: ['name', 'phone', 'avatar', 'rating'] },
                { model: User, as: 'rider', attributes: ['name', 'phone', 'avatar', 'rating'] }
            ]
        });

        // Fetch Jobs (For Hire)
        const jobQuery = isDriver ? { driverId: userId } : { clientId: userId };
        const jobs = await Job.findAll({
            where: jobQuery,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'driver', attributes: ['name', 'phone', 'avatar', 'rating'] },
                { model: User, as: 'client', attributes: ['name', 'phone', 'avatar', 'rating'] }
            ]
        });

        // Combine and map to common format if needed, or return as separate lists
        // For now, let's return a combined list with a 'type' field
        const combined = [
            ...rides.map(r => ({ ...r.toJSON(), type: 'share' })),
            ...jobs.map(j => ({ ...j.toJSON(), type: 'hire', origin: j.location, destination: j.location, price: j.budget }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceShares = async (req, res) => {
    try {
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
        const { id } = req.params;

        // Try to find Ride first
        let entity = await Ride.findByPk(id);
        let isJob = false;

        if (!entity) {
            entity = await Job.findByPk(id);
            isJob = true;
        }

        if (!entity) return res.status(404).json({ error: 'Ride/Job not found' });

        await entity.update({ status });

        const io = req.app.get('io');
        io.to(`ride_${entity.id}`).emit('ride_status_update', { status });

        // Notify counterpart
        const targetId = req.user.role === 'driver'
            ? (isJob ? entity.clientId : entity.riderId)
            : entity.driverId;

        if (targetId) {
            io.to(`user_${targetId}`).emit('notification', {
                title: isJob ? 'Job Update' : 'Ride Update',
                msg: `Status updated to: ${status}`,
                time: 'Just now'
            });
        }

        res.json(entity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper: haversine distance (km)
function haversineKm(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Simple origin/destination distance lookup (fallback)
function lookupDistanceKm(origin = '', destination = '') {
    if (!origin || !destination) return 0;
    const a = origin.toString().trim().toLowerCase();
    const b = destination.toString().trim().toLowerCase();
    const key = [a, b].sort().join('|');
    const table = {
        'blantyre|lilongwe': 350,
        'lilongwe|zomba': 300,
        'mzuzu|karonga': 200,
        'mzuzu|lilongwe': 350,
        'zomba|blantyre': 65,
        'nkhatabay|mzuzu': 163
    };
    if (table[key]) return table[key];
    for (const k of Object.keys(table)) {
        if ((a.includes(k.split('|')[0]) && b.includes(k.split('|')[1])) || (a.includes(k.split('|')[1]) && b.includes(k.split('|')[0]))) {
            return table[k];
        }
    }
    return 120;
}

/**
 * Complete a ride.
 * Body may include: endLocation: { lat, lng }, useMapbox: boolean
 * The passenger (rider) should call this when they finish trip and provide device coords.
 */
exports.completeRide = async (req, res) => {
    try {
        const { id } = req.params;
        const { endLocation, useMapbox } = req.body;

        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only allow rider or driver to complete
        if (req.user.role !== 'rider' && req.user.role !== 'driver' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        let distanceKm = 0;
        let durationHours = 0;

        // Prefer Mapbox route if both start/end coords and requested
        if (useMapbox && endLocation && ride.coordinates) {
            // try to extract start/end points
            let start = null;
            // coordinates can be stored as { start: {lat,lng}, end: {...} } or [start,end]
            if (ride.coordinates.start) start = ride.coordinates.start;
            else if (Array.isArray(ride.coordinates) && ride.coordinates[0]) start = { lat: ride.coordinates[0][1], lng: ride.coordinates[0][0] };

            if (start) {
                const route = await mapService.getDirections(start, endLocation);
                if (route && route.routes && route.routes[0]) {
                    distanceKm = (route.routes[0].distance || 0) / 1000.0;
                    durationHours = (route.routes[0].duration || 0) / 3600.0;
                }
            }
        }

        // If no mapbox or failed, but we have coords -> haversine
        if (!distanceKm && endLocation && ride.coordinates) {
            let start = null;
            if (ride.coordinates.start) start = ride.coordinates.start;
            else if (Array.isArray(ride.coordinates) && ride.coordinates[0]) start = { lat: ride.coordinates[0][1], lng: ride.coordinates[0][0] };
            if (start) {
                distanceKm = haversineKm(start.lat, start.lng, endLocation.lat, endLocation.lng);
                // assume avg speed
                durationHours = distanceKm / 60;
            }
        }

        // If still zero, fallback to lookup by origin/destination strings
        if (!distanceKm) {
            distanceKm = lookupDistanceKm(ride.origin, ride.destination);
            durationHours = distanceKm / 60;
        }

        const durationMinutes = Math.round(durationHours * 60);

        // Update ride with computed values
        const driverEarnings = ride.driverEarnings && ride.driverEarnings > 0 ? ride.driverEarnings : (ride.price - (ride.platformFee || 0));

        await ride.update({ distance_km: distanceKm, duration_minutes: durationMinutes, status: 'Completed', driverEarnings });

        // Create transaction records: payment (credit) and payout (debit)
        try {
            // Payment from rider to platform
            await Transaction.create({ type: 'Ride Payment', amount: ride.price, direction: 'credit', status: 'completed', relatedId: ride.id, description: `Payment for ride ${ride.id}` });
            // Payout to driver (debit from platform)
            await Transaction.create({ type: 'Payout', amount: driverEarnings, direction: 'debit', status: 'completed', relatedId: ride.id, description: `Payout to driver for ride ${ride.id}` });
        } catch (txErr) {
            console.warn('Transaction creation error:', txErr.message || txErr);
        }

        const io = req.app.get('io');
        if (io) io.emit('ride_completed', { rideId: ride.id, distance_km: distanceKm, duration_minutes: durationMinutes });

        res.json({ id: ride.id, distance_km: distanceKm, duration_minutes: durationMinutes, driverEarnings });
    } catch (err) {
        console.error('Complete ride error:', err);
        res.status(500).json({ error: err.message });
    }
};
