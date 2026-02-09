import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app init, validate session from sessionStorage
  // Enhanced for APK stability - ensures sessionStorage is accessible
  useEffect(() => {
    const validateSession = async () => {
      try {
        // Add delay for APK WebView initialization
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let sessionToken;
        try {
          sessionToken = sessionStorage.getItem('session_token');
        } catch (storageError) {
          console.warn('sessionStorage access failed:', storageError);
          sessionToken = null;
        }

        if (sessionToken) {
          const response = await base44.functions.invoke('getCurrentUser', { 
            session_token: sessionToken 
          });
          
          if (response?.data?.success) {
            setUser(response.data.user);
          } else {
            try {
              sessionStorage.removeItem('session_token');
            } catch (e) {
              console.warn('sessionStorage cleanup failed:', e);
            }
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        try {
          sessionStorage.removeItem('session_token');
        } catch (e) {
          console.warn('sessionStorage cleanup failed:', e);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (sessionToken) => {
    try {
      // Enhanced sessionStorage handling for APK
      try {
        sessionStorage.setItem('session_token', sessionToken);
      } catch (storageError) {
        console.error('sessionStorage write failed:', storageError);
        return { success: false, error: 'Storage not available' };
      }

      const response = await base44.functions.invoke('getCurrentUser', { 
        session_token: sessionToken 
      });
      
      if (response?.data?.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        try {
          sessionStorage.removeItem('session_token');
        } catch (e) {
          console.warn('sessionStorage cleanup failed:', e);
        }
        setUser(null);
        return { success: false, error: response?.data?.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      try {
        sessionStorage.removeItem('session_token');
      } catch (e) {
        console.warn('sessionStorage cleanup failed:', e);
      }
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    let sessionToken;
    try {
      sessionToken = sessionStorage.getItem('session_token');
    } catch (e) {
      console.warn('sessionStorage read failed:', e);
    }

    try {
      if (sessionToken) {
        await base44.functions.invoke('logout', { session_token: sessionToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    try {
      sessionStorage.removeItem('session_token');
    } catch (e) {
      console.warn('sessionStorage cleanup failed:', e);
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