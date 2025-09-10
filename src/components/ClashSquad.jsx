import React, { useState, useEffect } from "react";
import "./ClashSquad.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short"
  });
}

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const hours = Math.floor(ms / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) return `${hours}h ${min}m ${sec}s`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

export default function ClashSquad() {
  const [tournaments, setTournaments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("time");
  const [searchTerm, setSearchTerm] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [countdown, setCountdown] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState("");

  const SQUAD_FILTERS = ["All", "1", "2", "3", "4"];
  const SORT_OPTIONS = [
    { value: "time", label: "⏰ By Time" },
    { value: "fee", label: "💰 By Entry Fee" },
    { value: "prize", label: "🏆 By Prize" },
    { value: "players", label: "👥 By Slots" }
  ];

  // Auto-refresh tournaments every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!refreshing) {
        fetchTournaments(true);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [refreshing]);

  // Real-time countdown
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

  const fetchTournaments = async (silent = false) => {
    if (!silent) setRefreshing(true);

    try {
      const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments?mode=clashsquad`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      if (tourRes.ok) {
        const toursData = await tourRes.json();
        setTournaments(toursData);
        if (silent) {
          setNotification("🔄 Tournaments updated");
          setTimeout(() => setNotification(""), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: getAuthHeaders(),
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setBalance(profileData.balance);
        }

        await fetchTournaments();
      } catch (error) {
        setTournaments([]);
      }
    }
    fetchData();
  }, []);

  // Enhanced filtering and sorting
  const joined = tournaments.filter((t) => t.joined);
  const available = tournaments
    .filter((t) => !t.joined)
    .filter((t) => {
      const matchesFilter = filterType === "All" || t.squadSize.toString() === filterType;
      const matchesSearch = searchTerm === "" || 
        `${t.squadSize}v${t.squadSize}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTierLevel(t.entryFee).toLowerCase().includes(searchTerm.toLowerCase());
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
        default:
          return new Date(a.matchTime) - new Date(b.matchTime);
      }
    });

  // Get tournament tier based on entry fee
  const getTierLevel = (fee) => {
    if (fee > 50) return "Super Premium";
    if (fee > 30) return "Premium";
    return "Standard";
  };

  const getCardClass = (t) => {
    let base = "clashsquad-card";
    if (t.joined) return base + " joined";
    if (t.entryFee > 50) return base + " super-premium";
    if (t.entryFee > 30) return base + " premium";
    return base;
  };

  const handleJoin = (tournament) => setModalTournament(tournament);

  const confirmJoin = async () => {
    if (!modalTournament) return;
    setIsJoining(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/join-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          entryFee: modalTournament.entryFee,
          matchId: modalTournament._id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setJoinMessage("🎉 Successfully joined! Prepare for clash!");
        setBalance(data.balance);

        await fetchTournaments();
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join the match.");
      }
    } catch (error) {
      alert("Network error occurred, please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Quick stats
  const stats = {
    totalPrize: available.reduce((sum, t) => sum + t.prizePool, 0),
    avgFee: available.length > 0 
      ? Math.round(available.reduce((sum, t) => sum + t.entryFee, 0) / available.length)
      : 0,
    slotsAvailable: available.reduce((sum, t) => sum + (t.maxPlayers - t.players), 0),
    liveMatches: available.filter(t => countdown[t._id] <= 0).length
  };

  return (
    <div className="clashsquad-bg">
      {/* Enhanced Header */}
      <div className="clashsquad-topbar">
        <button className="clashsquad-back-btn" onClick={() => window.history.back()}>
          &larr; Back
        </button>
        <div className="topbar-title">
          <span className="title-main">Clash Squad</span>
          <span className="title-sub">Elite Combat</span>
        </div>
        <span
          className="clashsquad-help-icon"
          onClick={() => alert("Need assistance? Contact support@cashplayzz.com or join our Discord community!")}
          role="button"
          aria-label="Help & Support"
        >
          &#9432;
        </span>
      </div>

      {/* Welcome Message with Animation */}
      <div className="clashsquad-greeting">
        <span className="greeting-text">Welcome to Clash Squad!</span>
        <span className="greeting-subtitle">Choose Your Squad Size & Dominate</span>
      </div>

      {/* Enhanced Balance Display with Stats */}
      <div className="clashsquad-balance-box">
        <div className="balance-main">
          <span>Balance:</span> 
          <span className="balance-amount">₹{balance.toLocaleString()}</span>
        </div>
        
        <div className="quick-stats-row">
          <div className="stat-item">
            <span className="stat-value">₹{stats.totalPrize.toLocaleString()}</span>
            <span className="stat-label">Total Prizes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.slotsAvailable}</span>
            <span className="stat-label">Open Slots</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.liveMatches}</span>
            <span className="stat-label">Live Now</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {joinMessage && (
        <div className="success-notification">
          {joinMessage}
        </div>
      )}

      {notification && (
        <div className="info-notification">
          {notification}
        </div>
      )}

      {/* Enhanced Controls */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by squad size or tier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            className="refresh-btn"
            onClick={() => fetchTournaments()}
            disabled={refreshing}
            title="Refresh Tournaments"
          >
            {refreshing ? "🔄" : "↻"}
          </button>
        </div>

        <div className="filter-sort-container">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Joined Matches Toggle */}
      {joined.length > 0 && (
        <button
          className="clashsquad-collapse-toggle"
          onClick={() => setShowJoined((j) => !j)}
        >
          {showJoined ? "🔽 Hide Joined Matches" : `🔼 Show Joined Matches (${joined.length})`}
          {joined.some(t => countdown[t._id] <= 0) && (
            <span className="live-indicator">🔴 LIVE</span>
          )}
        </button>
      )}

      {/* Joined Matches Section */}
      {showJoined && joined.length > 0 && (
        <div className="clashsquad-cards-section">
          <div className="section-header">
            <h3>🎯 Your Active Clashes</h3>
            <span className="section-count">({joined.length})</span>
          </div>
          {joined.map((t) => (
            <div key={t._id} className={getCardClass(t)}>
              <div className="card-header">
                <div className="card-title">
                  <span className="clashsquad-card-type">{t.squadSize}v{t.squadSize} Clash Squad</span>
                  <span className="tier-badge">{getTierLevel(t.entryFee)}</span>
                </div>
                <span className="joined-status">✓ JOINED</span>
              </div>

              <div className="countdown-display">
                <span className="countdown-label">
                  {countdown[t._id] <= 0 ? "🔴 LIVE NOW" : "⏰ Starts in"}
                </span>
                {countdown[t._id] > 0 && (
                  <span className="countdown-timer">
                    {formatCountdown(countdown[t._id])}
                  </span>
                )}
              </div>

              <div className="clashsquad-card-info">
                <span>Entry: <b>₹{t.entryFee}</b></span>
                <span>Prize: <b>₹{t.prizePool.toLocaleString()}</b></span>
                <span>Match time: <b>{formatDateTime(t.matchTime)}</b></span>
                <span>Players: <b>{t.players}/{t.maxPlayers}</b></span>
              </div>

              {countdown[t._id] <= 0 && (
                <div className="live-match-indicator">
                  <span className="pulse-dot"></span>
                  Match is Live! Check your game
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Squad Size Filter Bar */}
      <div className="clashsquad-filter-bar">
        <div className="filter-header">
          <span>Squad Size:</span>
        </div>
        {SQUAD_FILTERS.map((type) => (
          <button
            key={type}
            className={`clashsquad-filter-btn${filterType === type ? " active" : ""}`}
            onClick={() => setFilterType(type)}
            type="button"
          >
            {type === "All" ? "All Sizes" : `${type}v${type}`}
          </button>
        ))}
      </div>

      {/* Available Tournaments */}
      <div className="clashsquad-cards-section">
        <div className="section-header">
          <h3>⚔️ Available Clashes</h3>
          <span className="section-count">({available.length})</span>
        </div>

        {available.length === 0 ? (
          <div className="no-tournaments">
            <div className="empty-state">
              <span className="empty-icon">🎮</span>
              <h4>No clashes match your criteria</h4>
              <p>Try adjusting filters or check back for new squad battles!</p>
            </div>
          </div>
        ) : (
          available.map((t) => {
            const timeDiff = countdown[t._id] || 0;
            const isUrgent = timeDiff > 0 && timeDiff < 300000; // Less than 5 minutes
            const isLive = timeDiff <= 0;

            return (
              <div
                key={t._id}
                className={`${getCardClass(t)} ${isUrgent ? 'urgent' : ''} ${isLive ? 'live' : ''}`}
                onClick={() => setExpanded(expanded === t._id ? null : t._id)}
              >
                <div className="card-header">
                  <div className="card-title">
                    <span className="clashsquad-card-type">{t.squadSize}v{t.squadSize} Clash Squad</span>
                    <span className="tier-badge">{getTierLevel(t.entryFee)}</span>
                  </div>
                  {isLive && <span className="live-badge">🔴 LIVE</span>}
                  {isUrgent && !isLive && <span className="urgent-badge">⚡ URGENT</span>}
                </div>

                <div className="countdown-display">
                  <span className="countdown-label">
                    {isLive ? "Started" : "Starts in"}
                  </span>
                  {!isLive && (
                    <span className={`countdown-timer ${isUrgent ? 'urgent' : ''}`}>
                      {formatCountdown(timeDiff)}
                    </span>
                  )}
                </div>

                <div className="clashsquad-card-info">
                  <span>Entry: <b>₹{t.entryFee}</b></span>
                  <span>Prize: <b>₹{t.prizePool.toLocaleString()}</b></span>
                  <span>ROI: <b>{Math.round((t.prizePool / t.entryFee) * 100)}%</b></span>
                  <span>
                    Players: <b>{t.players}/{t.maxPlayers}</b>
                    <span className="slots-indicator">
                      ({t.maxPlayers - t.players} slots left)
                    </span>
                  </span>
                </div>

                <button
                  className="clashsquad-join-btn"
                  disabled={
                    t.joined || 
                    balance < t.entryFee || 
                    timeDiff <= 0 || 
                    t.players >= t.maxPlayers ||
                    isJoining
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoin(t);
                  }}
                >
                  {t.players >= t.maxPlayers ? (
                    "🔒 FULL"
                  ) : isLive ? (
                    "⏰ Started"
                  ) : balance < t.entryFee ? (
                    "💳 Low Balance"
                  ) : (
                    `⚡ Join Squad (₹${t.entryFee})`
                  )}
                </button>

                {expanded === t._id && (
                  <div className="tournament-details">
                    <div className="details-header">
                      <b>📋 Tournament Rules:</b>
                    </div>
                    <ul>
                      {t.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                    <div className="additional-info">
                      <div className="info-item">
                        <span>🏆 Prize Distribution:</span>
                        <span>Winner takes all</span>
                      </div>
                      <div className="info-item">
                        <span>🕒 Match Duration:</span>
                        <span>~15-20 minutes</span>
                      </div>
                      <div className="info-item">
                        <span>📍 Map:</span>
                        <span>Bermuda/Purgatory</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Confirmation Modal */}
      {modalTournament && (
        <div className="battle-modal-overlay">
          <div className="battle-modal-box">
            <button 
              className="battle-modal-close" 
              onClick={() => setModalTournament(null)}
              disabled={isJoining}
            >
              &times;
            </button>

            <div className="modal-header">
              <div className="battle-modal-title">
                Join {modalTournament.squadSize}v{modalTournament.squadSize} Clash Squad
              </div>
              <div className="tier-badge large">
                {getTierLevel(modalTournament.entryFee)}
              </div>
            </div>

            <div className="battle-modal-info">
              <div className="modal-stats-grid">
                <div className="modal-stat">
                  <span className="stat-label">💰 Entry Fee</span>
                  <span className="stat-value">₹{modalTournament.entryFee}</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-label">🏆 Prize Pool</span>
                  <span className="stat-value">₹{modalTournament.prizePool.toLocaleString()}</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-label">⏰ Starts</span>
                  <span className="stat-value">
                    {formatCountdown(countdown[modalTournament._id])}
                  </span>
                </div>
                <div className="modal-stat">
                  <span className="stat-label">👥 Players</span>
                  <span className="stat-value">
                    {modalTournament.players}/{modalTournament.maxPlayers}
                  </span>
                </div>
              </div>

              <div className="balance-preview">
                <div className="balance-item">
                  <span>Current Balance:</span>
                  <span>₹{balance.toLocaleString()}</span>
                </div>
                <div className="balance-item">
                  <span>After Joining:</span>
                  <span>₹{(balance - modalTournament.entryFee).toLocaleString()}</span>
                </div>
              </div>

              <div className="tournament-rules">
                <h4>📋 Rules & Guidelines:</h4>
                <ul>
                  {modalTournament.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="battle-modal-cancel"
                onClick={() => setModalTournament(null)}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button 
                className="battle-modal-action" 
                onClick={confirmJoin}
                disabled={isJoining}
              >
                {isJoining ? "⏳ Joining..." : "🚀 Confirm & Join Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
