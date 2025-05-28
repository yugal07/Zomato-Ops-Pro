import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('manager' | 'delivery')[];
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login' 
}) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authState.isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !allowedRoles.includes(authState.user.role)) {
    // Redirect based on user role
    const roleRedirects = {
      manager: '/manager/dashboard',
      delivery: '/delivery/dashboard'
    };
    
    return (
      <Navigate 
        to={roleRedirects[authState.user.role]} 
        replace 
      />
    );
  }

  // User is authenticated and has proper role
  return <>{children}</>;
};

export default PrivateRoute; 