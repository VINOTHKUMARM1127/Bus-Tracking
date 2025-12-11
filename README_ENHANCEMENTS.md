# Smart Bus Tracking System - New Features Documentation

## Overview
This document describes all the new features added to the Smart Bus Tracking System. These enhancements include Route Management, Trip Lifecycle, Speed Monitoring, Geofencing, Real-time Updates, Offline Sync, Analytics, and more.

## New Features Summary

### ✅ Backend Features

#### 1. Route Management
- **Models**: `backend/src/models/Route.js`
- **APIs**: 
  - `POST /api/routes` - Create route
  - `GET /api/routes` - List all routes
  - `GET /api/routes/:id` - Get route details
  - `PUT /api/routes/:id` - Update route
  - `DELETE /api/routes/:id` - Delete route (soft delete)
  - `POST /api/routes/:id/assign-driver` - Assign driver to route

#### 2. Trip Lifecycle
- **Models**: `backend/src/models/Trip.js`
- **APIs**:
  - `POST /api/trips/driver/start` - Driver starts a trip
  - `POST /api/trips/driver/:id/end` - Driver ends a trip
  - `GET /api/trips` - Admin: List trips with filters
  - `GET /api/trips/:id` - Get trip details
  - `GET /api/trips/:id/locations` - Get trip location history

#### 3. Speed Monitoring & Alerts
- **Models**: `backend/src/models/Alert.js`
- **Features**:
  - Automatic speed checking on location updates
  - Configurable threshold (env: `OVERSPEED_THRESHOLD` or per-route)
  - Creates alert records when speed exceeded
  - Real-time Socket.io notifications

#### 4. Geofencing (Out-of-Route) Alerts
- **Utilities**: `backend/src/utils/geofencing.js`
- **Features**:
  - Polygon and circle geofence support
  - Automatic checking on location updates
  - Creates alerts when driver goes out of route
  - Calculates distance from route

#### 5. Real-time Tracking with Socket.io
- **Integration**: `backend/src/index.js`
- **Events Emitted**:
  - `location:update` - New location received
  - `trip:update` - Trip started/ended/location added
  - `alert:new` - New alert created
- **Configuration**: `ENABLE_SOCKET_IO=true` in `.env`

#### 6. Bulk Location Sync
- **API**: `POST /api/driver/locations/bulk`
- **Purpose**: Sync queued locations when driver comes back online
- **Features**: Deduplication, retry logic, error handling

#### 7. Analytics Endpoints
- **APIs**: `backend/src/routes/analytics.routes.js`
  - `GET /api/analytics/dashboard-stats` - Overall statistics
  - `GET /api/analytics/trips-per-day` - Daily trip counts
  - `GET /api/analytics/avg-trip-duration` - Average trip metrics
  - `GET /api/analytics/top-overspeed-drivers` - Top offenders

#### 8. Public API (Student App)
- **API**: `GET /api/buses/live`
- **Returns**: Live bus locations with ETA to stops
- **No authentication required**

### ✅ Frontend Admin Features

#### New Pages
1. **Routes** (`/routes`)
   - List all routes
   - Create/Edit routes
   - Assign drivers to routes
   - View route details

2. **Trips** (`/trips`)
   - View trip history
   - Filter by status, driver, route
   - View trip details and location path

3. **Analytics** (`/analytics`)
   - Dashboard with key metrics
   - Charts: Trips per day, Top overspeed drivers
   - Real-time statistics

4. **Alerts** (`/alerts`)
   - View all alerts (overspeed, out-of-route)
   - Filter by type, status, severity
   - Acknowledge alerts

#### Real-time Updates
- Socket.io client integration
- Automatic map updates when locations change
- Fallback to polling if socket disconnected
- Real-time alert notifications

### ✅ Driver App Features

#### Offline Sync
- **React Native**: `myapp/utils/offlineQueue.ts`
- **Web**: `frontend/driver/src/utils/offlineQueue.js`
- **Features**:
  - Queues locations when offline
  - Automatic sync on reconnect
  - Deduplication by timestamp
  - Retry with exponential backoff
  - Max queue size limit

