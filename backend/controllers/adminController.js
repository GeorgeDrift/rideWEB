
const { User, Ride, Transaction, PricingZone, SystemSetting, sequelize } = require('../models');

// --- Analytics ---
exports.getDashboardStats = async (req, res) => {
    try {
        const users = await User.count();
        const activeDrivers = await User.count({ where: { role: 'driver', isOnline: true } });
        const rides = await Ride.count();
        
        const revenueResult = await Transaction.findAll({
            where: { status: 'completed', direction: 'debit' }, // Incoming money
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });

        res.json({ 
            users, 
            activeDrivers,
            rides, 
            revenue: revenueResult[0].total || 0 
        });
    } catch (err) {
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
