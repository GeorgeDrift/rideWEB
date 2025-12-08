
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, rideController.createRide);
router.get('/my-rides', authenticateToken, rideController.getMyRides);
router.get('/marketplace/share', rideController.getMarketplaceShares);
router.put('/:id/status', authenticateToken, rideController.updateRideStatus);
router.post('/:id/complete', authenticateToken, rideController.completeRide);
router.post('/:id/confirm-pickup', authenticateToken, rideController.confirmPickup);
router.post('/:id/payment-method', authenticateToken, rideController.selectPaymentMethod);
router.post('/:id/payment-timing', authenticateToken, rideController.selectPaymentTiming);
router.post('/:id/confirm-handover', authenticateToken, rideController.confirmHandover);
router.post('/:id/complete-handover', authenticateToken, rideController.completeHandover);
router.post('/:id/request-return', authenticateToken, rideController.requestVehicleReturn);
router.post('/:id/confirm-return', authenticateToken, rideController.confirmVehicleReturn);

// New pickup flow endpoints
router.post('/:id/start-pickup', authenticateToken, rideController.startPickup);
router.post('/:id/arrive-at-pickup', authenticateToken, rideController.arriveAtPickup);
router.post('/:id/board-passenger', authenticateToken, rideController.boardPassenger);
router.post('/:id/confirm-boarding', authenticateToken, rideController.confirmBoarding);
router.post('/:id/start-trip', authenticateToken, rideController.startTrip);
router.post('/:id/end-trip', authenticateToken, rideController.endTrip);

module.exports = router;
