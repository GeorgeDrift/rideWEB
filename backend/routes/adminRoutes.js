
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware: Ensure user is logged in and is an Admin
router.use(authenticateToken, authorizeRole(['admin']));

// Dashboard Analytics
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/drivers', adminController.getDrivers);
router.get('/riders', adminController.getRiders);
router.put('/users/:id/status', adminController.updateUserStatus); // Approve/Suspend

// Ride Management
router.get('/rides', adminController.getAllRides);

// Pricing Zones
router.get('/pricing-zones', adminController.getPricingZones);
router.post('/pricing-zones', adminController.createPricingZone);

// Global Base Rates
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
