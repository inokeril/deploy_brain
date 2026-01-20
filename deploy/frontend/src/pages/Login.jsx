import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Trophy, Target } from 'lucide-react';
import { useTelegram } from '@/contexts/TelegramContext';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isTelegram, themeParams } = useTelegram();
  const { isAuthenticated, isLoading } = useAuth();

  // If in Telegram and authenticated, redirect to dashboard
  useEffect(() => {
    if (isTelegram && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isTelegram, isAuthenticated, navigate]);

  // If in Telegram but not authenticated, show loading (auth should happen automatically)
  if (isTelegram) {
    if (isLoading) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: themeParams?.bg_color || '#ffffff' }}
        >
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4"
              style={{ borderColor: themeParams?.button_color || '#9333ea' }}
            ></div>
            <p style={{ color: themeParams?.text_color }}>
              Авторизация через Telegram...
            </p>
          </div>
        </div>
      );
    }

    // If in Telegram and auth failed, show error
    if (!isAuthenticated) {
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
              Не удалось авторизоваться через Telegram. Попробуйте закрыть и открыть приложение снова.
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

    return null;
  }

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Тренировка Мозга
          </h1>
          <p className="text-xl text-gray-600">
            Развивайте внимание, память и скорость реакции
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">9 упражнений</h3>
                <p className="text-sm text-gray-600">
                  Разнообразные тренировки для развития мозга
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Соревнования</h3>
                <p className="text-sm text-gray-600">
                  Еженедельные турниры с призами
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-pink-300 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-2">Система уровней</h3>
                <p className="text-sm text-gray-600">
                  Отслеживайте свой прогресс и рост
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Начните тренировки</CardTitle>
            <CardDescription>
              Войдите с помощью Google, чтобы сохранять результаты
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Входя в систему, вы соглашаетесь с условиями использования
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Присоединяйтесь к тысячам пользователей, тренирующих свой мозг каждый день!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
