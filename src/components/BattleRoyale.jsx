import React, { useEffect, useState } from "react";

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      console.log("Token:", token); // Debug log
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Get user profile
        const profileRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile response:", profileRes.status); // Debug log
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("Profile data:", profileData); // Debug log
          setBalance(profileData.balance);
        }

        // Get tournaments
        const tourRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/tournaments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Tournaments response:", tourRes.status); // Debug log
        
        if (tourRes.ok) {
          const tourData = await tourRes.json();
          console.log("Tournaments data:", tourData); // Debug log
          setTournaments(tourData);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 20, color: "#fff", background: "#222", minHeight: "100vh" }}>
        <h1>Please log in first</h1>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 20, color: "#fff", background: "#222", minHeight: "100vh" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, color: "#fff", background: "#222", minHeight: "100vh" }}>
      <button onClick={() => window.history.back()} style={{ marginBottom: 20 }}>
        ← Back to Dashboard
      </button>
      
      <h1>Battle Royale</h1>
      <p><strong>Balance: ₹{balance}</strong></p>
      
      <h2>Available Tournaments ({tournaments.length})</h2>
      
      {tournaments.length === 0 ? (
        <p>No tournaments available</p>
      ) : (
        <div>
          {tournaments.map((tournament) => (
            <div key={tournament._id} style={{ 
              border: "1px solid #555", 
              padding: 15, 
              margin: 10, 
              borderRadius: 5,
              backgroundColor: tournament.joined ? "#006600" : "#333"
            }}>
              <h3>{tournament.teamType} Tournament</h3>
              <p>Entry Fee: ₹{tournament.entryFee}</p>
              <p>Prize Pool: ₹{tournament.prizePool}</p>
              <p>Players: {tournament.players}/{tournament.maxPlayers}</p>
              <p>Time: {new Date(tournament.matchTime).toLocaleString()}</p>
              {tournament.joined ? (
                <p style={{ color: "#00ff00" }}>✓ JOINED</p>
              ) : (
                <button 
                  onClick={() => alert("Join functionality - coming next")}
                  disabled={balance < tournament.entryFee}
                  style={{ 
                    padding: "10px 20px", 
                    backgroundColor: balance >= tournament.entryFee ? "#007700" : "#666",
                    color: "#fff",
                    border: "none",
                    borderRadius: 3,
                    cursor: balance >= tournament.entryFee ? "pointer" : "not-allowed"
                  }}
                >
                  {balance >= tournament.entryFee ? `Join (₹${tournament.entryFee})` : "Insufficient Balance"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
