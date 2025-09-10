// src/admin/WithdrawalsList.jsx
import React, { useEffect, useState } from 'react';

const WithdrawalsList = () => {
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(res => res.json())
      .then(data => {
        if(data.success) setWithdrawals(data.withdrawals);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Withdrawals</h2>
      <ul>
        {withdrawals.map(item => (
          <li key={item._id}>
            {item.userId.username} - ₹{item.amount} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WithdrawalsList;
