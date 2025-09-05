import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaStar, FaCog } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomPlayerPool = [
  "PriyaGaming12", "YT_Gamerz", "ShadowKnight", "AlphaStriker",
  "CrimsonFury", "BladeRunner", "NeonNinja", "GhostReaper",
  "PhantomFox", "StormRider", "GameMaster", "PixelWarrior",
  "DarkKnight", "EpicSlayer", "NovaStorm", "FireWizard",
  "IceQueen", "DragonFly", "CyberTiger", "LightningBolt"
];

function generateLeaderboard(hourOfDay) {
  // Select 3 unique random players each time leaderboard refreshes
  const shuffled = randomPlayerPool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  // Assign increasing prize values driven by hourOfDay for day progression, 5k-17k increments per hour
  return selected.map((name, idx) => {
    const base = getRandomInt(6000, 10000);
    // Increase prize by 5k to 17k multiplied by current hour (hourOfDay)
    const prize = base + hourOfDay * getRandomInt(5000, 17000);
    return { name, prize };
  });
}

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

  const updateLeaderboard = () => {
    const now = new Date();
    const hourOfDay = now.getHours();
    setLeaderboard(generateLeaderboard(hourOfDay));
  };

  useEffect(() => {
    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 3600000); // refresh hourly
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
          headers: { Authorization: `Bearer ${userToken}` },
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

  // Next match timer (example static timer)
  const [timer, setTimer] = useState(760);
  useEffect(() => {
    const tick = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 1800)), 1000);
    return () => clearInterval(tick);
  }, []);
  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  const modes = [
    {
      name: "Battle Royale",
      icon: "🔥",
      caption: "Intense battles, big prizes 🔥",
      description: "Classic survival mode",
    },
    {
      name: "Clash Squad",
      icon: "⚡",
      caption: "Fast-paced, big wins ⚡",
      description: "Quick 4v4 shows",
    },
    {
      name: "Lone Wolf",
      icon: "🐺",
      caption: "Quick way to make profit 🐺",
      description: "Intense 1v1 duels",
    },
  ];

  const handleEnterMode = (name) => {
    toast.info(`Entering ${name}`);
    // Add navigation/features as needed
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
              <li onClick={handleLogout}>
                <FaBell style={{ marginRight: 8 }} /> Logout
              </li>
              <li onClick={goToSettings}>
                <FaCog style={{ marginRight: 8 }} /> Settings
              </li>
              <li>
                <button
                  className="extra-btn"
                  onClick={() => toast.info("Extra Action!")}
                >
                  <FaStar /> Extra Action
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Balance */}
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
            {showDepositForm && <DepositForm token={userToken} refreshBalance={fetchUser} />}
            {showWithdrawForm && <WithdrawForm token={userToken} refreshBalance={fetchUser} />}
          </div>
        )}

        {/* Leaderboard toggle */}
        <button className="leaderboard-toggle-btn glass" onClick={() => setLeaderboardVisible(v => !v)}>
          {leaderboardVisible ? (
            <>Hide Leaderboard <FaChevronUp /></>
          ) : (
            <>Show Leaderboard <FaChevronDown /></>
          )}
        </button>

        {/* Leaderboard */}
        {leaderboardVisible && (
          <div className="leaderboard-glass glass">
            <div className="leaderboard-title">
              Top Players Today
            </div>
            {leaderboard.map(({ name, prize }, i) => (
              <div className="leaderboard-row" key={name}>
                <div>
                  <span className="lb-pos">{i + 1}</span>
                  <span className="lb-name">🎮 {name}</span>
                </div>
                <span className="lb-prize">₹{prize.toLocaleString()}</span>
              </div>
            ))}
            <div className="lb-note">* This leaderboard refreshes every hour</div>
          </div>
        )}

        {/* Next match */}
        <div className="next-match-glass glass">
          <span role="img" aria-label="timer">⏰</span>
          <span style={{ marginLeft: 10 }}>
            Next Battle Royale starts in <b>{mm}:{ss}</b>
          </span>
        </div>

        {/* Mode cards */}
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

export default Dashboard;
