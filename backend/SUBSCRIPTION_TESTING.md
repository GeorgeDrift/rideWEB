# Subscription Payment Backend Testing Guide

## Prerequisites
- Backend server running on port 3001 (or your configured port)
- Test driver account: `driver@ridex.com` / `password123`

## Test 1: Login and Get Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@ridex.com","password":"password123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "role": "driver" }
}
```

**Save the token for next steps!**

---

## Test 2: Get Subscription Plans

```bash
curl http://localhost:3001/api/subscriptions/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "plans": {
    "monthly": { "name": "Monthly Plan", "price": 49900, "duration": 30 },
    "quarterly": { "name": "Quarterly Plan", "price": 134900, "duration": 90 },
    "biannual": { "name": "Bi-Annual Plan", "price": 254900, "duration": 180 },
    "yearly": { "name": "Yearly Plan", "price": 479900, "duration": 365 }
  },
  "trialDays": 7
}
```

** Verify all 4 plans are returned with correct prices and durations**

---

## Test 3: Initiate Subscription Payment

```bash
curl -X POST http://localhost:3001/api/subscriptions/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "plan": "monthly",
    "mobileNumber": "+265991234567",
    "providerRefId": "airtel-money-ref-id"
  }'
```

**Expected Backend Terminal Logs:**
```
💰 [SUBSCRIPTION] User ... initiating Monthly Plan payment
✅ Transaction created: 12345
📤 Calling PayChangu...
📥 PayChangu response: {...}
🔑 Charge ID: abc-123
✅ SUCCESS! Payment initiated
```

**Expected API Response:**
```json
{
  "status": "success",
  "message": "Payment initiated. Please approve on your phone.",
  "chargeId": "abc-123"
}
```

**Save the chargeId for next step!**

---

## Test 4: Check Status (Before Payment)

```bash
curl http://localhost:3001/api/subscriptions/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "status": "inactive",
  "isTrial": true,
  "daysLeft": 7,
  "message": "You are on a 7-day trial"
}
```

---

## Test 5: Simulate Webhook (Payment Success)

```bash
curl -X POST http://localhost:3001/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "charge_id": "YOUR_CHARGE_ID_HERE",
    "status": "successful",
    "tx_ref": "YOUR_CHARGE_ID_HERE",
    "metadata": {
      "plan": "monthly",
      "duration": 30
    }
  }'
```

**Expected Backend Terminal Logs:**
```
Subscription webhook received: {...}
Subscription activated for user ... until [date]
```

**Expected API Response:**
```json
{
  "success": true,
  "message": "Subscription activated"
}
```

---

## Test 6: Check Status (After Payment)

```bash
curl http://localhost:3001/api/subscriptions/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "status": "active",
  "expiryDate": "2025-01-07T...",
  "daysLeft": 30,
  "isTrial": false,
  "canRenew": false
}
```

**✅ Verify status changed from 'inactive' to 'active'**

---

## Test 7: Get Payment History

```bash
curl http://localhost:3001/api/subscriptions/payment-history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "history": [
    {
      "plan": "monthly",
      "amount": 49900,
      "status": "active",
      "startDate": "2025-12-08T...",
      "endDate": "2026-01-07T...",
      "createdAt": "2025-12-08T..."
    }
  ]
}
```

**✅ Verify the payment appears in history**

---

## Verification Checklist

- [ ] Can login and get auth token
- [ ] Can fetch all 4 subscription plans with correct prices
- [ ] Payment initiation creates Transaction in database
- [ ] Backend logs show PayChangu API call with 3 parameters
- [ ] Webhook creates Subscription record
- [ ] Subscription status changes from inactive to active
- [ ] Payment appears in history
- [ ] Calendar shows paid days in gold (frontend)
- [ ] Status persists after page refresh (frontend)

---

## Troubleshooting

**If login fails:**
- Ensure backend is running: `npm run dev` in backend folder
- Check if driver@ridex.com user exists in database
- Verify port is 3001 (check backend/.env and server.js)

**If payment initiation fails:**
- Check backend terminal for error logs
- Verify PayChangu service is configured
- Check Transaction table exists in database

**If webhook fails:**
- Check Subscription table exists
- Verify User table has subscriptionStatus column
- Check backend logs for detailed error

**If status doesn't persist:**
- Check database for Subscription record
- Verify endDate is in the future
- Check User.subscriptionStatus is 'active'
