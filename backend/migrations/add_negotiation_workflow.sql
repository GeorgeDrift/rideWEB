-- ============================================
-- MIGRATION: Add Negotiation & Approval Workflow
-- ============================================

BEGIN;

-- 1. Add negotiation and approval fields to Rides table
ALTER TABLE "Rides" 
ADD COLUMN IF NOT EXISTS "negotiationStatus" VARCHAR(50) DEFAULT 'pending' 
    CHECK ("negotiationStatus" IN ('pending', 'negotiating', 'approved', 'rejected', 'completed')),
ADD COLUMN IF NOT EXISTS "offeredPrice" FLOAT,
ADD COLUMN IF NOT EXISTS "acceptedPrice" FLOAT,
ADD COLUMN IF NOT EXISTS "pickupLocation" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "paymentType" VARCHAR(50) DEFAULT 'pending' 
    CHECK ("paymentType" IN ('online', 'physical', 'pending')),
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "approvedBy" UUID REFERENCES "Users"(id),
ADD COLUMN IF NOT EXISTS "pickupTime" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "returnTime" TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_rides_negotiation_status ON "Rides"("negotiationStatus");
CREATE INDEX IF NOT EXISTS idx_rides_payment_type ON "Rides"("paymentType");

-- 2. Create NegotiationHistory table
CREATE TABLE IF NOT EXISTS "NegotiationHistory" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "rideId" UUID REFERENCES "Rides"(id) ON DELETE CASCADE,
    "offeredBy" UUID REFERENCES "Users"(id),
    "offeredPrice" FLOAT NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_ride_id ON "NegotiationHistory"("rideId");
CREATE INDEX IF NOT EXISTS idx_negotiation_offered_by ON "NegotiationHistory"("offeredBy");

-- Trigger for updatedAt
CREATE TRIGGER update_negotiation_history_updated_at BEFORE UPDATE ON "NegotiationHistory"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Update RideSharePosts table
ALTER TABLE "RideSharePosts"
ADD COLUMN IF NOT EXISTS "pickupLocation" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "allowedDestinations" JSONB, -- Array of allowed destinations
ADD COLUMN IF NOT EXISTS "vehicleId" UUID REFERENCES "RideShareVehicles"(id),
ADD COLUMN IF NOT EXISTS "negotiable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "minPrice" FLOAT,
ADD COLUMN IF NOT EXISTS "maxPrice" FLOAT;

CREATE INDEX IF NOT EXISTS idx_rideshare_posts_vehicle_id ON "RideSharePosts"("vehicleId");
CREATE INDEX IF NOT EXISTS idx_rideshare_posts_pickup_location ON "RideSharePosts"("pickupLocation");

-- 4. Update HirePosts table
ALTER TABLE "HirePosts"
ADD COLUMN IF NOT EXISTS "negotiable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "minRate" FLOAT,
ADD COLUMN IF NOT EXISTS "maxRate" FLOAT,
ADD COLUMN IF NOT EXISTS "requiresApproval" BOOLEAN DEFAULT true;

COMMIT;

-- ============================================
-- Verification
-- ============================================

-- Check Rides table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Rides' 
AND column_name IN ('negotiationStatus', 'offeredPrice', 'acceptedPrice', 'paymentType')
ORDER BY column_name;

-- Check NegotiationHistory table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'NegotiationHistory';

-- Check RideSharePosts new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'RideSharePosts' 
AND column_name IN ('pickupLocation', 'allowedDestinations', 'negotiable')
ORDER BY column_name;
