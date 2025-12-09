import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('scbt_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('scbt_admin_token'));
  const [loading, setLoading] = useState(false);
  const isAuthed = Boolean(token && user);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('scbt_admin_token', token);
    } else {
      localStorage.removeItem('scbt_admin_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('scbt_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('scbt_admin_user');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      setUser(data.user);
      setToken(data.token);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


