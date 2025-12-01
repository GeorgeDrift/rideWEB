-- Add vehicleId column to RideSharePosts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'RideSharePosts' AND column_name = 'vehicleId') THEN
        ALTER TABLE "RideSharePosts" ADD COLUMN "vehicleId" UUID REFERENCES "Vehicles"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Add vehicleId column to HirePosts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'HirePosts' AND column_name = 'vehicleId') THEN
        ALTER TABLE "HirePosts" ADD COLUMN "vehicleId" UUID REFERENCES "Vehicles"("id") ON DELETE SET NULL;
    END IF;
END $$;
