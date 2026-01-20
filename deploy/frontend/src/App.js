import "@/App.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { TelegramProvider, useTelegram } from "@/contexts/TelegramContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import SchultePage from "@/pages/SchultePage";
import SpotDifferencePage from "@/pages/SpotDifferencePage";
import StroopPage from "@/pages/StroopPage";
import CatchLetterPage from "@/pages/CatchLetterPage";
import WhackMolePage from "@/pages/WhackMolePage";
import TypingPage from "@/pages/TypingPage";
import SequencePage from "@/pages/SequencePage";
import MathPage from "@/pages/MathPage";
import Competitions from "@/pages/Competitions";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";

// Theme adapter component
function TelegramThemeAdapter({ children }) {
  const { isTelegram, colorScheme, getCSSVariables, themeParams } = useTelegram();

  useEffect(() => {
    if (isTelegram && themeParams) {
      const cssVars = getCSSVariables();
      const root = document.documentElement;
      
      // Apply Telegram theme CSS variables
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Set color scheme class
      if (colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = themeParams.bg_color || '#1c1c1d';
        document.body.style.color = themeParams.text_color || '#ffffff';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = themeParams.bg_color || '#ffffff';
        document.body.style.color = themeParams.text_color || '#000000';
      }
    }
  }, [isTelegram, colorScheme, themeParams, getCSSVariables]);

  return children;
}

// Router component to handle session_id detection
function AppRouter() {
  const location = useLocation();
  const { isTelegram, isReady } = useTelegram();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check for session_id in URL fragment (Emergent Auth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  // Show loading while checking auth
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            {isTelegram ? 'Загрузка...' : 'Проверка авторизации...'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes - only show login if not in Telegram */}
      <Route 
        path="/login" 
        element={
          isTelegram && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/schulte"
        element={
          <ProtectedRoute>
            <SchultePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/spot-difference"
        element={
          <ProtectedRoute>
            <SpotDifferencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/stroop"
        element={
          <ProtectedRoute>
            <StroopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/catch-letter"
        element={
          <ProtectedRoute>
            <CatchLetterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/whack-mole"
        element={
          <ProtectedRoute>
            <WhackMolePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/sequence"
        element={
          <ProtectedRoute>
            <SequencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/math"
        element={
          <ProtectedRoute>
            <MathPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercise/typing"
        element={
          <ProtectedRoute>
            <TypingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitions"
        element={
          <ProtectedRoute>
            <Competitions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TelegramProvider>
        <TelegramThemeAdapter>
          <AuthProvider>
            <div className="min-h-screen bg-background transition-colors duration-200">
              <AppRouter />
            </div>
          </AuthProvider>
        </TelegramThemeAdapter>
      </TelegramProvider>
    </BrowserRouter>
  );
}

export default App;
