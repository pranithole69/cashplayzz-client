// src/admin/DepositsList.jsx
import React, { useEffect, useState } from 'react';

const DepositsList = () => {
  const [deposits, setDeposits] = useState([]);

  useEffect(() => {
    fetch('/api/admin/deposits', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(res => res.json())
      .then(data => {
        if(data.success) setDeposits(data.deposits);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Deposits</h2>
      <ul>
        {deposits.map(item => (
          <li key={item._id}>
            {item.userId.username} - ₹{item.amount} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepositsList;
