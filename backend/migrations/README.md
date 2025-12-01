# Database Migration Instructions

## How to Run the Migration

Since `psql` is not in your PATH, use one of these methods:

### Option 1: Using pgAdmin (Recommended for Windows)
1. Open **pgAdmin**
2. Connect to your database
3. Right-click on your database → **Query Tool**
4. Open the file: `backend/migrations/add_missing_tables.sql`
5. Click **Execute** (F5)

### Option 2: Using DBeaver / DataGrip
1. Open your database client
2. Connect to your PostgreSQL database
3. Open SQL Editor
4. Load `backend/migrations/add_missing_tables.sql`
5. Execute the script

### Option 3: Using Node.js Script
Run this command from the `backend` directory:
```powershell
node -e "const {sequelize} = require('./models'); const fs = require('fs'); const sql = fs.readFileSync('./migrations/add_missing_tables.sql', 'utf8'); sequelize.query(sql).then(() => console.log('Migration complete!')).catch(err => console.error(err));"
```

### Option 4: Install psql and add to PATH
1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\<version>\bin`)
2. Add to PATH environment variable
3. Restart terminal
4. Run: `psql $env:DATABASE_URL -f migrations/add_missing_tables.sql`

## Verification

After running the migration, verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('RideSharePosts', 'HirePosts', 'Conversations', 'Notifications', 'RiderStats', 'DriverStats')
ORDER BY table_name;
```

You should see all 6 tables listed.
