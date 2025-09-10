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

  // Generate mock tournaments with your specifications
  const generateTournaments = () => {
    const mockTournaments = [];
    const startDate = new Date();
    startDate.setHours(18, 0, 0, 0); // 6 PM today
    
    const tournamentNames = [
      "Classic Solo", "Elite Solo", "Pro Solo", "Master Solo", "Champion Solo",
      "Warrior Solo", "Legend Solo", "Supreme Solo", "Ultimate Solo", "Apex Solo",
      "Royal Solo", "Diamond Solo", "Platinum Solo", "Gold Solo", "Silver Solo"
    ];

    for (let day = 0; day < 7; day++) {
      for (let i = 0; i < 15; i++) {
        const entryFee = Math.floor(Math.random() * (50 - 7 + 1)) + 7; // 7-50 rs
        let roi, prizeMultiplier;
        
        // ROI based on your requirements
        if (i % 3 === 0) {
          roi = 400;
          prizeMultiplier = 4;
        } else if (i % 3 === 1) {
          roi = 300;
          prizeMultiplier = 3;
        } else {
          roi = 150;
          prizeMultiplier = 1.5;
        }

        const matchTime = new Date(startDate);
        matchTime.setDate(startDate.getDate() + day);
        matchTime.setHours(18 + i); // Stagger throughout the day

        const isExpired = matchTime < new Date();

        mockTournaments.push({
          _id: `tour_${day}_${i}`,
          teamType: tournamentNames[i],
          entryFee: entryFee,
          prizePool: Math.round(entryFee * prizeMultiplier),
          players: Math.floor(Math.random() * 85) + 5,
          maxPlayers: 100,
          matchTime: matchTime.toISOString(),
          roi: roi,
          isExpired: isExpired,
          joined: false,
          rules: [
            "No teaming allowed in solo matches",
            "Use of hacks/cheats will result in immediate ban",
            "Match starts exactly at scheduled time",
            "Winners will be announced within 30 minutes",
            "Prize distribution: 1st (50%), 2nd (30%), 3rd (20%)"
          ],
          prizes: {
            first: Math.round(entryFee * prizeMultiplier * 0.5),
            second: Math.round(entryFee * prizeMultiplier * 0.3),
            third: Math.round(entryFee * prizeMultiplier * 0.2)
          },
          joinedPlayers: [
            { name: "ProGamer123", joinTime: "2 hours ago" },
            { name: "FireFighter88", joinTime: "1 hour ago" },
            { name: "ShadowHunter", joinTime: "45 mins ago" },
            { name: "RoyaleKing", joinTime: "30 mins ago" },
            { name: "DeathStroke99", joinTime: "15 mins ago" }
          ]
        });
      }
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

        // Use mock tournaments for now
        const mockTournaments = generateTournaments();
        setTournaments(mockTournaments);
        
      } catch (error) {
        console.error("Fetch error:", error);
        // Fallback to mock data
        setTournaments(generateTournaments());
      }
      setLoading(false);
    }
    
    fetchData();
  }, [token]);

  // Sort tournaments - active first, then expired
  const sortedTournaments = tournaments.sort((a, b) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired - b.isExpired; // Active first
    }
    return new Date(a.matchTime) - new Date(b.matchTime);
  });

  const joinedTournaments = sortedTournaments.filter(t => t.joined);
  const availableTournaments = sortedTournaments.filter(t => !t.joined);

  const handleTournamentClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowTournamentModal(true);
  };

  const handleJoinClick = (tournament, e) => {
    e.stopPropagation();
    setSelectedTournament(tournament);
    setShowJoinModal(true);
  };

  const confirmJoin = async () => {
    if (!selectedTournament) return;
    setIsJoining(true);

    try {
      // Simulate join - replace with actual API call
      setTimeout(() => {
        setBalance(prev => prev - selectedTournament.entryFee);
        
        // Update tournament to joined
        setTournaments(prev => 
          prev.map(t => 
            t._id === selectedTournament._id 
              ? { ...t, joined: true, players: t.players + 1 }
              : t
          )
        );

        setIsJoining(false);
        setShowJoinModal(false);
        setShowTournamentModal(false);
        setSelectedTournament(null);
        setShowJoined(true);
      }, 1500);
    } catch (error) {
      setIsJoining(false);
      alert("Network error. Please try again.");
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
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
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
        {/* Removed the alert notification */}
        <div className="help-icon">
          ℹ️
        </div>
      </div>

      {/* Simple Balance Display */}
      <div className="balance-display">
        <span className="balance-label">Your Balance</span>
        <span className="balance-amount">₹{balance.toLocaleString()}</span>
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
                    <span>Starts:</span>
                    <span>{getTimeRemaining(tournament.matchTime)}</span>
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
              <div 
                key={tournament._id} 
                className={`tournament-card clickable ${tournament.isExpired ? 'expired-card' : ''}`}
                onClick={() => handleTournamentClick(tournament)}
              >
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <div className={`roi-badge roi-${tournament.roi}`}>
                    {tournament.roi}% ROI
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
                    <span className={tournament.isExpired ? 'expired-text' : ''}>
                      {tournament.isExpired ? 'Expired - Starting Tomorrow' : formatTime(tournament.matchTime)}
                    </span>
                  </div>
                </div>

                {!tournament.isExpired && (
                  <button
                    className={`join-btn ${balance >= tournament.entryFee ? 'enabled' : 'disabled'}`}
                    onClick={(e) => handleJoinClick(tournament, e)}
                    disabled={balance < tournament.entryFee || tournament.players >= tournament.maxPlayers}
                  >
                    {tournament.players >= tournament.maxPlayers ? 
                      'FULL' : 
                      balance >= tournament.entryFee ? 
                        `Join (₹${tournament.entryFee})` : 
                        'Insufficient Balance'
                    }
                  </button>
                )}

                {tournament.isExpired && (
                  <div className="expired-notice">
                    Tournament Expired - Restarts Tomorrow
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Large Tournament Details Modal */}
      {showTournamentModal && selectedTournament && (
        <div className="tournament-modal-overlay" onClick={() => setShowTournamentModal(false)}>
          <div className="tournament-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTournamentModal(false)}>
              ✕
            </button>
            
            <div className="tournament-modal-header">
              <h2>{selectedTournament.teamType} Tournament</h2>
              <div className={`roi-badge large roi-${selectedTournament.roi}`}>
                {selectedTournament.roi}% ROI
              </div>
            </div>

            <div className="tournament-modal-body">
              {/* Prize Distribution */}
              <div className="prize-section">
                <h3>🏆 Prize Distribution</h3>
                <div className="prizes-grid">
                  <div className="prize-item first">
                    <span className="position">1st Place</span>
                    <span className="amount">₹{selectedTournament.prizes.first}</span>
                  </div>
                  <div className="prize-item second">
                    <span className="position">2nd Place</span>
                    <span className="amount">₹{selectedTournament.prizes.second}</span>
                  </div>
                  <div className="prize-item third">
                    <span className="position">3rd Place</span>
                    <span className="amount">₹{selectedTournament.prizes.third}</span>
                  </div>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="tournament-info-grid">
                <div className="info-card">
                  <span className="info-label">Entry Fee</span>
                  <span className="info-value fee">₹{selectedTournament.entryFee}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Total Pool</span>
                  <span className="info-value prize">₹{selectedTournament.prizePool}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Players</span>
                  <span className="info-value">{selectedTournament.players}/{selectedTournament.maxPlayers}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Starts In</span>
                  <span className="info-value">
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
                <ul>
                  {selectedTournament.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Joined Players */}
              <div className="joined-players-section">
                <h4>👥 Recently Joined Players</h4>
                <div className="players-list">
                  {selectedTournament.joinedPlayers.map((player, index) => (
                    <div key={index} className="player-item">
                      <span className="player-name">{player.name}</span>
                      <span className="join-time">{player.joinTime}</span>
                    </div>
                  ))}
                  <div className="view-all">
                    + {selectedTournament.players - 5} more players...
                  </div>
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
                <div className="expired-notice">
                  🕐 Tournament has expired - Same tournament starts tomorrow
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
            <button className="modal-close" onClick={() => setShowJoinModal(false)}>
              ✕
            </button>
            
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
                    <span>Prize Pool</span>
                    <span>₹{selectedTournament.prizePool}</span>
                  </div>
                  <div className="preview-stat">
                    <span>ROI</span>
                    <span>{selectedTournament.roi}%</span>
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
