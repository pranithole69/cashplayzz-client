import React, { useEffect, useState } from "react";
import axios from "axios";

const DepositsList = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "https://cashplayzz-backend-1.onrender.com/api/admin/deposits",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeposits(response.data);
    } catch (err) {
      setError("Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `https://cashplayzz-backend-1.onrender.com/api/admin/deposits/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDeposits(); // Refresh the list
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-white text-xl mb-4 font-bold">Pending Deposits</h2>
      {deposits.length === 0 ? (
        <p className="text-white">No pending deposits</p>
      ) : (
        <div className="space-y-4">
          {deposits.map((dep) => (
            <div
              key={dep._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg text-white"
            >
              <p>
                <span className="text-gray-400">Username:</span>{" "}
                {dep.userId?.username || "Unknown"}
              </p>
              <p>
                <span className="text-gray-400">Sender Name:</span>{" "}
                {dep.senderName}
              </p>
              <p>
                <span className="text-gray-400">Amount:</span> ₹{dep.amount}
              </p>
              <p>
                <span className="text-gray-400">Transaction ID:</span>{" "}
                {dep.transactionId}
              </p>
              <p>
                <span className="text-gray-400">Submitted:</span>{" "}
                {new Date(dep.createdAt).toLocaleString()}
              </p>
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => handleApproval(dep._id, "approved")}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(dep._id, "rejected")}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepositsList;
