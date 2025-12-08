-- ============================================
-- RideX Database Schema for PostgreSQL
-- ============================================
-- This schema supports the complete RideX application
-- including user management, rides, payments, and messaging
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: Users
-- ============================================
-- Stores all users (admins, drivers, and riders)
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'driver', 'rider')),
    phone VARCHAR(50),
    avatar VARCHAR(500),
    rating FLOAT DEFAULT 5.0,
    "walletBalance" FLOAT DEFAULT 0.0,
    
    -- Account Status for Admin Management
    "accountStatus" VARCHAR(50) DEFAULT 'active' CHECK ("accountStatus" IN ('pending', 'active', 'suspended')),
    
    -- Driver Specific Fields
    "vehicleModel" VARCHAR(255),
    "vehiclePlate" VARCHAR(100),
    "driverLicenseUrl" VARCHAR(500),
    
    -- Payment Details (Driver Payout Methods)
    "airtelMoneyNumber" VARCHAR(50),
    "mpambaNumber" VARCHAR(50),
    "bankName" VARCHAR(255),
    "bankAccountNumber" VARCHAR(100),
    "bankAccountName" VARCHAR(255),
    
    -- Driver Location & Status
    "isOnline" BOOLEAN DEFAULT FALSE,
    "currentLat" FLOAT,
    "currentLng" FLOAT,
    "currentHeading" FLOAT,
    
    -- Subscription
    "subscriptionStatus" VARCHAR(50) DEFAULT 'inactive' CHECK ("subscriptionStatus" IN ('active', 'inactive', 'expired')),
    "subscriptionExpiry" TIMESTAMP,
    
    -- Permissions (stored as JSON array)
    permissions JSONB,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Users table
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_role ON "Users"(role);
CREATE INDEX idx_users_account_status ON "Users"("accountStatus");
CREATE INDEX idx_users_is_online ON "Users"("isOnline");
CREATE INDEX idx_users_location ON "Users"("currentLat", "currentLng");

CREATE TABLE "Rides" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('share', 'hire')),
    
    -- Route Information
    origin VARCHAR(500) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    coordinates JSONB, -- Store route coordinates as JSON
    
    -- Scheduling
    date VARCHAR(50),
    time VARCHAR(50),
    "isImmediate" BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    price FLOAT NOT NULL,
    "platformFee" FLOAT DEFAULT 0,
    "driverEarnings" FLOAT DEFAULT 0,
    
    -- Ride Details
    seats INTEGER,
    duration VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN (
        'Pending', 'Scheduled', 'Inbound', 'Arrived', 'Boarded', 
        'In Progress', 'Payment Due', 'Completed', 'Cancelled'
    )),
    
    -- Payment
    "paymentStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("paymentStatus" IN ('pending', 'paid', 'failed', 'refunded')),
    "paymentMethod" VARCHAR(100),
    "transactionRef" VARCHAR(255),
    
    -- Rider Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    -- Foreign Keys
    "driverId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "riderId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Rides table
CREATE INDEX idx_rides_driver_id ON "Rides"("driverId");
CREATE INDEX idx_rides_rider_id ON "Rides"("riderId");
CREATE INDEX idx_rides_status ON "Rides"(status);
CREATE INDEX idx_rides_payment_status ON "Rides"("paymentStatus");
CREATE INDEX idx_rides_type ON "Rides"(type);
CREATE INDEX idx_rides_created_at ON "Rides"("createdAt");

CREATE TABLE "PricingZones" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    multiplier FLOAT DEFAULT 1.0,
    color VARCHAR(50) DEFAULT '#ef4444',
    coordinates JSONB, -- Polygon coordinates as JSON
    "isActive" BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for PricingZones table
CREATE INDEX idx_pricing_zones_is_active ON "PricingZones"("isActive");

-- ============================================
-- TABLE: SystemSettings
-- ============================================
-- Stores global system configuration
CREATE TABLE "SystemSettings" (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: Transactions
-- ============================================
-- Stores all financial transactions
CREATE TABLE "Transactions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'Ride Payment', 'Subscription', 'Payout', 'Refund', 'TopUp', 'Settlement'
    )),
    amount FLOAT NOT NULL,
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('credit', 'debit')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    reference VARCHAR(255),
    description TEXT,
    "relatedId" UUID, -- Can link to Ride ID or other entities
    
    -- Foreign Key
    "userId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Transactions table
CREATE INDEX idx_transactions_user_id ON "Transactions"("userId");
CREATE INDEX idx_transactions_type ON "Transactions"(type);
CREATE INDEX idx_transactions_status ON "Transactions"(status);
CREATE INDEX idx_transactions_related_id ON "Transactions"("relatedId");
CREATE INDEX idx_transactions_created_at ON "Transactions"("createdAt");

