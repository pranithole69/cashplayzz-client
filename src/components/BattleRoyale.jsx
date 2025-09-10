import React, { useEffect, useState } from "react";
import "./BattleRoyale.css";

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("time");
  const [searchTerm, setSearchTerm] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState({});
  const token = localStorage.getItem("token");

  // Filter options for difficulty levels
  const FILTER_OPTIONS = ["All", "Basic", "Advanced", "Premium"];

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

  // Real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdown = {};
      tournaments.forEach(tournament => {
        const timeLeft = new Date(tournament.matchTime).getTime() - Date.now();
        newCountdown[tournament._id] = timeLeft;
      });
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(timer);
  }, [tournaments]);

  // Format countdown display
  const formatCountdown = (ms) => {
    if (ms < 0) return "Started";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Get difficulty level based on entry fee
  const getDifficultyLevel = (fee) => {
    if (fee > 50) return "Premium";
    if (fee > 30) return "Advanced";
    return "Basic";
  };

  // Filter and sort tournaments
  const joinedTournaments = tournaments.filter(t => t.joined);
  const availableTournaments = tournaments
    .filter(t => !t.joined)
    .filter(t => {
      const matchesFilter = filterType === "All" || getDifficultyLevel(t.entryFee) === filterType;
      const matchesSearch = searchTerm === "" || 
        t.teamType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDifficultyLevel(t.entryFee).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "fee":
          return a.entryFee - b.entryFee;
        case "prize":
          return b.prizePool - a.prizePool;
        case "players":
          return (b.maxPlayers - b.players) - (a.maxPlayers - a.players);
        default: // time
          return new Date(a.matchTime) - new Date(b.matchTime);
      }
    });

  // Enhanced join tournament with confirmation modal
  const handleJoinClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowModal(true);
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
        setJoinMessage("🎉 Successfully joined! Get ready for battle!");
        
        // Refresh tournaments
        const tourRes = await fetch("https://cashplayzz-backend-1.onrender.com/api/user/tournaments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (tourRes.ok) {
          const tourData = await tourRes.json();
          setTournaments(tourData);
        }

        setShowJoined(true);
        setTimeout(() => setJoinMessage(""), 5000);
      } else {
        alert(data.message || "Failed to join tournament");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsJoining(false);
      setShowModal(false);
      setSelectedTournament(null);
    }
  };

  // Quick stats calculation
  const stats = {
    totalPrize: availableTournaments.reduce((sum, t) => sum + t.prizePool, 0),
    avgFee: availableTournaments.length > 0 
      ? Math.round(availableTournaments.reduce((sum, t) => sum + t.entryFee, 0) / availableTournaments.length)
      : 0,
    slotsAvailable: availableTournaments.reduce((sum, t) => sum + (t.maxPlayers - t.players), 0)
  };

  if (!token) {
    return (
      <div className="battle-container">
        <div className="auth-message">
          <div className="auth-icon">🔒</div>
          <h1>Authentication Required</h1>
          <p>Please log in to access Battle Royale tournaments</p>
          <button className="back-btn" onClick={() => window.history.back()}>
            Go Back & Login
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
          <h2>Loading Epic Battles...</h2>
          <p>Preparing your battlefield experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-container">
      {/* Enhanced Header */}
      <div className="battle-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className="battle-title">Battle Royale</h1>
        <div className="help-icon" onClick={() => alert("Need help? Contact support@cashplayzz.com or join our Discord!")}>
          ❓
        </div>
      </div>

      {/* Enhanced Balance Display with Quick Stats */}
      <div className="balance-display">
        <span className="balance-label">Your Balance</span>
        <span className="balance-amount">₹{balance.toLocaleString()}</span>
        
        {/* Quick Stats Row */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-value">₹{stats.totalPrize.toLocaleString()}</span>
            <span className="stat-label">Total Prizes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.slotsAvailable}</span>
            <span className="stat-label">Open Slots</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">₹{stats.avgFee}</span>
            <span className="stat-label">Avg Fee</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {joinMessage && (
        <div className="success-message">
          {joinMessage}
        </div>
      )}

      {/* Enhanced Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {FILTER_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="time">⏰ By Time</option>
            <option value="fee">💰 By Fee</option>
            <option value="prize">🏆 By Prize</option>
            <option value="players">👥 By Slots</option>
          </select>
        </div>
      </div>

      {/* Joined Matches Toggle */}
      {joinedTournaments.length > 0 && (
        <button 
          className="joined-toggle-btn"
          onClick={() => setShowJoined(!showJoined)}
        >
          {showJoined ? '🔽 Hide' : '🔼 Show'} Joined Matches ({joinedTournaments.length})
        </button>
      )}

      {/* Joined Matches Section */}
      {showJoined && joinedTournaments.length > 0 && (
        <div className="joined-section">
          <h2 className="section-title">🎯 Your Active Battles</h2>
          <div className="tournaments-grid">
            {joinedTournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card joined-card">
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <span className="joined-badge">✓ JOINED</span>
                </div>
                
                {/* Live countdown for joined tournaments */}
                <div className="countdown-display">
                  <span className="countdown-label">Starts In:</span>
                  <span className="countdown-time">
                    {countdown[tournament._id] ? formatCountdown(countdown[tournament._id]) : "Loading..."}
                  </span>
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

                {/* Tournament Status */}
                <div className="tournament-status">
                  {countdown[tournament._id] > 0 ? (
                    <span className="status-waiting">⏳ Waiting to start</span>
                  ) : (
                    <span className="status-live">🔴 LIVE NOW!</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tournaments */}
      <div className="available-section">
        <h2 className="section-title">
          ⚔️ Available Battles ({availableTournaments.length})
        </h2>
        
        {availableTournaments.length === 0 ? (
          <div className="no-tournaments">
            <div className="empty-state">
              <span className="empty-icon">🎮</span>
              <h3>No tournaments match your criteria</h3>
              <p>Try adjusting your filters or check back later for new battles!</p>
            </div>
          </div>
        ) : (
          <div className="tournaments-grid">
            {availableTournaments.map((tournament) => (
              <div key={tournament._id} className="tournament-card">
                <div className="card-header">
                  <h3>{tournament.teamType} Tournament</h3>
                  <div className={`difficulty-badge ${getDifficultyLevel(tournament.entryFee).toLowerCase()}`}>
                    {getDifficultyLevel(tournament.entryFee)}
                  </div>
                </div>
                
                {/* Enhanced countdown display */}
                <div className="countdown-display">
                  <span className="countdown-label">Starts In:</span>
                  <span className={`countdown-time ${countdown[tournament._id] < 300000 ? 'urgent' : ''}`}>
                    {countdown[tournament._id] ? formatCountdown(countdown[tournament._id]) : "Loading..."}
                  </span>
                </div>

                <div className="card-info">
                  <div className="info-row">
                    <span>Entry Fee:</span>
                    <span className="fee">₹{tournament.entryFee}</span>
                  </div>
                  <div className="info-row">
                    <span>Prize Pool:</span>
                    <span className="prize">₹{tournament.prizePool.toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span>Players:</span>
                    <span>
                      {tournament.players}/{tournament.maxPlayers}
                      <span className="slots-left">
                        ({tournament.maxPlayers - tournament.players} left)
                      </span>
                    </span>
                  </div>
                  <div className="info-row">
                    <span>ROI:</span>
                    <span className="roi">
                      {Math.round((tournament.prizePool / tournament.entryFee) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Enhanced join button */}
                <button
                  className={`join-btn ${
                    balance >= tournament.entryFee && countdown[tournament._id] > 0 
                      ? 'enabled' 
                      : 'disabled'
                  }`}
                  onClick={() => handleJoinClick(tournament)}
                  disabled={
                    balance < tournament.entryFee || 
                    countdown[tournament._id] <= 0 || 
                    tournament.players >= tournament.maxPlayers
                  }
                >
                  {tournament.players >= tournament.maxPlayers ? (
                    '🔒 FULL'
                  ) : countdown[tournament._id] <= 0 ? (
                    '⏰ Started'
                  ) : balance >= tournament.entryFee ? (
                    `⚡ Join Battle (₹${tournament.entryFee})`
                  ) : (
                    '💳 Insufficient Balance'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Confirmation Modal */}
      {showModal && selectedTournament && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✕
            </button>
            
            <div className="modal-header">
              <h3>🎯 Join Battle Royale</h3>
              <div className={`difficulty-badge ${getDifficultyLevel(selectedTournament.entryFee).toLowerCase()}`}>
                {getDifficultyLevel(selectedTournament.entryFee)}
              </div>
            </div>

            <div className="modal-body">
              <div className="tournament-preview">
                <h4>{selectedTournament.teamType} Tournament</h4>
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span>💰 Entry Fee</span>
                    <span>₹{selectedTournament.entryFee}</span>
                  </div>
                  <div className="preview-stat">
                    <span>🏆 Prize Pool</span>
                    <span>₹{selectedTournament.prizePool.toLocaleString()}</span>
                  </div>
                  <div className="preview-stat">
                    <span>⏰ Starts</span>
                    <span>{formatCountdown(countdown[selectedTournament._id])}</span>
                  </div>
                  <div className="preview-stat">
                    <span>👥 Players</span>
                    <span>{selectedTournament.players}/{selectedTournament.maxPlayers}</span>
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
                onClick={() => setShowModal(false)}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button 
                className="modal-btn confirm"
                onClick={confirmJoin}
                disabled={isJoining}
              >
                {isJoining ? '⏳ Joining...' : '🚀 Confirm & Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
