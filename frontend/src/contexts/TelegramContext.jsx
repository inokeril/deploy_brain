import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const TelegramContext = createContext(null);

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};

export const TelegramProvider = ({ children }) => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [colorScheme, setColorScheme] = useState('light');
  const [themeParams, setThemeParams] = useState({});
  const [initData, setInitData] = useState('');

  useEffect(() => {
    // Check if we're inside Telegram WebApp
    const tg = window.Telegram?.WebApp;
    
    if (tg && tg.initData) {
      setWebApp(tg);
      setIsTelegram(true);
      setInitData(tg.initData);
      
      // Get user data
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
      
      // Get theme
      setColorScheme(tg.colorScheme || 'light');
      setThemeParams(tg.themeParams || {});
      
      // Tell Telegram that the WebApp is ready
      tg.ready();
      
      // Expand the WebApp to full height
      tg.expand();
      
      // Enable closing confirmation (optional)
      // tg.enableClosingConfirmation();
      
      // Listen to theme changes
      tg.onEvent('themeChanged', () => {
        setColorScheme(tg.colorScheme);
        setThemeParams(tg.themeParams || {});
      });
      
      // Listen to viewport changes
      tg.onEvent('viewportChanged', (event) => {
        if (event.isStateStable) {
          // Viewport is stable
        }
      });
      
      setIsReady(true);
      console.log('Telegram WebApp initialized:', {
        user: tg.initDataUnsafe?.user,
        colorScheme: tg.colorScheme,
        platform: tg.platform,
        version: tg.version
      });
    } else {
      // Not in Telegram, still mark as ready for regular browser
      setIsReady(true);
      console.log('Not running inside Telegram WebApp');
    }
    
    return () => {
      if (tg) {
        tg.offEvent('themeChanged');
        tg.offEvent('viewportChanged');
      }
    };
  }, []);

  // Haptic feedback
  const hapticImpact = useCallback((style = 'light') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style); // light, medium, heavy, rigid, soft
    }
  }, [webApp]);

  const hapticNotification = useCallback((type = 'success') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type); // error, success, warning
    }
  }, [webApp]);

  const hapticSelection = useCallback(() => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  }, [webApp]);

  // Main Button
  const showMainButton = useCallback((text, onClick, options = {}) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      
      if (options.color) {
        webApp.MainButton.color = options.color;
      }
      if (options.textColor) {
        webApp.MainButton.textColor = options.textColor;
      }
      
      webApp.MainButton.show();
    }
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const setMainButtonLoading = useCallback((loading) => {
    if (webApp?.MainButton) {
      if (loading) {
        webApp.MainButton.showProgress();
      } else {
        webApp.MainButton.hideProgress();
      }
    }
  }, [webApp]);

  // Back Button
  const showBackButton = useCallback((onClick) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);

  // Alerts and Popups
  const showAlert = useCallback((message, callback) => {
    if (webApp) {
      webApp.showAlert(message, callback);
    } else {
      alert(message);
      callback?.();
    }
  }, [webApp]);

  const showConfirm = useCallback((message, callback) => {
    if (webApp) {
      webApp.showConfirm(message, callback);
    } else {
      const result = window.confirm(message);
      callback?.(result);
    }
  }, [webApp]);

  const showPopup = useCallback((params, callback) => {
    if (webApp) {
      webApp.showPopup(params, callback);
    }
  }, [webApp]);

  // Close the WebApp
  const close = useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  // Open link
  const openLink = useCallback((url, options) => {
    if (webApp) {
      webApp.openLink(url, options);
    } else {
      window.open(url, '_blank');
    }
  }, [webApp]);

  // Open Telegram link
  const openTelegramLink = useCallback((url) => {
    if (webApp) {
      webApp.openTelegramLink(url);
    }
  }, [webApp]);

  // Get CSS variables for Telegram theme
  const getCSSVariables = useCallback(() => {
    if (!themeParams || Object.keys(themeParams).length === 0) {
      return {};
    }
    
    return {
      '--tg-theme-bg-color': themeParams.bg_color || '#ffffff',
      '--tg-theme-text-color': themeParams.text_color || '#000000',
      '--tg-theme-hint-color': themeParams.hint_color || '#999999',
      '--tg-theme-link-color': themeParams.link_color || '#2481cc',
      '--tg-theme-button-color': themeParams.button_color || '#2481cc',
      '--tg-theme-button-text-color': themeParams.button_text_color || '#ffffff',
      '--tg-theme-secondary-bg-color': themeParams.secondary_bg_color || '#f0f0f0',
      '--tg-theme-header-bg-color': themeParams.header_bg_color || '#ffffff',
      '--tg-theme-accent-text-color': themeParams.accent_text_color || '#2481cc',
      '--tg-theme-section-bg-color': themeParams.section_bg_color || '#ffffff',
      '--tg-theme-section-header-text-color': themeParams.section_header_text_color || '#999999',
      '--tg-theme-subtitle-text-color': themeParams.subtitle_text_color || '#999999',
      '--tg-theme-destructive-text-color': themeParams.destructive_text_color || '#ff3b30',
    };
  }, [themeParams]);

  const value = {
    webApp,
    user,
    isReady,
    isTelegram,
    colorScheme,
    themeParams,
    initData,
    // Haptic
    hapticImpact,
    hapticNotification,
    hapticSelection,
    // Main Button
    showMainButton,
    hideMainButton,
    setMainButtonLoading,
    // Back Button
    showBackButton,
    hideBackButton,
    // Popups
    showAlert,
    showConfirm,
    showPopup,
    // Actions
    close,
    openLink,
    openTelegramLink,
    // Theme
    getCSSVariables,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};
