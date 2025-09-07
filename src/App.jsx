import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import Agreement from "./Agreement.jsx";   // Correct relative import

const backendURL = "https://cashplayzz-backend-1.onrender.com";
const background = "/bg.png"; // Public folder asset

const App = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 1000) + 200);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [loginCredential, setLoginCredential] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 11) + 5;
      const increase = Math.random() > 0.5;
      setActiveUsers((prev) => Math.max(50, Math.min(5000, increase ? prev + change : prev - change)));
      const newAmount = Math.floor(Math.random() * (350000 - 23000 + 1)) + 23000;
      setWageredAmount(newAmount);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAgreement = () => setShowAgreement(!showAgreement);

  const handleSignup = async () => {
    if (!agreeChecked) return toast.warn("Please accept the user agreement.");
    if (!signupEmail || !signupUsername || !signupPassword) return toast.warn("All fields required.");
    const toastId = toast.loading("⏳ Signing up...");
    try {
      const res = await axios.post(`${backendURL}/api/auth/signup`, {
        email: signupEmail.trim(),
        username: signupUsername.trim(),
        password: signupPassword.trim(),
      });
      toast.update(toastId, {
        render: res.data.message || "Signup successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setShowSignup(false);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Signup failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const navigateToBattleRoyale = () => navigate("/battle-royale");

  const handleLogin = async () => {
    if (!loginCredential || !loginPassword) return toast.error("⚠️ Email/Username and password required.");
    setIsLoggingIn(true);
    const warmUpTimeout = setTimeout(() => {
      toast.info("🚀 Server warming up...", { position: "top-center", autoClose: 4000 });
    }, 5000);
    const toastId = toast.loading("⏳ Logging in...");
    try {
      const res = await axios.post(`${backendURL}/api/auth/login`, {
        identifier: loginCredential.trim(),
        password: loginPassword.trim(),
      });
      clearTimeout(warmUpTimeout);
      localStorage.setItem("token", res.data.token);
      toast.update(toastId, {
        render: res.data.message || "Login successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setShowLogin(false);

      // Decode token safely:
      const decodedToken = JSON.parse(atob(res.data.token.split(".")[1]));
      if (decodedToken.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      clearTimeout(warmUpTimeout);
      toast.update(toastId, {
        render: err?.response?.data?.message || "❌ Invalid credentials or server error.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${background})` }}>
      <ToastContainer position="top-center" />
      {isLoggingIn && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Logging in...</p>
        </div>
      )}
      <div className="center-box">
        <p className="time-indicator">🌐 World → 🇮🇳 India → 🕓 {currentTime}</p>
        <h1 className="welcome">
          Welcome to <span className="highlight">CashPlayzz</span>
        </h1>

        <div className="buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowSignup(true)}>Signup</button>
          <button onClick={toggleAgreement}>View User Agreement</button>
          <button
            onClick={navigateToBattleRoyale}
            style={{
              marginTop: "15px",
              backgroundColor: "#06b6d4",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            Battle Royale
          </button>
        </div>

        <div className="info-section">
          <p>🔥 {activeUsers.toLocaleString()} players active</p>
          <p>💸 ₹{wageredAmount.toLocaleString()} wagered this second</p>
        </div>
        <div className="footer-note">Powered by CashPlayzz — Play smart. Stay in control.</div>
        <p className="footer-msg">
          You’re on a safe platform, <span>BUDDYY!</span>
        </p>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Login to CashPlayzz</h2>
            <input
              type="text"
              placeholder="Email or Username"
              value={loginCredential}
              onChange={(e) => setLoginCredential(e.target.value)}
            />
            <div className="password-field">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <span onClick={() => setShowLoginPassword(!showLoginPassword)}>
                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <button className="modal-btn" onClick={handleLogin}>
              Login
            </button>
            <button className="modal-close" onClick={() => setShowLogin(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="modal-overlay" onClick={() => setShowSignup(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create an Account</h2>
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
            />
            <div className="password-field">
              <input
                type={showSignupPassword ? "text" : "password"}
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <span onClick={() => setShowSignupPassword(!showSignupPassword)}>
                {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <label className="agreement-checkbox">
              <input
                type="checkbox"
                checked={agreeChecked}
                onChange={() => setAgreeChecked(!agreeChecked)}
              />
              I accept the <span onClick={toggleAgreement}>User Agreement</span>
            </label>
            <button className="modal-btn" onClick={handleSignup} disabled={!agreeChecked}>
              Signup
            </button>
            <button className="modal-close" onClick={() => setShowSignup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showAgreement && <Agreement onClose={toggleAgreement} />}
    </div>
  );
};

export default App;
