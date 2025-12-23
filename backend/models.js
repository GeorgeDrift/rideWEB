const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// --- Database Connection ---
// Ensure you have a PostgreSQL database running and DATABASE_URL set in .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log, // TEMPORARILY ENABLED to debug save issues
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// --- User Model ---
const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'driver', 'rider'), allowNull: false },
    phone: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    walletBalance: { type: DataTypes.FLOAT, defaultValue: 0.0 },

    // Email Verification
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING },
    verificationTokenExpiry: { type: DataTypes.DATE },

    // Account Status for Admin Management
    accountStatus: {
        type: DataTypes.ENUM('pending', 'active', 'suspended'),
        defaultValue: 'active'
    },

    // Driver Specific (Flattened for SQL)
    vehicleModel: { type: DataTypes.STRING },
    vehiclePlate: { type: DataTypes.STRING },

    // Driver License
    driverLicenseUrl: { type: DataTypes.STRING },

    // Payout Method
    payoutMethod: { type: DataTypes.ENUM('Bank', 'Airtel Money', 'Mpamba'), allowNull: true },

    // Payment Details
    airtelMoneyNumber: { type: DataTypes.STRING },
    mpambaNumber: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    bankAccountNumber: { type: DataTypes.STRING },
    bankAccountName: { type: DataTypes.STRING },

    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Location stored as separate columns in SQL
    currentLat: { type: DataTypes.FLOAT },
    currentLng: { type: DataTypes.FLOAT },
    currentHeading: { type: DataTypes.FLOAT },

    subscriptionStatus: { type: DataTypes.ENUM('active', 'inactive', 'expired'), defaultValue: 'active' },
    subscriptionExpiry: { type: DataTypes.DATE },
    trialStartDate: { type: DataTypes.DATE },
    trialEndDate: { type: DataTypes.DATE },

    permissions: { type: DataTypes.JSON }, // Store array as JSON
});

// --- Vehicle Inventory Model ---
const Vehicle = sequelize.define('Vehicle', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    plate: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    make: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    rate: { type: DataTypes.STRING, allowNull: false },
    features: { type: DataTypes.JSON }, // Store array as JSON
    imageUrl: { type: DataTypes.STRING },
    color: { type: DataTypes.STRING },
    seats: { type: DataTypes.INTEGER, defaultValue: 4 },
    status: { type: DataTypes.ENUM('Available', 'On-Route', 'Maintenance', 'Rented'), defaultValue: 'Available' }
});

// --- Ride Model (includes 'hire' requests) ---
const Ride = sequelize.define('Ride', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM('share', 'hire'), allowNull: false },

    origin: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },

    // Coordinates stored as JSON or separate fields. JSON is easier for objects.
    coordinates: { type: DataTypes.JSON },

    date: { type: DataTypes.STRING },
    time: { type: DataTypes.STRING },
    isImmediate: { type: DataTypes.BOOLEAN, defaultValue: false },

    price: { type: DataTypes.FLOAT, allowNull: false },
    platformFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    driverEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
    distance_km: { type: DataTypes.FLOAT, defaultValue: 0 },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },

    seats: { type: DataTypes.INTEGER },
    duration: { type: DataTypes.STRING },

    status: {
        type: DataTypes.ENUM('Pending', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Payment Due', 'Completed', 'Cancelled', 'Awaiting Payment Selection', 'Waiting for Pickup', 'Handover Pending', 'Active', 'Return Pending'),
        defaultValue: 'Pending'
    },

    // Negotiation & Approval Workflow
    negotiationStatus: {
        type: DataTypes.ENUM('pending', 'negotiating', 'approved', 'rejected', 'completed'),
        defaultValue: 'pending'
    },
    offeredPrice: { type: DataTypes.FLOAT },
    acceptedPrice: { type: DataTypes.FLOAT },
    pickupLocation: { type: DataTypes.STRING },
    paymentType: {
        type: DataTypes.ENUM('online', 'physical', 'pending'),
        defaultValue: 'pending'
    },
    approvedAt: { type: DataTypes.DATE },
    approvedBy: { type: DataTypes.UUID }, // References User(id)
    pickupTime: { type: DataTypes.DATE },
    returnTime: { type: DataTypes.DATE },

    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
    paymentMethod: { type: DataTypes.STRING },
    transactionRef: { type: DataTypes.STRING },

    // Passenger Boarding Tracking (for Ride Share)
    totalPassengers: { type: DataTypes.INTEGER, defaultValue: 1 },
    boardedPassengers: { type: DataTypes.INTEGER, defaultValue: 0 },
    passengerBoardingList: { type: DataTypes.JSON }, // Array of { passengerId, name, boarded: boolean, boardedAt: timestamp }

    // Rider Feedback
    rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
    review: { type: DataTypes.STRING }
});

