
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// --- Database Connection ---
// Ensure you have a PostgreSQL database running and DATABASE_URL set in .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see raw SQL queries
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

    subscriptionStatus: { type: DataTypes.ENUM('active', 'inactive', 'expired'), defaultValue: 'inactive' },
    subscriptionExpiry: { type: DataTypes.DATE },

    permissions: { type: DataTypes.JSON }, // Store array as JSON
});

// --- Vehicle Inventory Model ---
const Vehicle = sequelize.define('Vehicle', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    plate: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.STRING, allowNull: false },
    features: { type: DataTypes.JSON }, // Store array as JSON
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('Available', 'On-Route', 'Maintenance', 'Rented'), defaultValue: 'Available' }
});

// --- Ride/Job Model ---
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

    seats: { type: DataTypes.INTEGER },
    duration: { type: DataTypes.STRING },

    status: {
        type: DataTypes.ENUM('Pending', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 'In Progress', 'Payment Due', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
    },

    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
    paymentMethod: { type: DataTypes.STRING },
    transactionRef: { type: DataTypes.STRING },

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
    readBy: { type: DataTypes.JSON } // Array of user IDs
});

// --- Relationships ---

// User <-> Vehicle
User.hasMany(Vehicle, { foreignKey: 'driverId', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

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

module.exports = {
    sequelize,
    User,
    Vehicle,
    Ride,
    PricingZone,
    SystemSetting,
    Transaction,
    Message
};
