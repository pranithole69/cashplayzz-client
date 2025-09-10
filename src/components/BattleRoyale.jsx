import React, { useEffect, useState } from "react";
import "./BattleRoyale.css";

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showJoined, setShowJoined] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const token = localStorage.getItem("token");

  // Generate mock tournaments - ALWAYS AVAILABLE
  const generateTournaments = () => {
    const mockTournaments = [];
    const startDate = new Date();
    startDate.setHours(10, 0, 0, 0);
    
    const tournamentNames = [
      "Classic Solo", "Elite Solo", "Pro Solo", "Master Solo", "Champion Solo",
      "Warrior Solo", "Legend Solo", "Supreme Solo", "Ultimate Solo", "Apex Solo",
      "Royal Solo", "Diamond Solo", "Platinum Solo", "Gold Solo", "Silver Solo"
    ];

    for (let i = 0; i < 15; i++) {
      const entryFee = 10 + i;
      const maxPlayers = 48;
      const matchTime = new Date(startDate);
      matchTime.setMinutes(startDate.getMinutes() + (i * 25));
      
      const totalCollection = entryFee * maxPlayers;
      const profit = Math.round(totalCollection * 0.22);
      const prizePool = totalCollection - profit;
      
      const firstPrize = Math.round(prizePool * 0.5);
      const secondPrize = Math.round(prizePool * 0.3);
      const thirdPrize = Math.round(prizePool * 0.2);
      
      const returnsMultiplier = (firstPrize / entryFee).toFixed(1);
      
      const isExpired = matchTime < new Date();
      const currentPlayers = Math.min(maxPlayers, 30 + (i * 2));

      mockTournaments.push({
        _id: `tour_${i}`,
        teamType: tournamentNames[i],
        entryFee: entryFee,
        players: currentPlayers,
        maxPlayers: maxPlayers,
        matchTime: matchTime.toISOString(),
        returns: `${returnsMultiplier}x`,
        isExpired: isExpired,
        joined: false,
        prizePool: prizePool,
        rules: [
          "No teaming allowed in solo matches",
          "Use of hacks/cheats will result in immediate ban", 
          "Match starts exactly at scheduled time",
          "Winners will be announced within 30 minutes",
          "Prize distribution: 1st (50%), 2nd (30%), 3rd (20%)"
        ],
        prizes: {
          first: firstPrize,
          second: secondPrize,
          third: thirdPrize
        }
      });
    }
    return mockTournaments;
  };

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

        // TRY TO FETCH REAL TOURNAMENTS
        const tourRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/tournaments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (tourRes.ok) {
          const tourData = await tourRes.json();
          console.log("API Response:", tourData); // DEBUG LOG
          
          // CHECK if API returns valid data
          if (tourData && Array.isArray(tourData) && tourData.length > 0) {
            setTournaments(tourData);
          } else {
            console.log("API returned empty/invalid data, using mock tournaments");
            setTournaments(generateTournaments());
          }
        } else {
          console.log("API failed, using mock tournaments");
          setTournaments(generateTournaments());
        }
      } catch (error) {
        console.error("Fetch error:", error);
        console.log("Network error, using mock tournaments");
        setTournaments(generateTournaments());
      }
      setLoading(false);
    }
    
    fetchData();
  }, [token]);

  const joinedTournaments = tournaments.filter(t => t.joined);
  const availableTournaments = tournaments.filter(t => !t.joined);

  const handleTournamentClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowTournamentModal(true);
  };

  const handleJoinClick = (tournament, e) => {
    e.stopPropagation();
    setSelectedTournament(tournament);
    setShowJoinModal(true);
  };

  // ORIGINAL WORKING JOIN LOGIC
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

  const confirmJoin = async () => {
    if (!selectedTournament) return;
    setIsJoining(true);

    try {
      const response = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/join-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          entryFee: selectedTournament.entryFee,
          matchId: selectedTournament._id
        })
      });

      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setShowJoinModal(false);
        setShowTournamentModal(false);
        setSelectedTournament(null);
        window.location.reload();
      } else {
        alert(data.message || "Failed to join tournament");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (isoString) => {
    const now = new Date();
    const matchTime = new Date(isoString);
    const diff = matchTime - now;
    
    if (diff < 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // DEBUG: Log tournaments state
  console.log("Current tournaments state:", tournaments);

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
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-container">
      {/* Clean Header */}
      <div className="battle-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className="battle-title">Battle Royale</h1>
        <div className="help-icon">ℹ️</div>
      </div>

      {/* Simple Balance Display */}
      <div className="balance-display">
        <span className="balance-label">Your Balance</span>
        <span className="balance-amount">₹{balance.toLocaleString()}</span>
      </div>

      {/* Helper Text */}
      <div className="helper-text">
        💡 Tap any tournament card to see more details
      </div>

      {/* DEBUG INFO */}
      <div style={{padding: '10px', background: 'rgba(255,255,255,0.1)', margin: '10px 0', borderRadius: '10px', fontSize: '12px'}}>
        <strong>Debug Info:</strong> Total Tournaments: {tournaments.length} | 
        Available: {availableTournaments.length} | 
        Joined: {joinedTournaments.length}
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
              <div 
                key={tournament._id} 
                className="tournament-card joined-card clickable"
                onClick={() => handleTournamentClick(tournament)}
              >
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
                    <span>{formatTime(tournament.matchTime)}</span>
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
            <button onClick={() => setTournaments(generateTournaments())} style={{marginTop: '20px', padding: '10px 20px', background: '#ba55d3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>
              Load Mock Tournaments
            </button>
          </div>
        ) : (
          <div className="tournaments-grid">
            {availableTournaments.map((tournament) => (
              <div 
                key={tournament._id} 
                className={`tournament-card clickable ${tournament.isExpired ? 'expired-card' : ''}`}
                onClick={() => handleTournamentClick(tournament)}
              >
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <div className="returns-badge">
                    {tournament.returns} Returns
                  </div>
                </div>
                
                <div className="card-info">
                  <div className="info-row">
                    <span>Entry Fee:</span>
                    <span className="fee">₹{tournament.entryFee}</span>
                  </div>
                  <div className="info-row">
                    <span>Win Prize:</span>
                    <span className="prize">₹{tournament.prizes?.first || tournament.prizePool}</span>
                  </div>
                  <div className="info-row">
                    <span>Players:</span>
                    <span>{tournament.players}/{tournament.maxPlayers}</span>
                  </div>
                  <div className="info-row">
                    <span>Starts:</span>
                    <span className={tournament.isExpired ? 'expired-text' : ''}>
                      {tournament.isExpired ? 'Expired - Next Session Tomorrow' : formatTime(tournament.matchTime)}
                    </span>
                  </div>
                </div>

                {!tournament.isExpired && (
                  <button
                    className={`join-btn ${balance >= tournament.entryFee ? 'enabled' : 'disabled'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(tournament);
                    }}
                    disabled={balance < tournament.entryFee}
                  >
                    {balance >= tournament.entryFee ? `Join (₹${tournament.entryFee})` : 'Insufficient Balance'}
                  </button>
                )}

                {tournament.isExpired && (
                  <div className="expired-notice">
                    Tournament Expired - Next Session Starts Tomorrow at 10 AM
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Details Modal */}
      {showTournamentModal && selectedTournament && (
        <div className="tournament-modal-overlay" onClick={() => setShowTournamentModal(false)}>
          <div className="tournament-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTournamentModal(false)}>
              ✕
            </button>
            
            <div className="tournament-modal-header">
              <h2>{selectedTournament.teamType}</h2>
              <div className="returns-badge large">
                {selectedTournament.returns || '18.7x'} Returns
              </div>
            </div>

            <div className="tournament-modal-body">
              {/* Prize Distribution */}
              <div className="prize-section">
                <h3>🏆 Prize Distribution</h3>
                <div className="prizes-grid">
                  <div className="prize-item first-place">
                    <div className="position">1st Place</div>
                    <div className="amount">₹{selectedTournament.prizes?.first || Math.round(selectedTournament.prizePool * 0.5)}</div>
                  </div>
                  <div className="prize-item second-place">
                    <div className="position">2nd Place</div>
                    <div className="amount">₹{selectedTournament.prizes?.second || Math.round(selectedTournament.prizePool * 0.3)}</div>
                  </div>
                  <div className="prize-item third-place">
                    <div className="position">3rd Place</div>
                    <div className="amount">₹{selectedTournament.prizes?.third || Math.round(selectedTournament.prizePool * 0.2)}</div>
                  </div>
                </div>
              </div>

              {/* Tournament Quick Info */}
              <div className="tournament-quick-info">
                <div className="quick-info-item">
                  <span className="label">Entry Fee</span>
                  <span className="value fee">₹{selectedTournament.entryFee}</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Players</span>
                  <span className="value">{selectedTournament.players}/{selectedTournament.maxPlayers}</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Starts In</span>
                  <span className="value">
                    {selectedTournament.isExpired ? 'Expired' : getTimeRemaining(selectedTournament.matchTime)}
                  </span>
                </div>
              </div>

              {/* Important Notice */}
              <div className="important-notice">
                <h4>📢 Important Notice</h4>
                <p>Room ID and Password will be updated 5 minutes before match start. Please check back!</p>
              </div>

              {/* Rules Section */}
              <div className="rules-section">
                <h4>📋 Tournament Rules</h4>
                <div className="rules-list">
                  {selectedTournament.rules.map((rule, index) => (
                    <div key={index} className="rule-item">{rule}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="tournament-modal-footer">
              {!selectedTournament.joined && !selectedTournament.isExpired && (
                <button 
                  className={`join-tournament-btn ${balance >= selectedTournament.entryFee ? 'enabled' : 'disabled'}`}
                  onClick={() => {
                    setShowTournamentModal(false);
                    setShowJoinModal(true);
                  }}
                  disabled={balance < selectedTournament.entryFee || selectedTournament.players >= selectedTournament.maxPlayers}
                >
                  {selectedTournament.players >= selectedTournament.maxPlayers ? 
                    'Tournament Full' : 
                    balance >= selectedTournament.entryFee ? 
                      `Join Tournament (₹${selectedTournament.entryFee})` : 
                      'Insufficient Balance'
                  }
                </button>
              )}
              
              {selectedTournament.joined && (
                <div className="already-joined">
                  ✅ You have joined this tournament
                </div>
              )}
              
              {selectedTournament.isExpired && (
                <div className="expired-footer-notice">
                  🕐 Tournament has expired - Same tournament starts tomorrow at 10 AM
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple Join Confirmation Modal */}
      {showJoinModal && selectedTournament && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowJoinModal(false)}>✕</button>
            
            <div className="modal-header">
              <h3>Join Tournament</h3>
            </div>

            <div className="modal-body">
              <div className="tournament-preview">
                <h4>{selectedTournament.teamType} Tournament</h4>
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span>Entry Fee</span>
                    <span>₹{selectedTournament.entryFee}</span>
                  </div>
                  <div className="preview-stat">
                    <span>Win Prize</span>
                    <span>₹{selectedTournament.prizes?.first || Math.round(selectedTournament.prizePool * 0.5)}</span>
                  </div>
                  <div className="preview-stat">
                    <span>Returns</span>
                    <span>{selectedTournament.returns || '18.7x'}</span>
                  </div>
                </div>
              </div>

              <div className="balance-check">
                <span>Your Balance: ₹{balance.toLocaleString()}</span>
                <span>After Join: ₹{(balance - selectedTournament.entryFee).toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowJoinModal(false)}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm"
                onClick={confirmJoin}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Confirm Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
