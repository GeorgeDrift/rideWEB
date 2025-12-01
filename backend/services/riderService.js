
const { User, Ride, Vehicle, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

class RiderService {

    async getProfile(riderId) {
        return await User.findByPk(riderId, {
            attributes: { exclude: ['password'] }
        });
    }

    async updateProfile(riderId, data) {
        delete data.password;
        delete data.role;
        delete data.walletBalance;

        await User.update(data, { where: { id: riderId } });
        return await this.getProfile(riderId);
    }

    async getStats(riderId) {
        const spentResult = await Ride.findOne({
            where: { riderId, status: 'Completed' },
            attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
            raw: true
        });

        const rideCount = await Ride.count({ where: { riderId, status: 'Completed' } });

        const monthlyData = await Ride.findAll({
            where: { riderId, status: 'Completed' },
            attributes: [
                [sequelize.fn('to_char', sequelize.col('createdAt'), 'Mon'), 'name'],
                [sequelize.fn('SUM', sequelize.col('price')), 'value']
            ],
            group: [sequelize.fn('to_char', sequelize.col('createdAt'), 'Mon')],
            raw: true
        });

        const rideTypes = await Ride.findAll({
            where: { riderId },
            attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['type'],
            raw: true
        });

        return {
            totalSpent: spentResult?.total || 0,
            totalRides: rideCount,
            totalDistance: rideCount * 12.5,
            chartData: monthlyData,
            rideTypes: rideTypes.map(t => ({
                name: t.type === 'share' ? 'Share' : 'Hire',
                value: parseInt(t.count),
                color: t.type === 'share' ? '#FACC15' : '#3b82f6'
            }))
        };
    }

    async getMarketplaceShares(filters = {}) {
        // Prefer driver-created RideSharePost entries (marketplace posts)
        const { RideSharePost, User, RideShareVehicle } = require('../models');

        const whereClause = { status: 'active' };
        if (filters.origin) whereClause.origin = { [Op.iLike]: `%${filters.origin}%` };
        if (filters.destination) whereClause.destination = { [Op.iLike]: `%${filters.destination}%` };

        const posts = await RideSharePost.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'driver', attributes: ['id', 'name', 'rating', 'avatar'] },
                { model: RideShareVehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'plate', 'seats', 'imageUrl'], required: false }
            ],
            order: [['date', 'ASC']]
        });

        return posts;
    }

    async getMarketplaceHire(filters = {}) {
        // Prefer driver-created HirePost entries (marketplace job listings)
        const { HirePost, HireVehicle, User } = require('../models');

        const whereClause = { status: 'available' };
        if (filters.category) whereClause.category = { [Op.iLike]: `%${filters.category}%` };

        const posts = await HirePost.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'driver', attributes: ['id', 'name', 'rating', 'avatar'] },
                { model: HireVehicle, as: 'vehicle', attributes: ['id', 'name', 'plate', 'category', 'imageUrl'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        return posts;
    }

    async bookRide(riderId, bookingData) {
        const ride = await Ride.create({
            ...bookingData,
            riderId,
            status: 'Pending'
        });
        return ride;
    }

    async getActiveTrip(riderId) {
        return await Ride.findOne({
            where: {
                riderId,
                status: {
                    [Op.in]: ['Pending', 'Approved', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Payment Due']
                }
            },
            include: [{
                model: User,
                as: 'driver',
                attributes: ['name', 'rating', 'avatar', 'phone', 'vehicleModel', 'vehiclePlate']
            }],
            order: [['updatedAt', 'DESC']]
        });
    }

    async getHistory(riderId) {
        return await Ride.findAll({
            where: {
                riderId,
                status: { [Op.in]: ['Completed', 'Cancelled', 'Refunded'] }
            },
            include: [{ model: User, as: 'driver', attributes: ['name', 'rating', 'avatar'] }],
            order: [['date', 'DESC']]
        });
    }

    async rateDriver(riderId, rideId, rating, review) {
        const ride = await Ride.findOne({ where: { id: rideId, riderId } });
        if (!ride) throw new Error('Ride not found or access denied');

        await ride.update({ rating, review });

        if (ride.driverId) {
            const driverId = ride.driverId;
            const result = await Ride.findOne({
                where: { driverId, rating: { [Op.ne]: null } },
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
                raw: true
            });

            if (result?.avgRating) {
                await User.update(
                    { rating: parseFloat(result.avgRating).toFixed(1) },
                    { where: { id: driverId } }
                );
            }
        }
        return ride;
    }

    // --- NEW: Location-based Vehicle Search for Ride Share ---
    async searchRideShareVehicles(pickupLocation, destination) {
        const { RideSharePost, User, RideShareVehicle } = require('../models');

        // Build flexible where clause: match pickupLocation OR origin OR destination
        const where = { status: 'active' };
        const conditions = [];

        if (pickupLocation) {
            conditions.push({ pickupLocation: { [Op.iLike]: `%${pickupLocation}%` } });
            conditions.push({ origin: { [Op.iLike]: `%${pickupLocation}%` } });
            conditions.push({ destination: { [Op.iLike]: `%${pickupLocation}%` } });
        }
        if (destination) {
            conditions.push({ destination: { [Op.iLike]: `%${destination}%` } });
            // If allowedDestinations is stored as JSON/array, fall back to casting to text and searching
            const { sequelize } = require('../models');
            conditions.push(sequelize.where(sequelize.cast(sequelize.col('allowedDestinations'), 'text'), { [Op.iLike]: `%${destination}%` }));
        }

        if (conditions.length > 0) where[Op.or] = conditions;

        // pagination: accept page & limit via filters
        const page = parseInt(filters.page || 1, 10) || 1;
        const limit = Math.min(parseInt(filters.limit || 20, 10) || 20, 100);
        const offset = (page - 1) * limit;

        const { count, rows } = await RideSharePost.findAndCountAll({
            where,
            include: [
                { model: User, as: 'driver', attributes: ['id', 'name', 'rating', 'phone'] },
                { model: RideShareVehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'plate', 'seats', 'imageUrl'], required: false }
            ],
            order: [['date', 'ASC']],
            limit,
            offset
        });

        return { total: count, page, limit, results: rows };
    }

    // --- NEW: Submit Ride Request with Negotiation ---
    async submitRideRequest(riderId, requestData) {
        const { Ride, NegotiationHistory, Notification } = require('../models');

        const { vehicleId, pickupLocation, destination, offeredPrice, message, requestedDate, requestedTime, driverId } = requestData;

        // Create the ride request
        const ride = await Ride.create({
            type: 'share',
            riderId,
            driverId,
            origin: pickupLocation,
            destination,
            pickupLocation,
            date: requestedDate,
            time: requestedTime,
            offeredPrice,
            price: offeredPrice,
            status: 'Pending',
            negotiationStatus: 'pending',
            paymentStatus: 'pending',
            paymentType: 'pending'
        });

        // Create negotiation history entry
        await NegotiationHistory.create({
            rideId: ride.id,
            offeredBy: riderId,
            offeredPrice,
            message,
            status: 'pending'
        });

        // Notify driver
        await Notification.create({
            userId: driverId,
            title: 'New Ride Request',
            message: `New ride request from ${pickupLocation} to ${destination}. Offered price: MWK ${offeredPrice}`,
            type: 'info',
            relatedType: 'ride',
            relatedId: ride.id
        });

        return ride;
    }

    // --- NEW: Submit Hire Request ---
    async submitHireRequest(riderId, requestData) {
        const { Ride, NegotiationHistory, Notification } = require('../models');

        const { vehicleId, offeredPrice, startDate, endDate, message, driverId, location } = requestData;

        const ride = await Ride.create({
            type: 'hire',
            riderId,
            driverId,
            origin: location,
            destination: location,
            pickupLocation: location,
            date: startDate,
            offeredPrice,
            price: offeredPrice,
            status: 'Pending',
            negotiationStatus: 'pending',
            paymentStatus: 'pending',
            paymentType: 'pending',
            pickupTime: new Date(startDate),
            returnTime: new Date(endDate)
        });

        await NegotiationHistory.create({
            rideId: ride.id,
            offeredBy: riderId,
            offeredPrice,
            message,
            status: 'pending'
        });

        await Notification.create({
            userId: driverId,
            title: 'New Hire Request',
            message: `New vehicle hire request. Offered rate: MWK ${offeredPrice}`,
            type: 'info',
            relatedType: 'ride',
            relatedId: ride.id
        });

        return ride;
    }

    // --- NEW: Make Counter Offer ---
    async makeCounterOffer(riderId, rideId, counterOfferData) {
        const { Ride, NegotiationHistory, Notification } = require('../models');

        const { offeredPrice, message } = counterOfferData;

        const ride = await Ride.findByPk(rideId);
        if (!ride) throw new Error('Ride not found');

        ride.offeredPrice = offeredPrice;
        ride.negotiationStatus = 'negotiating';
        await ride.save();

        await NegotiationHistory.create({
            rideId,
            offeredBy: riderId,
            offeredPrice,
            message,
            status: 'pending'
        });

        await Notification.create({
            userId: ride.driverId,
            title: 'Counter Offer Received',
            message: `Rider made a counter offer: MWK ${offeredPrice}`,
            type: 'info',
            relatedType: 'ride',
            relatedId: rideId
        });

        return ride;
    }

    // --- NEW: Get Pending Requests for Rider ---
    async getPendingRequests(riderId) {
        const { Ride, User } = require('../models');

        const requests = await Ride.findAll({
            where: {
                riderId,
                negotiationStatus: ['pending', 'negotiating']
            },
            include: [{
                model: User,
                as: 'driver',
                attributes: ['id', 'name', 'rating', 'phone']
            }],
            order: [['createdAt', 'DESC']]
        });

        return requests;
    }
}

module.exports = new RiderService();
