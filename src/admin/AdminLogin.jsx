// src/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
      }

      const { token } = await response.json();

      localStorage.setItem('adminToken', token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#0ff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ border: '2px solid #0ff', padding: 30, borderRadius: 8, width: 400, backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 0 10px #0ff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Admin Login</h2>

        {error && <p style={{ color: 'red', marginBottom: 15, textAlign: 'center' }}>{error}</p>}

        <input type="text" placeholder="Email or Username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} required style={{ width: '100%', padding: 12, marginBottom: 15, borderRadius: 4, border: '1px solid #0ff', backgroundColor: 'transparent', color: '#0ff', fontSize: 16 }} />

        <input type="password" placeholder="Password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required style={{ width: '100%', padding: 12, marginBottom: 25, borderRadius: 4, border: '1px solid #0ff', backgroundColor: 'transparent', color: '#0ff', fontSize: 16 }} />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 4, border: 'none', backgroundColor: '#0ff', color: '#000', fontWeight: 'bold', fontSize: 16 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ marginTop: 20, fontSize: 12, textAlign: 'center' }}>Use your admin email and password</p>
      </form>
    </div>
  );
};

export default AdminLogin;
