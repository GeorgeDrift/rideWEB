const { User, Ride, Transaction, PricingZone, SystemSetting, Disputes, sequelize, RideShareVehicle, HireVehicle } = require('../models');
const { Op } = require('sequelize');

// --- Analytics ---
// --- Analytics ---
exports.getRevenueStats = async (req, res) => {
    try {
        // Daily Data (Last 30 days)
        const chartData = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toLocaleDateString('default', { day: 'numeric', month: 'short' });

            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const total = await Transaction.sum('amount', {
                where: {
                    status: 'completed',
                    direction: { [Op.or]: ['debit', 'credit'] }, // Include potentially all completed transactions relevant to revenue
                    createdAt: { [Op.between]: [startOfDay, endOfDay] }
                }
            });
            chartData.push({ name: dateStr, value: total || 0 });
        }

        // Transactions (All recent, increased limit or pagination ideally, but for now 50 to show "all" for user demo)
        const transactions = await Transaction.findAll({
            limit: 50,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'user', attributes: ['name'] }]
        });

        const formattedTransactions = transactions.map(t => ({
            id: t.id.substring(0, 8),
            source: t.description || 'System',
            date: new Date(t.createdAt).toLocaleDateString() + ' ' + new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: t.amount,
            status: t.status.charAt(0).toUpperCase() + t.status.slice(1)
        }));

        // Summary Stats
        const totalRevenue = await Transaction.sum('amount', {
            where: { status: 'completed', direction: 'debit' }
        });

        const pendingPayouts = await Transaction.sum('amount', {
            where: { status: 'pending', direction: 'credit' } // Assuming payouts are credits
        });

        const totalRides = await Ride.count({ where: { status: 'Completed' } });
        const avgRevenue = totalRides > 0 ? (totalRevenue / totalRides).toFixed(2) : 0;

        res.json({
            annual: chartData,
            transactions: formattedTransactions,
            stats: {
                totalRevenue: totalRevenue || 0,
                pendingPayouts: pendingPayouts || 0,
                avgRevenue: avgRevenue || 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTotalRideStats = async (req, res) => {
    try {
        const completed = await Ride.count({ where: { status: 'Completed' } });
        const cancelled = await Ride.count({ where: { status: 'Cancelled' } });
        const inProgress = await Ride.count({ where: { status: 'In Progress' } });

        // Weekly Data (Last 7 days)
        const weekly = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const startOfDay = new Date(d.setHours(0, 0, 0, 0));
            const endOfDay = new Date(d.setHours(23, 59, 59, 999));
            const dayName = startOfDay.toLocaleDateString('default', { weekday: 'short' });

            const rides = await Ride.count({
                where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } }
            });
            const cancelledCount = await Ride.count({
                where: {
                    status: 'Cancelled',
                    createdAt: { [Op.between]: [startOfDay, endOfDay] }
                }
            });
            const shareCount = await Ride.count({
                where: {
                    type: 'share',
                    createdAt: { [Op.between]: [startOfDay, endOfDay] }
                }
            });
            const hireCount = await Ride.count({
                where: {
                    type: 'hire',
                    createdAt: { [Op.between]: [startOfDay, endOfDay] }
                }
            });

            weekly.push({ name: dayName, rides, cancelled: cancelledCount, share: shareCount, hire: hireCount });
        }

        // Avg Distance (Active/Completed rides)
        const avgDistResult = await Ride.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('distance_km')), 'avgDist']],
            where: { status: 'Completed' }
        });

        res.json({
            weekly,
            monthly: weekly, // Reuse for now or implement similar monthly loop
            yearly: [],
            breakdown: { completed, cancelled, inProgress },
            avgDistance: parseFloat(avgDistResult?.dataValues?.avgDist || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getShareStats = async (req, res) => {
    try {
        const activeVehicles = await RideShareVehicle.count({ where: { status: 'active' } });
        const totalRides = await Ride.count({ where: { type: 'share' } });

        // Helper for time-based aggregation
        const getAggregatedData = async (days, mode = 'day') => {
            const data = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                let start, end, label;

                if (mode === 'month') {
                    d.setMonth(d.getMonth() - i);
                    start = new Date(d.getFullYear(), d.getMonth(), 1);
                    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
                    label = start.toLocaleString('default', { month: 'short' });
                } else if (mode === 'week') {
                    d.setDate(d.getDate() - (i * 7));
                    // Start of that week (Sunday)
                    const day = d.getDay();
                    start = new Date(d);
                    start.setDate(d.getDate() - day);
                    start.setHours(0, 0, 0, 0);

                    end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    end.setHours(23, 59, 59, 999);
                    label = `W${i + 1}`; // Simple label or date range
                } else {
                    // Daily
                    d.setDate(d.getDate() - i);
                    start = new Date(d.setHours(0, 0, 0, 0));
                    end = new Date(d.setHours(23, 59, 59, 999));
                    label = start.toLocaleDateString('default', { weekday: 'short' });
                }

                const count = await Ride.count({
                    where: {
                        type: 'share',
                        createdAt: { [Op.between]: [start, end] }
                    }
                });
                data.push({ name: label, rides: count });
            }
            return data;
        };

        const [weekly, monthly] = await Promise.all([
            getAggregatedData(7, 'day'),   // Last 7 days
            getAggregatedData(12, 'month') // Last 12 months
        ]);

        const avgFareResult = await Ride.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']],
            where: { type: 'share', status: 'Completed' }
        });

        res.json({
            weekly,
            monthly,
            activeVehicles,
            avgFare: parseFloat(avgFareResult?.dataValues?.avgPrice || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHireStats = async (req, res) => {
    try {
        // Fetch Categories from HireVehicle data
        const categoriesData = await HireVehicle.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'Available' THEN 1 ELSE 0 END")), 'available']
            ],
            group: ['category']
        });

        const categories = await Promise.all(categoriesData.map(async (cat) => {
            const categoryName = cat.get('category');
            const models = await HireVehicle.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('model')), 'model']],
                where: { category: categoryName },
                limit: 5
            });

            // Calculate revenue for this category (Join with Ride/HirePost ideally, simplifying for now)
            // const revenue = 0; // Placeholder until we link Rides to specific Vehicles accurately for revenue

            return {
                title: categoryName,
                icon: '🚙', // Generic icon
                count: parseInt(cat.get('total')),
                available: parseInt(cat.get('available')),
                examples: models.map(m => m.get('model')),
                stats: { activeRentals: 0, growth: 0, revenue: 0, avgRate: 0, chartData: [] }
            };
        }));

        const getAggregatedData = async (days, mode = 'day') => {
            const data = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                let start, end, label;

                if (mode === 'month') {
                    d.setMonth(d.getMonth() - i);
                    start = new Date(d.getFullYear(), d.getMonth(), 1);
                    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
                    label = start.toLocaleString('default', { month: 'short' });
                } else {
                    // Daily
                    d.setDate(d.getDate() - i);
                    start = new Date(d.setHours(0, 0, 0, 0));
                    end = new Date(d.setHours(23, 59, 59, 999));
                    label = start.toLocaleDateString('default', { weekday: 'short' });
                }

                const scheduled = await Ride.count({
                    where: { type: 'hire', isImmediate: false, createdAt: { [Op.between]: [start, end] } }
                });
                const immediate = await Ride.count({
                    where: { type: 'hire', isImmediate: true, createdAt: { [Op.between]: [start, end] } }
                });

                data.push({ name: label, scheduled, immediate });
            }
            return data;
        };

        const [weekly, monthly] = await Promise.all([
            getAggregatedData(7, 'day'),
            getAggregatedData(12, 'month')
        ]);

        res.json({ weekly, monthly, categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const driverCount = await User.count({ where: { role: 'driver' } });
        const riderCount = await User.count({ where: { role: 'rider' } });

        // Keep activeDrivers for backward compatibility if needed, or mapped to driverCount
        const activeDrivers = driverCount;
        const rides = await Ride.count();

        const revenueResult = await Transaction.findAll({
            where: { status: 'completed', direction: 'debit' }, // Incoming money
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });

        const pendingDisputes = await Disputes.count({ where: { status: 'pending' } });

        const rideShareCount = await Ride.count({ where: { type: 'share' } });
        const forHireCount = await Ride.count({ where: { type: 'hire' } });

        // Helper for revenue aggregation
        const getRevenueData = async (startDate, endDate, format) => {
            const transactions = await Transaction.findAll({
                where: {
                    status: 'completed',
                    direction: 'debit',
                    createdAt: { [Op.between]: [startDate, endDate] }
                },
                attributes: [
                    [sequelize.fn('date_trunc', format, sequelize.col('createdAt')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['date'],
                order: [['date', 'ASC']]
            });
            return transactions.map(t => ({
                name: new Date(t.getDataValue('date')).toLocaleDateString('en-US', { weekday: 'short' }),
                value: parseFloat(t.getDataValue('total')) || 0
            }));
        };

        // Date ranges
        const today = new Date();
        const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - 6);
        const startOfLastWeek = new Date(today); startOfLastWeek.setDate(today.getDate() - 13);
        const endOfLastWeek = new Date(today); endOfLastWeek.setDate(today.getDate() - 7);
        const startOfMonth = new Date(today); startOfMonth.setMonth(today.getMonth() - 6);

        // Fetch revenue trends
        // Note: For simplicity in this fix, we approximate daily data. 
        // Real implementation might need filling gaps.

        // This Week (Last 7 Days)
        const weekly = await getRevenueData(startOfWeek, today, 'day');

        // Last Week
        const lastWeek = await getRevenueData(startOfLastWeek, endOfLastWeek, 'day');

        // Monthly (Last 6 Months)
        const monthlyTransactions = await Transaction.findAll({
            where: {
                status: 'completed',
                direction: 'debit',
                createdAt: { [Op.between]: [startOfMonth, today] }
            },
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        const monthly = monthlyTransactions.map(t => ({
            name: new Date(t.getDataValue('date')).toLocaleDateString('en-US', { month: 'short' }),
            value: parseFloat(t.getDataValue('total')) || 0
        }));

        res.json({
            users: totalUsers,
            activeDrivers,
            driverCount,
            riderCount,
            rides,
            revenue: revenueResult[0]?.total || 0,
            pendingDisputes,
            weekly,
            lastWeek,
            monthly,
            rideShareCount,
            forHireCount
        });
    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- User Management ---
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await User.findAll({
            where: { role: 'driver' },
            attributes: { exclude: ['password'] }
        });
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRiders = async (req, res) => {
    try {
        const riders = await User.findAll({
            where: { role: 'rider' },
            attributes: { exclude: ['password'] }
        });
        res.json(riders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountStatus } = req.body; // 'active', 'suspended', 'pending'

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.update({ accountStatus });
        res.json({ message: `User ${accountStatus} successfully`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Ride Management ---
exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.findAll({
            include: [
                { model: User, as: 'driver', attributes: ['name', 'email'] },
                { model: User, as: 'rider', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100 // Safety limit
        });
        res.json(rides);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Pricing Zones ---
exports.getPricingZones = async (req, res) => {
    try {
        const zones = await PricingZone.findAll();
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPricingZone = async (req, res) => {
    try {
        const zone = await PricingZone.create(req.body);
        res.status(201).json(zone);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Global Settings (Base Rates) ---
exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findAll();
        // Convert array to object { baseFare: 5.00, ... }
        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // { baseFare: 6.00, perKm: 1.5 }

        const promises = Object.keys(updates).map(key => {
            return SystemSetting.upsert({
                key,
                value: updates[key].toString()
            });
        });

        await Promise.all(promises);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllVehicles = async (req, res) => {
    try {
        // Fetch Ride Share Vehicles
        const shareVehicles = await RideShareVehicle.findAll({
            include: [{ model: User, as: 'driver', attributes: ['name', 'email'] }]
        });

        // Fetch For Hire Vehicles
        const hireVehicles = await HireVehicle.findAll();

        const formattedShare = shareVehicles.map(v => ({
            id: v.id,
            type: 'Ride Share',
            make: v.make,
            model: v.model,
            plate: v.plate,
            driver: v.driver?.name || 'Unknown',
            status: v.status,
            category: 'Standard'
        }));

        const formattedHire = hireVehicles.map(v => ({
            id: v.id,
            type: 'For Hire',
            make: v.make || 'Generic',
            model: v.model,
            plate: v.plate,
            driver: 'Agency/Fleet',
            status: v.status,
            category: v.category
        }));

        res.json([...formattedShare, ...formattedHire]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
