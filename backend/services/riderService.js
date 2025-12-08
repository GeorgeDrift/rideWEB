
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
                    [Op.in]: ['Pending', 'Approved', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Payment Due', 'Awaiting Payment Selection', 'Waiting for Pickup', 'Handover Pending', 'Active', 'Return Pending']
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
                status: { [Op.in]: ['Completed', 'Cancelled', 'Refunded', 'Approved', 'Pending', 'Inbound', 'Arrived', 'In Progress', 'Waiting for Pickup', 'Payment Due', 'Scheduled', 'Boarded', 'Awaiting Payment Selection', 'Handover Pending', 'Active', 'Return Pending'] }
            },
            include: [{ model: User, as: 'driver', attributes: ['name', 'rating', 'avatar'] }],
            order: [['createdAt', 'DESC']]
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
    async searchRideShareVehicles(pickupLocation, destination, filters = {}) {
        const { RideSharePost, Ride, User, RideShareVehicle, sequelize } = require('../models');

        // Require at least one location filter
        if (!pickupLocation && !destination) {
            throw new Error('Please provide pickupLocation or destination to search');
        }

        // Build ILIKE patterns
        const pickupPattern = pickupLocation ? `%${pickupLocation}%` : null;
        const destPattern = destination ? `%${destination}%` : null;

        // Query RideSharePost (driver marketplace posts)
        const postWhere = { status: 'active' };
        const postConds = [];
        if (pickupPattern) {
            postConds.push({ origin: { [Op.iLike]: pickupPattern } });
            postConds.push({ destination: { [Op.iLike]: pickupPattern } });
        }
        if (destPattern) {
            postConds.push({ destination: { [Op.iLike]: destPattern } });
            postConds.push(sequelize.where(sequelize.cast(sequelize.col('allowedDestinations'), 'text'), { [Op.iLike]: destPattern }));
        }
        if (postConds.length > 0) postWhere[Op.or] = postConds;

        const posts = await RideSharePost.findAll({
            where: postWhere,
            include: [
                { model: User, as: 'driver', attributes: ['id', 'name', 'rating', 'phone'] },
                { model: RideShareVehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'plate', 'seats', 'imageUrl'], required: false }
            ],
            order: [['date', 'ASC']]
        });

        // Query Ride (rider requests of type 'share')
        const rideWhere = { type: 'share' };
        const rideConds = [];
        if (pickupPattern) {
            rideConds.push({ origin: { [Op.iLike]: pickupPattern } });
            rideConds.push({ destination: { [Op.iLike]: pickupPattern } });
        }
        if (destPattern) {
            rideConds.push({ destination: { [Op.iLike]: destPattern } });
        }
        if (rideConds.length > 0) rideWhere[Op.or] = rideConds;

        const rides = await Ride.findAll({
            where: rideWhere,
            include: [
                { model: User, as: 'driver', attributes: ['id', 'name', 'rating', 'phone'] },
                { model: User, as: 'rider', attributes: ['id', 'name', 'rating', 'avatar'] }
            ],
            order: [['date', 'ASC']]
        });

        // Combine posts and rides into a unified array
        const unified = [];
        for (const p of posts) {
            const obj = p.toJSON ? p.toJSON() : p;
            obj._source = 'post';
            unified.push(obj);
        }
        for (const r of rides) {
            const obj = r.toJSON ? r.toJSON() : r;
            obj._source = 'ride';
            unified.push(obj);
        }

        // Sort by date ascending (earlier trips first) then createdAt
        unified.sort((a, b) => {
            const da = a.date ? new Date(a.date) : new Date(a.createdAt);
            const db = b.date ? new Date(b.date) : new Date(b.createdAt);
            return da - db || new Date(b.createdAt) - new Date(a.createdAt);
        });

        // pagination on combined results
        const page = parseInt(filters.page || 1, 10) || 1;
        const limit = Math.min(parseInt(filters.limit || 20, 10) || 20, 100);
        const offset = (page - 1) * limit;
        const total = unified.length;
        const pageRows = unified.slice(offset, offset + limit);

        return { total, page, limit, results: pageRows };
    }

    // --- NEW: Submit Ride Request with Negotiation ---
    async submitRideRequest(riderId, requestData) {
        const { Ride, NegotiationHistory, Notification } = require('../models');

        const { vehicleId, pickupLocation, destination, offeredPrice, message, requestedDate, requestedTime, driverId, origin } = requestData;

        // Use origin or pickupLocation (some frontend calls send origin, others pickupLocation)
        const finalOrigin = origin || pickupLocation;

        if (!finalOrigin || !destination) {
            throw new Error('Origin and destination are required');
        }

        // Create the ride request
        const ride = await Ride.create({
            type: 'share',
            riderId,
            driverId,
            origin: finalOrigin,
            destination,
            pickupLocation: finalOrigin,
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
