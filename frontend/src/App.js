import "@/App.css";
import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

// Router component to handle session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check for session_id in URL fragment (synchronous check before routing)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
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
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