// --- Pricing Zone Model ---
const PricingZone = sequelize.define('PricingZone', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    multiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
    color: { type: DataTypes.STRING, defaultValue: '#ef4444' },
    coordinates: { type: DataTypes.JSON }, // Store polygon coords as JSON
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// --- System Settings Model (Global Config) ---
const SystemSetting = sequelize.define('SystemSetting', {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING }
});

// --- Transaction Model ---
const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM('Ride Payment', 'Subscription', 'Payout', 'Refund', 'TopUp', 'Settlement'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    direction: { type: DataTypes.ENUM('credit', 'debit'), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    reference: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    relatedId: { type: DataTypes.UUID }, // Can link to Ride or other ID
});

// --- Message Model ---
const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    readBy: { type: DataTypes.JSON }, // Array of user IDs
    conversationId: { type: DataTypes.UUID, allowNull: true },
    rideId: { type: DataTypes.UUID, allowNull: true },
    senderId: { type: DataTypes.UUID, allowNull: false }
});

// --- Ride Share Vehicle Model ---
const RideShareVehicle = sequelize.define('RideShareVehicle', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER },
    plate: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING },
    seats: { type: DataTypes.INTEGER, defaultValue: 4 },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('active', 'inactive', 'maintenance'), defaultValue: 'active' }
});

// --- Hire Vehicle Model ---
const HireVehicle = sequelize.define('HireVehicle', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    plate: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.STRING },
    rateAmount: { type: DataTypes.FLOAT },
    rateUnit: { type: DataTypes.STRING, defaultValue: 'day' },
    features: { type: DataTypes.JSON },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('Available', 'Rented', 'Maintenance'), defaultValue: 'Available' }
});


// --- Subscription Model ---
const Subscription = sequelize.define('Subscription', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    plan: { type: DataTypes.ENUM('1m', '3m', '6m', '1y'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'expired', 'cancelled'), defaultValue: 'active' },
    startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    endDate: { type: DataTypes.DATE, allowNull: false },
    paymentMethod: { type: DataTypes.STRING },
    transactionId: { type: DataTypes.STRING }
});

// --- RideSharePost Model ---
const RideSharePost = sequelize.define('RideSharePost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    origin: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    seats: { type: DataTypes.INTEGER, allowNull: false },
    availableSeats: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('active', 'full', 'cancelled', 'completed'), defaultValue: 'active' },
    vehicleId: { type: DataTypes.UUID },
    driverId: { type: DataTypes.UUID }
});

// --- HirePost Model ---
const HirePost = sequelize.define('HirePost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.STRING, allowNull: false },
    rateAmount: { type: DataTypes.FLOAT, allowNull: false },
    rateUnit: { type: DataTypes.STRING, defaultValue: 'day' },
    description: { type: DataTypes.TEXT },
    features: { type: DataTypes.JSON },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('available', 'rented', 'inactive'), defaultValue: 'available' },
    vehicleId: { type: DataTypes.UUID },
    driverId: { type: DataTypes.UUID }
});

// --- Conversation Model ---
const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    lastMessage: { type: DataTypes.TEXT },
    lastMessageTime: { type: DataTypes.DATE },
    unreadCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    participants: { type: DataTypes.JSON, allowNull: false } // Array of user IDs
});

// --- Notification Model ---
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    relatedType: { type: DataTypes.STRING },
    relatedId: { type: DataTypes.UUID }
});

