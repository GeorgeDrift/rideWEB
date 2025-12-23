const { Subscription, User } = require('./models');
const { Op } = require('sequelize');

/**
 * Fast-track a user's subscription to a specific date.
 * Usage: node test-fast-forward-sub.js <email> <daysBack>
 * Example: node test-fast-forward-sub.js driver@ridex.com 31
 */

const email = process.argv[2];
const daysBack = parseInt(process.argv[3]) || 31;

if (!email) {
    console.error('❌ Please provide a user email.');
    process.exit(1);
}

(async () => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.error(`❌ User ${email} not found.`);
            process.exit(1);
        }

        const subscription = await Subscription.findOne({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });

        if (!subscription) {
            console.error(`❌ No subscription found for user ${email}.`);
            process.exit(1);
        }

        const originalEndDate = new Date(subscription.endDate);
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() - daysBack);

        await subscription.update({
            endDate: newEndDate,
            status: 'expired' // Manually set to expired to test the popup trigger
        });

        console.log(`✅ Subscription for ${email} updated!`);
        console.log(`   Original End Date: ${originalEndDate.toISOString()}`);
        console.log(`   New End Date (Simulated): ${newEndDate.toISOString()}`);
        console.log(`   Status set to: expired`);
        console.log(`\nNow refresh the dashboard to see the mandatory payment popup.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating subscription:', error);
        process.exit(1);
    }
})();
