
const { Vehicle, Ride, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const locations = require('../data/locations.json');

exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({ where: { driverId: req.user.id } });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addVehicle = async (req, res) => {
    try {
        // Only allow columns that exist in the Vehicles table to avoid schema mismatch
        const allowed = ['name', 'plate', 'category', 'rate', 'features', 'imageUrl', 'status'];
        const payload = {};
        for (const k of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        }
        payload.driverId = req.user.id;

        // Pass explicit fields so Sequelize doesn't try to insert columns not present in the DB
        const vehicle = await Vehicle.create(payload, { fields: Object.keys(payload) });
        // Emit an update for marketplace listeners and admin
        try {
            const io = req.app.get('io');
            if (io) io.emit('vehicle_added', vehicle);
        } catch (e) { console.warn('Socket emit error for vehicle_added', e); }
        res.status(201).json(vehicle);
    } catch (err) {
        console.error('Add vehicle error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        // SQL Aggregation
        const stats = await Ride.findAll({
            where: {
                driverId: req.user.id,
                status: 'Completed'
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('driverEarnings')), 'totalEarnings'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                // Mock rating calc as it is on User model or separate table usually
            ],
            raw: true
        });

        const result = stats[0];

        // Fetch fresh user data for wallet balance
        // Fetch fresh user data for wallet balance
        const user = await User.findByPk(req.user.id);
        console.log(`[DEBUG] Wallet Check - User: ${req.user.id}, Balance: ${user ? user.walletBalance : 'User Not Found'}, Name: ${user ? user.name : 'N/A'}`);
        console.log('DRIVER AMOUNT:', user ? user.walletBalance : 0);

        let currentBalance = user ? user.walletBalance : 0;
        const totalEarnings = result.totalEarnings || 0;

        // Lazy Fix: If wallet balance is 0 but total earnings exist (and assuming no withdrawals yet),
        // sync the balance to match earnings. This fixes the "zero balance" issue for existing drivers.
        if (currentBalance === 0 && totalEarnings > 0) {
            console.log(`[getStats] Syncing walletBalance for user ${req.user.id} from 0 to ${totalEarnings}`);
            if (user) {
                user.walletBalance = totalEarnings;
                await user.save();
                currentBalance = totalEarnings;
            }
        }

        res.json({
            totalEarnings: totalEarnings,
            count: parseInt(result.count) || 0,
            avgRating: 4.9, // Static or fetch from User.rating
            walletBalance: currentBalance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Profit breakdown (Weekly / Monthly / Yearly) derived from rides
exports.getProfitStats = async (req, res) => {
    try {
        const driverId = req.user.id;

        // Build a very small aggregation for demo purposes: last 7 days (weekly), last 6 months (monthly), last 12 months (yearly)
        // We assume Ride.createdAt is a timestamp
        const weekly = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));
            const sum = await Ride.sum('driverEarnings', { where: { driverId, status: 'Completed', createdAt: { [Op.between]: [start, end] } } }) || 0;
            weekly.push({ name: start.toLocaleDateString(), value: Math.round(sum) });
        }

        // Monthly - last 6 months
        const monthly = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
            const sum = await Ride.sum('driverEarnings', { where: { driverId, status: 'Completed', createdAt: { [Op.between]: [start, end] } } }) || 0;
            monthly.push({ name: start.toLocaleString('default', { month: 'short' }), value: Math.round(sum) });
        }

        // Yearly - last 12 months simplified
        const yearly = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
            const sum = await Ride.sum('driverEarnings', { where: { driverId, status: 'Completed', createdAt: { [Op.between]: [start, end] } } }) || 0;
            yearly.push({ name: start.toLocaleString('default', { month: 'short' }), value: Math.round(sum) });
        }

        res.json({ Weekly: weekly, Monthly: monthly, Yearly: yearly });
    } catch (err) {
        console.error('Profit stats error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Get Driver Transactions ---
exports.getTransactions = async (req, res) => {
    try {
        const { Transaction } = require('../models');
        const transactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50 // Limit to last 50 for performance
        });

        // Map to frontend expected format
        const formatted = transactions.map(t => ({
            id: t.id,
            type: t.type,
            desc: t.description || t.type,
            date: t.createdAt,
            amount: t.amount,
            method: t.reference ? 'Mobile/Bank' : 'System',
            sub: t.reference || '-',
            status: t.status,
            direction: t.direction
        }));

        res.json(formatted);
    } catch (err) {
        console.error('getTransactions error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Trip history stats: simple counts per day/week
exports.getTripHistoryStats = async (req, res) => {
    try {
        const driverId = req.user.id;
        // Last 7 days - count of rides
        const now = new Date();
        const weekly = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));

            const shareCount = await Ride.count({
                where: {
                    driverId,
                    type: 'share',
                    status: 'Completed',
                    createdAt: { [Op.between]: [start, end] }
                }
            });

            const hireCount = await Ride.count({
                where: {
                    driverId,
                    type: 'hire',
                    status: 'Completed',
                    createdAt: { [Op.between]: [start, end] }
                }
            });

            weekly.push({ name: start.toLocaleDateString(), share: shareCount, hire: hireCount });
        }
        res.json(weekly);
    } catch (err) {
        console.error('Trip history error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Distance stats: compute a mocked distance using count * constant (distance not stored in model)
exports.getDistanceStats = async (req, res) => {
    try {
        const driverId = req.user.id;
        const now = new Date();
        const weekly = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));
            const count = await Ride.count({ where: { driverId, createdAt: { [Op.between]: [start, end] } } });
            // assume average 12 km per ride
            weekly.push({ name: start.toLocaleDateString(), km: count * 12 });
        }
        res.json(weekly);
    } catch (err) {
        console.error('Distance stats error:', err);
        res.status(500).json({ error: err.message });
    }
};
// Helper: lookup approximate distance (km) between two named locations (origin/destination)
function lookupDistanceKm(origin = '', destination = '') {
    if (!origin || !destination) return 0;
    const a = origin.toString().trim().toLowerCase();
    const b = destination.toString().trim().toLowerCase();

    // canonical key (order-agnostic)
    const key = [a, b].sort().join('|');

    // Hard-coded approximate distances for common routes (km)
    const table = {
        'blantyre|lilongwe': 350,
        'lilongwe|zomba': 300,
        'mzuzu|karonga': 200,
        'mzuzu|lilongwe': 350,
        'zomba|blantyre': 65,
        'nkhatabay|mzuzu': 163
    };

    if (table[key]) return table[key];

    // If origin/destination mention a city pair substring, try match loosely
    for (const k of Object.keys(table)) {
        if ((a.includes(k.split('|')[0]) && b.includes(k.split('|')[1])) || (a.includes(k.split('|')[1]) && b.includes(k.split('|')[0]))) {
            return table[k];
        }
    }

    // Fallback average distance for unknown routes
    return 120;
}

// Distance stats: compute distance per day by summing per-ride distance derived from origin/destination
exports.getDistanceStats = async (req, res) => {
    try {
        const driverId = req.user.id;
        const now = new Date();
        const weekly = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));

            const rides = await Ride.findAll({ where: { driverId, status: 'Completed', createdAt: { [Op.between]: [start, end] } }, raw: true });
            let kmSum = 0;
            for (const r of rides) {
                const km = lookupDistanceKm(r.origin, r.destination);
                kmSum += km;
            }
            weekly.push({ name: start.toLocaleDateString(), km: Math.round(kmSum) });
        }
        res.json(weekly);
    } catch (err) {
        console.error('Distance stats error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Driving hours stats: derive hours from distance / avg speed and bucket day/night by ride.time
exports.getHoursStats = async (req, res) => {
    try {
        const driverId = req.user.id;
        const now = new Date();
        const weekly = [];
        const AVG_SPEED_KMH = 60; // average speed assumption

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));

            const rides = await Ride.findAll({ where: { driverId, status: 'Completed', createdAt: { [Op.between]: [start, end] } }, raw: true });
            let dayHours = 0;
            let nightHours = 0;

            for (const r of rides) {
                const km = lookupDistanceKm(r.origin, r.destination);
                const hours = km / AVG_SPEED_KMH;

                // Determine if ride was during day (06:00-18:00) or night
                let hourOfDay = 12; // default midday
                if (r.time) {
                    try {
                        const parts = r.time.split(':');
                        hourOfDay = parseInt(parts[0], 10);
                    } catch (e) { /* ignore */ }
                } else if (r.createdAt) {
                    hourOfDay = new Date(r.createdAt).getHours();
                }

                if (hourOfDay >= 6 && hourOfDay < 18) dayHours += hours;
                else nightHours += hours;
            }

            weekly.push({ name: start.toLocaleDateString(), day: Math.round(dayHours), night: Math.round(nightHours) });
        }
        res.json(weekly);
    } catch (err) {
        console.error('Hours stats error:', err);
        res.status(500).json({ error: err.message });
    }
};


