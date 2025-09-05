import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaCog, FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

const playerPool = [
  "PriyaGaming12","YT_Gamerz","ShadowKnight","AlphaStriker","CrimsonFury",
  "BladeRunner","NeonNinja","GhostReaper","PhantomFox","StormRider"
];

function generateHourlyLeaderboard(hour) {
  const basePrizes = [10000, 8000, 6000]; // realistic starting amounts
  return playerPool.slice(0, 3).map((name, i) => ({
    name,
    prize: basePrizes[i] + hour * (1000 + Math.floor(Math.random() * 2000)),
  }));
}

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setLeaderboard(generateHourlyLeaderboard(hour));
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

  const goToSettings = () => toast.info("Settings feature coming soon!");

  const handleDeposit = () => {
    setShowDepositForm((v) => !v);
    setShowWithdrawForm(false);
  };

  const handleWithdraw = () => {
    setShowWithdrawForm((v) => !v);
    setShowDepositForm(false);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("https://cashplayzz-backend-1.onrender.com/api/user/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setUsername(res.data.username);
      setBalance(res.data.balance);
    } catch {
      toast.error("Failed to load user info");
    }
  };

  useEffect(() => { if(userToken) fetchUser(); }, [userToken]);

  const modes = [
    { name: "Battle Royale", icon: "🔥", caption: "Intense battles, big prizes 🔥", description: "Classic survival mode" },
    { name: "Clash Squad", icon: "⚡", caption: "Fast-paced, big wins ⚡", description: "Quick 4v4 matches" },
    { name: "Lone Wolf", icon: "🐺", caption: "Quick way to make profit 🐺", description: "Intense 1v1 duels" },
  ];

  const handleEnterMode = (mode) => {
    console.log(`Enter pressed for mode: ${mode}`); // Implement navigation here if wanted
    toast.info(`You tapped Enter for ${mode}`);
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="dashboard-scroll">
        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </div>

        {menuOpen && (
          <div className="sidebar glass">
            <ul>
              <li onClick={() => toast.info("Notifications coming soon!")}>
                <FaBell style={{ marginRight: 8 }} /> Notifications
              </li>
              <li onClick={goToSettings}>
                <FaCog style={{ marginRight: 8 }} /> Settings
              </li>
              <li>
                <button className="extra-btn" onClick={() => toast.info("Extra action pressed!")}>
                  <FaStar /> Extra Action
                </button>
              </li>
            </ul>
          </div>
        )}

        <div className="balance-box glass">
          <div className="balance-info">
            <small className="balance-label">Your Balance</small>
            <span className="balance-text">₹{balance.toLocaleString("en-IN")}</span>
            <small className="username-text">
              Logged in as: <strong>{username || "guest"}</strong>
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
            {showDepositForm && <DepositForm token={userToken} refreshBalance={fetchUser} />}
            {showWithdrawForm && <WithdrawForm token={userToken} refreshBalance={fetchUser} />}
          </div>
        )}

        <button className="leaderboard-toggle-btn glass" onClick={() => setLeaderboardVisible(v => !v)}>
          {leaderboardVisible ? <>Hide Leaderboard <FaChevronUp /></> : <>Show Leaderboard <FaChevronDown /></>}
        </button>

        {leaderboardVisible && (
          <div className="leaderboard-glass glass">
            <div className="leaderboard-title">Top Players Today</div>
            {leaderboard.map(({ name, prize }, i) => (
              <div className="leaderboard-row" key={name}>
                <div>
                  <span className="lb-pos">{i + 1}</span>
                  <span className="lb-name">🎮 {name}</span>
                </div>
                <span className="lb-prize">₹{prize.toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="lb-note">* This leaderboard refreshes every hour</div>
          </div>
        )}

        <div className="game-zone glass">
          <h2 className="game-zone-heading">
            <span role="img" aria-label="controller">🎮</span> Matches Available Now
          </h2>
          <div className="modes-list">
            {modes.map(({ name, icon, caption, description }) => (
              <div className="mode-card glass" key={name} onClick={() => handleEnterMode(name)}>
                <div className="mode-header">
                  <span className="mode-icon">{icon}</span>
                  <span className="mode-title">{name}</span>
                </div>
                <div className="mode-caption">{caption}</div>
                <div className="mode-desc">{description}</div>
                <button className="enter-btn">Enter Battle</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loggingOut && (
        <div className="logout-overlay glass">
          <div className="spinner"></div>
          <p>Logging you out... 🧳</p>
        </div>
      )}
    </div>
  );
}
