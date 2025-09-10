// src/admin/AllUsers.jsx
import React, { useEffect, useState } from 'react';

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // fetch users from backend
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(res => res.json())
      .then(data => {
        if(data.success) setUsers(data.users);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>All Users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>₹{user.balance}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsers;
