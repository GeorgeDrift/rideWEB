-- Add trial date tracking columns to Users table
-- Migration: add_trial_dates.sql
-- Purpose: Track 30-day free trial period for subscription safeback feature

-- Add trial_start_date column (when user's trial began)
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP;

-- Add trial_end_date column (when user's trial expires)
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP;

-- Backfill existing users with trial dates based on their registration date
-- Set trial start to their created_at date
UPDATE "Users" 
SET "trialStartDate" = "createdAt"
WHERE "trialStartDate" IS NULL;

-- Set trial end to 30 days after registration (createdAt + 30 days)
UPDATE "Users" 
SET "trialEndDate" = "createdAt" + INTERVAL '30 days'
WHERE "trialEndDate" IS NULL;

-- Create index for faster trial status lookups
CREATE INDEX IF NOT EXISTS idx_users_trial_end_date ON "Users" ("trialEndDate");

-- Verify the migration
SELECT 
    id, 
    email, 
    role,
    "createdAt",
    "trialStartDate",
    "trialEndDate",
    "subscriptionStatus"
FROM "Users" 
LIMIT 5;
