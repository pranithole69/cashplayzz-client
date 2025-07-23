import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UsersList from './UsersList';
import DepositsList from './DepositsList';
import WithdrawalsList from './WithdrawalsList';

const AdminApp = () => {
  return (
    <div style={{ display: 'flex' }}>
      <nav
        style={{
          width: '220px',
          background: '#111',
          height: '100vh',
          padding: '1rem',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        <h2>👑 Admin Panel</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>
              👥 Users
            </Link>
          </li>
          <li>
            <Link to="/admin/deposits" style={{ color: 'white', textDecoration: 'none' }}>
              💰 Deposits
            </Link>
          </li>
          <li>
            <Link to="/admin/withdrawals" style={{ color: 'white', textDecoration: 'none' }}>
              🏧 Withdrawals
            </Link>
          </li>
        </ul>
      </nav>

      <main
        style={{
          flex: 1,
          marginLeft: '220px',
          padding: '2rem',
          background: '#0d0d0d',
          color: 'white',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/deposits" element={<DepositsList />} />
          <Route path="/withdrawals" element={<WithdrawalsList />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminApp;
