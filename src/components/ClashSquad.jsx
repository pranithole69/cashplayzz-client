import React, { useState, useEffect } from "react";
import "./clashSquad.css";

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
  });
}

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min >= 60 ? `${Math.floor(min / 60)} hr ` : ""}${min % 60}:${
    sec < 10 ? "0" : ""
  }${sec}`;
}

export default function ClashSquad() {
  const [tournaments, setTournaments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");
  const SQUAD_FILTERS = ["All", "1", "2", "3", "4"];

  useEffect(() => {
    const fetchData = async () => {
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
        const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments?mode=clashsquad`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        if (tourRes.ok) {
          const tournamentsData = await tourRes.json();
          setTournaments(tournamentsData);
        } else setTournaments([]);
      } catch {
        setTournaments([]);
      }
    };
    fetchData();
  }, []);

  const joined = tournaments.filter((t) => t.joined);
  const upcoming = tournaments.filter(
    (t) => !t.joined && (filterType === "All" || t.squadSize.toString() === filterType)
  );

  const getCardClass = (t) => {
    let base = "clash-card";
    if (t.joined) return base + " joined";
    if (t.entryFee > 50) return base + " premium-high";
    if (t.entryFee > 30) return base + " premium-medium";
    return base;
  };

  const handleJoin = (t) => setModalTournament(t);

  const confirmJoin = async () => {
    if (!modalTournament) return;
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
        setJoinMessage("Get ready for the clash!");

        const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments?mode=clashsquad`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        if (tourRes.ok) {
          const tournamentsData = await tourRes.json();
          setTournaments(tournamentsData);
        }
        setBalance(data.balance);
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join the match.");
      }
    } catch {
      alert("Server error occurred, please try again.");
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setExpanded(null);
  };

  return (
    <div className="clashSquad-container">
      {/* Your Clash Squad UI here, unchanged except for added balance & joinMessage */}
      {/* Show balance */}
      <div className="balance-display">Balance: ₹{balance}</div>

      {/* Join message */}
      {joinMessage && <div className="join-message">{joinMessage}</div>}

      {/* Joined toggle */}
      <button className="toggle-joined" onClick={() => setShowJoined(!showJoined)} style={{ display: joined.length ? "block" : "none" }}>
        {showJoined ? "Hide Joined Matches" : `Joined Matches (${joined.length})`}
      </button>

      {/* Joined matches display */}
      {showJoined && (
        <div className="joined-matches-list">
          {joined.map((t) => (
            <div key={t._id} className={getCardClass(t)}>
              <div>{t.squadSize}v{squadSize} Clash Squad</div>
              <div>Entry: ₹{t.entryFee}</div>
              <div>Prize: ₹{t.prizePool}</div>
              <div>Time: {formatDateTime(t.matchTime)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter buttons */}
      <div className="filter-bar">
        {SQUAD_FILTERS.map((type) => (
          <button key={type} className={filterType === type ? "active" : ""} onClick={() => handleFilterChange(type)}>
            {type === "All" ? "All" : `${type}v${type}`}
          </button>
        ))}
      </div>

      {/* Upcoming tournaments */}
      <div className="upcoming-list">
        {upcoming.map((t) => {
          const timeDiff = new Date(t.matchTime).getTime() - Date.now();
          return (
            <div key={t._id} className={getCardClass(t)} onClick={() => setExpanded(expanded === t._id ? null : t._id)}>
              <div>{t.squadSize}v{squadSize} Clash Squad</div>
              <div>Entry: ₹{t.entryFee}</div>
              <div>Prize: ₹{t.prizePool}</div>
              <div>
                {timeDiff > 0
                  ? `Starts: ${formatCountdown(timeDiff)} | ${formatDateTime(t.matchTime)}`
                  : "Started"}
              </div>
              <button disabled={t.joined || balance < t.entryFee || timeDiff <= 0} onClick={(e) => { e.stopPropagation(); handleJoin(t); }}>
                Join
              </button>
              {expanded === t._id && (
                <div className="details">
                  <b>Rules:</b>
                  <ul>
                    {t.rules && t.rules.map((r, idx) => <li key={idx}>{r}</li>)}
                  </ul>
                  <div>Players: {t.players}/{t.maxPlayers}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Join modal */}
      {modalTournament && (
        <div className="join-modal">
          <button onClick={() => setModalTournament(null)}>Close</button>
          <h2>Join {modalTournament.squadSize}v{modalTournament.squadSize} Clash Squad</h2>
          <p>Entry Fee: ₹{modalTournament.entryFee}</p>
          <p>Prize Pool: ₹{modalTournament.prizePool}</p>
          <p>Scheduled: {formatDateTime(modalTournament.matchTime)}</p>
          <ul>
            {modalTournament.rules?.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
          <button onClick={confirmJoin}>Confirm Join</button>
        </div>
      )}
    </div>
  );
}
