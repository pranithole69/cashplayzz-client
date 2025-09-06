import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaInfoCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
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
  const toggleInfo = () => setShowInfo(!showInfo);

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
      console.error("❌ Fetch user error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (userToken) fetchUser();
  }, [userToken]);

  const modes = [
    { name: "Battle Royale", description: "Classic survival mode" },
    { name: "Clash Squad", description: "Fast-paced 4v4 matches" },
    { name: "Lone Wolf", description: "1v1 intense duels" },
  ];

  const handleEnterMode = (modeName) => {
    if (modeName === "Battle Royale") navigate("/battle-royale");
    else if (modeName === "Clash Squad") navigate("/clash-squad");
    else if (modeName === "Lone Wolf") navigate("/lone-wolf");
    else toast.info(`Mode ${modeName} clicked!`);
  };

  return (
    <div className="dashboard-container">
      <ToastContainer limit={1} />
      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
      </div>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div className="sidebar">
          <ul>
            <li onClick={handleDeposit}>Deposit</li>
            <li onClick={handleWithdraw}>Withdraw</li>
            <li onClick={goToSettings}>Settings</li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      )}

      {/* Balance Box */}
      <div className="balance-box">
        <div className="balance-info">
          <span className="balance-label">YOUR BALANCE</span>
          <span className="balance-text">₹{balance}</span>
          <span className="balance-user">
            Logged in as: <b>{username}</b>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaWallet className="wallet-icon" onClick={toggleWallet} />
          <FaInfoCircle className="info-icon" onClick={toggleInfo} />
        </div>
        {showInfo && (
          <div className="info-tooltip">
            How to deposit? Click wallet{" "}
            <FaWallet style={{ verticalAlign: "middle" }} /> and follow instructions.
          </div>
        )}
      </div>

      {/* Wallet Forms */}
      {walletOpen && (
        <div className="wallet-box">
          {showDepositForm && <DepositForm />}
          {showWithdrawForm && <WithdrawForm />}
        </div>
      )}

      {/* Section Heading */}
      <h2 className="gamezone-title">CHOOSE YOUR PREFERENCE OF BATTLE</h2>

      {/* Game Zone */}
      <div className="game-zone minimal">
        <div className="modes-list">
          {modes.map((mode) => (
            <div className="mode-card minimal" key={mode.name}>
              <div className="game-name">{mode.name}</div>
              <p className="game-desc">{mode.description}</p>
              <button
                className="enter-button minimal"
                onClick={() => handleEnterMode(mode.name)}
              >
                Enter
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logout spinner overlay */}
      {loggingOut && (
        <div className="logout-overlay">
          <div className="spinner"></div>
          Logging out...
        </div>
      )}
    </div>
  );
}

export default Dashboard;
