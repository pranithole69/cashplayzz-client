import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaChevronDown, FaChevronUp, FaBell, FaCog, FaStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Utility
const inr = (n) => Number(n).toLocaleString("en-IN"); // commas in INR format [web:68][web:78][web:69]

const playerPool = [
  "PriyaGaming12","YT_Gamerz","ShadowKnight","AlphaStriker","CrimsonFury",
  "BladeRunner","NeonNinja","GhostReaper","PhantomFox","StormRider",
  "NovaStorm","EpicSlayer","PixelWarrior","DarkKnight","CyberTiger",
  "LightningBolt","GameMaster","FireWizard","IceQueen","DragonFly"
];

// Generate a small, believable, strictly non-decreasing hourly prize
function generateHourlyPrizes(hour) {
  // hour is 0..23; base between 4,000..9,000; each hour add +1,000..5,000
  const base = [7000, 6000, 5000]; // three ranks start differently
  return base.map((b) => {
    let amount = b;
    for (let i = 0; i < hour; i++) amount += Math.floor(Math.random() * 4000) + 1000; // +1k..5k each hour [web:77][web:80]
    return amount;
  });
}

function pickThreeNames() {
  // daily shuffle using date seed so same refresh during hour still yields same trio until next hour
  const dayKey = new Date().toDateString();
  const arr = [...playerPool].sort((a, b) => (a + dayKey).localeCompare(b + dayKey));
  return arr.slice(0, 3);
}

export default function Dashboard() {
  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Auth/user
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);

  // Leaderboard
  const [lbVisible, setLbVisible] = useState(false); // default hidden as requested
  const [leaderboard, setLeaderboard] = useState([]);

  // Next match timer (static example)
  const [secs, setSecs] = useState(12 * 60 + 41);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 30 * 60)), 1000); // loop every 30m [web:74]
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  // Fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("https://cashplayzz-backend-1.onrender.com/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username || "");
        setBalance(res.data.balance || 0);
      })
      .catch(() => toast.error("Failed to load user"));
  }, []);

  // Build realistic hourly leaderboard that never goes down mid-hour
  const buildLeaderboard = () => {
    const now = new Date();
    const hour = now.getHours(); // 0..23
    const names = pickThreeNames(); // changes per day, not every refresh
    const prizes = generateHourlyPrizes(hour); // increases with hour of day
    setLeaderboard(
      names.map((name, i) => ({
        name,
        prize: prizes[i],
      }))
    );
  };

  useEffect(() => {
    buildLeaderboard(); // initial
    // refresh exactly at the top of each next hour
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
    const timeout = setTimeout(() => {
      buildLeaderboard(); // first hour tick
      const hourly = setInterval(buildLeaderboard, 3600000); // hourly after that [web:77]
      // store id on window for cleanup
      window.__lb__ = hourly;
    }, Math.max(msToNextHour, 0));
    return () => {
      clearTimeout(timeout);
      if (window.__lb__) clearInterval(window.__lb__);
    };
  }, []);

  const modes = [
    { name: "Battle Royale", icon: "🔥", caption: "Intense battles, big prizes 🔥", desc: "Classic survival mode" },
    { name: "Clash Squad", icon: "⚡", caption: "Fast-paced, big wins ⚡", desc: "Quick 4v4 shows" },
    { name: "Lone Wolf", icon: "🐺", caption: "Quick way to make profit 🐺", desc: "Intense 1v1 duels" },
  ];

  const handleEnter = (mode) => {
    toast.info(`Entering ${mode}`);
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="hamburger" onClick={() => setMenuOpen((v) => !v)}>
        {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </div>

      {menuOpen && (
        <div className="sidebar glass">
          <ul>
            <li onClick={() => toast.info("Notifications coming soon")}>
              <FaBell style={{ marginRight: 8 }} /> Notifications
            </li>
            <li onClick={() => toast.info("Settings coming soon")}>
              <FaCog style={{ marginRight: 8 }} /> Settings
            </li>
            <li>
              <button className="extra-btn" onClick={() => toast.info("Quick Action!")}>
                <FaStar /> Quick Action
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Balance */}
      <div className="balance-box glass">
        <div className="balance-info">
          <small className="balance-label">Your Balance</small>
          <span className="balance-text">₹{inr(balance)}</span>
          <small className="username-text">
            Logged in as: <strong>{username}</strong>
          </small>
        </div>
        <FaWallet className="wallet-icon" onClick={() => setWalletOpen((v) => !v)} />
      </div>

      {walletOpen && (
        <div className="wallet-box glass">
          <div className="wallet-actions">
            <button className="wallet-btn" onClick={() => setShowDeposit((v) => !v)}>
              {showDeposit ? "Hide Deposit" : "Deposit"}
            </button>
            <button className="wallet-btn" onClick={() => setShowWithdraw((v) => !v)}>
              {showWithdraw ? "Hide Withdraw" : "Withdraw"}
            </button>
          </div>
          {showDeposit && <div style={{ marginTop: 10 }}>Deposit form here</div>}
          {showWithdraw && <div style={{ marginTop: 10 }}>Withdraw form here</div>}
        </div>
      )}

      {/* Leaderboard toggle - default hidden */}
      <button className="leaderboard-toggle-btn glass" onClick={() => setLbVisible((v) => !v)}>
        {lbVisible ? (
          <>
            Hide Leaderboard <FaChevronUp />
          </>
        ) : (
          <>
            Show Leaderboard <FaChevronDown />
          </>
        )}
      </button>

      {lbVisible && (
        <div className="leaderboard-glass glass">
          <div className="leaderboard-title">Top Players Today</div>
          {leaderboard.map(({ name, prize }, idx) => (
            <div className="leaderboard-row" key={name}>
              <div>
                <span className="lb-pos">{idx + 1}</span>
                <span className="lb-name">🎮 {name}</span>
              </div>
              <span className="lb-prize">₹{inr(prize)}</span>
            </div>
          ))}
          <div className="lb-note">* This leaderboard refreshes every hour</div>
        </div>
      )}

      {/* Next match widget */}
      <div className="next-match-glass glass">
        <span role="img" aria-label="timer">⏰</span>
        <span style={{ marginLeft: 10 }}>
          Next Battle Royale starts in <b>{mm}:{ss}</b>
        </span>
      </div>

      {/* Game Zone */}
      <div className="game-zone glass">
        <h2 className="game-zone-heading">
          <span role="img" aria-label="controller">🎮</span> Matches Available Now
        </h2>
        <div className="modes-list">
          {modes.map((m) => (
            <div key={m.name} className="mode-card glass" onClick={() => handleEnter(m.name)}>
              <div className="mode-header">
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-title">{m.name}</span>
              </div>
              <div className="mode-caption">{m.caption}</div>
              <div className="mode-desc">{m.desc}</div>
              <button className="enter-btn">Enter Battle</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
