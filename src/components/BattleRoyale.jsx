import React, { useEffect, useState } from "react";
import "./BattleRoyale.css";

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showJoined, setShowJoined] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const profileRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setBalance(profileData.balance);
        }

        const tourRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/tournaments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (tourRes.ok) {
          const tourData = await tourRes.json();
          setTournaments(tourData);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [token]);

  const joinedTournaments = tournaments.filter(t => t.joined);
  const availableTournaments = tournaments.filter(t => !t.joined);

  const handleJoin = async (tournament) => {
    try {
      const response = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/join-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          entryFee: tournament.entryFee,
          matchId: tournament._id
        })
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        window.location.reload();
      } else {
        alert(data.message || "Failed to join");
      }
    } catch (error) {
      alert("Error joining tournament");
    }
  };

  if (!token) {
    return (
      <div className="battle-container">
        <div className="auth-message">
          <h1>Please log in first</h1>
          <button className="back-btn" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="battle-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h2>Loading Battles...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-container">
      {/* Header */}
      <div className="battle-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className="battle-title">Battle Royale</h1>
        <div className="help-icon" onClick={() => alert("Contact support@cashplayzz.com")}>
          ℹ️
        </div>
      </div>

      {/* Balance Display */}
      <div className="balance-display">
        <span className="balance-label">Your Balance</span>
        <span className="balance-amount">₹{balance}</span>
      </div>

      {/* Joined Matches Toggle */}
      {joinedTournaments.length > 0 && (
        <button 
          className="joined-toggle-btn"
          onClick={() => setShowJoined(!showJoined)}
        >
          {showJoined ? 'Hide' : 'Show'} Joined Matches ({joinedTournaments.length})
        </button>
      )}

      {/* Joined Matches Section */}
      {showJoined && joinedTournaments.length > 0 && (
        <div className="joined-section">
          <h2 className="section-title">Your Joined Matches</h2>
          <div className="tournaments-grid">
            {joinedTournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card joined-card">
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <span className="joined-badge">✓ JOINED</span>
                </div>
                <div className="card-info">
                  <div className="info-row">
                    <span>Entry Fee:</span>
                    <span className="fee">₹{tournament.entryFee}</span>
                  </div>
                  <div className="info-row">
                    <span>Prize Pool:</span>
                    <span className="prize">₹{tournament.prizePool}</span>
                  </div>
                  <div className="info-row">
                    <span>Players:</span>
                    <span>{tournament.players}/{tournament.maxPlayers}</span>
                  </div>
                  <div className="info-row">
                    <span>Match Time:</span>
                    <span>{new Date(tournament.matchTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tournaments */}
      <div className="available-section">
        <h2 className="section-title">Available Tournaments ({availableTournaments.length})</h2>
        
        {availableTournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No tournaments available at the moment</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {availableTournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card">
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <div className={`difficulty-badge ${tournament.entryFee > 50 ? 'premium' : tournament.entryFee > 30 ? 'advanced' : 'basic'}`}>
                    {tournament.entryFee > 50 ? 'PREMIUM' : tournament.entryFee > 30 ? 'ADVANCED' : 'BASIC'}
                  </div>
                </div>
                
                <div className="card-info">
                  <div className="info-row">
                    <span>Entry Fee:</span>
                    <span className="fee">₹{tournament.entryFee}</span>
                  </div>
                  <div className="info-row">
                    <span>Prize Pool:</span>
                    <span className="prize">₹{tournament.prizePool}</span>
                  </div>
                  <div className="info-row">
                    <span>Players:</span>
                    <span>{tournament.players}/{tournament.maxPlayers}</span>
                  </div>
                  <div className="info-row">
                    <span>Starts:</span>
                    <span>{new Date(tournament.matchTime).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  className={`join-btn ${balance >= tournament.entryFee ? 'enabled' : 'disabled'}`}
                  onClick={() => handleJoin(tournament)}
                  disabled={balance < tournament.entryFee}
                >
                  {balance >= tournament.entryFee ? `Join (₹${tournament.entryFee})` : 'Insufficient Balance'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
