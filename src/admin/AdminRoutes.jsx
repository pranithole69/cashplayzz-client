import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AllUsers from './AllUsers';
import AdminLogin from './AdminLogin';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} /> {/* ✅ FIXED */}
      <Route path="users" element={<AllUsers />} />
      <Route path="login" element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminRoutes;
