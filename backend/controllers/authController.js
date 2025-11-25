
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

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
            // At least one payment method is required for drivers
            const hasPaymentMethod = airtelMoneyNumber || mpambaNumber || (bankName && bankAccountNumber);
            if (!hasPaymentMethod) {
                return res.status(400).json({
                    error: 'Drivers must provide at least one payment method (Airtel Money, Mpamba, or Bank details)'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Set account status based on role
        const accountStatus = role === 'driver' ? 'pending' : 'active';

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
            bankAccountName
        });

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
            message: role === 'driver'
                ? 'Registration successful! Your account is pending approval.'
                : 'Registration successful!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar }
        });
    } catch (err) {
        console.error(err);
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
