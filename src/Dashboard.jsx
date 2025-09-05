import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const playerPool = [
  "PriyaGaming12", "YT_Gamerz", "ShadowKnight", "AlphaStriker",
  "CrimsonFury", "BladeRunner", "NeonNinja", "GhostReaper",
  "PhantomFox", "StormRider"
];

function getIndianFormattedNumber(number) {
  return number.toLocaleString('en-IN');
}

// Generate leaderboard data consistent within the same hour
function generateLeaderboard(hour) {
  let basePrizes = [10000, 9000, 8000]; // Base prize per rank
  let leaderboard = [];
  let usedIndices = new Set();

  for (let i = 0; i < 3; i++) {
    // pick unique player
    let idx;
    do {
      idx = Math.floor(((hour / 3) * 7 * (i + 1) + i * 13) % playerPool.length);
    } while (usedIndices.has(idx));
    usedIndices.add(idx);

    // cumulative prize with hourly increment
    let prize = basePrizes[i] + hour * (500 + i * 200); // steady growth

    leaderboard.push({
      name: playerPool[idx],
      prize,
    });
  }
  // Sort descending
  leaderboard.sort((a, b) => b.prize - a.prize);
  return leaderboard;
}

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  // Initial leaderboard load and update every hour on the hour
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    setLeaderboard(generateLeaderboard(currentHour));

    // calculate millis to next hour
    const msToNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
    // Update once on the hour, then every hour
    const timeout = setTimeout(() => {
      setLeaderboard(generateLeaderboard((new Date()).getHours()));
      const interval = setInterval(() => setLeaderboard(generateLeaderboard((new Date()).getHours())), 3600000);
      window._leaderboardInterval = interval;
    }, msToNextHour);

    return () => {
      clearTimeout(timeout);
      if (window._leaderboardInterval) clearInterval(window._leaderboardInterval);
    };
  }, []);

  // User info load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("https://cashplayzz-backend-1.herokuapp.com/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setUsername(res.data.username || "");
      setBalance(res.data.balance || 0);
    }).catch(() => toast.error("Unable to fetch user data."));
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleWallet = () => {
    setWalletOpen(!walletOpen);
    setShowDeposit(false);
    setShowWithdraw(false);
  };
  const handleLogout = () => {
    setLoggingOut(true);
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

  const modes = [
    {name: "Battle Royale", icon:"🔥", caption:"Intense battles, big prizes", desc:"Classic survival mode"},
    {name: "Clash Squad", icon:"⚡", caption:"Fast-paced, big wins", desc:"Quick 4v4 battles"},
    {name: "Lone Wolf", icon:"🐺", caption:"Fast way to profit", desc:"Intense 1v1 duels"},
  ];

  const handleEnter = (mode) => {
    console.log(`ENTER ${mode}`);
    toast.info(`Entering ${mode}`);
    // Replace with navigation or modal open etc.
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="dashboard-scroll">
        <div className="hamburger" onClick={toggleMenu}>{menuOpen ? <FaTimes size={22}/> : <FaBars size={22}/>}</div>

        {menuOpen && (
          <div className="sidebar glass">
            <ul>
              <li onClick={() => toast.info("Notifications coming soon")}><FaBell /> Notifications</li>
              <li onClick={goToSettings}><FaCog /> Settings</li>
              <li><button className="extra-btn" onClick={() => toast.info("Extra action")}> <FaStar /> Extra Action</button></li>
            </ul>
          </div>
        )}

        <div className="balance-box glass">
          <div className="balance-info">
            <small className="balance-label">Your Balance</small>
            <span className="balance-amount">₹{balance.toLocaleString("en-IN")}</span>
            <small className="balance-user">Logged in as: <b>{username || 'Guest'}</b></small>
          </div>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
        </div>

        {walletOpen && (
          <div className="wallet-section glass">
            <div className="wallet-actions">
              <button className="wallet-btn" onClick={toggleDeposit}>{showDeposit ? "Hide Deposit" : "Deposit"}</button>
              <button className="wallet-btn" onClick={toggleWithdraw}>{showWithdraw ? "Hide Withdraw" : "Withdraw"}</button>
            </div>
            {showDeposit && <div className="wallet-form">Deposit form goes here</div>}
            {showWithdraw && <div className="wallet-form">Withdraw form goes here</div>}
          </div>
        )}

        <button className="leaderboard-toggle glass" onClick={() => setLeaderboardVisible(!leaderboardVisible)}>
          {leaderboardVisible ? <>Hide Leaderboard <FaChevronUp /></> : <>Show Leaderboard <FaChevronDown /></>}
        </button>

        {leaderboardVisible && (
          <div className="leaderboard glass">
            <div className="leaderboard-header">Top Players Today</div>
            {leaderboard.sort((a,b) => b.prize - a.prize).map(({name, prize}, idx) => (
              <div className="leaderboard-row" key={name}>
                <div><span className="pos">{idx+1}</span> <span className="player">{name}</span></div>
                <div className="prize">₹{prize.toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div className="leaderboard-note">* Leaderboard refreshes every hour</div>
          </div>
        )}

        <div className="game-zone glass">
          <div className="game-header">
            <span>🎮</span> Matches Available Now
          </div>
          <div className="modes">
            {modes.map(({name,icon,caption,desc}) => (
              <div key={name} className="mode-card glass" onClick={() => handleEnter(name)}>
                <div className="mode-title"><span className="icon">{icon}</span> {name}</div>
                <div className="mode-caption">{caption}</div>
                <div className="mode-desc">{desc}</div>
                <button className="enter-btn">Enter Battle</button>
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
