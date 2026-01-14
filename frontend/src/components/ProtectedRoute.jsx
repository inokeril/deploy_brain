import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
