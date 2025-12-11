import axios from 'axios';
import Constants from 'expo-constants';

// Get API base URL from environment or use default
// You can set this in app.json under expo.extra.apiBase or use EXPO_PUBLIC_API_BASE
const API_BASE = 
  process.env.EXPO_PUBLIC_API_BASE || 
  Constants.expoConfig?.extra?.apiBase || 
  'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

