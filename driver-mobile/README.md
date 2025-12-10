# Bus Driver Mobile App

Fresh React Native app built with Expo SDK 54 for Android drivers to track and send their location.

## Why This Works (Avoids TurboModule Errors)

This app is built from scratch to avoid PlatformConstants/TurboModule errors by:

1. **Using Only Expo Managed APIs**: All packages are from Expo SDK 54, no custom native modules
2. **No Background Location**: Uses foreground-only location tracking (no TaskManager/BackgroundFetch)
3. **Standard React Navigation**: Uses @react-navigation which is fully Expo Go compatible
4. **Clean Dependencies**: Only SDK 54 compatible packages, no version conflicts
5. **No Native Code**: Pure JavaScript/React Native, works perfectly in Expo Go

## Installation

### Step 1: Install Dependencies

```bash
cd driver-mobile
npm install
```

### Step 2: Configure Backend URL

Edit `src/services/api.js` and update the `API_BASE_URL`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

For local development, use your computer's IP address (not localhost):
```javascript
const API_BASE_URL = 'http://192.168.1.100:4000/api';
```

### Step 3: Start Development Server

```bash
npm start
```

Then scan the QR code with Expo Go app on your Android device.

## Project Structure

```
driver-mobile/
├── App.js                 # Main app with navigation
├── app.json               # Expo configuration (SDK 54)
├── package.json           # Dependencies
├── babel.config.js        # Babel config
└── src/
    ├── screens/
    │   ├── LoginScreen.js      # Driver login
    │   └── TrackingScreen.js   # Location tracking
    ├── services/
    │   └── api.js              # Backend API calls
    └── utils/
        └── storage.js          # Token storage
```

## Features

- **Login Screen**: Username/password authentication with JWT token storage
- **Tracking Screen**: Start/Stop location tracking
- **Foreground Location**: Gets GPS location every 10 seconds when tracking is ON
- **Permission Handling**: Requests location permission only when user taps "Start Tracking"
- **Status Display**: Shows tracking status (ON/OFF) and last sent location

## Technical Details

- **Expo SDK**: 54.0.0
- **React Native**: 0.76.5
- **React**: 18.3.1
- **Navigation**: React Navigation Native Stack
- **Location**: expo-location (foreground only)
- **Storage**: AsyncStorage
- **HTTP**: Axios

## Important Notes

- **Foreground Only**: Location updates stop when app goes to background
- **No Background Tasks**: This app does NOT use TaskManager or background location
- **Expo Go Compatible**: Works perfectly in Expo Go without any native builds
- **Android Only**: Configured for Android platform

## Troubleshooting

### "Unable to resolve module" errors
- Run `npm install` again
- Clear cache: `expo start -c`

### Location permission issues
- Make sure location permission is granted in Android settings
- The app requests permission when you tap "Start Tracking"

### Network errors
- Verify backend URL in `src/services/api.js`
- Check that backend server is running and accessible
- For local development, use IP address not localhost

## Development Commands

```bash
# Start Expo dev server
npm start

# Start and open on Android
npm run android

# Clear cache and restart
expo start -c
```

## Production Build

For production builds, you'll need:
1. Expo account
2. EAS Build: `eas build --platform android`

For now, Expo Go is perfect for development and testing!