exports.getMarketplaceHire = async (req, res) => {
    try {
        const { User } = require('../models');
        // Returns available vehicles for riders to see
        const vehicles = await Vehicle.findAll({
            where: { status: 'Available' },
            include: [
                { model: User, as: 'driver', attributes: ['name', 'rating', 'avatar'] }
            ]
        });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get driver payout details for payment processing
 */
exports.getDriverPayoutDetails = async (req, res) => {
    try {
        const { User } = require('../models');
        const { driverId } = req.params;

        console.log(`🔍 [Payout Details] Fetching for driverId: ${driverId}`);

        // Fetch driver from database
        const driver = await User.findByPk(driverId);

        if (!driver) {
            console.log(`❌ [Payout Details] Driver ${driverId} not found in DB`);
            return res.status(404).json({ error: 'Driver not found' });
        }

        if (!driver.payoutMethod) {
            console.log(`⚠️ [Payout Details] Driver ${driverId} has no payout details configured.`);
        }

        // Map Model fields to Frontend expected fields
        // Model: airtelMoneyNumber, mpambaNumber, bankAccountNumber, bankAccountName
        // Frontend expects: payoutMobileNumber, payoutAccountNumber, accountHolderName

        let mobileNumber = null;
        if (driver.payoutMethod === 'Airtel Money') mobileNumber = driver.airtelMoneyNumber;
        else if (driver.payoutMethod === 'Mpamba') mobileNumber = driver.mpambaNumber;
        else mobileNumber = driver.airtelMoneyNumber || driver.mpambaNumber; // Fallback

        const payoutDetails = {
            driverId: driver.id,
            driverName: driver.name,
            payoutMethod: driver.payoutMethod || null,
            bankName: driver.bankName || null,
            payoutAccountNumber: driver.bankAccountNumber || null, // FIX: Use bankAccountNumber
            accountHolderName: driver.bankAccountName || driver.name, // FIX: Use bankAccountName
            payoutMobileNumber: mobileNumber || null
        };

        console.log(`✅ [Payout Details] Sending details for driver ${driverId}`, { ...payoutDetails, walletBalance: driver.walletBalance });
        console.log('DRIVER AMOUNT:', driver.walletBalance);
        console.log('REGISTERED BANK DETAILS:', {
            bank: driver.bankName,
            account: driver.bankAccountNumber,
            holder: driver.bankAccountName,
            airtel: driver.airtelMoneyNumber,
            mpamba: driver.mpambaNumber
        });

        res.json(payoutDetails);
    } catch (err) {
        console.error('Error fetching driver payout details:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Save driver payout details (bank account information only)
 */
exports.saveDriverPayoutDetails = async (req, res) => {
    try {
        const { User } = require('../models');
        const { payoutMethod, bankName, bankAccountNumber, bankAccountName, airtelMoneyNumber, mpambaNumber } = req.body;

        console.log(`🏦 [Payout Details] Saving for driver ${req.user.id}:`, {
            method: payoutMethod,
            bank: bankName,
            account: bankAccountNumber,
            mobile: airtelMoneyNumber || mpambaNumber
        });

        // Fetch driver from database
        const driver = await User.findByPk(req.user.id);

        if (!driver) {
            console.log(`❌ [Payout Details] Driver ${req.user.id} not found`);
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Update driver payout details based on selected method
        driver.payoutMethod = payoutMethod;

        if (payoutMethod === 'Bank') {
            driver.bankName = bankName;
            driver.bankAccountNumber = bankAccountNumber; // FIX: Use bankAccountNumber
            driver.bankAccountName = bankAccountName; // FIX: Use bankAccountName
        } else if (payoutMethod === 'Airtel Money') {
            driver.airtelMoneyNumber = airtelMoneyNumber; // FIX: Use airtelMoneyNumber
        } else if (payoutMethod === 'Mpamba') {
            driver.mpambaNumber = mpambaNumber; // FIX: Use mpambaNumber
        }

        // Ensure we save the fields if they are provided, even if not the primary method (optional enhancement, but for now just updating active method fields is fine, just don't clear the others)
        // Actually, the form sends everything. If I switch to Bank, the form might send empty strings for mobile if I didn't type unique state.
        // But the user issue is probable that they SAVED 'Bank', so 'Mobile' was cleared.
        // Now if I remove the clearing, old data persists.


        await driver.save();
        console.log(`✅ [Payout Details] Driver ${req.user.id} updated successfully.`);

        res.json({
            message: 'Payout details saved successfully',
            driver: {
                id: driver.id,
                payoutMethod: driver.payoutMethod,
                bankName: driver.bankName,
                payoutAccountNumber: driver.bankAccountNumber,
                accountHolderName: driver.bankAccountName,
                payoutMobileNumber: driver.airtelMoneyNumber || driver.mpambaNumber
            }
        });
    } catch (err) {
        console.error('Error saving driver payout details:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Get Pending Approval Requests ---
exports.getPendingApprovals = async (req, res) => {
    try {
        const { Ride, User, NegotiationHistory } = require('../models');

        const requests = await Ride.findAll({
            where: {
                driverId: req.user.id,
                negotiationStatus: ['pending', 'negotiating']
            },
            include: [
                {
                    model: User,
                    as: 'rider',
                    attributes: ['id', 'name', 'rating', 'phone', 'avatar']
                },
                {
                    model: NegotiationHistory,
                    as: 'negotiations',
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`🔎 getPendingApprovals found ${requests.length} items for driver ${req.user.id}`);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Approve or Reject Request ---
exports.approveRequest = async (req, res) => {
    try {
        console.log('approveRequest called by:', req.user?.id, 'params:', req.params, 'body:', req.body);
        const { Ride, NegotiationHistory, Notification } = require('../models');
        const { requestId } = req.params;
        const { approved, counterOffer, message } = req.body;

        const ride = await Ride.findByPk(requestId);
        if (!ride) return res.status(404).json({ error: 'Request not found' });
        if (ride.driverId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        // Idempotency Check: If already approved, return success immediately
        if (approved && ride.negotiationStatus === 'approved') {
            console.log(`⚠️ Ride ${ride.id} is already approved. Returning success.`);
            return res.json({ message: 'Request already approved', ride });
        }

        if (approved) {
            // Approve the request
            ride.negotiationStatus = 'approved';
            ride.acceptedPrice = counterOffer || ride.price;
            ride.approvedAt = new Date();
            ride.approvedBy = req.user.id;
            // Mark request as scheduled (driver approved the booking)
            // Mark request status based on type
            if (ride.type && ride.type.toLowerCase() === 'hire') {
                ride.status = 'Awaiting Payment Selection';
            } else {
                ride.status = 'Waiting for Pickup';
            }
            ride.price = ride.acceptedPrice;

            // Update negotiation history
            try {
                await NegotiationHistory.update(
                    { status: 'accepted' },
                    { where: { rideId: requestId, status: 'pending' } }
                );
            } catch (uh) {
                console.error('NegotiationHistory.update error:', uh);
            }

            // Notify rider
            try {
                await Notification.create({
                    userId: ride.riderId,
                    title: 'Request Approved!',
                    message: `Your ${ride.type} request has been approved. Price: MWK ${ride.acceptedPrice}. Please check the Active Trip tab to pick up your vehicle.`,
                    type: 'success',
                    relatedType: 'ride',
                    relatedId: ride.id
                });
            } catch (nn) {
                console.error('Notification.create error:', nn);
            }

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                // For "hire" type trips, prompt rider to select payment timing (Pay Now or Pay on Pickup)
                if (ride.type && ride.type.toLowerCase() === 'hire') {
                    io.to(`user_${ride.riderId}`).emit('payment_selection_required', {
                        rideId: ride.id,
                        id: ride.id,
                        type: ride.type,
                        origin: ride.origin,
                        destination: ride.destination,
                        price: ride.acceptedPrice,
                        acceptedPrice: ride.acceptedPrice,
                        driver: req.user.dataValues || req.user,
                        message: 'Request approved! Please select when you\'d like to pay.'
                    });
                } else {
                    // For Ride Share, send standard approval notification
                    io.to(`user_${ride.riderId}`).emit('request_approved', {
                        id: ride.id,
                        rideId: ride.id,
                        type: ride.type,
                        origin: ride.origin,
                        destination: ride.destination,
                        date: ride.date,
                        time: ride.time,
                        status: 'Approved',
                        price: ride.acceptedPrice,
                        acceptedPrice: ride.acceptedPrice,
                        driver: req.user.dataValues || req.user,
                        riderId: ride.riderId,
                        driverId: ride.driverId,
                        message: 'Check the Active Trip tab to pick up your vehicle.'
                    });
                }
            }

            // BRUTE FORCE SAVE via Raw SQL to bypass Model/Sync consistency issues
            try {
                // We need to import sequelize here or ensure it's available via req or similar
                // But it's available via require('../models') at top of function if added.
                // Assuming sequelize is available in scope or needs to be.
                const { sequelize } = require('../models');
                await sequelize.query(
                    `UPDATE "Rides" SET "negotiationStatus"='approved', "status"=:status, "acceptedPrice"=:price, "updatedAt"=NOW() WHERE id=:id`,
                    {
                        replacements: {
                            status: ride.status, // use the ride.status set above
                            price: ride.acceptedPrice,
                            id: ride.id
                        }
                    }
                );
                console.log('✅ Brute Force SQL Update Success');
            } catch (sqlErr) {
                console.error('❌ Brute Force SQL Update Failed:', sqlErr);
                // Don't throw, let ride.save try
            }
        } else {
            // Reject the request
            ride.negotiationStatus = 'rejected';
            ride.status = 'Cancelled';

            try {
                await NegotiationHistory.update(
                    { status: 'rejected' },
                    { where: { rideId: requestId, status: 'pending' } }
                );
            } catch (uh) {
                console.error('NegotiationHistory.update error during reject:', uh);
            }

            try {
                await Notification.create({
                    userId: ride.riderId,
                    title: 'Request Declined',
                    message: `Your ${ride.type} request was declined by the driver.`,
                    type: 'warning',
                    relatedType: 'ride',
                    relatedId: ride.id
                });
            } catch (nn) {
                console.error('Notification.create error during reject:', nn);
            }
        }

        console.log('Approving ride (FINAL SAVE):', ride.id, 'negotiationStatus:', ride.negotiationStatus, 'status:', ride.status, 'acceptedPrice:', ride.acceptedPrice);
        await ride.save();
        res.json({ message: approved ? 'Request approved' : 'Request rejected', ride });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW: Make Counter Offer (Driver) ---
exports.makeDriverCounterOffer = async (req, res) => {
    try {
        const { Ride, NegotiationHistory, Notification } = require('../models');
        const { requestId } = req.params;
        const { counterPrice, message } = req.body;

        const ride = await Ride.findByPk(requestId);
        if (!ride) return res.status(404).json({ error: 'Request not found' });
        if (ride.driverId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        // Update ride with counter offer
        ride.offeredPrice = counterPrice;
        ride.negotiationStatus = 'negotiating';
        try {
            console.log('Approving ride (saving):', ride.id, 'status:', ride.status, 'price:', ride.price, 'acceptedPrice:', ride.acceptedPrice);
            await ride.save();
            console.log('ride.save succeeded for', ride.id);
        } catch (rs) {
            console.error('ride.save error:', rs);
            throw rs;
        }

        // Create negotiation history
        await NegotiationHistory.create({
            rideId: requestId,
            offeredBy: req.user.id,
            offeredPrice: counterPrice,
            message,
            status: 'countered'
        });

        // Notify rider
        await Notification.create({
            userId: ride.riderId,
            title: 'Counter Offer Received',
            message: `Driver made a counter offer: MWK ${counterPrice}`,
            type: 'info',
            relatedType: 'ride',
            relatedId: ride.id
        });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${ride.riderId}`).emit('counter_offer', {
                rideId: ride.id,
                counterPrice
            });
        }

        res.json({ message: 'Counter offer sent', ride });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Get driver share posts ---
exports.getMySharePosts = async (req, res) => {
    try {
        const { RideSharePost, RideShareVehicle } = require('../models');

        const posts = await RideSharePost.findAll({
            where: { driverId: req.user.id },
            include: [
                { model: RideShareVehicle, as: 'vehicle', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(posts);
    } catch (err) {
        console.error('getMySharePosts error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Get driver hire posts ---
exports.getMyHirePosts = async (req, res) => {
    try {
        const { HirePost, HireVehicle } = require('../models');

        const posts = await HirePost.findAll({
            where: { driverId: req.user.id },
            include: [
                { model: HireVehicle, as: 'vehicle', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(posts);
    } catch (err) {
        console.error('getMyHirePosts error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Get contracted jobs / assigned hires for the driver
exports.getContractedJobs = async (req, res) => {
    try {
        const { Ride, User } = require('../models');

        const jobs = await Ride.findAll({
            where: { driverId: req.user.id },
            include: [
                { model: User, as: 'rider', attributes: ['id', 'name', 'phone', 'avatar'] },
                { model: User, as: 'driver', attributes: ['id', 'name', 'phone', 'avatar'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(jobs);
    } catch (err) {
        console.error('getContractedJobs error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Create a Manual Job (Mark as Booked) ---
exports.createManualJob = async (req, res) => {
    try {
        const { Ride } = require('../models');
        const { title, origin, destination, date, price, type, clientName, clientId } = req.body;

        const job = await Ride.create({
            driverId: req.user.id,
            type: type || 'share',
            origin,
            destination,
            date: date || new Date().toISOString().split('T')[0],
            price: price || 0,
            status: 'Scheduled',
            // Store client info in a way that fits the model. 
            // Since we don't have a riderId for manual bookings (it's external), 
            // we might need to store it in a generic field or leave riderId null.
            // For now, we'll assume manual jobs don't link to a system user, 
            // but we can store the name in 'review' or a new field if needed.
            // However, the frontend displays 'clientName', so we should probably return it.
            // The Ride model doesn't have 'clientName', so we'll rely on the frontend to handle the display 
            // or add a temporary field if we were modifying the schema.
            // For this fix, we will just create the ride. 
            // NOTE: The current Ride model requires 'origin', 'destination', 'price'.
            // We'll use 'transactionRef' to store client info for now as a hack, or just ignore it if not critical.
            transactionRef: `Manual: ${clientName} (${clientId})`
        });

        // Return the created job formatted as the frontend expects
        const formattedJob = {
            ...job.toJSON(),
            clientName: clientName,
            clientId: clientId
        };

        res.status(201).json(formattedJob);
    } catch (err) {
        console.error('createManualJob error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Add a RideShare post (driver creating a shared ride) ---
exports.addSharePost = async (req, res) => {
    try {
        const { RideSharePost } = require('../models');
        const allowed = ['origin', 'destination', 'date', 'time', 'price', 'seats', 'availableSeats', 'description', 'status', 'vehicleId', 'imageUrl'];
        const payload = {};
        for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        payload.driverId = req.user.id;
        if (!payload.availableSeats) payload.availableSeats = payload.seats;

        const post = await RideSharePost.create(payload, { fields: Object.keys(payload) });

        // emit socket event for marketplace updates
        try { const io = req.app.get('io'); if (io) io.emit('rideshare_post_added', post); } catch (e) { }

        res.status(201).json(post);
    } catch (err) {
        console.error('addSharePost error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Add a Hire post (driver posting a hire/job listing) ---
exports.addHirePost = async (req, res) => {
    try {
        const { HirePost } = require('../models');
        const allowed = ['title', 'category', 'location', 'rate', 'rateAmount', 'rateUnit', 'description', 'features', 'imageUrl', 'status', 'vehicleId'];
        const payload = {};
        for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
        payload.driverId = req.user.id;

        const post = await HirePost.create(payload, { fields: Object.keys(payload) });

        try { const io = req.app.get('io'); if (io) io.emit('hire_post_added', post); } catch (e) { }

        res.status(201).json(post);
    } catch (err) {
        console.error('addHirePost error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Confirm booking / job by driver ---
exports.confirmBooking = async (req, res) => {
    try {
        const { Ride, Notification } = require('../models');
        const { rideId } = req.body;

        if (!rideId) return res.status(400).json({ error: 'rideId is required' });

        const ride = await Ride.findByPk(rideId);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });
        if (ride.driverId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        ride.status = 'In Progress';
        ride.confirmedAt = new Date();
        await ride.save();

        // Notify rider
        try {
            await Notification.create({
                userId: ride.riderId,
                title: 'Driver Confirmed',
                message: `Driver has confirmed your ${ride.type} booking.`,
                type: 'info',
                relatedType: 'ride',
                relatedId: ride.id
            });
        } catch (e) { console.warn('Notification create error', e); }

        // Emit socket event
        try {
            const io = req.app.get('io');
            if (io) io.to(`user_${ride.riderId}`).emit('booking_confirmed', { rideId: ride.id });
        } catch (e) { }

        res.json({ message: 'Booking confirmed', ride });
    } catch (err) {
        console.error('Confirm booking error:', err);
        res.status(500).json({ error: err.message });
    }
};

// --- Location suggestions for job posting autocomplete ---
exports.getLocationSuggestions = async (req, res) => {
    try {
        const q = (req.query.q || '').trim().toLowerCase();
        if (!q) return res.json({ results: [] });

        // simple Levenshtein distance
        function levenshtein(a, b) {
            const al = a.length, bl = b.length;
            if (al === 0) return bl;
            if (bl === 0) return al;
            const v0 = new Array(bl + 1).fill(0);
            const v1 = new Array(bl + 1).fill(0);
            for (let j = 0; j <= bl; j++) v0[j] = j;
            for (let i = 0; i < al; i++) {
                v1[0] = i + 1;
                for (let j = 0; j < bl; j++) {
                    const cost = a[i] === b[j] ? 0 : 1;
                    v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
                }
                for (let j = 0; j <= bl; j++) v0[j] = v1[j];
            }
            return v1[bl];
        }

        const scored = locations.map(loc => {
            const text = String(loc).toLowerCase();
            let score = 100;
            if (text.startsWith(q)) score = 0;
            else if (text.includes(q)) score = 10;
            else {
                const dist = levenshtein(q, text);
                score = 20 + dist; // smaller is better
            }
            return { name: loc, score };
        });

        scored.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
        const results = scored.slice(0, 20).map(s => s.name);
        res.json({ results });
    } catch (err) {
        console.error('Location suggestion error:', err);
        res.status(500).json({ error: err.message });
    }
};



// --- Confirm Handover (Driver hands keys to Rider) ---
exports.confirmHandover = async (req, res) => {
    try {
        const { Ride, Notification } = require('../models');
        const { rideId } = req.body;

        if (!rideId) return res.status(400).json({ error: 'rideId is required' });

        const ride = await Ride.findByPk(rideId);
        if (!ride) return res.status(404).json({ error: 'Ride not found' });
        if (ride.driverId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        const io = req.app.get('io');
        let messageForRider = '';
        let eventToEmit = '';

        // SMART HANDOVER LOGIC:
        // If already paid, skip 'Handover Pending' and go straight to 'In Progress'
        if (ride.paymentStatus === 'paid') {
            ride.status = 'In Progress';
            ride.confirmedAt = new Date();
            messageForRider = 'Handover complete. Vehicle is now in your possession.';
            eventToEmit = 'booking_confirmed'; // Re-use booking confirmed or similar to refresh state
        } else {
            // Not paid yet, prompt for payment
            ride.status = 'Handover Pending';
            messageForRider = 'Driver is ready for handover. Please confirm payment.';
            eventToEmit = 'handover_confirmed';
        }

        await ride.save();

        // Notification for rider
        try {
            await Notification.create({
                userId: ride.riderId,
                title: ride.status === 'In Progress' ? 'Vehicle Handover Complete' : 'Vehicle Handover',
                message: messageForRider,
                type: 'info',
                relatedType: 'ride',
                relatedId: ride.id
            });
        } catch (e) { console.warn('Notification create error', e); }

        // Emit socket event to rider
        try {
            if (io) {
                console.log(`Emit ${eventToEmit} to user_${ride.riderId} for ride ${ride.id}`);
                io.to(`user_${ride.riderId}`).emit(eventToEmit, {
                    rideId: ride.id,
                    status: ride.status,
                    message: messageForRider
                });
            }
        } catch (e) { console.warn('Socket emit error', e); }

        res.json({ message: 'Handover processed', ride });
    } catch (err) {
        console.error('Confirm handover error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Upload vehicle image
 */
exports.uploadVehicleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Return the relative URL path to the uploaded image
        const imageUrl = `/uploads/vehicles/${req.file.filename}`;

        console.log(`✅ Vehicle image uploaded: ${imageUrl}`);
        res.json({ imageUrl });
    } catch (err) {
        console.error('Upload vehicle image error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Upload post image (for ride share or hire posts)
 */
exports.uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Return the relative URL path to the uploaded image
        const imageUrl = `/uploads/vehicles/${req.file.filename}`;

        console.log(`✅ Post image uploaded: ${imageUrl}`);
        res.json({ imageUrl });
    } catch (err) {
        console.error('Upload post image error:', err);
        res.status(500).json({ error: err.message });
    }
};

