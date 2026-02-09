import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app init, validate session from sessionStorage
  useEffect(() => {
    const validateSession = async () => {
      try {
        const sessionToken = sessionStorage.getItem('session_token');
        if (sessionToken) {
          const response = await base44.functions.invoke('getCurrentUser', { 
            session_token: sessionToken 
          });
          
          if (response?.data?.success) {
            setUser(response.data.user);
          } else {
            sessionStorage.removeItem('session_token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        sessionStorage.removeItem('session_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (sessionToken) => {
    try {
      sessionStorage.setItem('session_token', sessionToken);
      const response = await base44.functions.invoke('getCurrentUser', { 
        session_token: sessionToken 
      });
      
      if (response?.data?.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        sessionStorage.removeItem('session_token');
        setUser(null);
        return { success: false, error: response?.data?.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      sessionStorage.removeItem('session_token');
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    const sessionToken = sessionStorage.getItem('session_token');
    try {
      await base44.functions.invoke('logout', { session_token: sessionToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    sessionStorage.removeItem('session_token');
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