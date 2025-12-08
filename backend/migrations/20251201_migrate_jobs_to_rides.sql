-- Migration: Copy Jobs -> Rides and then drop Jobs
-- Created: 2025-12-01
BEGIN;

-- Only run if Jobs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Jobs') THEN

    -- Insert Jobs into Rides (avoid duplicates)
    INSERT INTO "Rides" (
      id, type, origin, destination, coordinates, date, time, "isImmediate",
      price, "platformFee", "driverEarnings", seats, duration, status, "paymentStatus",
      "paymentMethod", "transactionRef", rating, review, "driverId", "riderId", "createdAt", "updatedAt"
    )
    SELECT
      j.id,
      'hire',
      j.location,
      j.location,
      NULL::jsonb,
      COALESCE(to_char(j."startDate", 'YYYY-MM-DD'), to_char(j."createdAt", 'YYYY-MM-DD')),
      COALESCE(to_char(j."startDate", 'HH24:MI:SS'), ''),
      FALSE,
      COALESCE(j.budget, 0),
      0,
      COALESCE(j.budget, 0),
      NULL,
      NULL,
      CASE WHEN j.status = 'Open' THEN 'Pending' ELSE j.status END,
      'pending',
      NULL,
      NULL,
      NULL,
      NULL,
      j."driverId",
      j."clientId",
      j."createdAt",
      j."updatedAt"
    FROM "Jobs" j
    WHERE NOT EXISTS (SELECT 1 FROM "Rides" r WHERE r.id = j.id);

    -- Update Notifications which referenced jobs into ride type (if the id now exists in Rides)
    UPDATE "Notifications" n
    SET "relatedType" = 'ride'
    WHERE n."relatedType" = 'job' AND EXISTS (SELECT 1 FROM "Rides" r WHERE r.id = n."relatedId");

  END IF;
END
$$ LANGUAGE plpgsql;

COMMIT;
