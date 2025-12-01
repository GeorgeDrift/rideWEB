-- Add vehicleId column to Rides
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Rides' AND column_name = 'vehicleId') THEN
        ALTER TABLE "Rides" ADD COLUMN "vehicleId" UUID REFERENCES "Vehicles"("id") ON DELETE SET NULL;
    END IF;
END $$;
