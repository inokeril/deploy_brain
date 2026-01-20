import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth, isTelegram } = useAuth();
  const { colorScheme, themeParams } = useTelegram();
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(location.state?.user ? false : true);

  useEffect(() => {
    // Skip auth check if user data was passed from AuthCallback
    if (location.state?.user) {
      setLocalLoading(false);
      return;
    }

    const verifyAuth = async () => {
      await checkAuth();
      setLocalLoading(false);
    };

    if (isAuthenticated === null) {
      verifyAuth();
    } else {
      setLocalLoading(false);
    }
  }, [isAuthenticated, location.state, checkAuth]);

  if (isLoading || localLoading) {
    // Adaptive loading screen for Telegram
    const bgColor = isTelegram && themeParams?.bg_color 
      ? themeParams.bg_color 
      : undefined;
    const textColor = isTelegram && themeParams?.text_color
      ? themeParams.text_color
      : undefined;
    const spinnerColor = isTelegram && themeParams?.button_color
      ? themeParams.button_color
      : '#9333ea';

    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${!isTelegram ? 'bg-gradient-to-br from-purple-50 to-blue-50' : ''}`}
        style={isTelegram ? { backgroundColor: bgColor } : undefined}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-4"
            style={{ borderColor: spinnerColor, borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
          ></div>
          <p 
            className={`text-lg ${!isTelegram ? 'text-gray-600' : ''}`}
            style={isTelegram ? { color: textColor } : undefined}
          >
            Загрузка...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // In Telegram, if auth failed, show error instead of redirect
    if (isTelegram) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: themeParams?.bg_color || '#ffffff' }}
        >
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: themeParams?.text_color || '#000000' }}
            >
              Ошибка авторизации
            </h2>
            <p 
              className="mb-4"
              style={{ color: themeParams?.hint_color || '#999999' }}
            >
              Не удалось авторизоваться через Telegram. Попробуйте перезапустить приложение.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: themeParams?.button_color || '#2481cc',
                color: themeParams?.button_text_color || '#ffffff'
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
