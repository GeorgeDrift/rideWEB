
const { Ride, User, Transaction, RideSharePost, HirePost } = require('../models');
const driverController = require('./driverController');
const { Op } = require('sequelize');
const mapService = require('../services/mapService');

exports.createRide = async (req, res) => {
    try {
        const { type } = req.body;
        const io = req.app.get('io');

        // Drivers should use dedicated driver endpoints for creating marketplace posts.
        // Reject requests here for clarity and to avoid accidental writes to the Ride table.
        if (req.user.role === 'driver') {
            return res.status(400).json({ error: 'Drivers: use /api/driver/posts/share or /api/driver/posts/hire to create posts' });
        }

        // Log the incoming request body to debug price issue
        console.log('createRide called with body:', JSON.stringify(req.body, null, 2));

        // Ensure price is set - if not provided or 0, reject the request
        if (!req.body.price || req.body.price === 0) {
            console.error('createRide: Price is missing or 0!', req.body);
            return res.status(400).json({ error: 'Price is required and must be greater than 0' });
        }

        // Always create a Ride row, using type: 'hire' for hire requests
        const ride = await Ride.create({ ...req.body, riderId: req.user.id });
        console.log('Ride created successfully:', ride.id, 'price:', ride.price);

        if (io) {
            if (ride.driverId) io.to(`user_${ride.driverId}`).emit('new_job_request', ride);
            else io.to('drivers_online').emit('new_pool_request', ride);
        }
        return res.status(201).json(ride);
    } catch (err) {
        console.error('createRide error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMyRides = async (req, res) => {
    try {
        const isDriver = req.user.role === 'driver';
        const userId = req.user.id;

        // Fetch Rides (requests) only
        const rideQuery = isDriver ? { driverId: userId } : { riderId: userId };
        const rides = await Ride.findAll({
            where: rideQuery,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'driver', attributes: ['name', 'phone', 'avatar', 'rating'] },
                { model: User, as: 'rider', attributes: ['name', 'phone', 'avatar', 'rating'] }
            ]
        });

        console.log(`[getMyRides] Found ${rides.length} rides for user ${userId}`);
        if (rides.length > 0) {
            console.log('[getMyRides] Top 3 rides:', JSON.stringify(rides.slice(0, 3).map(r => ({
                id: r.id,
                status: r.status,
                type: r.type,
                driver: r.driver ? r.driver.name : 'null',
                price: r.price
            })), null, 2));
        }

        // Additionally, include marketplace posts created by drivers so drivers can see their own posts
        let sharePosts = [];
        let hirePosts = [];
        if (isDriver) {
            sharePosts = await RideSharePost.findAll({ where: { driverId: userId }, order: [['createdAt', 'DESC']] });
            hirePosts = await HirePost.findAll({ where: { driverId: userId }, order: [['createdAt', 'DESC']] });
        } else {
            sharePosts = [];
            hirePosts = [];
        }

        const combined = [
            ...rides.map(r => ({ ...r.toJSON(), type: r.type })),
            ...sharePosts.map(p => ({ ...p.toJSON(), type: 'share_post' })),
            ...hirePosts.map(p => ({ ...p.toJSON(), type: 'hire_post' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMarketplaceShares = async (req, res) => {
    try {
        const rides = await RideSharePost.findAll({
            where: {
                status: 'active',
                // Optional: filter by date >= today
            },
            include: [
                { model: User, as: 'driver', attributes: ['name', 'rating', 'avatar', 'vehicleModel', 'vehiclePlate'] }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
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

        // Only update Ride rows
        const entity = await Ride.findByPk(id);
        if (!entity) return res.status(404).json({ error: 'Ride not found' });

        await entity.update({ status });

        const io = req.app.get('io');
        io.to(`ride_${entity.id}`).emit('ride_status_update', { status });

        // Notify counterpart
        const targetId = req.user.role === 'driver'
            ? entity.riderId
            : entity.driverId;

        if (targetId) {
            io.to(`user_${targetId}`).emit('notification', {
                title: 'Ride Update',
                msg: `Status updated to: ${status}`,
                time: 'Just now'
            });
        }

        // Emit driver_arrived when status changes to 'Arrived'
        try {
            if (req.user.role === 'driver' && status === 'Arrived') {
                if (entity.riderId) {
                    io.to(`user_${entity.riderId}`).emit('driver_arrived', {
                        rideId: entity.id,
                        driverId: entity.driverId,
                        status: 'Arrived',
                        message: 'Your driver has arrived at the pickup location.'
                    });
                }
            }
        } catch (e) { console.warn('driver_arrived emit failed', e); }

        // If driver started pickup/trip, send trip to rider's active trips tab
        try {
            if (req.user.role === 'driver' && (status === 'Inbound' || status === 'In Progress')) {
                if (entity.riderId) {
                    io.to(`user_${entity.riderId}`).emit('trip_started', {
                        rideId: entity.id,
                        id: entity.id,
                        type: entity.type,
                        origin: entity.origin,
                        destination: entity.destination,
                        price: entity.price,
                        driver: entity.driverId,
                        status: status,
                        message: 'Your driver has started the trip. Check your Active Trips tab.'
                    });
                }
            }
        } catch (e) { console.warn('trip_started emit failed', e); }

        // If driver updated status to an end/collection status, notify the rider to confirm and pay
        try {
            if (req.user.role === 'driver' && (status === 'Payment Due' || status === 'Completed')) {
                if (entity.riderId) {
                    io.to(`user_${entity.riderId}`).emit('driver_end_trip', {
                        rideId: entity.id,
                        status,
                        message: 'Driver marked trip ended — please confirm trip and complete payment.'
                    });
                }
            }
        } catch (e) { console.warn('driver_end_trip emit failed', e); }

        res.json(entity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Rider confirms they have boarded.
 * Called by the rider after driver sends pickup request.
 */
exports.confirmPickup = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the rider for this ride may confirm boarding
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized to confirm pickup for this ride' });
        }

        ride.status = 'Boarded';
        await ride.save();

        // Notify driver that rider has boarded
        const io = req.app.get('io');
        if (io && ride.driverId) {
            io.to(`user_${ride.driverId}`).emit('rider_boarded', {
                rideId: ride.id,
                message: 'Rider has confirmed boarding. You can start the trip.'
            });
        }

        res.json({ message: 'Boarding confirmed', ride });
    } catch (err) {
        console.error('confirmPickup error:', err);
        res.status(500).json({ error: err.message });
    }
};


/**
 * Rider selects a payment method for a ride. Saves choice and notifies driver.
 */
exports.selectPaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentType } = req.body;

        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the rider may select payment method
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized to select payment for this ride' });
        }

        ride.paymentMethod = paymentType;
        // If payment selected as 'online', mark status so frontend can initiate payment flow
        if (paymentType === 'online') ride.status = 'Payment Pending';
        await ride.save();

        try {
            const { Notification } = require('../models');
            await Notification.create({
                userId: ride.driverId,
                title: 'Payment Method Selected',
                message: `Rider selected ${paymentType} for ride ${ride.id}`,
                type: 'info',
                relatedType: 'ride',
                relatedId: ride.id
            });
        } catch (nn) { console.warn('Notification create failed', nn); }

        const io = req.app.get('io');
        if (io && ride.driverId) {
            io.to(`user_${ride.driverId}`).emit('payment_method_selected', { rideId: ride.id, paymentType });
        }

        res.json({ message: 'Payment method saved', ride });
    } catch (err) {
        console.error('selectPaymentMethod error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Rider selects payment timing for a For Hire request after driver approval.
 * Called when rider chooses "Pay Now" or "Pay on Pickup".
 */
exports.selectPaymentTiming = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentTiming } = req.body; // 'now' or 'pickup'

        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the rider may select payment timing
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized to select payment timing for this ride' });
        }

        const io = req.app.get('io');

        if (paymentTiming === 'now') {
            // Rider chose to pay now - trigger payment flow
            ride.paymentMethod = 'online'; // Set to trigger payment modal on rider side
            ride.status = 'Payment Pending';
            await ride.save();

            // Emit event to rider to open payment modal
            if (io && ride.riderId) {
                io.to(`user_${ride.riderId}`).emit('payment_required', {
                    rideId: ride.id,
                    type: ride.type,
                    price: ride.price,
                    message: 'Please complete payment now'
                });
            }

            res.json({ message: 'Payment timing set to now, please complete payment', ride, requiresPayment: true });
        } else if (paymentTiming === 'pickup') {
            // Rider chose to pay on pickup - mark as pending and proceed to active
            ride.paymentStatus = 'pending';
            ride.status = 'Scheduled'; // Ride is scheduled, payment will be at handover
            await ride.save();

            // Notify driver that rider will pay on pickup
            if (io && ride.driverId) {
                io.to(`user_${ride.driverId}`).emit('payment_timing_selected', {
                    rideId: ride.id,
                    paymentTiming: 'pickup',
                    message: 'Rider will pay on pickup'
                });
            }

            res.json({ message: 'Payment set for pickup', ride, requiresPayment: false });
        } else {
            return res.status(400).json({ error: 'Invalid payment timing. Must be "now" or "pickup"' });
        }
    } catch (err) {
        console.error('selectPaymentTiming error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Driver confirms handover for a hire job.
 * Checks payment status - if already paid, complete handover without payment prompt.
 * If not paid, emit payment requirement to rider.
 */
exports.confirmHandover = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the driver can confirm handover
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized to confirm handover' });
        }

        // Only hire jobs can have handover
        if (!ride.type || ride.type.toLowerCase() !== 'hire') {
            return res.status(400).json({ error: 'Handover only applies to hire jobs' });
        }

        const io = req.app.get('io');

        // Check if payment was already made
        if (ride.paymentStatus === 'paid') {
            // Payment already completed - proceed directly to Active status
            ride.status = 'Active';
            await ride.save();

            // Notify rider that vehicle is ready for pickup (no payment needed)
            if (io && ride.riderId) {
                io.to(`user_${ride.riderId}`).emit('handover_completed', {
                    rideId: ride.id,
                    driverId: ride.driverId,
                    status: 'Active',
                    type: 'hire',
                    message: 'Payment confirmed. Vehicle is ready for pickup!',
                    paymentAlreadyCompleted: true
                });
            }

            // Notify driver
            if (io && ride.driverId) {
                io.to(`user_${ride.driverId}`).emit('handover_ready', {
                    rideId: ride.id,
                    message: 'Payment confirmed. Vehicle ready for handover.'
                });
            }

            return res.json({ message: 'Handover confirmed, payment already completed', ride, paymentRequired: false });
        }

        // Payment not yet made - set status to "Handover Pending" and request payment
        ride.status = 'Handover Pending';
        await ride.save();

        // Emit socket event to rider to pay
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('handover_confirmed', {
                rideId: ride.id,
                driverId: ride.driverId,
                status: 'Handover Pending',
                type: 'hire',
                price: ride.price,
                origin: ride.origin,
                destination: ride.destination,
                message: 'Driver has confirmed handover. Please select your payment method to complete the handover and pick up the vehicle.'
            });
        }

        // Create notification for rider
        try {
            const { Notification } = require('../models');
            await Notification.create({
                userId: ride.riderId,
                title: 'Handover Ready',
                message: `Driver is ready to hand over your vehicle. Please select your payment method.`,
                type: 'info',
                relatedType: 'ride',
                relatedId: ride.id
            });
        } catch (nn) { console.warn('Notification create failed', nn); }

        res.json({ message: 'Handover confirmed, awaiting rider payment', ride, paymentRequired: true });
    } catch (err) {
        console.error('confirmHandover error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Rider confirms handover after payment.
 * Only allowed after payment has been selected/completed.
 */
exports.completeHandover = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;

        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the rider can complete handover
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized to complete handover' });
        }

        // Rider must have selected a payment method
        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method required to complete handover' });
        }

        // Update payment and move to "Active" status
        console.log(`[completeHandover] Updating ride ${id} from status "${ride.status}" to "Active"`);
        console.log(`[completeHandover] Ride data before save:`, JSON.stringify({ id: ride.id, status: ride.status, paymentMethod: ride.paymentMethod }));

        ride.paymentMethod = paymentMethod;
        ride.status = 'Active';

        try {
            const savedRide = await ride.save();
            console.log(`[completeHandover] ✅ Ride.save() completed`);
            console.log(`[completeHandover] Saved ride status: "${savedRide.status}"`);

            // VERIFY: Reload from database to confirm persistence
            await ride.reload();
            console.log(`[completeHandover] ✅ After reload, ride status in DB: "${ride.status}"`);

            if (ride.status !== 'Active') {
                console.error(`[completeHandover] 🚨 CRITICAL: Status did not persist! Expected "Active", got "${ride.status}"`);
                throw new Error(`Database rejected status change. Current status: ${ride.status}`);
            }
        } catch (saveError) {
            console.error(`[completeHandover] ❌ SAVE FAILED:`, saveError);
            throw saveError;
        }

        // Emit socket event to driver
        const io = req.app.get('io');
        if (io && ride.driverId) {
            console.log(`[completeHandover] 📡 Emitting handover_completed to driver: user_${ride.driverId}`);
            io.to(`user_${ride.driverId}`).emit('handover_completed', {
                rideId: ride.id,
                riderId: ride.riderId,
                paymentMethod: paymentMethod,
                status: 'Active',
                message: 'Rider has completed payment and confirmed handover. Vehicle is ready for pickup.'
            });
        }

        // ALSO emit to rider so their UI updates immediately
        if (io && ride.riderId) {
            console.log(`[completeHandover] 📡 Emitting handover_completed to rider: user_${ride.riderId}`);
            io.to(`user_${ride.riderId}`).emit('handover_completed', {
                rideId: ride.id,
                status: 'Active',
                paymentMethod: paymentMethod,
                message: 'Handover complete. Drive safely!'
            });
        }

        // Create notification for driver
        try {
            const { Notification } = require('../models');
            await Notification.create({
                userId: ride.driverId,
                title: 'Handover Completed',
                message: `Rider has confirmed handover with payment method: ${paymentMethod}. Vehicle ready for pickup.`,
                type: 'success',
                relatedType: 'ride',
                relatedId: ride.id
            });
        } catch (nn) { console.warn('Notification create failed', nn); }

        console.log(`[completeHandover] ✅ Sending success response for ride ${id}`);
        res.json({ message: 'Handover completed, hire is now active', ride });
    } catch (err) {
        console.error('completeHandover error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * REQUEST VEHICLE RETURN - Rider requests to return the vehicle to dealership
 * Changes status from 'Active' to 'Return Pending'
 */
exports.requestVehicleReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only rider can request return
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (ride.status !== 'Active') {
            return res.status(400).json({ error: 'Ride must be Active to request return' });
        }

        // Update status
        ride.status = 'Return Pending';
        await ride.save();

        // Notify driver
        const io = req.app.get('io');
        if (io && ride.driverId) {
            io.to(`user_${ride.driverId}`).emit('return_requested', {
                rideId: ride.id,
                status: 'Return Pending',
                message: 'Rider has requested to return the vehicle. Please confirm when received.'
            });
        }

        res.json({ message: 'Return requested', ride });
    } catch (err) {
        console.error('requestVehicleReturn error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * CONFIRM VEHICLE RETURN - Driver confirms vehicle has been returned
 * Changes status from 'Return Pending' to 'Completed'
 */
exports.confirmVehicleReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can confirm return
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (ride.status !== 'Return Pending') {
            return res.status(400).json({ error: 'Ride must be in Return Pending status' });
        }

        // Update status to Completed
        ride.status = 'Completed';

        // Ensure earnings are set for consistent stats
        if (!ride.driverEarnings || ride.driverEarnings <= 0) {
            ride.driverEarnings = ride.price; // Default to full price for hire if not set
        }
        await ride.save();

        // Increment Driver Wallet
        try {
            const { User } = require('../models');
            if (ride.driverEarnings > 0) {
                console.log(`[confirmVehicleReturn] Crediting wallet for driver ${ride.driverId}: +${ride.driverEarnings}`);
                await User.increment('walletBalance', { by: ride.driverEarnings, where: { id: ride.driverId } });
            }
        } catch (walletErr) {
            console.error('Failed to update wallet balance:', walletErr);
        }

        // Notify rider
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('return_confirmed', {
                rideId: ride.id,
                status: 'Completed',
                message: 'Vehicle return confirmed. Trip completed.'
            });
        }

        res.json({ message: 'Vehicle return confirmed, trip completed', ride });
    } catch (err) {
        console.error('confirmVehicleReturn error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Helper: haversine distance (km)
function haversineKm(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

        // Increment Driver Wallet
        try {
            const { User } = require('../models'); // Ensure imported
            if (driverEarnings > 0) {
                console.log(`[completeRide] Crediting wallet for driver ${ride.driverId}: +${driverEarnings}`);
                await User.increment('walletBalance', { by: driverEarnings, where: { id: ride.driverId } });
            }
        } catch (walletErr) {
            console.error('Failed to update wallet balance in completeRide:', walletErr);
        }

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

/**
 * START PICKUP - Driver clicks "Pick Up" for a trip
 * Sends boarding confirmation request to rider
 */
exports.startPickup = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can start pickup
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Set status to waiting for boarding confirmation
        ride.status = 'Waiting for Boarding';
        await ride.save();

        // Notify rider to confirm boarding
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('boarding_request', {
                rideId: ride.id,
                driverId: ride.driverId,
                message: 'Driver is ready to pick you up. Please confirm boarding.'
            });
        }

        res.json({ message: 'Boarding request sent to rider', ride });
    } catch (err) {
        console.error('startPickup error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.arriveAtPickup = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can mark arrived
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update status
        ride.status = 'Arrived';
        await ride.save();

        // Notify rider
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('driver_arrived', {
                rideId: ride.id,
                status: 'Arrived',
                message: 'Driver has arrived at your location'
            });
        }

        res.json({ message: 'Arrival confirmed', ride });
    } catch (err) {
        console.error('arriveAtPickup error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * BOARD PASSENGER - Driver clicks "Passenger Boarded" for each passenger
 * Increments boardedPassengers count
 */
exports.boardPassenger = async (req, res) => {
    try {
        const { id } = req.params;
        const { passengerIndex } = req.body; // Optional: specific passenger index

        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can board passengers
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Increment boarded count
        const currentBoarded = ride.boardedPassengers || 0;
        const totalPassengers = ride.totalPassengers || 1;

        if (currentBoarded >= totalPassengers) {
            return res.status(400).json({ error: 'All passengers already boarded' });
        }

        ride.boardedPassengers = currentBoarded + 1;

        // Update boarding list
        const boardingList = ride.passengerBoardingList || [];
        boardingList.push({
            index: passengerIndex || currentBoarded + 1,
            boardedAt: new Date().toISOString(),
            confirmed: true
        });
        ride.passengerBoardingList = boardingList;

        //  If all passengers boarded, update status to 'Boarded'
        if (ride.boardedPassengers >= totalPassengers) {
            ride.status = 'Boarded';
        }

        await ride.save();

        // Notify rider
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('passenger_boarded', {
                rideId: ride.id,
                boardedPassengers: ride.boardedPassengers,
                totalPassengers: ride.totalPassengers,
                allBoarded: ride.boardedPassengers >= totalPassengers,
                message: `Passenger ${ride.boardedPassengers} of ${totalPassengers} boarded`
            });
        }

        res.json({
            message: 'Passenger boarded',
            ride,
            boardedPassengers: ride.boardedPassengers,
            totalPassengers: ride.totalPassengers
        });
    } catch (err) {
        console.error('boardPassenger error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * CONFIRM BOARDING - Rider confirms they have boarded the vehicle
 * Changes status from 'Arrived' to 'Boarded'
 */
exports.confirmBoarding = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only the rider can confirm boarding
        if (req.user.role !== 'rider' || req.user.id !== ride.riderId) {
            return res.status(403).json({ error: 'Not authorized to confirm boarding for this ride' });
        }

        // Update status to Boarded
        ride.status = 'Boarded';
        await ride.save();

        // Notify driver that rider has boarded
        const io = req.app.get('io');
        if (io && ride.driverId) {
            io.to(`user_${ride.driverId}`).emit('rider_boarded', {
                rideId: ride.id,
                status: 'Boarded',
                message: 'Rider has confirmed boarding. You can start the trip.'
            });
        }

        // Notify rider
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('boarding_confirmed', {
                rideId: ride.id,
                status: 'Boarded',
                message: 'Boarding confirmed. Waiting for driver to start the trip.'
            });
        }

        res.json({ message: 'Boarding confirmed', ride });
    } catch (err) {
        console.error('confirmBoarding error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * START TRIP - Driver clicks "Start Trip" after all passengers boarded
 * Changes status from 'Boarded' to 'In Progress'
 */
exports.startTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can start trip
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update status
        ride.status = 'In Progress';
        await ride.save();

        // Notify rider
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('trip_started', {
                id: ride.id,
                rideId: ride.id,
                status: 'In Progress',
                message: 'Trip has started'
            });
        }

        res.json({ message: 'Trip started', ride });
    } catch (err) {
        console.error('startTrip error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * END TRIP - Driver clicks "Complete Trip" to end the ride
 * Changes status from 'In Progress' to 'Payment Due'
 */
exports.endTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const ride = await Ride.findByPk(id);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });

        // Only driver can end trip
        if (req.user.role !== 'driver' || req.user.id !== ride.driverId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update status
        ride.status = 'Payment Due';
        await ride.save();

        // Notify rider to pay
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('driver_end_trip', {
                rideId: ride.id,
                status: 'Payment Due',
                type: ride.type,
                price: ride.price,
                message: 'Trip completed. Please complete payment.'
            });
        }

        res.json({ message: 'Trip ended, awaiting payment', ride });
    } catch (err) {
        console.error('endTrip error:', err);
        res.status(500).json({ error: err.message });
    }
};
