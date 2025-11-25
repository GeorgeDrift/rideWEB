
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public marketplace route for riders to see hire vehicles
router.get('/marketplace/hire', driverController.getMarketplaceHire);

// Protected driver routes
router.get('/vehicles', authenticateToken, authorizeRole(['driver']), driverController.getVehicles);
router.post('/vehicles', authenticateToken, authorizeRole(['driver']), driverController.addVehicle);
router.get('/stats', authenticateToken, authorizeRole(['driver']), driverController.getStats);

module.exports = router;
