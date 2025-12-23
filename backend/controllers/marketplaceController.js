const { RideSharePost, HirePost, User, Vehicle } = require('../models');

// Helper to filter expired ride share posts
const filterExpiredPosts = (posts) => {
    const now = new Date();
    // Get current date string in YYYY-MM-DD format (local time)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const windowMs = 90 * 60 * 1000; // 1 hour 30 minutes grace period

    return posts.filter(post => {
        try {
            // Hard cutoff: If the scheduled date is before today, don't show
            if (post.date < todayStr) return false;

            // If the date is today, check if more than 90 minutes have passed since departure
            if (post.date === todayStr) {
                const postDateTime = new Date(`${post.date}T${post.time}`);
                if (now.getTime() - postDateTime.getTime() > windowMs) {
                    return false;
                }
            }

            // For today (within window) and all future dates, keep the post
            return true;
        } catch (e) {
            console.warn('Post expiration check failed for post:', post.id, e.message);
            return true; // Keep as fallback
        }
    });
};

// Get all active ride share posts for public marketplace
exports.getPublicRideSharePosts = async (req, res) => {
    try {
        const posts = await RideSharePost.findAll({
            where: { status: 'active' },
            include: [
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'name', 'rating', 'avatar', 'phone', 'airtelMoneyNumber', 'mpambaNumber']
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['id', 'name', 'make', 'model', 'plate', 'seats', 'imageUrl', 'color'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']], // Recent jobs first
            limit: 100
        });

        res.json(filterExpiredPosts(posts));
    } catch (error) {
        console.error('Error fetching public ride share posts:', error);
        res.status(500).json({ error: 'Failed to fetch ride share listings' });
    }
};

// Get all available hire vehicles for public marketplace
exports.getPublicHirePosts = async (req, res) => {
    try {
        const posts = await HirePost.findAll({
            where: { status: 'available' },
            include: [
                {
                    model: User,
                    as: 'driver',
                    attributes: ['id', 'name', 'rating', 'avatar', 'phone', 'airtelMoneyNumber', 'mpambaNumber']
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['id', 'name', 'make', 'model', 'plate', 'category', 'imageUrl', 'features'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching public hire posts:', error);
        res.status(500).json({ error: 'Failed to fetch hire listings' });
    }
};

// Get all marketplace listings (both ride share and hire)
exports.getAllPublicListings = async (req, res) => {
    try {
        const [rideSharePosts, hirePosts] = await Promise.all([
            RideSharePost.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: User,
                        as: 'driver',
                        attributes: ['id', 'name', 'rating', 'avatar', 'phone', 'airtelMoneyNumber', 'mpambaNumber']
                    },
                    {
                        model: Vehicle,
                        as: 'vehicle',
                        attributes: ['id', 'name', 'make', 'model', 'plate', 'seats', 'imageUrl', 'color'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            }),
            HirePost.findAll({
                where: { status: 'available' },
                include: [
                    {
                        model: User,
                        as: 'driver',
                        attributes: ['id', 'name', 'rating', 'avatar', 'phone', 'airtelMoneyNumber', 'mpambaNumber']
                    },
                    {
                        model: Vehicle,
                        as: 'vehicle',
                        attributes: ['id', 'name', 'make', 'model', 'plate', 'category', 'imageUrl', 'features'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            })
        ]);

        const filteredRideShare = filterExpiredPosts(rideSharePosts);

        res.json({
            rideShare: filteredRideShare,
            hire: hirePosts,
            total: filteredRideShare.length + hirePosts.length
        });
    } catch (error) {
        console.error('Error fetching all public listings:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace listings' });
    }
};
