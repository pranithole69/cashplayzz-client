import React, { useState } from "react";
import "./dashboard.css";
import { FaWallet, FaBars, FaTimes } from "react-icons/fa";
import { GiTwoCoins } from "react-icons/gi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleWallet = () => setWalletOpen(!walletOpen);

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
    // Or navigate("/settings") if routing
  };

  const handleDeposit = () => {
    toast.success("Deposit feature coming soon!");
  };

  const handleWithdraw = () => {
    toast.success("Withdraw feature coming soon!");
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger + Sidebar */}
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

      {/* Top Balance Box */}
      <div className="balance-box">
        <GiTwoCoins className="coin-icon" />
        <span className="balance-text">₹12,500.00</span>
        <FaWallet className="wallet-icon" onClick={toggleWallet} />
      </div>

      {/* Wallet Dropdown */}
      {walletOpen && (
        <div className="wallet-box">
          <button className="wallet-btn" onClick={handleDeposit}>Deposit</button>
          <button className="wallet-btn" onClick={handleWithdraw}>Withdraw</button>
        </div>
      )}

      {/* Game Zone */}
      <div className="game-zone">
        <h2>🎮 Game Zone</h2>
        <p>Here you can play cool games!</p>
      </div>

      {/* User Info */}
      <div className="user-info">👤 Logged in as: <span>Player123</span></div>

      {/* Logout Spinner Overlay */}
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
