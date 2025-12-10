# Installation Guide

## Quick Start

### Step 1: Install Dependencies

```bash
cd driver-mobile
npm install
```

This will install all required packages compatible with Expo SDK 54.

### Step 2: Configure Backend URL

Open `src/services/api.js` and update the API URL:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

**For local development:**
- Use your computer's IP address (not `localhost`)
- Find your IP: 
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`
- Example: `http://192.168.1.100:4000/api`

### Step 3: Install Expo Go App

Download **Expo Go** from Google Play Store:
- [Expo Go - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 4: Start Development Server

```bash
npm start
```

This will:
- Start Metro bundler
- Display QR code in terminal
- Open Expo DevTools in browser

### Step 5: Connect Your Device

**Option A: Same WiFi Network (Recommended)**
1. Ensure Android device and computer are on same WiFi
2. Open Expo Go app
3. Tap "Scan QR code"
4. Scan QR code from terminal/browser
5. App will load automatically

**Option B: USB Connection**
1. Enable USB debugging on Android device
2. Connect via USB
3. Run: `npm run android`
4. App installs and launches automatically

## Why This Avoids TurboModule Errors

This fresh project avoids PlatformConstants/TurboModule errors because:

1. **Clean SDK 54 Setup**: All dependencies are exactly compatible with Expo SDK 54
2. **No Custom Native Code**: Uses only Expo managed APIs
3. **No Background Tasks**: Foreground location only (no TaskManager)
4. **Standard Packages**: Only well-tested Expo SDK packages
5. **Proper Configuration**: app.json configured correctly for SDK 54

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

### Location permission denied
- Go to Android Settings > Apps > Expo Go > Permissions
- Enable Location permission
- Restart app

### Network request failed
- Verify backend URL is correct in `src/services/api.js`
- Check backend server is running
- Ensure device can reach backend (same network or public URL)

### App won't load in Expo Go
- Update Expo Go to latest version
- Clear Expo Go cache: Settings > Clear cache
- Restart development server: `expo start -c`

## Verification

After installation, verify everything works:

1. ✅ App loads without red screen errors
2. ✅ Login screen appears
3. ✅ Can login with driver credentials
4. ✅ Tracking screen appears after login
5. ✅ "Start Tracking" button requests location permission
6. ✅ Location updates sent every 10 seconds when tracking is ON
7. ✅ "Stop Tracking" stops sending locations

## Next Steps

Once the app is running:

1. Test login with your driver credentials
2. Test location tracking (ensure GPS is enabled on device)
3. Verify locations appear in your backend/admin dashboard
4. Test stop tracking functionality

## Production Build (Future)

For production, you'll need:
- Expo account
- EAS Build: `eas build --platform android`

For development and testing, Expo Go is perfect!