// --- RiderStats Model ---
const RiderStats = sequelize.define('RiderStats', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    totalSpend: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalDistance: { type: DataTypes.FLOAT, defaultValue: 0 },
    completedRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    cancelledRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageRating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    chartData: { type: DataTypes.JSON },
    rideTypes: { type: DataTypes.JSON },
    lastCalculated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// --- DriverStats Model ---
const DriverStats = sequelize.define('DriverStats', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalDistance: { type: DataTypes.FLOAT, defaultValue: 0 },
    completedRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    cancelledRides: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageRating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    onTimePercentage: { type: DataTypes.FLOAT, defaultValue: 100.0 },
    profitData: { type: DataTypes.JSON },
    tripHistory: { type: DataTypes.JSON },
    distanceData: { type: DataTypes.JSON },
    lastCalculated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// --- NegotiationHistory Model ---
const NegotiationHistory = sequelize.define('NegotiationHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    offeredPrice: { type: DataTypes.FLOAT, allowNull: false },
    message: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered'), defaultValue: 'pending' }
});

// --- SubscriptionPlans Model ---
const SubscriptionPlans = sequelize.define('SubscriptionPlans', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // Days
    description: { type: DataTypes.TEXT },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// --- Disputes Model ---
const Disputes = sequelize.define('Disputes', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'resolved', 'dismissed'), defaultValue: 'pending' },
    userId: { type: DataTypes.UUID },
    rideId: { type: DataTypes.UUID }
});


// --- Relationships ---

// User <-> Vehicle (Legacy)
User.hasMany(Vehicle, { foreignKey: 'driverId', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// User <-> RideShareVehicle
User.hasMany(RideShareVehicle, { foreignKey: 'driverId', as: 'rideShareVehicles' });
RideShareVehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// User <-> HireVehicle
User.hasMany(HireVehicle, { foreignKey: 'driverId', as: 'hireVehicles' });
HireVehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });


// User <-> Subscription
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Ride
User.hasMany(Ride, { foreignKey: 'driverId', as: 'drivenRides' });
User.hasMany(Ride, { foreignKey: 'riderId', as: 'takenRides' });
Ride.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });
Ride.belongsTo(User, { foreignKey: 'riderId', as: 'rider' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Message Relationships
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

// NEW RELATIONSHIPS

// User <-> RideSharePost
User.hasMany(RideSharePost, { foreignKey: 'driverId', as: 'rideSharePosts' });
RideSharePost.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// User <-> HirePost
User.hasMany(HirePost, { foreignKey: 'driverId', as: 'hirePosts' });
HirePost.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Vehicle <-> HirePost
Vehicle.hasMany(HirePost, { foreignKey: 'vehicleId', as: 'hirePosts' });
HirePost.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

// Vehicle <-> RideSharePost (explicit relationship)
Vehicle.hasMany(RideSharePost, { foreignKey: 'vehicleId', as: 'rideSharePosts' });
RideSharePost.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

// Conversation <-> Ride
Conversation.belongsTo(Ride, { foreignKey: 'relatedRideId', as: 'ride' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> RiderStats (One-to-One)
User.hasOne(RiderStats, { foreignKey: 'userId', as: 'riderStats' });
RiderStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> DriverStats (One-to-One)
User.hasOne(DriverStats, { foreignKey: 'userId', as: 'driverStats' });
DriverStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Ride <-> NegotiationHistory
Ride.hasMany(NegotiationHistory, { foreignKey: 'rideId', as: 'negotiations' });
NegotiationHistory.belongsTo(Ride, { foreignKey: 'rideId', as: 'ride' });

// User <-> NegotiationHistory
User.hasMany(NegotiationHistory, { foreignKey: 'offeredBy', as: 'offers' });
NegotiationHistory.belongsTo(User, { foreignKey: 'offeredBy', as: 'offerer' });

module.exports = {
    sequelize,
    User,
    Vehicle,
    RideShareVehicle,
    HireVehicle,
    Subscription,
    Ride,
    PricingZone,
    SystemSetting,
    Transaction,
    Message,
    RideSharePost,
    HirePost,
    Conversation,
    Notification,
    RiderStats,
    DriverStats,
    NegotiationHistory,
    SubscriptionPlans,
    Disputes
};
