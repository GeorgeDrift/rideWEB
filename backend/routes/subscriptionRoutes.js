const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

// Get available subscription plans (authenticated users)
router.get('/plans', authenticateToken, subscriptionController.getPlans);

// Get current subscription status
router.get('/status', authenticateToken, subscriptionController.getSubscriptionStatus);

// Get payment history
router.get('/history', authenticateToken, subscriptionController.getPaymentHistory);

// Initiate subscription payment
router.post('/initiate', authenticateToken, subscriptionController.initiateSubscriptionPayment);

// Verify payment status
router.get('/verify/:chargeId', authenticateToken, subscriptionController.verifyPayment);

// Webhook endpoint for PayChangu notifications (no auth - validated by signature)
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