#### Trip Management
- Start trip (requires route assignment)
- End trip
- View current trip status
- Automatic location tracking during trips

## Installation & Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend Admin:**
```bash
cd frontend/admin
npm install
```

**Driver Apps:**
Dependencies already installed (socket.io-client, recharts, etc.)

### 2. Run Migrations

```bash
cd backend
node src/scripts/migrations/001_add_routes_trips_alerts.js
```

### 3. Seed Sample Data (Optional)

```bash
cd backend
node src/scripts/seed.js
```

This creates:
- Admin user: `admin` / `admin123`
- Driver 1: `driver1` / `driver123` (assigned to Route 1)
- Driver 2: `driver2` / `driver123`
- Sample route with stops
- Sample completed trip

### 4. Update Environment Variables

See updated `.env.sample` files in each folder for new variables:
- `OVERSPEED_THRESHOLD`
- `ENABLE_SOCKET_IO`
- `SOCKET_IO_PATH`
- `GEOHASH_PRECISION`

### 5. Start Services

**Backend:**
```bash
cd backend
npm run dev
```

**Admin Frontend:**
```bash
cd frontend/admin
npm run dev
```

**Driver Web:**
```bash
cd frontend/driver
npm run dev
```

**Driver Mobile (Expo):**
```bash
cd myapp
npm start
```

## API Endpoints Reference

### Routes
- `POST /api/routes` - Create route
- `GET /api/routes` - List routes
- `GET /api/routes/:id` - Get route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `POST /api/routes/:id/assign-driver` - Assign driver

### Trips
- `POST /api/trips/driver/start` - Start trip (driver)
- `POST /api/trips/driver/:id/end` - End trip (driver)
- `GET /api/trips` - List trips (admin, with filters)
- `GET /api/trips/:id` - Get trip details
- `GET /api/trips/:id/locations` - Get trip location history

### Alerts
- `GET /api/alerts` - List alerts (admin, with filters)
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/alerts/unacknowledged/count` - Get unacknowledged count

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/analytics/trips-per-day` - Daily trip counts
- `GET /api/analytics/avg-trip-duration` - Average duration stats
- `GET /api/analytics/top-overspeed-drivers` - Top overspeed drivers

### Public
- `GET /api/buses/live` - Live bus locations with ETA (no auth)

### Driver
- `POST /api/driver/location` - Send location (enhanced with trip integration)
- `POST /api/driver/locations/bulk` - Bulk sync queued locations
- `GET /api/driver/status` - Get current tracking status

## Sample API Requests

### Create Route
```bash
curl -X POST http://localhost:4000/api/routes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Route 1",
    "stops": [
      {"lat": 12.9716, "lng": 77.5946, "name": "Start", "etaOrder": 0},
      {"lat": 12.9352, "lng": 77.6245, "name": "Stop 1", "etaOrder": 1}
    ],
    "geofence": {
      "type": "circle",
      "coords": {"center": [12.9352, 77.6245], "radius": 5000}
    },
    "speedLimit": 60
  }'
```

### Start Trip (Driver)
```bash
curl -X POST http://localhost:4000/api/trips/driver/start \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"routeId": "ROUTE_ID", "busId": "BUS-001"}'
```

### Get Live Buses (Public)
```bash
curl http://localhost:4000/api/buses/live
```

## Navigation Structure

### Admin App
- **Dashboard** (`/`) - Overview with stats and live map
- **Drivers** (`/drivers`) - Manage drivers
- **Routes** (`/routes`) - Manage routes ⭐ NEW
- **Trips** (`/trips`) - View trip history ⭐ NEW
- **Analytics** (`/analytics`) - Analytics dashboard ⭐ NEW
- **Alerts** (`/alerts`) - View and manage alerts ⭐ NEW
- **Map** (`/map`) - Live map view

### Driver App
- **Login** (`/driver/login`) - Driver authentication
- **Tracking** (`/driver/tracking`) - Location tracking with trip management ⭐ ENHANCED

## Key Files Created/Modified

