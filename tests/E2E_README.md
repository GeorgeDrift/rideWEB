Playwright E2E test for Driver posting flow

Prerequisites
- Node.js installed
- Frontend dev server running (Vite) on http://localhost:5173
- Backend server running on http://localhost:5000 (backend/.env must be configured and DB accessible)

Install Playwright (once per machine):

```powershell
# from repo root
npm install -D @playwright/test
# install browser binaries (required)
npx playwright install
```

Run the tests

Make sure both frontend and backend are running, then run:

```powershell
npm run test:e2e
```

Test details
- The test logs in with these test credentials (created by backend/test_create_posts.js):
  - Email: dev-driver@example.com
  - Password: password
- The test will: log in, navigate to My Jobs, post a Ride-Share listing and a For-Hire listing, and assert each shows in "Your Active Listings".
