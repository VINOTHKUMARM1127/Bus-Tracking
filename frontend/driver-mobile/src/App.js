import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from './api';

const STORAGE_KEYS = {
  TOKEN: 'scbt_driver_token',
  USER: 'scbt_driver_user',
};

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const timerRef = useRef(null);

  // Load stored token and user on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Update auth token in API when token changes
  useEffect(() => {
    setAuthToken(token);
    if (token) {
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  // Save user data when it changes
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  const loadStoredData = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error loading stored data:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data.user.role !== 'driver') {
        setError('Driver account required');
        setLoading(false);
        return;
      }
      setUser(data.user);
      setToken(data.token);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    stopTracking();
    setUser(null);
    setToken(null);
    setStatus('');
    setError('');
  };

  const sendLocation = async (coords) => {
    const payload = {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: coords.speed || 0,
      heading: coords.heading || 0,
      accuracy: coords.accuracy || 0,
    };
    await api.post('/driver/location', payload);
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
  };

  const getCurrentPosition = async () => {
    await requestLocationPermission();
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      maximumAge: 5000,
    });
    return location.coords;
  };

  const startTracking = async () => {
    setStatus('Requesting location permission...');
    setError('');
    setLoading(true);

    try {
      const coords = await getCurrentPosition();
      await sendLocation(coords);
      setTracking(true);
      setStatus('Tracking started. Sending location every 10 seconds');
      setLoading(false);

      timerRef.current = setInterval(async () => {
        try {
          const c = await getCurrentPosition();
          await sendLocation(c);
        } catch (err) {
          console.error('Location send failed', err);
          setError('Failed to send location');
        }
      }, 10000);
    } catch (err) {
      setError(err.message || 'Permission denied');
      setTracking(false);
      setLoading(false);
      Alert.alert('Location Error', err.message || 'Unable to access location');
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

  if (loading && !token) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!token || !user) {
    return (
      <ScrollView contentContainerStyle={styles.loginContainer}>
        <StatusBar style="auto" />
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Driver Login</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user.username}</Text>
            <Text style={styles.busNumber}>
              Bus: {user.busNumber || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackingCard}>
          <Text style={styles.infoText}>
            Share your live location. Keep this app open while driving.
          </Text>
          <View style={styles.buttonContainer}>
            {!tracking ? (
              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={startTracking}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Start Tracking</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.stopButton]}
                onPress={stopTracking}
              >
                <Text style={styles.buttonText}>Stop Tracking</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.statusText}>
            Status: {tracking ? 'Active' : 'Inactive'}
          </Text>
          {status ? <Text style={styles.successText}>{status}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Text style={styles.noteText}>
          Note: This app does not show a map. It only sends your GPS to admin.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  busNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    color: '#dc2626',
    textDecorationLine: 'underline',
  },
  trackingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButton: {
    backgroundColor: '#6366f1',
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
  statusText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
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
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
});

