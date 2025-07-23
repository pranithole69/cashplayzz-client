// client/src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        const res = await axios.get("https://cashplayzz-backend-1.onrender.com/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load stats");
      }
    };

    fetchStats();
  }, [navigate]);

  if (!stats && !error) return <p className="text-white text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-center text-neon mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card title="Total Profit" value={`₹${stats.profit}`} />
        <Card title="Total Deposits" value={`₹${stats.totalDeposits}`} />
        <Card title="Total Withdrawals" value={`₹${stats.totalWithdrawals}`} />
        <Card title="Total Users" value={stats.totalUsers} />
        {stats.topWinner && (
          <Card title="Top Winner" value={`${stats.topWinner.username} — ₹${stats.topWinner.amount}`} />
        )}
        {stats.topLoser && (
          <Card title="Top Loser" value={`${stats.topLoser.username} — ₹${stats.topLoser.amount}`} />
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg text-gray-400">{title}</h3>
      <p className="text-2xl font-semibold text-neon mt-2">{value}</p>
    </div>
  );
}

export default AdminDashboard;
