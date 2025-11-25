
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        
        // Check existing
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            phone,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({ 
            token, 
            user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar } 
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
