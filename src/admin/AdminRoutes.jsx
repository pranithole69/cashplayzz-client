import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AllUsers from './AllUsers';
import AdminLogin from './AdminLogin';

const AdminRoutes = () => {
  // Check if admin is authenticated
  const isAuthenticated = localStorage.getItem('adminToken');

  return (
    <Routes>
      {/* Default route - redirect to dashboard if authenticated, login if not */}
      <Route 
        index 
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} 
      />
      
      {/* Main Dashboard Route */}
      <Route 
        path="dashboard" 
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} 
      />
      
      {/* All Users Management */}
      <Route 
        path="users" 
        element={isAuthenticated ? <AllUsers /> : <Navigate to="/admin/login" replace />} 
      />
      
      {/* Admin Login Route */}
      <Route path="login" element={<AdminLogin />} />
      
      {/* Redirect any other admin routes to dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
