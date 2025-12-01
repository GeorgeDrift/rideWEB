const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/', authenticateToken, vehicleController.createVehicle);
router.get('/my-vehicles', authenticateToken, vehicleController.getDriverVehicles);
router.delete('/:id', authenticateToken, vehicleController.deleteVehicle);

// Public routes
router.get('/search', vehicleController.searchVehicles);
router.get('/', vehicleController.getAllVehicles);

module.exports = router;
