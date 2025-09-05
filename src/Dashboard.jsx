import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaCog, FaStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const playerPool = [
  "PriyaGaming12",
  "YT_Gamerz",
  "ShadowKnight",
  "AlphaStriker",
  "CrimsonFury",
  "BladeRunner",
  "NeonNinja",
  "GhostReaper",
  "PhantomFox",
  "StormRider",
];

// Utility to generate stable leaderboard data based on hour
function generateLeaderboard(hour) {
  const basePrizes = [9500, 8200, 7650];
  const multiplier = 1000; // Base growth per hour
  let leaderboard = [];

  for (let i = 0; i < 3; i++) {
    // Simple indexing for different names based on hour to make it dynamic but stable
    const idx = (hour + i * 7) % playerPool.length;
    // Prize increases with hour, slight randomness but no decrease
    const prize = basePrizes[i] + multiplier * hour + Math.floor(Math.random() * 500);
    leaderboard.push({
      name: playerPool[idx],
      prize,
    });
  }

  leaderboard.sort((a, b) => b.prize - a.prize);
  return leaderboard;
}

const modes = [
  {
    name: "Battle Royale",
    icon: "🔥",
    caption: "Intense battles, big prizes",
    description: "Classic survival mode",
  },
  {
    name: "Clash Squad",
    icon: "⚡",
    caption: "Fast-paced, big wins",
    description: "Quick 4v4 matches",
  },
  {
    name: "Lone Wolf",
    icon: "🐺",
    caption: "Quick way to profit",
    description: "Intense 1v1 duels",
  },
];

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");

  // Load user info
  useEffect(() => {
    if (!userToken) return;
    axios
      .get("https://cashplayzz-backend.herokuapp.com/api/user/profile", {
        headers: { Authorization: "Bearer " + userToken },
      })
      .then((res) => {
        setUsername(res.data.username || "Guest");
        setBalance(res.data.balance || 0);
      })
      .catch(() => toast.error("Failed to fetch user info"));
  }, [userToken]);

  // Initialize leaderboard and update hourly
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setLeaderboard(generateLeaderboard(hour));

    const millisToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      const newHour = new Date().getHours();
      setLeaderboard(generateLeaderboard(newHour));

      const interval = setInterval(() => {
        setLeaderboard(generateLeaderboard(new Date().getHours()));
      }, 3600000);

      window._leaderboardUpdateInterval = interval;
    }, millisToNextHour);

    return () => {
      clearTimeout(timeout);
      if (window._leaderboardUpdateInterval) clearInterval(window._leaderboardUpdateInterval);
    };
  }, []);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const toggleWallet = () => {
    setWalletOpen((v) => !v);
    setShowDeposit(false);
    setShowWithdraw(false);
  };
  const toggleDeposit = () => setShowDeposit((v) => !v);
  const toggleWithdraw = () => setShowWithdraw((v) => !v);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    }, 1200);
  };

  const goToSettings = () => toast.info("Settings coming soon!");

  const handleEnter = (mode) => {
    toast.success(`Ready to enter ${mode}!`);
    // Placeholder for navigation logic
    // e.g., navigate(`/mode/${mode.toLowerCase().replace(/\s+/g, '-')}`)
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />

      <div className="dashboard-scroll" style={{ minHeight: "100vh" }}>
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </div>

        {menuOpen && (
          <div className="sidebar glass">
            <ul>
              <li onClick={handleLogout}>
                <FaBell style={{ marginRight: 8 }} /> Logout
              </li>
              <li onClick={goToSettings}>
                <FaCog style={{ marginRight: 8 }} /> Settings
              </li>
            </ul>
          </div>
        )}

        {/* Balance Section */}
        <div className="balance-box glass">
          <div className="balance-info">
            <div className="balance-label">YOUR BALANCE</div>
            <div className="balance-amount">₹{balance.toLocaleString("en-IN")}</div>
            <div className="balance-user">Logged in as <b>{username}</b></div>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

        {/* Wallet */}
        {walletOpen && (
          <div className="wallet-box glass">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={toggleDeposit}>
                {showDeposit ? "Hide Deposit" : "Deposit"}
              </button>
              <button className="wallet-btn" onClick={toggleWithdraw}>
                {showWithdraw ? "Hide Withdraw" : "Withdraw"}
              </button>
            </div>
            {showDeposit && <div className="wallet-form">Deposit form here</div>}
            {showWithdraw && <div className="wallet-form">Withdraw form here</div>}
          </div>
        )}

        {/* Leaderboard Toggle */}
        <button
          className="leaderboard-toggle glass"
          onClick={() => setLeaderboardVisible((v) => !v)}
        >
          {leaderboardVisible ? "Hide Leaderboard" : "Show Leaderboard"}{" "}
          {leaderboardVisible ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {/* Leaderboard */}
        {leaderboardVisible && (
          <div className="leaderboard glass">
            <div className="leaderboard-header">Top Players Today</div>
            {leaderboard.map(({ name, prize }, idx) => (
              <div key={name} className="leaderboard-row">
                <div>
                  <span className="lb-pos">{idx + 1}</span>{" "}
                  <span className="lb-name">{name}</span>
                </div>
                <div className="lb-prize">₹{prize.toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div className="leaderboard-note">
              * This leaderboard refreshes every hour
            </div>
          </div>
        )}

        {/* Game Zone */}
        <div className="game-zone glass">
          <div className="game-header">
            <span role="img" aria-label="game">
              🎮
            </span>{" "}
            Matches Available Now
          </div>
          <div className="modes-list">
            {modes.map(({ name, icon, caption, description }) => (
              <div
                key={name}
                className="mode-card glass"
                onClick={() => handleEnter(name)}
              >
                <div className="mode-header">
                  <span className="mode-icon">{icon}</span>{" "}
                  <span className="mode-title">{name}</span>
                </div>
                <div className="mode-caption">{caption}</div>
                <div className="mode-desc">{description}</div>
                <button
                  className="enter-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnter(name);
                  }}
                >
                  Enter Battle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Overlay */}
      {loggingOut && (
        <div className="overlay">
          <div className="spinner"></div>
          <div>Logging out...</div>
        </div>
      )}
    </div>
  );
}
