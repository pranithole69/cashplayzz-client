import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaCog } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const playerPool = [
  "PriyaGaming12", "YT_Gamerz", "ShadowKnight",
  "AlphaStriker", "CrimsonFury", "BladeRunner",
  "NeonNinja", "GhostReaper", "PhantomFox", "StormRider"
];

function generateLeaderboard(hour) {
  const basePrizes = [9500, 8200, 7650];
  const multiplier = 1100;
  let leaderboard = [];

  for (let i = 0; i < 3; i++) {
    const idx = (hour + i * 7) % playerPool.length;
    const prize = basePrizes[i] + multiplier * hour + Math.floor(Math.random() * 500);
    leaderboard.push({ name: playerPool[idx], prize });
  }

  return leaderboard.sort((a, b) => b.prize - a.prize);
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
    description: "Quick 4v4 battles",
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

  useEffect(() => {
    if (!userToken) return;
    axios
      .get("https://cashplayzz-backend.herokuapp.com/api/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      .then((res) => {
        setUsername(res.data.username || "Guest");
        setBalance(res.data.balance || 0);
      })
      .catch(() => {
        toast.error("Unable to load user info");
        setUsername("Guest");
        setBalance(0);
      });
  }, [userToken]);

  useEffect(() => {
    const hour = new Date().getHours();
    setLeaderboard(generateLeaderboard(hour));
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();

    const timeout = setTimeout(() => {
      setLeaderboard(generateLeaderboard(new Date().getHours()));
      const interval = setInterval(() => {
        setLeaderboard(generateLeaderboard(new Date().getHours()));
      }, 3600 * 1000);
      window._leaderboardInterval = interval;
    }, msToNextHour);

    return () => {
      clearTimeout(timeout);
      if (window._leaderboardInterval) clearInterval(window._leaderboardInterval);
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
    // Navigate or other functionality here
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
            </ul>
          </div>
        )}

        <div className="balance-box glass">
          <div>
            <div className="balance-label">YOUR BALANCE</div>
            <div className="balance-amount">
              ₹{balance.toLocaleString("en-IN")}
            </div>
            <div className="balance-user">
              Logged in as <b>{username}</b>
            </div>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

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
            {showDeposit && <div className="wallet-form">[Deposit Form]</div>}
            {showWithdraw && <div className="wallet-form">[Withdraw Form]</div>}
          </div>
        )}

        <button
          className="leaderboard-toggle glass"
          onClick={() => setLeaderboardVisible((v) => !v)}
        >
          {leaderboardVisible ? "Hide Leaderboard" : "Show Leaderboard"}{" "}
          {leaderboardVisible ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {leaderboardVisible && (
          <div className="leaderboard glass">
            <div className="leaderboard-header">Top Players Today</div>
            {leaderboard.map(({ name, prize }, idx) => (
              <div key={name} className="leaderboard-row">
                <span className="lb-pos">{idx + 1}</span>
                <span className="lb-name">🎮 {name}</span>
                <span className="lb-prize">
                  ₹{prize.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div className="leaderboard-note">
              * This leaderboard refreshes every hour
            </div>
          </div>
        )}

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

      {loggingOut && (
        <div className="overlay">
          <div className="spinner"></div>
          <div>Logging out...</div>
        </div>
      )}
    </div>
  );
}
