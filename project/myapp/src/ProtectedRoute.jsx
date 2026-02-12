import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