### Backend
- `src/models/Route.js` ⭐ NEW
- `src/models/Trip.js` ⭐ NEW
- `src/models/Alert.js` ⭐ NEW
- `src/utils/distance.js` ⭐ NEW
- `src/utils/geofencing.js` ⭐ NEW
- `src/utils/validators.js` ⭐ NEW
- `src/controllers/routeController.js` ⭐ NEW
- `src/controllers/tripController.js` ⭐ NEW
- `src/controllers/alertController.js` ⭐ NEW
- `src/controllers/analyticsController.js` ⭐ NEW
- `src/routes/route.routes.js` ⭐ NEW
- `src/routes/trip.routes.js` ⭐ NEW
- `src/routes/alert.routes.js` ⭐ NEW
- `src/routes/analytics.routes.js` ⭐ NEW
- `src/routes/public.routes.js` ⭐ NEW
- `src/index.js` ⭐ MODIFIED (Socket.io integration)
- `src/routes/driver.routes.js` ⭐ MODIFIED (bulk sync, trip integration)
- `src/models/User.js` ⭐ MODIFIED (added assignedRoute)

### Frontend Admin
- `src/pages/Routes/RouteList.jsx` ⭐ NEW
- `src/pages/Routes/RouteEditor.jsx` ⭐ NEW
- `src/pages/Routes/AssignDriverModal.jsx` ⭐ NEW
- `src/pages/Trips/TripHistory.jsx` ⭐ NEW
- `src/pages/Analytics/AnalyticsDashboard.jsx` ⭐ NEW
- `src/pages/Alerts/AlertsPage.jsx` ⭐ NEW
- `src/hooks/useSocket.js` ⭐ NEW
- `src/App.jsx` ⭐ MODIFIED (added routes, Socket.io)
- `src/components/Layout.jsx` ⭐ MODIFIED (added navigation)

### Driver Apps
- `myapp/utils/offlineQueue.ts` ⭐ NEW
- `frontend/driver/src/utils/offlineQueue.js` ⭐ NEW
- `myapp/app/driver/tracking.tsx` ⭐ MODIFIED (offline sync, trips)
- `frontend/driver/src/App.jsx` ⭐ MODIFIED (offline sync)

## Testing

### Manual Testing Steps

1. **Route Management**:
   - Create a route via admin panel
   - Add stops with coordinates
   - Assign a driver to the route

2. **Trip Lifecycle**:
   - Driver logs in and starts tracking
   - Driver starts a trip (requires route assignment)
   - Driver ends trip
   - Admin views trip history

3. **Speed Monitoring**:
   - Driver sends location with speed > threshold
   - Check alerts page for overspeed alert
   - Verify Socket.io notification

4. **Geofencing**:
   - Create route with geofence
   - Driver sends location outside geofence
   - Check alerts for out-of-route alert

5. **Offline Sync**:
   - Disconnect network
   - Driver app continues tracking (queues locations)
   - Reconnect network
   - Verify locations sync automatically

6. **Real-time Updates**:
   - Open admin map
   - Driver sends location
   - Map updates immediately (if Socket.io connected)

## Troubleshooting

### Socket.io not connecting
- Check `ENABLE_SOCKET_IO=true` in backend `.env`
- Check `VITE_SOCKET_IO_URL` in admin `.env`
- Verify CORS settings allow Socket.io origin

### Offline queue not syncing
- Check network connectivity
- Verify `/api/driver/locations/bulk` endpoint accessible
- Check browser console for errors

### Alerts not appearing
- Verify speed threshold is set correctly
- Check route has geofence configured
- Verify location updates include speed data

## Next Steps / TODO

1. **Route Editor Map Integration**: Add map picker for selecting stops (Leaflet/Google Maps)
2. **Trip Route Selection**: Add UI for drivers to select route when starting trip
3. **Enhanced Analytics**: Add more chart types and date range filters
4. **Student App**: Create simple React app for passengers to view live buses
5. **Push Notifications**: Re-implement if needed (FCM removed per request)
6. **Testing**: Add comprehensive Jest tests for new endpoints

## Support

For issues or questions, check:
- Backend logs: `backend/` console output
- Frontend console: Browser dev tools
- Socket.io connection: Check browser Network tab for WebSocket

