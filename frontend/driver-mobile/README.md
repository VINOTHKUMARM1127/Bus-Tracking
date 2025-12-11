# Driver Mobile App (Expo SDK 54)

React Native mobile app for bus drivers to track and share their location in real-time.

## Features

- Driver authentication
- Real-time GPS location tracking
- Automatic location updates every 10 seconds
- Background location tracking support

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app installed on your Android device (SDK 54)

## Setup

1. Install dependencies:
```bash
cd frontend/driver-mobile
npm install
```

2. Configure API endpoint:
   - Copy `env.example` to `.env` (or set environment variable)
   - Update `EXPO_PUBLIC_API_BASE` with your backend API URL
   - For local testing, use your computer's IP address (e.g., `http://192.168.1.100:4000/api`)

3. (Optional) Create assets folder:
   - Create an `assets` folder in the project root
   - Add `icon.png` (1024x1024), `splash.png`, `adaptive-icon.png`, and `favicon.png`
   - Or Expo will use default placeholders

4. Start the development server:
```bash
npm start
```

5. Scan the QR code with Expo Go app on your Android device (SDK 54)

## Android Development

To run on Android:
```bash
npm run android
```

## Environment Variables

- `EXPO_PUBLIC_API_BASE`: Backend API base URL (default: http://localhost:4000/api)

## Permissions

The app requires the following permissions:
- Location (Foreground and Background)

These are automatically configured in `app.json`.

## Troubleshooting

### PlatformConstants Error

If you encounter the `PlatformConstants could not be found` error:

1. **Clear all caches and reinstall:**
   ```bash
   npm cache clean --force
   rm -rf node_modules .expo package-lock.json
   npm install
   npx expo start --clear
   ```

2. **Update Expo Go app** on your Android device to the latest version

3. **Verify your Expo Go app supports SDK 54** - check the app version in Google Play Store

4. See `TROUBLESHOOTING.md` for more detailed solutions

## Notes

- Make sure your backend API is running and accessible from your device
- For local development, use your computer's IP address instead of `localhost`
- Example: `http://192.168.1.100:4000/api`
- Always start Expo with `--clear` flag if you encounter module errors: `npx expo start --clear`

