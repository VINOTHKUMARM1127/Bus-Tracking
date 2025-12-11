import { useEffect, useRef, useState } from 'react';
import { api, setAuthToken } from './api.js';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('scbt_driver_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('scbt_driver_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('scbt_driver_token', token);
    } else {
      localStorage.removeItem('scbt_driver_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('scbt_driver_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('scbt_driver_user');
    }
  }, [user]);

  // Check server tracking status on mount if user is logged in
  useEffect(() => {
    if (token && user) {
      checkTrackingStatus();
    }
  }, [token, user]);

  const checkTrackingStatus = async () => {
    try {
      const { data } = await api.get('/driver/status');
      if (data.isTracking) {
        // Server says tracking is active, sync local state
        setTracking(true);
        setStatus('Tracking is active. Sending every 10s');
        
        // Send current location immediately
        try {
          const coords = await requestPosition();
          await sendLocation(coords);
        } catch (err) {
          console.error('Failed to send initial location:', err);
          setError('Location permission required');
          // If permission denied, stop tracking on server
          try {
            await api.post('/driver/location/stop');
            setTracking(false);
          } catch (stopErr) {
            console.error('Failed to stop tracking on server:', stopErr);
          }
          return;
        }
        
        // Restart the location sending interval
        timerRef.current = setInterval(async () => {
          try {
            const c = await requestPosition();
            await sendLocation(c);
          } catch (err) {
            console.error('Location send failed', err);
            setError('Failed to send location');
          }
        }, 10000);
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

  const login = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const username = form.get('username');
    const password = form.get('password');
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data.user.role !== 'driver') {
        setError('Driver account required');
        return;
      }
      setUser(data.user);
      setToken(data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    stopTracking();
    setUser(null);
    setToken(null);
  };

  const sendLocation = async (coords) => {
    const payload = {
      lat: coords.latitude,
      lng: coords.longitude,
      speed: coords.speed || 0,
      heading: coords.heading || 0,
      accuracy: coords.accuracy || 0
    };
    
    // Use offline queue for reliability
    const { offlineQueue } = await import('./utils/offlineQueue.js');
    await offlineQueue.addLocation(payload);
  };

  const requestPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    });

  const startTracking = async () => {
    setStatus('Requesting location...');
    setError('');
    try {
      const coords = await requestPosition();
      await sendLocation(coords);
      setTracking(true);
      setStatus('Tracking started. Sending every 10s');
      timerRef.current = setInterval(async () => {
        try {
          const c = await requestPosition();
          await sendLocation(c);
        } catch (err) {
          console.error('Location send failed', err);
          setError('Failed to send location');
        }
      }, 10000);
    } catch (err) {
      setError(err.message || 'Permission denied');
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

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-sm">
          <h1 className="text-lg font-semibold mb-4 text-gray-800">Driver Login</h1>
          <form className="space-y-4" onSubmit={login}>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Username</label>
              <input
                className="w-full border rounded px-3 py-2"
                name="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="password"
                name="password"
                required
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              Hello, {user.username}
            </div>
            <div className="text-sm text-gray-500">Bus: {user.busNumber || 'N/A'}</div>
          </div>
          <button
            className="text-sm text-red-600 underline"
            onClick={logout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
        <div className="p-4 rounded border bg-gray-50 space-y-2">
          <div className="text-sm text-gray-700">
            Share your live location. Keep this page open while driving.
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            {!tracking ? (
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={startTracking}
              >
                Start Tracking
              </button>
            ) : (
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                onClick={stopTracking}
              >
                Stop Tracking
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Status: {tracking ? 'Active' : 'Inactive'}
          </div>
          {status && <div className="text-sm text-green-700">{status}</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <div className="text-xs text-gray-500">
          Note: This app does not show a map. It only sends your GPS to admin.
        </div>
      </div>
    </div>
  );
}


