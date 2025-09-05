import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaCog, FaStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const playerPool = [
  "PriyaGaming12", "YT_Gamerz", "ShadowKnight", "AlphaStriker",
  "CrimsonFury", "BladeRunner", "NeonNinja", "GhostReaper",
  "PhantomFox", "StormRider"
];

// Generate leaderboard with realistic hourly increments
function generateLeaderboard(hour) {
  const basePrizes = [10000, 9000, 8000];
  const randomIncrement = () => Math.floor(Math.random() * 2000) + 1000;
  let leaderboard = [];

  for (let i = 0; i < 3; i++) {
    const playerIndex = (hour + i * 7) % playerPool.length;
    const prize = basePrizes[i] + hour * randomIncrement();
    leaderboard.push({
      name: playerPool[playerIndex],
      prize,
    });
  }

  leaderboard.sort((a, b) => b.prize - a.prize);
  return leaderboard;
}

const modes = [
  { name: "Battle Royale", icon: "🔥", caption: "Intense battles, big prizes 🔥", description: "Classic survival mode" },
  { name: "Clash Squad", icon: "⚡", caption: "Fast-paced, big wins ⚡", description: "Quick 4v4 battles" },
  { name: "Lone Wolf", icon: "🐺", caption: "Quick way to make profit 🐺", description: "Intense 1v1 duels" },
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

  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    setLeaderboard(generateLeaderboard(hour));
  }, []);

  useEffect(() => {
    if (!userToken) return;
    axios.get("https://cashplayzz-backend-1.onrender.com/api/user/profile", {
      headers: { Authorization: `Bearer ${userToken}` }
    }).then(res => {
      setUsername(res.data.username);
      setBalance(res.data.balance);
    }).catch(() => toast.error("Failed to fetch user info"));
  }, [userToken]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleWallet = () => {
    setWalletOpen(!walletOpen);
    setShowDeposit(false);
    setShowWithdraw(false);
  };
  const handleLogout = () => {
    setLoggingOut(true);
    toast.info("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    }, 1500);
  };
  const toggleDeposit = () => {
    setShowDeposit(!showDeposit);
    setShowWithdraw(false);
  };
  const toggleWithdraw = () => {
    setShowWithdraw(!showWithdraw);
    setShowDeposit(false);
  };
  const goToSettings = () => toast.info("Settings coming soon!");

  const handleEnter = (mode) => {
    toast.info(`Entering ${mode}`);
    // Replace with navigation or other logic
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
              <li onClick={handleLogout}><FaBell /> Logout</li>
              <li onClick={goToSettings}><FaCog /> Settings</li>
              <li><button className="extra-btn" onClick={() => toast.info("Extra action!")}> <FaStar /> Extra Action </button></li>
            </ul>
          </div>
        )}

        <div className="balance-box glass">
          <div className="balance-info">
            <small className="balance-label">Your Balance</small>
            <span className="balance-amount">₹{balance.toLocaleString("en-IN")}</span>
            <small className="username-text">Logged in as: <b>{username || "Guest"}</b></small>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

        {walletOpen && (
          <div className="wallet-box glass">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={toggleDeposit}>{showDeposit ? "Hide Deposit" : "Deposit"}</button>
              <button className="wallet-btn" onClick={toggleWithdraw}>{showWithdraw ? "Hide Withdraw" : "Withdraw"}</button>
            </div>
            {showDeposit && <DepositForm token={userToken} refreshBalance={() => {}} />}
            {showWithdraw && <WithdrawForm token={userToken} refreshBalance={() => {}} />}
          </div>
        )}

        <button className="leaderboard-toggle glass" onClick={() => setLeaderboardVisible(v => !v)}>
          {leaderboardVisible ? <>Hide Leaderboard <FaChevronUp /></> : <>Show Leaderboard <FaChevronDown /></>}
        </button>

        {leaderboardVisible && (
          <div className="leaderboard glass">
            <div className="leaderboard-header">Top Players Today</div>
            {leaderboard.map(({ name, prize }, idx) => (
              <div key={name} className="leaderboard-row">
                <div><span className="lb-pos">{idx + 1}</span> <span className="lb-name">🎮 {name}</span></div>
                <div className="lb-prize">₹{prize.toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div className="leaderboard-note">* This leaderboard refreshes every hour</div>
          </div>
        )}

        <div className="game-zone glass">
          <h2 className="game-zone-heading"><span role="img" aria-label="game">🎮</span> Matches Available Now</h2>
          <div className="modes-list">
            {modes.map(({ name, icon, caption, description }) => (
              <div key={name} className="mode-card glass" onClick={() => handleEnter(name)}>
                <div className="mode-header"><span className="mode-icon">{icon}</span> <span className="mode-title">{name}</span></div>
                <div className="mode-caption">{caption}</div>
                <div className="mode-desc">{description}</div>
                <button onClick={e => { e.stopPropagation(); handleEnter(name); }} className="enter-btn">Enter Battle</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loggingOut && (
        <div className="logout-overlay glass">
          <div className="spinner"></div>
          <p>Logging you out...</p>
        </div>
      )}
    </div>
  );
}
