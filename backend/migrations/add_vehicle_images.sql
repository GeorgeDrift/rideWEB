-- Add imageUrl column to Vehicles table if it doesn't exist
ALTER TABLE "Vehicles" 
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);

-- Add imageUrl column to RideSharePosts table if it doesn't exist
ALTER TABLE "RideSharePosts" 
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);

-- Add imageUrl column to HirePosts table if it doesn't exist
ALTER TABLE "HirePosts" 
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);

-- Add imageUrl column to RideShareVehicles table if it doesn't exist
ALTER TABLE "RideShareVehicles" 
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);

-- Add imageUrl column to HireVehicles table if it doesn't exist
ALTER TABLE "HireVehicles" 
ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);
