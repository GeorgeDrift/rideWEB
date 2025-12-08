const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get driver notifications (placeholder)
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        // Return empty array for now - no notifications system yet
        res.json([]);
    } catch (error) {
        console.error('Notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

module.exports = router;
