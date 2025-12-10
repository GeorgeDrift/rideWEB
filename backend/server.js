
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');
const riderRoutes = require('./routes/riderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const { sequelize, User, Message } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make io accessible in controllers
app.set('io', io);

// --- Configuration ---
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));

// --- Database Connection & Server Start ---
// sync({ force: false }) creates tables if they don't exist
sequelize.sync({ force: false })
    .then(async () => {
        console.log('✅ PostgreSQL Connected & Models Synced');

        // Manual Migration: Add conversationId if missing (safe fix for view dependency error)
        try {
            await sequelize.query(`
                ALTER TABLE "Messages" 
                ADD COLUMN IF NOT EXISTS "conversationId" UUID;
            `);
            console.log('✅ Schema patch applied: conversationId added to Messages');
        } catch (e) {
            console.warn('⚠️ Schema patch warning (conversationId):', e.message);
        }

        // Manual Migration 2: Fix Enum/Check Constraint for Ride Status
        // The outdated check constraint prevents new statuses like 'Awaiting Payment Selection'
        try {
            await sequelize.query(`
                ALTER TABLE "Rides" DROP CONSTRAINT IF EXISTS "Rides_status_check";
            `);
            console.log('✅ Schema patch applied: Dropped restrictive Rides_status_check');
        } catch (e) {
            console.warn('⚠️ Schema patch warning (Rides_status_check):', e.message);
        }

        // Manual Migration 3: Attempt to add enum value if it is a native enum (fail safe)
        try {
            await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE IF NOT EXISTS 'Awaiting Payment Selection';`);
            await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE IF NOT EXISTS 'Waiting for Pickup';`);
            await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE IF NOT EXISTS 'Handover Pending';`);
            await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE IF NOT EXISTS 'Active';`);
            await sequelize.query(`ALTER TYPE "enum_Rides_status" ADD VALUE IF NOT EXISTS 'Return Pending';`);
            console.log('✅ Schema patch applied: Added Active and Return Pending to enum');
        } catch (e) {
            // Ignore - likely means it's not a native enum or already exists or is using check constraint only
            console.warn('⚠️ Enum migration note:', e.message);
        }

        server.listen(PORT, () => {
            console.log(`🚀 Ridex Backend running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database Connection Error:', err);
    });

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // 1. Authentication & Room Joining
    socket.on('authenticate', (userId) => {
        socket.join(`user_${userId}`);
        socket.userId = userId;
        console.log(`👤 User ${userId} authenticated`);
    });

    socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log(`👑 Admin joined monitoring room`);
    });

    socket.on('join_ride', (rideId) => {
        socket.join(`ride_${rideId}`);
    });

    // 2. Driver Online Status
    socket.on('driver_online', async ({ userId, location }) => {
        socket.join('drivers_online');
        io.to('admin_room').emit('map_update', {
            type: 'driver',
            id: userId,
            lat: location.lat,
            lng: location.lng,
            status: 'online'
        });

        try {
            await User.update(
                { isOnline: true, currentLat: location.lat, currentLng: location.lng },
                { where: { id: userId } }
            );
        } catch (e) { console.error("Socket update error", e); }
    });

    // 3. Live Tracking
    socket.on('update_location', async (data) => {
        // Stream to specific ride room
        if (data.rideId) {
            io.to(`ride_${data.rideId}`).emit('driver_location', data);
        }
        // Stream to Admin
        io.to('admin_room').emit('map_update', {
            type: 'driver',
            id: data.driverId,
            lat: data.lat,
            lng: data.lng,
            heading: data.heading
        });
    });

    // 4. Chat
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        // console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
        const { senderId, recipientId, text, rideId, conversationId } = data;
        // console.log("Server received message:", data);

        try {
            let message;

            if (conversationId) {
                // New Flow: Conversation-based
                // Ensure senderId is valid (for admin it might be string 'admin' or UUID)
                // If it's a real user (driver/rider), validation might be needed, but for now we trust the payload or socket.userId

                message = await Message.create({
                    senderId: senderId || socket.userId, // Fallback if not provided
                    conversationId,
                    text,
                    read: false,
                    // If your schema requires 'rideId' even if null, handle it. Sequelize usually allows null.
                });

                // Broadcast to conversation room 
                io.to(`conversation_${conversationId}`).emit('new_message', message);

                // Update Conversation metadata
                try {
                    const { Conversation } = require('./models');
                    await Conversation.update(
                        {
                            lastMessage: text,
                            updatedAt: new Date(),
                            // Increment unread for the OTHER participant. 
                            // Since we don't track who is who easily here without a query, we might skip or do a raw increment if possible.
                            // For now, simple update.
                        },
                        { where: { id: conversationId } }
                    );
                } catch (e) { console.error("Conv update error", e); }

                // Notify specific user rooms if needed (e.g. for push notifications outside the chat view)
                if (recipientId) {
                    io.to(`user_${recipientId}`).emit('newMessageNotification', {
                        title: 'New Message',
                        body: text,
                        conversationId
                    });
                }

            } else {
                // Legacy Flow: Ride-based
                message = await Message.create({ senderId: senderId || socket.userId, rideId, text });

                if (recipientId) {
                    io.to(`user_${recipientId}`).emit('new_message', message);
                } else if (rideId) {
                    io.to(`ride_${rideId}`).emit('new_message', message);
                }

                socket.emit('message_sent', message);
            }
        } catch (e) {
            console.error("Message persistence error:", e);
            socket.emit('error', { message: 'Failed to save message' });
        }
    });

    socket.on('disconnect', async () => {
        if (socket.userId) {
            try {
                await User.update({ isOnline: false }, { where: { id: socket.userId } });
                io.to('admin_room').emit('map_update', { type: 'driver', id: socket.userId, status: 'offline' });
            } catch (e) { }
        }
    });
});
