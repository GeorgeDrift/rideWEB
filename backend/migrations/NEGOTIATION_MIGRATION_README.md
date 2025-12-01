# Negotiation Workflow Migration - Instructions

## Files Created

1. **Migration SQL**: `backend/migrations/add_negotiation_workflow.sql`
2. **Sequelize Model**: Updated `backend/models.js` with `NegotiationHistory`

---

## What Was Added

### Database Changes

#### Rides Table - New Columns:
- `negotiationStatus` - Track negotiation state (pending, negotiating, approved, rejected, completed)
- `offeredPrice` - Price offered by rider
- `acceptedPrice` - Final agreed price
- `pickupLocation` - Where rider will pick up vehicle
- `paymentType` - online, physical, or pending
- `approvedAt` - Timestamp of approval
- `approvedBy` - Driver who approved
- `pickupTime` - When vehicle was picked up
- `returnTime` - When vehicle was returned

#### NegotiationHistory Table - NEW:
- Tracks all negotiation offers
- Links to Ride and User
- Stores offered price, message, and status

#### RideSharePosts Table - New Columns:
- `pickupLocation` - Where vehicle is available
- `allowedDestinations` - JSON array of allowed destinations
- `vehicleId` - Link to RideShareVehicle
- `negotiable` - Whether price can be negotiated
- `minPrice` / `maxPrice` - Price bounds

#### HirePosts Table - New Columns:
- `negotiable` - Whether rate can be negotiated
- `minRate` / `maxRate` - Rate bounds
- `requiresApproval` - Whether owner must approve

---

## How to Run Migration

### Option 1: pgAdmin (Recommended)
```
1. Open pgAdmin
2. Connect to database
3. Query Tool → Open file
4. Select: backend/migrations/add_negotiation_workflow.sql
5. Execute (F5)
```

### Option 2: Node.js
```powershell
cd backend
node -e "const {sequelize} = require('./models'); const fs = require('fs'); const sql = fs.readFileSync('./migrations/add_negotiation_workflow.sql', 'utf8'); sequelize.query(sql).then(() => console.log('Migration complete!')).catch(console.error);"
```

---

## Verification

After running migration, verify:

```sql
-- Check Rides table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Rides' 
AND column_name IN ('negotiationStatus', 'paymentType');

-- Check NegotiationHistory table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'NegotiationHistory';
```

---

## Next Steps

After migration is complete:
1. ✅ Run migration script
2. ⏳ Implement backend API endpoints (Phase 2-4)
3. ⏳ Update frontend components (Phase 5-7)
4. ⏳ Test complete workflow

Migration is ready to run!
