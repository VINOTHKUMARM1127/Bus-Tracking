import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { sendLocation, stopTracking } from '../services/api';
import { removeToken } from '../utils/storage';

/**
 * Tracking Screen
 * 
 * IMPORTANT: This uses ONLY foreground location tracking.
 * 
 * Why this avoids TurboModule/PlatformConstants errors:
 * 1. Uses expo-location which is a managed Expo API (no native module access)
 * 2. Uses getCurrentPositionAsync() for foreground updates only
 * 3. NO background location tracking
 * 4. NO TaskManager or BackgroundFetch
 * 5. NO custom native code
 * 
 * Location updates are requested manually via setInterval when tracking is ON.
 * This ensures compatibility with Expo Go SDK 54.
 */
export default function TrackingScreen({ navigation }) {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Not tracking');
  const [lastLocation, setLastLocation] = useState(null);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Request location permission
   * Called only when user taps "Start Tracking"
   */
  const requestPermission = async () => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your bus.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  };

  /**
   * Send location to backend
   */
  const sendLocationUpdate = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, speed, heading, accuracy } = location.coords;

      await sendLocation(
        latitude,
        longitude,
        speed || null,
        heading || null,
        accuracy || null
      );

      setLastLocation({
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        accuracy: accuracy ? `${Math.round(accuracy)}m` : 'N/A',
      });
      setError(null);
    } catch (error) {
      console.error('Location send error:', error);
      setError(error.message || 'Failed to send location');
    }
  };

  /**
   * Start tracking
   * Requests permission, then starts sending location every 10 seconds
   */
  const startTracking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      // Send initial location immediately
      await sendLocationUpdate();

      // Set up interval to send location every 10 seconds
      intervalRef.current = setInterval(() => {
        sendLocationUpdate();
      }, 10000); // 10 seconds

      setIsTracking(true);
      setStatus('Tracking active');
    } catch (error) {
      console.error('Start tracking error:', error);
      Alert.alert('Error', 'Failed to start tracking');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stop tracking
   */
  const handleStopTracking = async () => {
    setIsLoading(true);

    try {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Notify backend
      await stopTracking();

      setIsTracking(false);
      setStatus('Tracking stopped');
      setError(null);
    } catch (error) {
      console.error('Stop tracking error:', error);
      Alert.alert('Error', 'Failed to stop tracking');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (isTracking) {
              await handleStopTracking();
            }
            await removeToken();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusIndicator, isTracking && styles.statusIndicatorActive]}>
            <Text style={styles.statusText}>{isTracking ? 'ON' : 'OFF'}</Text>
          </View>
          <Text style={styles.statusDescription}>{status}</Text>
        </View>

        {/* Last Location Info */}
        {lastLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Last Location Sent:</Text>
            <Text style={styles.locationText}>
              Lat: {lastLocation.lat}, Lng: {lastLocation.lng}
            </Text>
            <Text style={styles.locationText}>Accuracy: {lastLocation.accuracy}</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isTracking ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonStart, isLoading && styles.buttonDisabled]}
              onPress={startTracking}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Start Tracking</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.buttonStop, isLoading && styles.buttonDisabled]}
              onPress={handleStopTracking}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Stop Tracking</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicatorActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusDescription: {
    fontSize: 16,
    color: '#666',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonStart: {
    backgroundColor: '#4CAF50',
  },
  buttonStop: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

