# Smart Bus Tracking System

A comprehensive web-based solution for real-time tracking of college/transport buses. This project consists of a centralized backend server, an admin dashboard for monitoring, and a driver application for broadcasting live location data.

## 🚀 Project Overview

The Smart Bus Tracking System is designed to provide real-time location updates of buses to administrators. It solves the problem of fleet management by allowing admins to visualize all active buses on a live map, while drivers use a simple mobile-friendly interface to share their location.

### Key Components

1.  **Backend Server (API)**: Handles authentication, data storage (MongoDB), and location processing.
2.  **Admin Dashboard**: A web portal for administrators to manage drivers and view live bus locations on an interactive map.
3.  **Driver Application**: A mobile-responsive web app for drivers to log in and start broadcasting their GPS coordinates.

---

## ✨ Features

### 1. Authentication & Security
*   **Role-Based Access Control (RBAC)**: Distinct login flows for Admins and Drivers.
*   **JWT Authentication**: Secure session management using JSON Web Tokens.
*   **Encrypted Passwords**: All passwords tracked using `bcryptjs`.

### 2. Live Bus Tracking
*   **Real-Time Updates**: Drivers' locations are updated in real-time.
*   **Interactive Maps**: Admin dashboard uses `Leaflet` maps to pinpoint bus locations interactively.
*   **Auto-Polling**: The map automatically refreshes bus positions every 10 seconds to ensure up-to-date data without manual reloads.

### 3. Driver Management
*   **Bus Assignment**: Drivers are linked to specific Bus Numbers for easy identification.
*   **Status Indicators**: System tracks speed, heading, and accuracy of the GPS signal.

### 4. User Experience
*   **Responsive Design**: Built with `Tailwind CSS`, ensuring the Driver app works perfectly on mobile devices.
*   **Zero-Config Map**: Uses OpenStreetMap (OSM) via Leaflet, requiring no paid API keys (User-friendly).

---

## 🛠 Tech Stack

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Security**: Helmet, CORS, Bcrypt
*   **Logging**: Morgan

### Frontend (Admin & Driver)
*   **Build Tool**: Vite
*   **Framework**: React.js
*   **Styling**: Tailwind CSS
*   **Maps**: Leaflet / React-Leaflet
*   **HTTP Client**: Axios

---

## 📂 Project Structure

```
Web Bus tracking/
├── backend/                # Express API Server
│   ├── src/
│   │   ├── models/         # Mongoose Schemas (User, DriverLocation)
│   │   ├── routes/         # API Routes (Auth, Admin, Driver)
│   │   └── index.js        # Entry point
│   └── .env                # Backend config
│
├── frontend/
│   ├── admin/              # Admin Dashboard (React + Vite)
│   │   └── src/components/ # MapView, Sidebar, etc.
│   │
│   └── driver/             # Driver App (React + Vite)
│       └── src/            # Location tracking logic
│
└── README.md               # Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (installed locally or a cloud URI)

### 1. Backend Setup

Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/smart-bus
JWT_SECRET=your_super_secret_key_123
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
LOCATION_HISTORY_LIMIT=50
```

Start the server:
```bash
npm run dev
```

### 2. Admin Frontend Setup

Open a new terminal, navigate to the admin folder:
```bash
cd frontend/admin
npm install
```

Create a `.env` file in `frontend/admin/`:
```env
VITE_API_BASE=http://localhost:4000/api
```

Start the Admin app:
```bash
npm run dev -- --host --port 5173
```

### 3. Driver Frontend Setup

Open a third terminal, navigate to the driver folder:
```bash
cd frontend/driver
npm install
```

Create a `.env` file in `frontend/driver/`:
```env
VITE_API_BASE=http://localhost:4000/api
```

Start the Driver app:
```bash
npm run dev -- --host --port 5174
```

---

## 📖 Usage Guide

### 1. Admin Login (Monitoring)
1.  Open **http://localhost:5173** in your browser.
2.  Login using the credentials defined in your backend `.env` (Default: `admin` / `admin123`).
3.  You will see a dashboard. If drivers are active, their buses will appear on the map.

### 2. Driver Login (Broadcasting)
1.  Open **http://localhost:5174** on a mobile phone or separate browser window.
2.  **Note**: First, you must register a driver user via Postman/API or manually in DB (or use the default seed if available).
    *   *Tip: Use the Register API or ask the developer to add a registration feature.*
3.  Login as a driver.
4.  Click **"Start Tracking"**. The app will request GPS permissions using the browser's Geolocation API.
5.  Once active, the location is sent to the backend every few seconds.

### 3. Simulating Traffic
*   Open the Driver app in one window and start tracking.
*   Open the Admin app in another window side-by-side.
*   Watch as the marker moves on the Admin map when the Driver location updates!

---

## 🔗 API Endpoints

### Auth
*   `POST /api/auth/login` - Login for both Admin and Driver.
*   `POST /api/auth/register` - Create new users (Protected).

### Admin
*   `GET /api/admin/locations` - Fetch latest locations of all active drivers.

### Driver
*   `POST /api/driver/location` - Send current GPS coordinates.
