import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

const fixedLeaderboard = [
  { name: "PriyaGaming12", stat: "50 matches played today" },
  { name: "YT_Gamerz", stat: "42 matches played today" },
  { name: "Shadow_Knight", stat: "38 matches played today" },
  { name: "Alpha_Striker", stat: "35 matches played today" },
  { name: "Crimson_Fury", stat: "30 matches played today" },
];

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
      console.error("❌ Fetch user error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (userToken) fetchUser();
  }, [userToken]);

  const [leaderboard, setLeaderboard] = useState(fixedLeaderboard);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLeaderboard((prev) => {
        const first = prev[0];
        const rest = prev.slice(1);
        return [...rest, first];
      });
    }, 10000); // shift every 10s
    return () => clearInterval(intervalRef.current);
  }, []);

  const modes = [
    { name: "Battle Royale", description: "Classic survival mode", icon: "🔥" },
    { name: "Clash Squad", description: "Fast-paced 4v4 matches", icon: "⚔️" },
    { name: "Lone Wolf", description: "1v1 intense duels", icon: "🐺" },
  ];

  const handleEnterMode = (modeName) => {
    if (modeName === "Battle Royale") navigate("/battle-royale");
    else if (modeName === "Clash Squad") navigate("/clash-squad");
    else if (modeName === "Lone Wolf") navigate("/lone-wolf");
    else toast.info(`Mode ${modeName} clicked!`);
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

        {/* BALANCE BOX */}
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

        {/* LEADERBOARD */}
        <div className="leaderboard-glass">
          <div className="leaderboard-title">Top Players Today</div>
          {leaderboard.slice(0, 3).map(({ name, stat }, index) => (
            <div className="leaderboard-row" key={index}>
              <span>🎮 {name}</span>
              <span>{stat}</span>
            </div>
          ))}
        </div>

        {/* NEXT MATCH WIDGET */}
        <div className="next-match-glass">
          <span role="img" aria-label="timer">
            ⏰
          </span>{" "}
          Next Battle Royale starts in <b>00:12:41</b>
        </div>

        {/* GAME ZONE */}
        <div className="game-zone">
          <h2 className="game-zone-heading">
            <span role="img" aria-label="controller">
              🎮
            </span>{" "}
            Matches Available Now
          </h2>
          <div className="modes-list">
            {modes.map((mode) => (
              <div
                key={mode.name}
                className="mode-card clean-glass"
                onClick={() => handleEnterMode(mode.name)}
              >
                <div className="mode-header">
                  <span className="mode-icon">{mode.icon}</span>
                  <span className="mode-title">{mode.name}</span>
                </div>
                <p className="mode-desc">{mode.description}</p>
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
