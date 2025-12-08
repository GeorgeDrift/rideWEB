
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public marketplace route for riders to see hire vehicles
router.get('/marketplace/hire', driverController.getMarketplaceHire);
// Location suggestions for job posting autocomplete
router.get('/locations', driverController.getLocationSuggestions);

// Protected driver routes
router.get('/vehicles', authenticateToken, authorizeRole(['driver']), driverController.getVehicles);
router.post('/vehicles', authenticateToken, authorizeRole(['driver']), driverController.addVehicle);
router.get('/stats', authenticateToken, authorizeRole(['driver']), driverController.getStats);
// Add more granular driver stats endpoints used by the frontend
router.get('/stats/profit', authenticateToken, authorizeRole(['driver']), driverController.getProfitStats);
router.get('/stats/trips', authenticateToken, authorizeRole(['driver']), driverController.getTripHistoryStats);
router.get('/stats/distance', authenticateToken, authorizeRole(['driver']), driverController.getDistanceStats);
router.get('/stats/hours', authenticateToken, authorizeRole(['driver']), driverController.getHoursStats);
router.get('/stats/ontime', authenticateToken, authorizeRole(['driver']), driverController.getOnTimeStats);
router.get('/transactions', authenticateToken, authorizeRole(['driver']), driverController.getTransactions);

// Post Management
router.post('/posts/share', authenticateToken, authorizeRole(['driver']), driverController.addSharePost);
router.post('/posts/hire', authenticateToken, authorizeRole(['driver']), driverController.addHirePost);
router.get('/posts/share', authenticateToken, authorizeRole(['driver']), driverController.getMySharePosts);
router.get('/posts/hire', authenticateToken, authorizeRole(['driver']), driverController.getMyHirePosts);

// Job Confirmation
router.post('/jobs/confirm', authenticateToken, authorizeRole(['driver']), driverController.confirmBooking);
router.post('/jobs/handover', authenticateToken, authorizeRole(['driver']), driverController.confirmHandover);
router.post('/jobs', authenticateToken, authorizeRole(['driver']), driverController.createManualJob);
router.get('/jobs', authenticateToken, authorizeRole(['driver']), driverController.getContractedJobs);

// Route for fetching driver payout details (accessible by authenticated users for payment processing)
router.get('/:driverId/payout-details', authenticateToken, driverController.getDriverPayoutDetails);

// Route for saving driver payout details (bank account info)
router.post('/payout-details', authenticateToken, authorizeRole(['driver']), driverController.saveDriverPayoutDetails);

// --- NEW: Approval Workflow Routes ---
router.get('/requests/pending', authenticateToken, authorizeRole(['driver']), driverController.getPendingApprovals);
router.post('/requests/:requestId/approve', authenticateToken, authorizeRole(['driver']), driverController.approveRequest);
router.post('/requests/:requestId/counter-offer', authenticateToken, authorizeRole(['driver']), driverController.makeDriverCounterOffer);

module.exports = router;
