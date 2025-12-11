# Troubleshooting Guide

## PlatformConstants Error

If you're seeing the error:
```
TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found
```

Follow these steps in order:

### Step 1: Clear All Caches

```bash
# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start --clear

# Or delete cache manually
rm -rf node_modules
rm -rf .expo
rm package-lock.json
```

### Step 2: Reinstall Dependencies

```bash
npm install
```

### Step 3: Restart Expo

```bash
# Stop the current Expo server (Ctrl+C)
# Then start fresh with cleared cache
npx expo start --clear
```

### Step 4: Update Expo Go App

- Make sure your Expo Go app on your Android device is updated to the latest version
- The app should support Expo SDK 54
- If needed, uninstall and reinstall Expo Go from Google Play Store

### Step 5: Check Node and npm Versions

```bash
node --version  # Should be v16 or higher
npm --version   # Should be v7 or higher
```

### Step 6: Verify Package Versions

Make sure your `package.json` has:
- `expo`: `~54.0.0`
- `react`: `18.3.1`
- `react-native`: `0.76.5`

### Step 7: Try Development Build (If Expo Go Still Fails)

If the issue persists with Expo Go, you may need to create a development build:

```bash
npx expo prebuild
npx expo run:android
```

## Other Common Issues

### Location Permission Not Working

- Make sure location permissions are granted in Android settings
- Check that `app.json` has the location plugin configured

### API Connection Issues

- Use your computer's IP address instead of `localhost`
- Make sure your device and computer are on the same network
- Check that the backend server is running and accessible

### Metro Bundler Issues

```bash
# Reset Metro bundler
npx expo start --clear

# Or kill the process and restart
# On Windows: Find and kill node processes
# Then restart with: npm start
```

