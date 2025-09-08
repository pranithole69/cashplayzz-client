import React, { useState, useEffect } from "react";
import "./ClashSquad.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const SQUAD_FILTERS = ["All", "1v1", "2v2", "3v3", "4v4"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setBalance(profileData.balance);
        }
        const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments?mode=clashsquad`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (tourRes.ok) {
          const toursData = await tourRes.json();
          setTournaments(toursData);
        } else setTournaments([]);
      } catch {
        setTournaments([]);
      }
    };
    fetchData();
  }, []);

  const joined = tournaments.filter((t) => t.joined);
  const upcoming = tournaments.filter(
    (t) => !t.joined && (filterType === "All" || t.squadSize === filterType)
  );

  const getCardClass = (t) => {
    let base = "clashsquad-card";
    if (t.joined) return base + " joined";
    if (t.entryFee > 50) return base + " super-premium";
    if (t.entryFee > 30) return base + " premium";
    return base;
  };

  const handleJoin = (t) => setModalTournament(t);

  const confirmJoin = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/user/join-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entryFee: modalTournament.entryFee, matchId: modalTournament._id }),
      });
      const data = await response.json();
      if (data.success) {
        setJoinMessage("Get ready for the clash!");
        await fetchData();
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else alert(data.message || "Failed to join the match.");
    } catch {
      alert("Server error occurred, please try again.");
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setExpanded(null);
  };

  return (
    <div className="clashsquad-bg">
      <div className="clashsquad-topbar">
        <button className="clashsquad-back-btn" onClick={() => window.history.back()}>
          &larr; Back
        </button>
        <span
          className="clashsquad-help-icon"
          onClick={() => alert("Contact support@cashplayzz.com or WhatsApp 24x7!")}
          role="button"
          aria-label="Help"
        >
          &#9432;
        </span>
      </div>

      <div className="clashsquad-greeting">Welcome to Clash Squad!</div>

      <div className="clashsquad-balance-box">
        <span>Balance:</span> <span>₹{balance}</span>
      </div>

      {joinMessage && (
        <div style={{ color: "#17e3ff", fontWeight: "bold", textAlign: "center", marginTop: 12 }}>
          {joinMessage}
        </div>
      )}

      <button
        className="clashsquad-collapse-toggle"
        onClick={() => setShowJoined((j) => !j)}
        style={{ display: joined.length ? "block" : "none" }}
      >
        {showJoined ? "Hide Joined Matches" : `Joined Matches (${joined.length})`}
      </button>

      {showJoined && (
        <div className="clashsquad-cards-section">
          {joined.map((t) => (
            <div key={t._id} className={getCardClass(t)}>
              <div className="clashsquad-card-type">{t.squadSize} Clash Squad</div>
              <div className="clashsquad-card-info">
                <span>Entry: <b>₹{t.entryFee}</b></span>
                <span>Prize: <b>{t.prizePool}</b></span>
                <span>Match time: <b>{formatDateTime(t.matchTime)}</b></span>
              </div>
              <span style={{ color: "#17e3ff", fontWeight: 700 }}>Status: Joined</span>
              <div style={{ marginTop: 7, fontSize: 13 }}>
                Players: {t.players}/{t.maxPlayers}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="clashsquad-section-label" style={{ marginTop: 27 }}>Upcoming Matches</div>

      <div className="clashsquad-filter-bar">
        {SQUAD_FILTERS.map((type) => (
          <button
            key={type}
            className={`clashsquad-filter-btn${filterType === type ? " active" : ""}`}
            onClick={() => handleFilterChange(type)}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>

      <div className="clashsquad-cards-section">
        {upcoming.map((t) => {
          const timeDiff = new Date(t.matchTime).getTime() - Date.now();
          return (
            <div
              key={t._id}
              className={getCardClass(t)}
              onClick={() => setExpanded(expanded === t._id ? null : t._id)}
            >
              <div className="clashsquad-card-type">{t.squadSize} Clash Squad</div>
              <div className="clashsquad-card-info">
                <span>Entry: ₹{t.entryFee}</span>
                <span>Prize: ₹{t.prizePool}</span>
                <span>
                  {timeDiff > 0
                    ? `Starts: ${formatCountdown(timeDiff)} | ${formatDateTime(t.matchTime)}`
                    : "Started"}
                </span>
              </div>
              <button
                className="clashsquad-join-btn"
                disabled={t.joined || balance < t.entryFee || timeDiff <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(t);
                }}
              >
                Join
              </button>
              {expanded === t._id && (
                <div className="tournament-details" style={{ marginTop: 11 }}>
                  <b>Rules:</b>
                  <ul>
                    {t.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 8, fontSize: 13, color: "#e1ffe4" }}>
                    Players: {t.players}/{t.maxPlayers}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalTournament && (
        <div className="battle-modal-overlay">
          <div className="battle-modal-box">
            <button className="battle-modal-close" onClick={() => setModalTournament(null)}>
              &times;
            </button>
            <div className="battle-modal-title">Join {modalTournament.squadSize} Clash Squad</div>
            <div className="battle-modal-info">
              Entry Fee: <b style={{ color: "#17e3ff" }}>₹{modalTournament.entryFee}</b>
              <br />
              Prize Pool: <b style={{ color: "#ffe066" }}>{modalTournament.prizePool}</b>
              <br />
              Scheduled Time: <b>{formatDateTime(modalTournament.matchTime)}</b>
              <ul style={{ marginTop: 10, marginLeft: 15 }}>
                {modalTournament.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
            <button className="battle-modal-action" onClick={confirmJoin}>
              Confirm & Join Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
