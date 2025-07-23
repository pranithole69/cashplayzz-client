// client/src/admin/DepositsList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function DepositsList() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  const fetchDeposits = async () => {
    try {
      const res = await axios.get("https://cashplayzz-backend-1.onrender.com/api/admin/deposits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeposits(res.data);
    } catch (err) {
      console.error("Failed to fetch deposits", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(
        `https://cashplayzz-backend-1.onrender.com/api/admin/deposits/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeposits(deposits.filter((d) => d._id !== id));
    } catch (err) {
      console.error(`Failed to ${action} deposit`, err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  if (loading) return <p className="text-white mt-10 text-center">Loading deposits...</p>;
  if (deposits.length === 0) return <p className="text-gray-400 mt-10 text-center">No pending deposits</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl font-bold text-center text-neon mb-6">Pending Deposit Approvals</h2>

      <div className="space-y-4 max-w-4xl mx-auto">
        {deposits.map((dep) => (
          <div
            key={dep._id}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p><span className="text-gray-400">User:</span> {dep.senderName}</p>
              <p><span className="text-gray-400">Amount:</span> ₹{dep.amount}</p>
              <p><span className="text-gray-400">Txn ID:</span> {dep.transactionId}</p>
              <p><span className="text-gray-400">Method:</span> {dep.method}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(dep._id, "approve")}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(dep._id, "reject")}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepositsList;
