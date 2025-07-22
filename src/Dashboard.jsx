import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DepositForm from "./components/DepositForm";

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);

  const userToken = localStorage.getItem("token");

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleWallet = () => {
    setWalletOpen(!walletOpen);
    setShowDepositForm(false);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    toast.info("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    }, 1500);
  };

  const goToSettings = () => {
    toast.info("Settings feature coming soon!");
  };

  const handleDeposit = () => {
    setShowDepositForm(!showDepositForm);
  };

  const handleWithdraw = () => {
    toast.success("Withdraw feature coming soon!");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "https://cashplayzz-backend-1.onrender.com/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("👤 User data:", res.data);
        const { username, balance } = res.data;  // <-- fixed here
        setUsername(username);
        setBalance(balance);
      } catch (err) {
        toast.error("Failed to load user info");
        console.error("❌ Fetch user error:", err.response?.data || err.message);
      }
    };
    if (userToken) fetchUser();
  }, [userToken]);

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="dashboard-scroll">
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </div>

        {menuOpen && (
          <div className="sidebar">
            <ul>
              <li onClick={handleLogout}>Logout</li>
              <li onClick={goToSettings}>Settings</li>
            </ul>
          </div>
        )}

        <div className="balance-box">
          <div className="balance-info">
            <small className="balance-label">Your Balance</small>
            <span className="balance-text">₹{balance.toLocaleString()}</span>
            <small className="username-text">
              Logged in as: <strong>{username}</strong>
            </small>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

        {walletOpen && (
          <div className="wallet-box">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={handleDeposit}>
                {showDepositForm ? "Hide Deposit" : "Deposit"}
              </button>
              <button className="wallet-btn" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
            {showDepositForm && <DepositForm token={userToken} />}
          </div>
        )}

        <div className="game-zone">
          <h2>🎮 Game Zone</h2>
          <p>Here you can play cool games!</p>
        </div>
      </div>

      {loggingOut && (
        <div className="logout-overlay">
          <div className="spinner"></div>
          <p>Logging you out... 🧳</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
