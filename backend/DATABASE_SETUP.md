# Database Setup Guide

## Quick Start

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ridex;

# Exit psql
\q
```

### 2. Run the Schema

```bash
# Execute the schema file
psql -U postgres -d ridex -f backend/schema.sql
```

### 3. Update .env File

Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ridex
```

### 4. Verify Installation

```bash
# Connect to database
psql -U postgres -d ridex

# List all tables
\dt

# You should see:
# - Users
# - Vehicles
# - Rides
# - PricingZones
# - SystemSettings
# - Transactions
# - Messages
```

## What's Included

### Tables Created
1. **Users** - All users (admin, drivers, riders)
2. **Vehicles** - Driver vehicle inventory
3. **Rides** - All ride requests and jobs
4. **PricingZones** - Surge pricing zones
5. **SystemSettings** - Global configuration
6. **Transactions** - Financial transactions
7. **Messages** - Chat messages

### Features
- ✅ UUID primary keys
- ✅ Proper foreign key relationships
- ✅ Indexes for performance
- ✅ Auto-updating timestamps
- ✅ Default seed data (system settings)
- ✅ Helpful views for queries
- ✅ Data validation with CHECK constraints

### Default Admin User
- Email: `admin@ridex.com`
- Password: `admin123` (change the hash in schema.sql before running)

## Important Notes

⚠️ **Before running in production:**
1. Update the admin password hash in the schema
2. Adjust database user permissions
3. Review and customize system settings

## Troubleshooting

### If you get "uuid-ossp extension not found"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### If tables already exist
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE ridex;
CREATE DATABASE ridex;
\q

# Then run schema again
psql -U postgres -d ridex -f backend/schema.sql
```

## Next Steps

After running the schema:
1. Start your backend: `cd backend && npm start`
2. The Sequelize models will sync with the database
3. Your application is ready to use!
