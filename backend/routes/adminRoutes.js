
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

// Analytics & Reports
router.get('/revenue', adminController.getRevenueStats);
router.get('/stats/rides', adminController.getTotalRideStats);
router.get('/stats/share', adminController.getShareStats);
router.get('/stats/hire', adminController.getHireStats);
router.get('/vehicles', adminController.getAllVehicles);

// Subscription Plan Management
const subscriptionController = require('../controllers/subscriptionController');
router.get('/plans', subscriptionController.getPlans);
router.post('/plans', subscriptionController.createPlan);
router.put('/plans/:id', subscriptionController.updatePlan);

module.exports = router;
