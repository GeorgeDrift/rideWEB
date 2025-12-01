-- ============================================
-- MIGRATION: Add Missing Tables for Frontend Data
-- Run this script to create tables needed for marketplace and stats
-- ============================================

BEGIN;

-- 1. RideSharePosts Table
-- Stores driver-posted rideshare offers for the marketplace
CREATE TABLE IF NOT EXISTS "RideSharePosts" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(500) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    price FLOAT NOT NULL,
    seats INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
    
    -- Foreign Key
    "driverId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rideshare_posts_driver_id ON "RideSharePosts"("driverId");
CREATE INDEX IF NOT EXISTS idx_rideshare_posts_status ON "RideSharePosts"(status);
CREATE INDEX IF NOT EXISTS idx_rideshare_posts_date ON "RideSharePosts"(date);

-- Trigger for updatedAt
CREATE TRIGGER update_rideshare_posts_updated_at BEFORE UPDATE ON "RideSharePosts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. HirePosts Table
-- Stores vehicle hire listings for the marketplace
CREATE TABLE IF NOT EXISTS "HirePosts" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(500) NOT NULL,
    rate VARCHAR(100) NOT NULL,
    "rateAmount" FLOAT NOT NULL,
    "rateUnit" VARCHAR(20) DEFAULT 'day',
    description TEXT,
    features JSONB,
    "imageUrl" VARCHAR(500),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'inactive')),
    
    -- Foreign Keys
    "driverId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    "vehicleId" UUID REFERENCES "HireVehicles"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hire_posts_driver_id ON "HirePosts"("driverId");
CREATE INDEX IF NOT EXISTS idx_hire_posts_vehicle_id ON "HirePosts"("vehicleId");
CREATE INDEX IF NOT EXISTS idx_hire_posts_category ON "HirePosts"(category);
CREATE INDEX IF NOT EXISTS idx_hire_posts_status ON "HirePosts"(status);

-- Trigger for updatedAt
CREATE TRIGGER update_hire_posts_updated_at BEFORE UPDATE ON "HirePosts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Conversations Table
-- Groups messages into conversations for chat system
CREATE TABLE IF NOT EXISTS "Conversations" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "lastMessage" TEXT,
    "lastMessageTime" TIMESTAMP,
    "unreadCount" INTEGER DEFAULT 0,
    
    -- Participants (stored as JSON array of user IDs)
    participants JSONB NOT NULL,
    
    -- Related to a ride/job
    "relatedRideId" UUID REFERENCES "Rides"(id) ON DELETE SET NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON "Conversations" USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_related_ride ON "Conversations"("relatedRideId");
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_time ON "Conversations"("lastMessageTime");

-- Trigger for updatedAt
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON "Conversations"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update Messages table to link to conversations
ALTER TABLE "Messages" 
ADD COLUMN IF NOT EXISTS "conversationId" UUID REFERENCES "Conversations"(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON "Messages"("conversationId");

-- 4. Notifications Table
-- Stores persistent notifications for users
CREATE TABLE IF NOT EXISTS "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    "isRead" BOOLEAN DEFAULT FALSE,
    
    -- Related Entity
    "relatedType" VARCHAR(50), -- 'ride', 'payment', 'subscription', etc.
    "relatedId" UUID,
    
    -- Foreign Key
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notifications"("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON "Notifications"("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON "Notifications"("createdAt");

-- Trigger for updatedAt
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "Notifications"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RiderStats Table
-- Caches computed statistics for riders (performance optimization)
CREATE TABLE IF NOT EXISTS "RiderStats" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID UNIQUE REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Aggregated Data
    "totalSpend" FLOAT DEFAULT 0,
    "totalRides" INTEGER DEFAULT 0,
    "totalDistance" FLOAT DEFAULT 0,
    "completedRides" INTEGER DEFAULT 0,
    "cancelledRides" INTEGER DEFAULT 0,
    "averageRating" FLOAT DEFAULT 5.0,
    
    -- Chart Data (stored as JSON)
    "chartData" JSONB,
    "rideTypes" JSONB,
    
    -- Last Calculated
    "lastCalculated" TIMESTAMP DEFAULT NOW(),
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_stats_user_id ON "RiderStats"("userId");

-- Trigger for updatedAt
CREATE TRIGGER update_rider_stats_updated_at BEFORE UPDATE ON "RiderStats"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. DriverStats Table
-- Caches computed statistics for drivers (performance optimization)
CREATE TABLE IF NOT EXISTS "DriverStats" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID UNIQUE REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Aggregated Data
    "totalEarnings" FLOAT DEFAULT 0,
    "totalRides" INTEGER DEFAULT 0,
    "totalDistance" FLOAT DEFAULT 0,
    "completedRides" INTEGER DEFAULT 0,
    "cancelledRides" INTEGER DEFAULT 0,
    "averageRating" FLOAT DEFAULT 5.0,
    "onTimePercentage" FLOAT DEFAULT 100.0,
    
    -- Chart Data (stored as JSON)
    "profitData" JSONB,
    "tripHistory" JSONB,
    "distanceData" JSONB,
    
    -- Last Calculated
    "lastCalculated" TIMESTAMP DEFAULT NOW(),
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_stats_user_id ON "DriverStats"("userId");

-- Trigger for updatedAt
CREATE TRIGGER update_driver_stats_updated_at BEFORE UPDATE ON "DriverStats"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify tables were created successfully

-- List all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('RideSharePosts', 'HirePosts', 'Conversations', 'Notifications', 'RiderStats', 'DriverStats')
ORDER BY table_name;

-- Count records in each new table
SELECT 
    'RideSharePosts' as table_name, COUNT(*) as record_count FROM "RideSharePosts"
UNION ALL
SELECT 'HirePosts', COUNT(*) FROM "HirePosts"
UNION ALL
SELECT 'Conversations', COUNT(*) FROM "Conversations"
UNION ALL
SELECT 'Notifications', COUNT(*) FROM "Notifications"
UNION ALL
SELECT 'RiderStats', COUNT(*) FROM "RiderStats"
UNION ALL
SELECT 'DriverStats', COUNT(*) FROM "DriverStats";
