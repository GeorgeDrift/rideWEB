
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
        const whereClause = {
            type: 'share',
            driverId: { [Op.ne]: null },
            status: { [Op.or]: ['Scheduled', 'Pending'] }
        };

        if (filters.origin) whereClause.origin = { [Op.iLike]: `%${filters.origin}%` };
        if (filters.destination) whereClause.destination = { [Op.iLike]: `%${filters.destination}%` };

        return await Ride.findAll({
            where: whereClause,
            include: [{ 
                model: User, 
                as: 'driver', 
                attributes: ['name', 'rating', 'avatar', 'vehicleModel', 'vehiclePlate'] 
            }],
            order: [['date', 'ASC']]
        });
    }

    async getMarketplaceHire(filters = {}) {
        const whereClause = {
            status: 'Available'
        };

        if (filters.category) whereClause.category = { [Op.iLike]: `%${filters.category}%` };

        return await Vehicle.findAll({
            where: whereClause,
            include: [{ 
                model: User, 
                as: 'driver', 
                attributes: ['name', 'rating', 'avatar'] 
            }]
        });
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
}

module.exports = new RiderService();
