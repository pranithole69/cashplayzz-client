import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaWallet, FaBars, FaTimes, FaInfoCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DepositForm from "./components/DepositForm.jsx";
import WithdrawForm from "./components/WithdrawForm.jsx";
import JoinedMatches from "./components/JoinedMatches.jsx";


function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showJoinedMatches, setShowJoinedMatches] = useState(false);
  const [joinedMatches, setJoinedMatches] = useState([]);
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
    toast.info("Settings feature coming soon");
  };

  const handleDeposit = () => {
    setShowDepositForm(!showDepositForm);
    setShowWithdrawForm(false);
  };

  const handleWithdraw = () => {
    setShowWithdrawForm(!showWithdrawForm);
    setShowDepositForm(false);
  };

  const getAuthHeaders = () => {
    return userToken ? { Authorization: `Bearer ${userToken}` } : {};
  };

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        headers: getAuthHeaders(),
      });
      setUsername(res.data.username);
      setBalance(res.data.balance);
    } catch (error) {
      toast.error("Failed to load user info");
      console.error("Fetch userProfile error:", error);
    }
  };

  const fetchJoinedMatches = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/jo
ined-matches`, {
        headers: getAuthHeaders(),
      });
      setJoinedMatches(res.data);
    } catch (error) {
      toast.error("Failed to load joined matches");
      console.error("Fetch joinedMatches error:", error);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchUserProfile();
      fetchJoinedMatches();
    }
  }, [userToken]);


  const modes = [
    { name: "Battle Royale", description: "Classic survival mode" },
    { name: "Clash Squad", description: "Fast Paced, Fast Wins" },
    { name: "Lone Wolf", description: "1v1 intense duels" },
  ];

  const handleEnterMode = (modeName) => {
    if (modeName === "Battle Royale") navigate("/battle-royale");
    else if (modeName === "Clash Squad") navigate("/clash-squad");
    else if (modeName === "Lone Wolf") navigate("/lone-wolf");
    else toast.info(`Clicked: ${modeName}`);
  };

  return (
    <div className="dashboard-container">
      <ToastContainer limit={1} />

      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </div>

      {/* Info Icon */}
      <div className="info-corner">
        <FaInfoCircle className="info-icon" onClick={() => setShowTips(!showTips)} />
        {showTips && (
          <div className="info-popup">
            <p><b>How to deposit?</b></p>
            <p>Click wallet icon to add funds</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {menuOpen && (
        <div className="sidebar">
          <ul>
            <li onClick={goToSettings}>Settings</li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      )}

      {/* Balance Box */}
      <div className="balance-box">
        <div className="balance-info">
          <span className="balance-label">YOUR BALANCE</span>
          <span className="balance-amount">₹{balance}</span>
          <span className="logged-user">Logged in as: {username}</span>
        </div>
        <FaWallet className="wallet-icon" onClick={toggleWallet} />
      </div>

      {walletOpen && (
        <div className="wallet-box">
          <div className="actions">
            <button className="btn" onClick={handleDeposit}>Deposit</button>
            <button className="btn" onClick={handleWithdraw}>Withdraw</button>
          </div>
          {showDepositForm && <DepositForm />}
          {showWithdrawForm && <WithdrawForm />}
        </div>
      )}

      {/* Button to open joined matches modal */}
      <button className="btn joined-btn" onClick={() => setShowJoinedMatches(true)}>
        Joined Matches ({joinedMatches.length})
      </button>

      {/* Joined Matches Modal */}
      {showJoinedMatches && (
        <div className="modal-overlay">
          <button className="close-btn" onClick={() => setShowJoinedMatches(false)} aria-label="Close joined matches modal">
            &times;
          </button>
          <JoinedMatches matches={joinedMatches} onClose={() => setShowJoinedMatches(false)} />
        </div>
      )}

      {/* Modes Selection */}
      <div className="game-zone">
        <h2>Choose Your Preference of Battle</h2>
        <div className="modes">
          {modes.map((mode) => (
            <div key={mode.name} className="mode-card">
              <h3>{mode.name}</h3>
              <p>{mode.description}</p>
              <button onClick={() => handleEnterMode(mode.name)}>Enter</button>
            </div>
          ))}
        </div>
      </div>

      {loggingOut && (
        <div className="logging-out-overlay">
          <div className="spinner"></div>
          Logging out...
        </div>
      )}
    </div>
  );
}

export default Dashboard;
