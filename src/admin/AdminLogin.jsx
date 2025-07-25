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
        setError("❌ Not authorized. You are not an admin.");
        return;
      }

      localStorage.setItem("adminToken", token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-neon"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-neon">
          Admin Login
        </h2>

        <input
          type="text"
          name="identifier"
          placeholder="Email or Username"
          value={input.identifier}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-neon"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={input.password}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-neon"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-neon hover:bg-pink-600 text-white font-bold py-2 rounded transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
