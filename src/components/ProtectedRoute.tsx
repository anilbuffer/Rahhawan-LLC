import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type PortalRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  role: PortalRole;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
