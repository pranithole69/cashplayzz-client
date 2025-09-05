import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

// Fixed user names for leaderboard
const playerNames = [
  "Shadow_Knight",
  "Alpha_Striker",
  "PriyaGaming12",
  "YT_Gamerz",
  "Crimson_Fury",
  "BladeRunner",
  "NeonNinja",
  "Ghost_Reaper",
  "PhantomFox",
  "StormRider",
];

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);

  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  // Helper to generate rising leaderboard prizes hour by hour
  const generateLeaderboard = () => {
    // Current hour index since unix epoch, to keep hourly increasing value
    const now = new Date();
    const hourIndex = Math.floor(now.getTime() / 1000 / 3600);

    // Base starting amount for each player (random to vary starting points)
    const baseAmounts = [2500, 2200, 2700, 2100, 1900, 1550, 2000, 1340, 1800, 1700];

    // Calculate prize for each player: base + (hourIndex * random between 1k-17k)
    const newLeaderboard = playerNames.slice(0, 3).map((name, idx) => {
      const increase = Array.from({ length: hourIndex }).reduce((acc) => {
        // Random increment each hour 1k-17k
        return acc + (Math.floor(Math.random() * 16000) + 1000);
      }, 0);
      return {
        name,
        prize: baseAmounts[idx] + increase,
      };
    });

    return newLeaderboard;
  };

  // Refresh leaderboard every hour
  useEffect(() => {
    setLeaderboard(generateLeaderboard());
    const interval = setInterval(() => {
      setLeaderboard(generateLeaderboard());
    }, 3600000); // 1 hour refresh

    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleWallet = () => {
    setWalletOpen(!walletOpen);
    setShowDepositForm(false);
    setShowWithdrawForm(false);
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
    setShowWithdrawForm(false);
  };

  const handleWithdraw = () => {
    setShowWithdrawForm(!showWithdrawForm);
    setShowDepositForm(false);
  };

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
      const { username, balance } = res.data;
      setUsername(username);
      setBalance(balance);
    } catch (err) {
      toast.error("Failed to load user info");
      console.error(err);
    }
  };

  useEffect(() => {
    if (userToken) fetchUser();
  }, [userToken]);

  const modes = [
    { name: "Battle Royale", description: "Classic survival mode", caption: "Intense battles, big prizes 🔥", icon: "🔥" },
    { name: "Clash Squad", description: "Fast-paced 4v4 matches", caption: "Fast-paced, big wins ⚡", icon: "⚡" },
    { name: "Lone Wolf", description: "1v1 intense duels", caption: "Quick way to make profit 🐺", icon: "🐺" },
  ];

  const handleEnterMode = (name) => {
    toast.info(`Entering ${name}`);
    // Implement navigation or functionality here
  };

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

        {/* Balance Section */}
        <div className="balance-box glass">
          <div className="balance-info">
            <small className="balance-label">Your Balance</small>
            <span className="balance-text">₹{balance.toLocaleString()}</span>
            <small className="username-text">Logged in as: <strong>{username}</strong></small>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

        {walletOpen && (
          <div className="wallet-box glass">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={handleDeposit}>
                {showDepositForm ? "Hide Deposit" : "Deposit"}
              </button>
              <button className="wallet-btn" onClick={handleWithdraw}>
                {showWithdrawForm ? "Hide Withdraw" : "Withdraw"}
              </button>
            </div>
            {showDepositForm && <DepositForm token={userToken} refreshBalance={fetchUser} />}
            {showWithdrawForm && <WithdrawForm token={userToken} refreshBalance={fetchUser} />}
          </div>
        )}

        {/* Leaderboard Toggle */}
        <button
          className="leaderboard-toggle-btn"
          onClick={() => setLeaderboardVisible(v => !v)}
        >
          {leaderboardVisible ? (
            <>
              Hide Leaderboard <FaChevronUp />
            </>
          ) : (
            <>
              Show Leaderboard <FaChevronDown />
            </>
          )}
        </button>

        {/* Leaderboard */}
        {leaderboardVisible && (
          <div className="leaderboard-glass glass">
            <div className="leaderboard-title">Top Players Today</div>
            {leaderboard.map(({ name, prize }, idx) => (
              <div className="leaderboard-row" key={name}>
                <div>
                  <span className="lb-pos">{idx + 1}</span>
                  <span className="lb-name">🎮 {name}</span>
                </div>
                <span className="lb-prize">₹{(prize / 1000).toFixed(1)}K</span>
              </div>
            ))}
            <div className="lb-note">* This leaderboard refreshes every hour</div>
          </div>
        )}

        {/* Next Match Widget */}
        <div className="next-match-glass glass">
          <span role="img" aria-label="timer">⏰</span>
          <span style={{ marginLeft: 12 }}>
            Next Battle Royale starts in <b>00:12:41</b>
          </span>
        </div>

        {/* Matches Available */}
        <div className="game-zone glass">
          <h2 className="game-zone-heading">
            <span role="img" aria-label="controller">🎮</span> Matches Available Now
          </h2>
          <div className="modes-list">
            {modes.map((mode) => (
              <div
                key={mode.name}
                className="mode-card glass"
                onClick={() => handleEnterMode(mode.name)}
              >
                <div className="mode-header">
                  <span className="mode-icon">{mode.icon}</span>
                  <span className="mode-title">{mode.name}</span>
                </div>
                <div className="mode-caption">{mode.caption}</div>
                <div className="mode-desc">{mode.description}</div>
                <button className="enter-btn">Enter</button>
              </div>
            ))}
          </div>
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
