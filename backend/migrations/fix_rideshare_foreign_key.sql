-- Fix RideSharePosts foreign key to point to Vehicles table instead of RideShareVehicles
ALTER TABLE "RideSharePosts" DROP CONSTRAINT IF EXISTS "RideSharePosts_vehicleId_fkey";
ALTER TABLE "RideSharePosts" ADD CONSTRAINT "RideSharePosts_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify the change
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'RideSharePosts' AND tc.constraint_type = 'FOREIGN KEY';
