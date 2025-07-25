import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Import CSS file

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      // Decode token and check role before fetching
      let decoded;
      try {
        decoded = JSON.parse(atob(token.split(".")[1]));
      } catch {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      if (decoded.role !== "admin") {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      try {
        const res = await axios.get(
          "https://cashplayzz-backend-1.onrender.com/api/admin/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load stats");
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin/login");
        }
      }
    };

    fetchStats();
  }, [navigate]);

  if (!stats && !error) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="admin-stats">
        <Card title="Total Profit" value={`₹${stats.profit ?? "0"}`} />
        <Card title="Total Deposits" value={`₹${stats.totalDeposits ?? "0"}`} />
        <Card title="Total Withdrawals" value={`₹${stats.totalWithdrawals ?? "0"}`} />
        <Card title="Total Users" value={stats.totalUsers ?? "0"} />
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
    <div className="stat-card">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  );
}

export default AdminDashboard;
