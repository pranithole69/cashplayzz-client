import { useState, useEffect } from "react";
import background from "./assets/bg.png";
import "./App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Agreement from "./Agreement";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);

  const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 1000) + 200);
  const [wageredAmount, setWageredAmount] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 11) + 5;
      const increase = Math.random() > 0.5;
      setActiveUsers((prev) => {
        let updated = increase ? prev + change : prev - change;
        return Math.max(50, Math.min(5000, updated));
      });

      const newAmount = Math.floor(Math.random() * (350000 - 23000 + 1)) + 23000;
      setWageredAmount(newAmount);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAgreement = () => setShowAgreement(!showAgreement);

  const handleSignup = async () => {
    if (!agreeChecked) return toast.warn("Please accept the user agreement.");
    if (!signupEmail || !signupUsername || !signupPassword)
      return toast.warn("All fields required.");

    const toastId = toast.loading("⏳ Signing up...");

    try {
      const res = await axios.post(`${backendURL}/api/auth/signup`, {
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
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

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return toast.warn("Enter both fields.");
    const toastId = toast.loading("⏳ Logging in...");
    try {
      const res = await axios.post(`${backendURL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      toast.update(toastId, {
        render: res.data.message || "Login successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setShowLogin(false);
      navigate("/dashboard");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Login failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${background})` }}>
      <ToastContainer position="top-center" />
      <div className="center-box">
        <p className="time-indicator">🌐 World → 🇮🇳 India → 🕓 {currentTime}</p>
        <h1 className="welcome">
          Welcome to <span className="highlight">CashPlayzz</span>
        </h1>

        <div className="buttons">
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowSignup(true)}>Signup</button>
          <button onClick={toggleAgreement}>View User Agreement</button>
        </div>

        <div className="info-section">
          <p>🔥 {activeUsers.toLocaleString()} players active</p>
          <p>💸 ₹{wageredAmount.toLocaleString()} wagered this second</p>
        </div>

        <div className="footer-note">
          Powered by CashPlayzz — where gaming meets strategy.<br />
          <span>Play smart. Stay in control.</span>
        </div>

        <p className="footer-msg">
          Don’t worry, you’re on a safe platform, <span>BUDDYY!</span>
        </p>
      </div>

      {/* MODALS */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Login to CashPlayzz</h2>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            <button className="modal-btn" onClick={handleLogin}>Login</button>
            <button className="modal-close" onClick={() => setShowLogin(false)}>Close</button>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal-overlay" onClick={() => setShowSignup(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create an Account</h2>
            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            <input type="text" placeholder="Username" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            <label className="agreement-checkbox">
              <input type="checkbox" checked={agreeChecked} onChange={() => setAgreeChecked(!agreeChecked)} />
              I accept the <span onClick={toggleAgreement}>User Agreement</span>
            </label>
            <button className="modal-btn" onClick={handleSignup} disabled={!agreeChecked}>Signup</button>
            <button className="modal-close" onClick={() => setShowSignup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* AGREEMENT MODAL */}
      {showAgreement && <Agreement onClose={toggleAgreement} />}
    </div>
  );
}

export default App;
