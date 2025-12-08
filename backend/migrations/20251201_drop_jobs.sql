-- Drop Jobs table migration
-- Created: 2025-12-01
BEGIN;
-- Remove trigger related to Jobs if present (safe no-op)
DROP TRIGGER IF EXISTS update_jobs_updated_at ON "Jobs";
-- Drop the Jobs table and any dependent objects
DROP TABLE IF EXISTS "Jobs" CASCADE;
COMMIT;
