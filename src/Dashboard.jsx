import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

// Fixed but genuine-looking leaderboard names
const leaderboardNames = [
  "PriyaGaming12", "YT_Gamerz", "Shadow_Knight", "Alpha_Striker",
  "Crimson_Fury", "BladeRunner", "NeonNinja", "Ghost_Reaper",
  "PhantomFox", "StormRider"
];

function getPrize(rank, hoursSinceMidnight) {
  // Fluctuate in the 1k–230k range, rising during the day, fluctuating for realism
  // Example: rank 1 gets more, lower ranks less, rise increases with time
  const min = 1000 + Math.floor((hoursSinceMidnight / 24) * 150000);
  const max = min + (rank === 0 ? 80000 : rank === 1 ? 40000 : 20000);
  const fluctuation = Math.floor(Math.random() * (max - min + 1)) + min;
  return fluctuation;
}

function getMatches() {
  return [
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
      description: "Quick 4v4 showdowns",
    },
    {
      name: "Lone Wolf",
      icon: "🐺",
      caption: "Quick way to make profit",
      description: "Intense 1v1 duels",
    }
  ];
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);

  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  const now = new Date();
  const hoursSinceMidnight = now.getHours() + now.getMinutes()/60;

  // Compose dynamic leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    // Pick 3 names, shuffle each day at 12 AM, simulate rise over the day
    const baseIdx = Math.floor((now.getTime()/1000/60/60/2) % leaderboardNames.length);
    const todayNames = [
      leaderboardNames[baseIdx % leaderboardNames.length],
      leaderboardNames[(baseIdx+1) % leaderboardNames.length],
      leaderboardNames[(baseIdx+2) % leaderboardNames.length]
    ];
    const entries = todayNames.map((name, idx) => ({
      name,
      amount: getPrize(idx, hoursSinceMidnight),
      stat: `${getPrize(idx, hoursSinceMidnight)/1000 | 0} matches played today`
    }));
    setLeaderboard(entries);
    // Every 30s, update with a small fluctuation to mimic real time
    const interval = setInterval(() => {
      setLeaderboard((prev) => prev.map(obj => ({
        ...obj,
        amount:
          obj.amount +
          (Math.floor(Math.random()*5000) * (Math.random() > 0.5 ? 1 : -1)),
        stat: `${(parseInt(obj.stat) + (Math.random() > 0.5 ? 1 : 0))} matches played today`
      })));
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Timer for next match
  const [timer, setTimer] = useState(760); // seconds to next match
  useEffect(() => {
    const t = setInterval(() => setTimer(s => (s > 0 ? s-1 : 1800)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(timer / 60)).padStart(2,"0");
  const ss = String(timer % 60).padStart(2,"0");

  // Wallet, user, and UX handlers
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
  const goToSettings = () => toast.info("Settings feature coming soon!");
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
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const { username, balance } = res.data;
      setUsername(username);
      setBalance(balance);
    } catch (err) {
      toast.error("Failed to load user info");
    }
  };
  useEffect(() => { if (userToken) fetchUser(); }, [userToken]);

  const matches = getMatches();
  const handleEnterMode = (name) => toast.info(`${name} selected! Implement mode landing next.`);

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

        {/* Wallet and Balance */}
        <div className="balance-box glass">
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
          <div className="wallet-box glass">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={handleDeposit}>
                {showDepositForm ? "Hide Deposit" : "Deposit"}
              </button>
              <button className="wallet-btn" onClick={handleWithdraw}>
                {showWithdrawForm ? "Hide Withdraw" : "Withdraw"}
              </button>
            </div>
            {showDepositForm && (
              <DepositForm token={userToken} refreshBalance={fetchUser} />
            )}
            {showWithdrawForm && (
              <WithdrawForm token={userToken} refreshBalance={fetchUser} />
            )}
          </div>
        )}

        {/* Leaderboard */}
        <div className="leaderboard-glass glass">
          <div className="leaderboard-title">
            <span role="img" aria-label="leaderboard">🎮</span> Top Players Today
          </div>
          {leaderboard.map(({ name, stat, amount }, i) => (
            <div className="leaderboard-row" key={i}>
              <div>
                <span className="lb-pos">{i + 1}</span>
                <span className="lb-name">🎮 {name}</span>
                <span className="lb-tip">{stat}</span>
              </div>
              <span className="lb-prize">₹{(amount/1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
        {/* Next match widget */}
        <div className="next-match-glass glass">
          <span role="img" aria-label="timer">⏰</span>
          <span style={{ marginLeft: 8, fontWeight: 600 }}>
            Next Battle Royale starts in <b>{mm}:{ss}</b>
          </span>
        </div>

        {/* Mode cards */}
        <div className="game-zone glass">
          <h2 className="game-zone-heading">
            <span role="img" aria-label="controller">🎮</span> Matches Available Now
          </h2>
          <div className="tips-zone">
            <span role="img" aria-label="tip">💡</span>
            Quick tip: Playing daily increases your leaderboard chances!
          </div>
          <div className="modes-list">
            {matches.map((mode, idx) => (
              <div
                key={mode.name}
                className="mode-card glass"
                onClick={() => handleEnterMode(mode.name)}
              >
                <div className="mode-header">
                  <span className="mode-icon">{mode.icon}</span>
                  <span className="mode-title">{mode.name}</span>
                </div>
                <div className="mode-caption">{mode.caption} {mode.icon}</div>
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
