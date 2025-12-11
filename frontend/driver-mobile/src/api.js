import axios from 'axios';

// Get API base URL from environment variables or use default
// In Expo, use EXPO_PUBLIC_ prefix for environment variables
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

