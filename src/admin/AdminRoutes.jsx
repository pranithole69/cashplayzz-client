import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from "./AdminDashboard"; // ✅ CORRECT
import AllUsers from './AllUsers';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<AllUsers />} />
    </Routes>
  );
};

export default AdminRoutes;
