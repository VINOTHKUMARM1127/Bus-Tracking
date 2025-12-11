import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { api, setAuthToken } from '@/utils/api';
import { storage } from '@/utils/storage';
import { offlineQueue } from '@/utils/offlineQueue';

interface User {
  username: string;
  busNumber?: string;
  role: string;
}

export default function DriverTrackingScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadUser();
    
    // Check for queued locations
    const checkQueue = async () => {
      const count = await offlineQueue.getQueueSize();
      setQueuedCount(count);
      if (count > 0) {
        await offlineQueue.syncQueue();
        const newCount = await offlineQueue.getQueueSize();
        setQueuedCount(newCount);
      }
    };
    
    checkQueue();
    const queueInterval = setInterval(checkQueue, 30000); // Check every 30s
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearInterval(queueInterval);
    };
  }, []);

  const checkTrackingStatus = async () => {
    try {
      const { data } = await api.get('/driver/status');
      if (data.isTracking) {
        // Server says tracking is active, sync local state
        // Check if we have location permission before starting interval
        const hasPermission = await requestLocationPermission();
        
        if (hasPermission) {
          setTracking(true);
          setStatus('Tracking is active. Sending every 10s');
          
          // Send current location immediately
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            await sendLocation(location);
          } catch (err) {
            console.error('Failed to send initial location:', err);
          }
          
          // Restart the location sending interval
          timerRef.current = setInterval(async () => {
            try {
              const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
              await sendLocation(currentLocation);
            } catch (err) {
              console.error('Location send failed', err);
              setError('Failed to send location');
            }
          }, 10000);
        } else {
          // Permission not granted, stop tracking on server
          setTracking(false);
          try {
            await api.post('/driver/location/stop');
          } catch (err) {
            console.error('Failed to stop tracking on server:', err);
          }
          setError('Location permission required. Please enable location access.');
        }
      } else {
        // Server says tracking is inactive
        setTracking(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed to check tracking status:', err);
      // If status check fails, assume inactive
      setTracking(false);
    }
  };

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      const userData = await storage.getUser();

      if (!token || !userData) {
        router.replace('/driver/login');
        return;
      }

      setAuthToken(token);
      setUser(userData);
      
      // Check server tracking status and sync
      await checkTrackingStatus();
      
      // Check for ongoing trip
      await checkOngoingTrip();
    } catch (err) {
      console.error('Failed to load user:', err);
      router.replace('/driver/login');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const sendLocation = async (coords: Location.LocationObject) => {
    const payload = {
      lat: coords.coords.latitude,
      lng: coords.coords.longitude,
      speed: coords.coords.speed || 0,
      heading: coords.coords.heading || 0,
      accuracy: coords.coords.accuracy || 0,
    };
    
    // Try to send, fallback to offline queue
    const sent = await offlineQueue.addLocation(payload);
    if (!sent) {
      // Queued for later sync
      console.log('Location queued for offline sync');
    }
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      setError('Location permission is required to track your position');
      Alert.alert(
        'Permission Required',
        'Please enable location permissions in your device settings to use tracking.'
      );
      return;
    }

    setStatus('Requesting location...');
    setError('');

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      await sendLocation(location);
      setTracking(true);
      setStatus('Tracking started. Sending every 10s');

      timerRef.current = setInterval(async () => {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          await sendLocation(currentLocation);
        } catch (err) {
          console.error('Location send failed', err);
          setError('Failed to send location');
        }
      }, 10000);
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setTracking(false);
    }
  };

  const stopTracking = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTracking(false);
    setStatus('Tracking stopped');
    
    try {
      await api.post('/driver/location/stop');
    } catch (err) {
      console.error('Stop tracking failed', err);
    }
  };

  const checkOngoingTrip = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/trips/driver/ongoing');
      if (data) {
        setCurrentTrip(data);
      }
    } catch (err) {
      console.error('Failed to check ongoing trip:', err);
    }
  };

  const handleStartTrip = async () => {
    // TODO: Show route selection modal
    // For now, show message - in production, fetch routes and show selection
    Alert.alert(
      'Start Trip',
      'Route selection coming soon. Please assign a route in admin panel first, then the trip will start automatically when you begin tracking.',
      [{ text: 'OK' }]
    );
    
    // Future implementation:
    // 1. Fetch available routes: GET /api/routes?assignedDriver=USER_ID
    // 2. Show route selection modal
    // 3. Start trip with selected route
  };

  const handleEndTrip = async () => {
    if (!currentTrip) return;
    
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/trips/driver/${currentTrip._id}/end`);
              setCurrentTrip(null);
              setStatus('Trip ended successfully');
            } catch (err: any) {
              setError(err.response?.data?.message || 'Failed to end trip');
            }
          }
        }
      ]
    );
  };

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
            stopTracking();
            await storage.setToken(null);
            await storage.setUser(null);
            setAuthToken(null);
            router.replace('/driver/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hello, {user.username}</Text>
            <Text style={styles.busNumber}>Bus: {user.busNumber || 'N/A'}</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.trackingCard}>
          <Text style={styles.infoText}>
            Share your live location. Keep this app open while driving.
          </Text>

          <View style={styles.buttonContainer}>
            {!tracking ? (
              <Pressable
                style={[styles.button, styles.startButton]}
                onPress={startTracking}
              >
                <Text style={styles.buttonText}>Start Tracking</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, styles.stopButton]}
                onPress={stopTracking}
              >
                <Text style={styles.buttonText}>Stop Tracking</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>
              Status: <Text style={styles.statusValue}>{tracking ? 'Active' : 'Inactive'}</Text>
            </Text>
          </View>

          {status ? (
            <Text style={styles.successText}>{status}</Text>
          ) : null}

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {queuedCount > 0 && (
            <Text style={styles.warningText}>
              {queuedCount} location(s) queued for sync
            </Text>
          )}
        </View>

        {/* Trip Management */}
        {tracking && (
          <View style={styles.tripCard}>
            <Text style={styles.tripTitle}>Trip Management</Text>
            {!currentTrip ? (
              <Pressable
                style={[styles.button, styles.startButton]}
                onPress={handleStartTrip}
              >
                <Text style={styles.buttonText}>Start Trip</Text>
              </Pressable>
            ) : (
              <View>
                <Text style={styles.tripStatus}>
                  Trip Active
                </Text>
                <Pressable
                  style={[styles.button, styles.stopButton]}
                  onPress={handleEndTrip}
                >
                  <Text style={styles.buttonText}>End Trip</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Note: This app does not show a map. It only sends your GPS to admin.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  busNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutText: {
    fontSize: 14,
    color: '#dc2626',
    textDecorationLine: 'underline',
  },
  trackingCard: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  button: {
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  startButton: {
    backgroundColor: '#16a34a',
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  successText: {
    fontSize: 14,
    color: '#16a34a',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 8,
  },
  noteContainer: {
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  tripCard: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  tripStatus: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 8,
  },
});

