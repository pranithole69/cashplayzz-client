import React from 'react';
import { Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwt_decode(token);
    if (decoded.role === 'admin') {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  } catch (err) {
    return <Navigate to="/" />;
  }
};

export default RequireAdmin;