-- ============================================
-- TABLE: Messages
-- ============================================
-- Stores chat messages between users
CREATE TABLE "Messages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    "readBy" JSONB, -- Array of user IDs who have read the message
    
    -- Foreign Keys
    "senderId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "rideId" UUID REFERENCES "Rides"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Messages table
CREATE INDEX idx_messages_sender_id ON "Messages"("senderId");
CREATE INDEX idx_messages_ride_id ON "Messages"("rideId");
CREATE INDEX idx_messages_created_at ON "Messages"("createdAt");

-- ============================================
-- SEED DATA: System Settings
-- ============================================
-- Insert default system settings
INSERT INTO "SystemSettings" (key, value, description) VALUES
    ('baseFare', '5.00', 'Base starting price for rides'),
    ('perKmRate', '1.50', 'Rate per kilometer'),
    ('perMinRate', '0.50', 'Rate per minute'),
    ('platformFeePercent', '10', 'Platform fee percentage (driver gets 90%)'),
    ('currency', 'MWK', 'Currency code'),
    ('maxRideDistance', '100', 'Maximum ride distance in km'),
    ('driverCommission', '90', 'Driver commission percentage')
ON CONFLICT (key) DO NOTHING;

INSERT INTO "SystemSettings" (key, value, description) VALUES
    ('subscriptionMonthlyPrice', '5000', 'Monthly subscription price in MWK'),
    ('subscriptionYearlyPrice', '50000', 'Yearly subscription price in MWK'),
    ('subscriptionTrialDays', '7', 'Number of free trial days for new drivers')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SEED DATA: Admin User
-- ============================================
-- Create default admin user (password: admin123)
-- Note: In production, use bcrypt to hash passwords
INSERT INTO "Users" (id, name, email, password, role, "accountStatus") VALUES
    (uuid_generate_v4(), 'Admin User', 'admin@ridex.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updatedAt trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON "Vehicles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON "Rides"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_zones_updated_at BEFORE UPDATE ON "PricingZones"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON "SystemSettings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON "Transactions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON "Messages"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (Optional - for convenience)
-- ============================================

-- View for active drivers
CREATE OR REPLACE VIEW active_drivers AS
SELECT 
    id, name, email, phone, rating, "vehicleModel", "vehiclePlate",
    "currentLat", "currentLng", "isOnline", "walletBalance"
FROM "Users"
WHERE role = 'driver' AND "accountStatus" = 'active';

-- View for ride statistics
CREATE OR REPLACE VIEW ride_statistics AS
SELECT 
    DATE("createdAt") as ride_date,
    COUNT(*) as total_rides,
    COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_rides,
    COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_rides,
    SUM(CASE WHEN status = 'Completed' THEN price ELSE 0 END) as total_revenue,
    AVG(CASE WHEN status = 'Completed' THEN price ELSE NULL END) as avg_ride_price
FROM "Rides"
GROUP BY DATE("createdAt")
ORDER BY ride_date DESC;

-- ============================================
-- GRANTS (Adjust based on your user setup)
-- ============================================
-- Example: Grant permissions to your application database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- TABLE: RideShareVehicles
-- ============================================
-- Stores vehicles used for Ride Sharing (Sedans, Hatchbacks, etc.)
CREATE TABLE "RideShareVehicles" (
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

CREATE INDEX idx_rideshare_vehicles_driver_id ON "RideShareVehicles"("driverId");

-- ============================================
-- TABLE: HireVehicles
-- ============================================
-- Stores vehicles used for Hire (Trucks, Tractors, Construction, etc.)
CREATE TABLE "HireVehicles" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Custom name e.g. "Big Red Tractor"
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plate VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Tractor, Truck, etc.
    rate VARCHAR(100), -- Daily/Hourly rate description
    "rateAmount" FLOAT, -- Numeric rate for calculations
    "rateUnit" VARCHAR(20) DEFAULT 'day', -- day, hour, km
    features JSONB,
    "imageUrl" VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Rented', 'Maintenance')),
    
    -- Foreign Key
    "driverId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hire_vehicles_driver_id ON "HireVehicles"("driverId");
CREATE INDEX idx_hire_vehicles_category ON "HireVehicles"(category);

-- ============================================
-- TABLE: Jobs
-- ============================================
-- Jobs table removed (consolidated into Rides)

-- ============================================
-- TABLE: Subscriptions
-- ============================================
-- Stores driver subscriptions
CREATE TABLE "Subscriptions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('1m', '3m', '6m', '1y')),
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

CREATE INDEX idx_subscriptions_user_id ON "Subscriptions"("userId");
CREATE INDEX idx_subscriptions_status ON "Subscriptions"(status);
CREATE INDEX idx_subscriptions_end_date ON "Subscriptions"("endDate");

-- ============================================
-- END OF SCHEMA
-- ============================================
