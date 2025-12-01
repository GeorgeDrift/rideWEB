# Payment System Testing Guide

## Prerequisites
1. Database is running and schema is applied
2. Backend server is running (`npm start` in backend folder)
3. Frontend is running (if testing UI)

## Step 1: Create Test Users

Run this command to create test users in the database:

```bash
cd backend
node create-test-users.js
```

**Test Credentials:**
- **Passenger**: `passenger@test.com` / `password123`
- **Driver**: `driver@test.com` / `password123`

---

## Step 2: Test Complete Payment Flow

### A. Ride Payment (Passenger → Driver)

**Scenario:** Passenger pays for a ride, driver receives 100% in their wallet.

1. **Login as Passenger** (via frontend or API)
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: { "email": "passenger@test.com", "password": "password123" }
   ```
   Save the JWT token.

2. **Create a Ride** (or use existing ride ID)

3. **Initiate Payment**
   ```bash
   POST http://localhost:5000/api/payments/initiate
   Headers: { "Authorization": "Bearer YOUR_PASSENGER_TOKEN" }
   Body: {
     "rideId": "YOUR_RIDE_ID",
     "amount": 5000,
     "mobileNumber": "0999111111",
     "providerRefId": "20be6c20-adeb-4b5b-a7ba-0769820df4fb"
   }
   ```
   
4. **Verify Payment** (simulate successful payment)
   ```bash
   GET http://localhost:5000/api/payments/verify/CHARGE_ID
   Headers: { "Authorization": "Bearer YOUR_PASSENGER_TOKEN" }
   ```

5. **Check Driver Wallet**
   - Driver's wallet should now have 5000 MWK

---

### B. Driver Payout (Driver Withdrawal)

**Scenario:** Driver withdraws money from their wallet to mobile money.

1. **Login as Driver**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: { "email": "driver@test.com", "password": "password123" }
   ```
   Save the JWT token.

2. **Request Payout**
   ```bash
   POST http://localhost:5000/api/payments/payout
   Headers: { "Authorization": "Bearer YOUR_DRIVER_TOKEN" }
   Body: {
     "amount": 1000,
     "mobileNumber": "0999222222",
     "providerRefId": "20be6c20-adeb-4b5b-a7ba-0769820df4fb"
   }
   ```

3. **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "Payout processed successfully",
     "newBalance": 4000
   }
   ```

4. **Check Results:**
   - Driver's wallet: 5000 → 4000 MWK
   - Driver receives SMS from Airtel Money
   - Transaction recorded in database

---

## Step 3: Test Error Scenarios

### Insufficient Balance
```bash
POST http://localhost:5000/api/payments/payout
Body: { "amount": 10000, ... }  # More than wallet balance
```
**Expected:** `400 Bad Request - Insufficient balance`

### Invalid Operator
```bash
POST http://localhost:5000/api/payments/initiate
Body: { "providerRefId": "invalid-id", ... }
```
**Expected:** `500 Error from PayChangu`

---

## Step 4: Automated Testing Scripts

### Run All Tests
```bash
# Test payment flow
node backend/test-payment-flow.js

# Test payout
node backend/test-payout.js

# Test PayChangu connection
node backend/test-paychangu.js
```

---

## Monitoring

### Check Database Records
```sql
-- View all transactions
SELECT * FROM "Transactions" ORDER BY "createdAt" DESC LIMIT 10;

-- View driver wallet
SELECT id, name, email, "walletBalance" FROM "Users" WHERE role = 'driver';

-- View completed rides
SELECT * FROM "Rides" WHERE status = 'Completed' ORDER BY "createdAt" DESC;
```

---

## Troubleshooting

### Payment Fails
1. Check PayChangu API credentials in `.env`
2. Verify mobile number format (should start with 0)
3. Check PayChangu dashboard for transaction logs

### Payout Fails
1. Ensure driver has sufficient wallet balance
2. Verify PayChangu merchant wallet has funds
3. Check driver's registered mobile number

### Database Errors
1. Ensure schema is applied: `psql -U postgres -d ridex -f backend/schema.sql`
2. Check database connection in `.env`
