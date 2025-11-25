
const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken, authorizeRole(['rider']));

router.get('/profile', riderController.getRiderProfile);
router.put('/profile', riderController.updateRiderProfile);

router.get('/stats', riderController.getRiderStats);
router.get('/transactions', riderController.getTransactions);

router.get('/marketplace/share', riderController.getMarketplaceShares);
router.get('/marketplace/hire', riderController.getMarketplaceHire);

router.post('/book', riderController.bookRide);
router.get('/active-trip', riderController.getActiveTrip);
router.get('/history', riderController.getHistory);

router.post('/rate', riderController.rateDriver);

module.exports = router;
