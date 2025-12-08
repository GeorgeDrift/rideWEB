const { RideSharePost, User } = require('./models');

async function checkPost() {
    try {
        const user = await User.findOne({ where: { email: 'cen-01-16-21@unilia.ac.mw' } });
        if (!user) {
            console.log('User not found');
            return;
        }

        const posts = await RideSharePost.findAll({
            where: { driverId: user.id },
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${posts.length} posts for user ${user.email}`);
        posts.forEach(p => {
            console.log(`- ${p.origin} to ${p.destination} at ${p.time} on ${p.date} (ID: ${p.id})`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

checkPost();
