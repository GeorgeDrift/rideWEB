-- Create SubscriptionPlans table
CREATE TABLE IF NOT EXISTS "SubscriptionPlans" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price FLOAT NOT NULL,
    duration INTEGER NOT NULL, -- Duration in days
    description TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed SubscriptionPlans with default data
INSERT INTO "SubscriptionPlans" (name, price, duration, description) VALUES
    ('Monthly Plan', 49900, 30, 'Full access for 30 days'),
    ('Quarterly Plan', 134900, 90, 'Full access for 3 months - Save 10%'),
    ('Bi-Annual Plan', 254900, 180, 'Full access for 6 months - Save 15%'),
    ('Yearly Plan', 479900, 365, 'Full access for 12 months - Save 20%');

-- Create Disputes table
CREATE TABLE IF NOT EXISTS "Disputes" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    "userId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "rideId" UUID REFERENCES "Rides"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Remove the restrictive CHECK constraint on Subscriptions.plan
-- We want 'plan' to be able to store any string or ID now (or we could change it to reference SubscriptionPlans, but text is safer for migration if we store the name or ID as string)
-- Dropping the constraint is the safest first step to allow flexibility.
ALTER TABLE "Subscriptions" DROP CONSTRAINT IF EXISTS "Subscriptions_plan_check";

-- Add Trigger for updated_at on new tables
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON "SubscriptionPlans"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON "Disputes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
