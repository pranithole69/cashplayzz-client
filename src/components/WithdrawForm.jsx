import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./WithdrawForm.css"; // uses same styling as deposit-box

function WithdrawForm({ token, setBalance }) {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!amount || !upiId) {
      toast.warn("⚠️ Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "https://cashplayzz-backend-1.onrender.com/api/withdraw",
        { amount, upiId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Withdrawal request submitted!");

      // 🧠 Smartest: update balance locally
      if (setBalance) {
        setBalance((prev) => prev - parseFloat(amount));
      }

      setAmount("");
      setUpiId("");
    } catch (err) {
      const msg = err.response?.data?.message || "Withdrawal failed";
      toast.error(`❌ ${msg}`);

      if (err.response?.status === 401) {
        toast.info("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-box"> {/* glassmorphism style from Deposit */}
      <h3>Withdraw Funds</h3>

      <label>Amount (₹):</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to withdraw"
      />

      <label>Your UPI ID:</label>
      <input
        type="text"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="e.g. yourname@upi"
      />

      <button onClick={handleWithdraw} disabled={loading}>
        {loading ? "Submitting..." : "Submit Withdrawal"}
      </button>
    </div>
  );
}

export default WithdrawForm;
