import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./DepositForm.css";

function DepositForm({ token }) {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !transactionId || !senderName) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await axios.post(
        "https://cashplayzz-backend-1.onrender.com/api/deposit", // Use your Render backend URL
        {
          amount: Number(amount),
          transactionId,
          senderName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message || "Deposit submitted successfully");

      // Clear input fields after success
      setAmount("");
      setTransactionId("");
      setSenderName("");
    } catch (err) {
      console.error("❌ Deposit error:", err);
      toast.error(err.response?.data?.error || "Server error");
    }
  };

  return (
    <form className="deposit-box" onSubmit={handleSubmit}>
      <h3>💰 UPI Deposit</h3>

      <label>Enter Amount (₹)</label>
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="100"
        required
      />

      <label>Your UPI Transaction ID</label>
      <input
        type="text"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        placeholder="Ex: 218372912837"
        required
      />

      <label>Sender Name (As per Bank)</label>
      <input
        type="text"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
        placeholder="Your full name"
        required
      />

      <label>Send to this UPI ID</label>
      <div className="upi-id-box">notpranit69@okicici</div>

      <img src="/qr.png" alt="QR Code" className="qr-img" />

      <button type="submit">Submit Deposit</button>
    </form>
  );
}

export default DepositForm;
