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

      // Guardar tokens en localStorage
      const sessionToken = localStorage.getItem('session_token');
      const accessToken = localStorage.getItem('access_token');

      // Notificar login sin bloquear (fire and forget)
      if (sessionToken && accessToken) {
        base44.functions.invoke('notifyNewLogin', {
          user_id: userData.id,
          email: userData.email,
          ip_address: 'client',
          user_agent: navigator.userAgent,
          is_suspicious: false
        }).catch(err => console.error('Notification error:', err));
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Revocar tokens server-side
      if (user) {
        const sessionToken = localStorage.getItem('session_token');
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        await base44.functions.invoke('logoutUser', {
          session_token: sessionToken,
          access_token: accessToken,
          refresh_token: refreshToken
        });

        // Limpiar localStorage
        localStorage.removeItem('session_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }

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