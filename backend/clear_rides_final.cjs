
require('dotenv').config({ path: './.env' });
const { Ride, NegotiationHistory, Notification, RideSharePost, HirePost } = require('./models');

async function clearData() {
    try {
        console.log('🗑️ Clearing Rides, Negotiations, Posts, and Notifications...');

        // Delete in order of dependency if foreign keys exist, though pure Sequelize destroy should accept force
        // Using truncate: true, cascade: true to wipe tables clean
        await NegotiationHistory.destroy({ where: {}, truncate: true, cascade: true });
        await Notification.destroy({ where: {}, truncate: true, cascade: true });
        await Ride.destroy({ where: {}, truncate: true, cascade: true });
        // Optional: Clear posts if user wants a FULL reset, usually safe for "test rides" context
        // await RideSharePost.destroy({ where: {}, truncate: true, cascade: true });
        // await HirePost.destroy({ where: {}, truncate: true, cascade: true });

        console.log('✅ Database cleared of rides and related data.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    }
}

clearData();
