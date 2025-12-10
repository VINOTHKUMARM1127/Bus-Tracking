# Smart Bus Tracking

Multi-app setup for live bus tracking with an admin dashboard and a driver client.

## Apps
- Backend: `backend/` (Express, MongoDB)
- Admin frontend: `frontend/admin/` (Vite + React)
- Driver frontend: `frontend/driver/` (Vite + React)

## Prerequisites
- Node 18+ recommended
- MongoDB running and reachable

## Environment
Create `.env` files (based on `env.sample` in each folder):

**backend/.env**
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/smart-bus
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
LOCATION_HISTORY_LIMIT=50
```

**frontend/admin/.env** (adjust to your backend URL)
```
VITE_API_BASE=http://localhost:4000/api
```

**frontend/driver/.env** (adjust to your backend URL)
```
VITE_API_BASE=http://localhost:4000/api
```

For Vercel/production, set `VITE_API_BASE` to your deployed backend URL, and set backend `CORS_ORIGIN` to the deployed frontend origins.

## Install
From repo root:
```bash
cd backend && npm install
cd ../frontend/admin && npm install
cd ../driver && npm install
```

## Run locally
Backend (port 4000):
```bash
cd backend
npm run dev
```

Admin app (port 5173):
```bash
cd frontend/admin
npm run dev -- --host --port 5173
```

Driver app (port 5174):
```bash
cd frontend/driver
npm run dev -- --host --port 5174
```

## Default admin
- Username: `admin`
- Password: `admin123`
(Change in backend `.env`.)

## Notes
- Admin consumes `/api/admin/*` and `/api/auth/login`.
- Driver app sends locations to `/api/driver/location`.
- Live map polls `/api/admin/locations` every 10s.
- Ensure HTTPS + correct CORS origins in production.

