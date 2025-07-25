import React, { useState } from 'react';
import './AdminLogin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTimesCircle } from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://cashplayzz-backend-1.onrender.com/api/auth/login', {
        email,
        password,
      });

      const token = res.data.token;
      const user = res.data.user;

      if (user.role !== 'admin') {
        setError('Access Denied: Not an admin ❌');
        return;
      }

      localStorage.setItem('token', token);
      toast.success('Admin Login Successful');
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password ❌');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleAdminLogin}>
        <h2>Admin Login</h2>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="error-message">
            <FaTimesCircle className="error-icon" />
            {error}
          </div>
        )}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
