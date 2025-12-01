
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/operators', authenticateToken, paymentController.getOperators);
router.post('/initiate', authenticateToken, paymentController.initiatePayment);
router.get('/verify/:chargeId', authenticateToken, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook); // No auth token, uses signature verification
router.post('/payout', authenticateToken, paymentController.requestPayout); // Driver withdrawal

module.exports = router;
