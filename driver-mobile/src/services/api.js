import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

// Update this URL to match your backend
// For local development, use your computer's IP address (not localhost)
// Example: 'http://192.168.1.100:4000/api'
const API_BASE_URL = 'https://bus-tracking-backend-brown.vercel.app/api';

/**
 * API Service using Axios
 * 
 * This uses standard axios for HTTP requests, which works perfectly
 * in Expo Go without requiring any native modules or TurboModules.
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
    }
    return Promise.reject(error);
  }
);

/**
 * Login with username and password
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Login failed');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Send location to backend
 */
export const sendLocation = async (lat, lng, speed, heading, accuracy) => {
  try {
    const payload = {
      lat,
      lng,
    };
    
    if (speed !== undefined && speed !== null) {
      payload.speed = speed;
    }
    if (heading !== undefined && heading !== null) {
      payload.heading = heading;
    }
    if (accuracy !== undefined && accuracy !== null) {
      payload.accuracy = accuracy;
    }

    const response = await api.post('/driver/location', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to send location');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Stop tracking
 */
export const stopTracking = async () => {
  try {
    const response = await api.post('/driver/location/stop');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to stop tracking');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export default api;

