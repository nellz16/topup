import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component for admin access
 * Redirects to home if not authenticated
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};