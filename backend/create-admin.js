#!/usr/bin/env node

/**
 * Script to create an admin user in the database
 * Usage: node create-admin.js
 */

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

const createAdmin = async () => {
    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected');

        const adminEmail = 'yuyuy4297@gmail.com';
        const adminPassword = 'admin2025';
        const adminName = 'System Administrator';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log(`⚠ Admin with email ${adminEmail} already exists`);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            accountStatus: 'active',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=0D47A1&color=fff`,
            rating: 5.0
        });

        console.log('✓ Admin user created successfully');
        console.log('─────────────────────────────────');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Role: ${admin.role}`);
        console.log(`Status: ${admin.accountStatus}`);
        console.log('─────────────────────────────────');
        console.log('⚠ IMPORTANT: Please change the password on first login');
        console.log('─────────────────────────────────');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
