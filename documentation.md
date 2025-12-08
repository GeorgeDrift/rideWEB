
# Ridex Admin Dashboard Documentation

## Overview

The **Ridex Admin Dashboard** is a comprehensive, React-based web application designed for managing a ride-sharing and vehicle hire platform. It provides real-time analytics, operational management for drivers and riders, pricing configuration, and revenue tracking.

The application utilizes a modern yellow/dark-themed UI built with **Tailwind CSS** and offers interactive data visualization using **Recharts**.

## Backend Setup (SQL / PostgreSQL)

Follow these steps to get the Node.js backend running with **PostgreSQL**.

### 1. Prerequisites
- Install [Node.js](https://nodejs.org/).
- Install [PostgreSQL](https://www.postgresql.org/download/).
- Create a new database named `ridex` in PostgreSQL.

### 2. Environment Variables (`.env`)

Create a file named `.env` inside the `backend/` folder and paste the following code:

```env
# --- Server Configuration ---
PORT=5000
NODE_ENV=development

# --- Database Connection ---
# Update with your Postgres username, password, and database name
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ridex

# --- Security ---
JWT_SECRET=ridex_secure_super_secret_key_2024

# --- External Services ---
MAPBOX_TOKEN=pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg
```

### 3. Database Initialization & Seeding

Run the seed script to create tables (sync) and populate initial data.

```bash
cd backend
npm install
node seed.js
```

**Note**: The `seed.js` script uses `sequelize.sync({ force: true })`, which will **drop existing tables** and recreate them. Use this for initial setup only.

### 4. Start Server

```bash
npm start
# or for development with auto-restart:
npm run dev
```

---

## 👑 Admin Features & Roles

### Role: Super Admin
**Access Level:** Full System Control

### Key Functionalities
1.  **Live Operations**:
    *   **Map**: Real-time 3D map tracking of all active drivers and rides using Mapbox GL.
    *   **Status**: Monitor online/offline status of the fleet.
2.  **Financials**:
    *   **Revenue**: Visual analytics of net income, payouts, and platform fees.
    *   **Transactions**: Audit log of all mobile money payments and cash settlements.
3.  **Pricing Control**:
    *   **Base Rates**: Set standard per-km and per-minute fees.
    *   **Surge Zones**: Draw polygons on the map to create dynamic pricing zones with multipliers (e.g., 1.5x in Downtown).
4.  **User Management**:
    *   **Drivers**: Approve applications, view vehicle documents, suspend accounts.
    *   **Riders**: Monitor customer activity and ratings.
5.  **Ride Management**:
    *   View detailed history of Ride Share and Vehicle Hire trips (hire requests are stored in the `Rides` table with `type = 'hire'`).
    *   Handle disputes and cancellations.

---

## 👤 Rider (Passenger) Features & Roles

### Role: Rider
**Access Level:** Standard User (Own Data + Marketplace)

### Key Functionalities
1.  **Ride Discovery & Booking**:
    *   **Marketplace**: Browse "Ride Share" (Point A to B) and "For Hire" (Vehicle rental) listings.
    *   **Negotiation**: Ability to accept listed prices or submit counter-offers (Bidding).
2.  **Active Trip Management**:
    *   **Live Tracking**: Real-time map view of assigned driver location.
    *   **Status Updates**: Monitor progress from `Inbound` -> `Arrived` -> `In Progress` -> `Payment`.
    *   **Safety**: Boarding confirmation and driver details (Plate, Name, Rating).
3.  **Financials**:
    *   **Secure Payments**: Integration with Airtel Money, Mpamba, and Card payments via PayChangu.
    *   **History**: View personal spending history and trip receipts.
4.  **Communication**:
    *   **Chat**: In-app messaging with drivers.
    *   **Rating**: Rate drivers and vehicles after trips.

### Data Dictionary (PostgreSQL)

| Entity | Description | Key Fields |
| :--- | :--- | :--- |
| **User** | System users (Admin, Driver, Rider) | `id`, `name`, `email`, `role`, `rating`, `walletBalance`, `accountStatus` |
| **Ride** | Trip records | `id`, `type` (share/hire), `origin`, `destination`, `price`, `status`, `driverId`, `riderId` |
| **Vehicle** | Driver inventory | `id`, `plate`, `model`, `category`, `status`, `rate` |
| **PricingZone** | Surge areas | `id`, `name`, `multiplier`, `coordinates` (JSON) |
| **Transaction** | Financial records | `id`, `amount`, `type`, `status`, `reference`, `method` |
| **SystemSetting** | Global Config | `key`, `value`, `description` |

---

## API Endpoints Reference

### 🔐 Authentication
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | `name`, `email`, `password`, `role`, `phone` |
| `POST` | `/api/auth/login` | Login user | `email`, `password` |
| `GET` | `/api/auth/me` | Get current profile | (Requires Token) |

### 🚗 Rides & Hire (consolidated)
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rides` | Request a ride (share or hire). Note: legacy "Jobs" entries were consolidated into the `Rides` table with `type = 'hire'` | `origin`, `destination`, `type` ('share'/'hire'), `price` |
| `GET` | `/api/rides/my-rides` | Get user's history | - |
| `GET` | `/api/rides/marketplace/share` | Get available shared rides | - |
| `PUT` | `/api/rides/:id/status` | Update ride status | `status` (e.g. 'In Progress', 'Completed') |

### 🚛 Driver Operations
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/driver/vehicles` | List my vehicles | - |
| `POST` | `/api/driver/vehicles` | Add vehicle to fleet | `name`, `plate`, `category`, `rate` |
| `GET` | `/api/driver/stats` | Get earnings stats | - |
| `GET` | `/api/driver/marketplace/hire` | Public list of hire vehicles | - |

### 👤 Rider (Passenger) Features
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rider/profile` | Get rider profile | - |
| `PUT` | `/api/rider/profile` | Update profile | `name`, `phone`, `avatar` |
| `GET` | `/api/rider/stats` | Get spending stats | - |

### 👑 Admin
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Get global stats | - |
| `POST` | `/api/admin/pricing-zones` | Create surge zone | `name`, `multiplier`, `coordinates` |
| `GET` | `/api/admin/settings` | Get base rates | - |
| `PUT` | `/api/admin/settings` | Update base rates | `baseFare`, `perKm`, `perMin` |

### 💰 Payments
| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/initiate` | Start PayChangu payment | `rideId`, `amount`, `mobileNumber`, `provider` |
