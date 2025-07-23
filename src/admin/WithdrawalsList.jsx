// src/admin/WithdrawalsList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const WithdrawalsList = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your actual backend API URL to get withdrawals
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://cashplayzz-backend-1.onrender.com/api/admin/withdrawals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWithdrawals(res.data.withdrawals || []);
      } catch (err) {
        setError("Failed to load withdrawals.");
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  if (loading) return <p>Loading withdrawals...</p>;
  if (error) return <p>{error}</p>;
  if (withdrawals.length === 0) return <p>No withdrawals found.</p>;

  return (
    <div>
      <h2>Withdrawals List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w._id}>
              <td>{w._id}</td>
              <td>{w.username || w.userId}</td>
              <td>₹{w.amount}</td>
              <td>{w.status}</td>
              <td>{new Date(w.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalsList;
