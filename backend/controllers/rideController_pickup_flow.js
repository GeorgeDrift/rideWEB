
const { Ride, User, Transaction, RideSharePost, HirePost } = require('../models');
const driverController = require('./driverController');
const { Op } = require('sequelize');
const mapService = require('./services/mapService');

// ... (existing functions remain unchanged) ...

/**
 * START PICKUP - Driver clicks "Start Pickup" for a trip
 * Changes status from 'Scheduled' to 'Inbound'
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

        // Update status
        ride.status = 'Inbound';
        await ride.save();

        // Notify rider
        const io = req.app.get('io');
        if (io && ride.riderId) {
            io.to(`user_${ride.riderId}`).emit('trip_status_update', {
                id: ride.id,
                status: 'Inbound',
                message: 'Driver is on the way to pick you up'
            });
        }

        res.json({ message: 'Pickup started', ride });
    } catch (err) {
        console.error('startPickup error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * ARRIVE AT PICKUP - Driver clicks "Arrived" when at pickup location
 * Changes status from 'Inbound' to 'Arrived'
 */
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
