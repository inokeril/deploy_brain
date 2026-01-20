import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useTelegram } from './TelegramContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [isLoading, setIsLoading] = useState(true);
  const [authType, setAuthType] = useState(null); // 'telegram' or 'emergent'
  const [sessionToken, setSessionToken] = useState(null);
  
  const { isTelegram, initData, isReady: telegramReady, user: telegramUser } = useTelegram();

  // Telegram authentication
  const authenticateWithTelegram = useCallback(async () => {
    if (!initData) {
      console.log('No Telegram initData available');
      return false;
    }

    try {
      console.log('Authenticating with Telegram...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/telegram`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ init_data: initData }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setAuthType('telegram');
        setSessionToken(data.session_token);
        console.log('Telegram auth successful:', data.user);
        return true;
      } else {
        const error = await response.json();
        console.error('Telegram auth failed:', error);
        return false;
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      return false;
    }
  }, [initData]);

  // Check existing session
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        setAuthType(userData.auth_type || 'emergent');
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Emergent Auth login (existing)
  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthType('emergent');
    if (token) setSessionToken(token);
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthType(null);
      setSessionToken(null);
    }
  };

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Wait for Telegram context to be ready
      if (!telegramReady) {
        return;
      }
      
      // First, check if we have an existing session
      const hasSession = await checkAuth();
      
      if (!hasSession && isTelegram && initData) {
        // No existing session, but we're in Telegram - authenticate
        await authenticateWithTelegram();
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [telegramReady, isTelegram, initData, checkAuth, authenticateWithTelegram]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authType,
    sessionToken,
    isTelegram,
    login,
    logout,
    checkAuth,
    authenticateWithTelegram,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
