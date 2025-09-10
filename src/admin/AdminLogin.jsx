import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting login...');
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Response error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        console.log('🎉 Login successful, redirecting...');
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#00ffe7'
    }}>
      <div style={{ 
        border: '2px solid #00ffe7', 
        borderRadius: '8px', 
        padding: '40px', 
        width: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Admin Login</h2>
        
        {error && (
          <div style={{ 
            color: '#ff4444', 
            marginBottom: '20px', 
            textAlign: 'center',
            padding: '10px',
            border: '1px solid #ff4444',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: 'transparent',
              border: '1px solid #00ffe7',
              borderRadius: '4px',
              color: '#00ffe7',
              fontSize: '16px'
            }}
          />
          
          <input
            type="password"
            placeholder="Admin Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '30px',
              backgroundColor: 'transparent',
              border: '1px solid #00ffe7',
              borderRadius: '4px',
              color: '#00ffe7',
              fontSize: '16px'
            }}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#00ffe7',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          fontSize: '12px', 
          color: '#888',
          textAlign: 'center'
        }}>
          Use your admin email and password
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
