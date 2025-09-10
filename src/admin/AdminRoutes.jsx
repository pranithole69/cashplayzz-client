import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AllUsers from './AllUsers';
import AdminLogin from './AdminLogin';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Login route - always accessible */}
      <Route path="login" element={<AdminLogin />} />
      
      {/* Protected routes - redirect if not authenticated */}
      <Route index element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute><AllUsers /></ProtectedRoute>} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default AdminRoutes;
