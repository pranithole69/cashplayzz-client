// client/src/admin/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [input, setInput] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://cashplayzz-backend-1.onrender.com/api/auth/login", input);
      const { token, role } = res.data;

      if (role !== "admin") {
        setError("Not authorized. You are not an admin.");
        return;
      }

      localStorage.setItem("adminToken", token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-neon">Admin Login</h2>

        <input
          type="text"
          name="identifier"
          placeholder="Email or Username"
          value={input.identifier}
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-gray-800 text-white border border-gray-600"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={input.password}
          onChange={handleChange}
          className="w-full mb-4 p-2 rounded bg-gray-800 text-white border border-gray-600"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-neon hover:bg-pink-600 text-white font-bold py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
