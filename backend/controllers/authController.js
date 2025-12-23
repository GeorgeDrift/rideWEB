
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone,
            // Driver-specific fields
            driverLicenseUrl,
            airtelMoneyNumber,
            mpambaNumber,
            bankName,
            bankAccountNumber,
            bankAccountName
        } = req.body;

        // Check existing
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        // Validate driver-specific requirements
        if (role === 'driver') {
            // At least one contact method is required for drivers (WhatsApp or Mobile Money)
            const hasContactMethod = phone || airtelMoneyNumber || mpambaNumber;
            if (!hasContactMethod) {
                return res.status(400).json({
                    error: 'Drivers must provide at least one contact method (WhatsApp number, Airtel Money, or Mpamba)'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Set account status based on role
        const accountStatus = role === 'driver' ? 'pending' : 'active';

        // Set trial dates for new users (30-day trial)
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 30); // 30 days from now

        const verificationToken = require('crypto').randomBytes(32).toString('hex');
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 4); // 4 hours from now

        // Determine payout method automatically if provided
        let determinedPayoutMethod = null;
        if (bankName) determinedPayoutMethod = 'Bank';
        else if (airtelMoneyNumber) determinedPayoutMethod = 'Airtel Money';
        else if (mpambaNumber) determinedPayoutMethod = 'Mpamba';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            accountStatus,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            // Driver-specific fields
            driverLicenseUrl,
            airtelMoneyNumber,
            mpambaNumber,
            bankName,
            bankAccountNumber,
            bankAccountName,
            payoutMethod: determinedPayoutMethod,
            // Trial dates for subscription
            trialStartDate: now,
            trialEndDate: trialEnd,
            subscriptionStatus: 'active', // Active during trial period

            // Verification
            isVerified: false, // Require email verification
            verificationToken: verificationToken,
            verificationTokenExpiry: tokenExpiry
        });

        // Send Verification Email (instead of welcome email)
        emailService.sendVerificationEmail(email, verificationToken).catch(err => console.error('Background Email Error:', err));

        // Proceed immediately without waiting for email
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                accountStatus: user.accountStatus
            },
            message: 'Registration successful! Please check your email to verify your account.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    console.log('Login request received:', req.body.email);
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ error: 'Email not registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for:', email);
            return res.status(400).json({ error: 'Wrong password' });
        }

        // Check Verification Status - disabled for auto-login flow
        // if (!user.isVerified) {
        //      return res.status(403).json({ error: 'Please verify your email first.' });
        // }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        console.log('Login successful for:', email);

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        // Check if token is expired
        if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
            return res.status(400).json({
                error: 'Verification token has expired. Please request a new verification email.',
                expired: true
            });
        }

        // Verify User
        await user.update({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null
        });

        // Auto-login? Or just success message.
        // Let's return success and let user login manually for security or return token.
        // Better UX: Return token so they are logged in.
        const authToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Email verified successfully!',
            token: authToken,
            user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar }
        });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate new token with 4-hour expiry
        const verificationToken = require('crypto').randomBytes(32).toString('hex');
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 4);

        await user.update({
            verificationToken,
            verificationTokenExpiry: tokenExpiry
        });

        // Send new verification email
        await emailService.sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email sent successfully. Please check your inbox.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // Exclude password from result
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadDriverLicense = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the file path relative to the backend directory
        const filePath = `/uploads/licenses/${req.file.filename}`;

        // Update user record with the license URL
        await User.update(
            { driverLicenseUrl: filePath },
            { where: { id: req.user.id } }
        );

        res.json({
            message: 'Driver license uploaded successfully',
            fileUrl: filePath
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
