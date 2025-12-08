-- Migration: add missing columns rideId and offeredBy to NegotiationHistories
BEGIN;

ALTER TABLE "NegotiationHistories"
ADD COLUMN IF NOT EXISTS "rideId" UUID REFERENCES "Rides"(id) ON DELETE CASCADE;

ALTER TABLE "NegotiationHistories"
ADD COLUMN IF NOT EXISTS "offeredBy" UUID REFERENCES "Users"(id);

CREATE INDEX IF NOT EXISTS idx_negotiation_ride_id ON "NegotiationHistories"("rideId");
CREATE INDEX IF NOT EXISTS idx_negotiation_offered_by ON "NegotiationHistories"("offeredBy");

-- Ensure updatedAt trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_negotiation_history_updated_at'
  ) THEN
    CREATE TRIGGER update_negotiation_history_updated_at BEFORE UPDATE ON "NegotiationHistories"
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END
$$ LANGUAGE plpgsql;

COMMIT;
