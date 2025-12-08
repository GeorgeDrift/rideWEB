# RideWEB — Detailed Documentation

This document describes the RideWEB front-end and back-end architecture, core features, typical flows, setup steps, and common troubleshooting notes. It's intended for developers who want to understand, run, or maintain the app.

**Overview**
- Purpose: A two-sided ride & vehicle-hire marketplace connecting drivers and riders with real-time tracking, negotiation, payments, and analytics.
- Main UI: React + TypeScript front-end (Vite) with Tailwind CSS and Recharts.
- Backend: Node.js / Express (folder: `backend/`) with PostgreSQL scripts and utilities.

**Actors**
- Driver: Create posts (ride-share & hire), manage vehicles, accept/decline requests, stream location, view analytics.
- Rider: Browse marketplace, request or negotiate, track driver in real time, pay, and rate trips.
- Admin: Manage settings, pricing zones, user verification, and global analytics.

**Key Features**
- Marketplace: Ride-share listings and For-hire (vehicle rental) listings.
- Booking & Negotiation: Riders can request or counter-offer; drivers approve or counter.
- Real-time events: Socket.IO for notifications, trip lifecycle events, and live driver location updates.
- Trip lifecycle: Pending → Scheduled → Inbound → Arrived → Boarded → In Progress → Payment Due → Completed.
- Payments: Mobile money (Airtel, Mpamba), card integrations (PayChangu hooks), and cash/handover flows for hires.
- Fleet & Inventory: Drivers add/manage vehicles, tie hires to vehicle inventory.
- Messaging: In-app conversations between riders and drivers.
- Documents: Upload license/verification files, admin verification flows.
- Analytics: Earnings, trips, distance, on-time stats shown with charts.

**Important Files / Locations**
- Frontend components: `components/DriverDashboard.tsx`, `components/RiderDashboard.tsx`, and other `components/*.tsx`.
- API wrappers: `services/api.ts` — centralized REST calls used across components.
- Socket helpers: `services/socket.ts` — socket connect/disconnect and event helpers.
- Polling helper: `services/polling.ts` — start/stop named polls.
- Map utils: `services/mapUtils.ts` — `geocodeAddress`, `calculateDistance` (expects `[lng, lat]`).
- Backend entry: `backend/server.js`, and backend scripts in `backend/`.

**Getting Started (Local Development)**
Prerequisites: Node.js, PostgreSQL

1) Backend

```powershell
cd backend
npm install
# create .env in backend with DATABASE_URL and JWT_SECRET
node seed.js    # optional: seeds DB (may drop existing tables)
npm run dev     # or `npm start` depending on package.json
```

2) Frontend

```powershell
cd ..\
npm install
npm run dev
# Open http://localhost:5173 (Vite default) or the port shown by the dev server
```

Notes: On Windows PowerShell use `;` if combining commands on one line.

**Core Flows (Annotated)**

1) Booking a Ride (Rider)
- Rider browses marketplace and submits a request (`ApiService.createRide` / `POST /api/rides`).
- Backend stores the request and notifies relevant drivers via socket rooms (or pub/sub).
- Driver receives a pending approval notification; driver approves via API.
- When approved, rider receives `request_approved` socket event and is prompted to choose payment or confirm pickup.

2) Driver Lifecycle
- Driver toggles online/offline. When online, the app calls `navigator.geolocation.watchPosition` to stream location updates to server (via `socketService.updateDriverLocation`).
- Driver can accept a job which updates a `Ride` status and triggers socket events: `trip_started`, `driver_arrived`, `driver_end_trip` etc.

3) Payments (Hire flow)
- After driver confirms handover, backend emits `payment_selection_required`.
- Rider chooses payment timing/method; mobile money push or card flow is initiated (`/api/payment/initiate`).

**Common Troubleshooting**

- Duplicate Polling: Some components use both `pollingService.startPolling(...)` and manual `setInterval(...)` for the same endpoints. This causes duplicate requests and race conditions. Remove one strategy for each data key (prefer `pollingService`).

- Coordinate Ordering: Mapbox and `services/mapUtils.ts` use `[lng, lat]`. Ensure components also use `[lng, lat]` consistently. A common bug is using `[lat, lng]` in defaults or state.

- Token Decoding: Components decode JWTs with `atob(token.split('.')[1])` without validating token shape. Add checks to avoid exceptions when token missing or malformed.

- ID Normalization: Comparing IDs using `Number(...)` fails for IDs like `driver_123`. Use `String(...)` normalization before comparing, e.g. `String(a) === String(b)`.

- Socket Handler Cleanup: Ensure `socketService.off(event, handler)` is used when the socket wrapper supports handler removal by reference. If `off(event)` removes all handlers, be deliberate about disconnect timing.

**Recommended Immediate Fixes (Priority)**
1. Make coordinate format consistent across the app and convert any swapped default values.
2. Remove the duplicate `geocodeAddress` definition inside `DriverDashboard.tsx` to use the centralized `services/mapUtils.ts` implementation.
3. Replace `Number(...)` comparisons for IDs with `String(...)` comparisons.
4. Deduplicate polling: keep only `pollingService` usage and remove duplicate `setInterval` blocks.
5. Add defensive checks around JWT parsing.

**Developer Tips & Debugging Commands**
- To inspect frontend console logs, run the dev server (`npm run dev`) and open the browser DevTools (Console and Network tabs).
- To see backend logs, run `cd backend; npm run dev` and watch stdout.
- If you see repeated network requests for the same endpoint, search the codebase for duplicate polling keys (e.g., `driver-jobs`, `driver-posts`) and deduplicate.

**If you want me to apply fixes**
- I can open the files and patch the items listed under "Recommended Immediate Fixes." After applying patches I will attempt to run the frontend dev server and report any errors.

---

If you'd like this condensed into a README-style page or converted to a markdown file in `docs/` with images/diagrams, tell me which layout you prefer and I will generate it.
