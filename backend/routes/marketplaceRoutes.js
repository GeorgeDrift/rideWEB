const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

// Public routes - no authentication required
router.get('/rideshare', marketplaceController.getPublicRideSharePosts);
router.get('/hire', marketplaceController.getPublicHirePosts);
router.get('/all', marketplaceController.getAllPublicListings);

module.exports = router;
