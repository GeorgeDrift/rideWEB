
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, rideController.createRide);
router.get('/my-rides', authenticateToken, rideController.getMyRides);
router.get('/marketplace/share', rideController.getMarketplaceShares);
router.put('/:id/status', authenticateToken, rideController.updateRideStatus);

module.exports = router;
