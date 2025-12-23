
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { uploadLicense } = require('../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/me', authenticateToken, authController.getProfile);
router.post('/upload-license', authenticateToken, uploadLicense.single('license'), authController.uploadDriverLicense);

module.exports = router;
