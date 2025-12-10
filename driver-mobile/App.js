import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import { getToken } from './src/utils/storage';

const Stack = createNativeStackNavigator();

/**
 * Main App Component
 * 
 * This is a clean implementation that avoids TurboModule issues by:
 * 1. Using only Expo managed APIs (no direct native module access)
 * 2. Using React Navigation which is fully compatible with Expo Go
 * 3. Avoiding any custom native code or TurboModule registrations
 * 4. Using standard Expo SDK 54 packages only
 * 
 * The app checks for stored authentication token on startup and
 * navigates accordingly.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsReady(true);
    }
  };

  // Don't render until auth check is complete
  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Tracking' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tracking"
          component={TrackingScreen}
          options={{
            title: 'Bus Tracking',
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
