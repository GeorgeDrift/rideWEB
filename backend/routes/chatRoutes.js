const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.get('/conversations', authenticateToken, chatController.getConversations);
router.post('/conversations', authenticateToken, chatController.createConversation);

module.exports = router;
