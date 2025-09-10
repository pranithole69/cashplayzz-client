// src/admin/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import AllUsers from './AllUsers';
import DepositsList from './DepositsList';
import WithdrawalsList from './WithdrawalsList';
import TournamentManagement from './TournamentManagement';

const AdminRoutes = () => {
  const isAuthenticated = Boolean(localStorage.getItem('adminToken'));

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AllUsers />} />
      <Route path="deposits" element={<DepositsList />} />
      <Route path="withdrawals" element={<WithdrawalsList />} />
      <Route path="tournaments" element={<TournamentManagement />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
