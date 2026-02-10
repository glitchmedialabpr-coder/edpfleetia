import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    try {
      // Intentar validar desde cookie HttpOnly primero
      const response = await base44.functions.invoke('getCurrentUserFromCookie', {});
      
      if (response?.data?.authenticated && response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth validation error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}