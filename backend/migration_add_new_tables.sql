-- Migration Script: Add New Tables for Schema Refactor
-- Run this script on your PostgreSQL database to add the new tables
-- This assumes your existing schema is already in place

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: RideShareVehicles
-- ============================================
CREATE TABLE IF NOT EXISTS "RideShareVehicles" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    plate VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    seats INTEGER DEFAULT 4,
    "imageUrl" VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    
    -- Foreign Key
    "driverId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rideshare_vehicles_driver_id ON "RideShareVehicles"("driverId");

-- ============================================
-- TABLE: HireVehicles
-- ============================================
CREATE TABLE IF NOT EXISTS "HireVehicles" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plate VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rate VARCHAR(100),
    "rateAmount" FLOAT,
    "rateUnit" VARCHAR(20) DEFAULT 'day',
    features JSONB,
    "imageUrl" VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Rented', 'Maintenance')),
    
    -- Foreign Key
    "driverId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hire_vehicles_driver_id ON "HireVehicles"("driverId");
CREATE INDEX IF NOT EXISTS idx_hire_vehicles_category ON "HireVehicles"(category);

-- ============================================
-- TABLE: Jobs
-- ============================================
CREATE TABLE IF NOT EXISTS "Jobs" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(500) NOT NULL,
    
    -- Scheduling
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    
    -- Pricing
    budget FLOAT,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
    
    -- Foreign Keys
    "clientId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "driverId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "vehicleId" UUID REFERENCES "HireVehicles"(id) ON DELETE SET NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_driver_id ON "Jobs"("driverId");
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON "Jobs"("clientId");
CREATE INDEX IF NOT EXISTS idx_jobs_status ON "Jobs"(status);

-- ============================================
-- TABLE: Subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS "Subscriptions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('1m', '3m', '6m', '1y', 'monthly', 'yearly')),
    amount FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    "startDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    "endDate" TIMESTAMP NOT NULL,
    "paymentMethod" VARCHAR(50),
    "transactionId" VARCHAR(255),
    
    -- Foreign Key
    "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON "Subscriptions"("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON "Subscriptions"(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON "Subscriptions"("endDate");

-- ============================================
-- Add Triggers for updatedAt
-- ============================================

-- Function already exists from main schema, but adding for completeness
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
CREATE TRIGGER update_rideshare_vehicles_updated_at BEFORE UPDATE ON "RideShareVehicles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hire_vehicles_updated_at BEFORE UPDATE ON "HireVehicles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON "Jobs"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "Subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Optional: Migrate existing data
-- ============================================
-- Uncomment and adjust if you want to migrate existing Vehicles to HireVehicles
-- INSERT INTO "HireVehicles" (id, name, make, model, plate, category, rate, "rateAmount", features, "imageUrl", status, "driverId", "createdAt", "updatedAt")
-- SELECT id, name, make, model, plate, category, rate, 0, features, "imageUrl", status, "driverId", "createdAt", "updatedAt"
-- FROM "Vehicles";

-- ============================================
-- END OF MIGRATION
-- ============================================
