import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('devflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveSession = (token, userData) => {
    localStorage.setItem('devflow_token', token);
    localStorage.setItem('devflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      saveSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithToken = useCallback((token, userData) => {
    saveSession(token, userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('devflow_token');
    localStorage.removeItem('devflow_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
