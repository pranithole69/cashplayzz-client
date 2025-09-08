import React, { useState, useEffect } from "react";
import "./clashSquad.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
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
  return `${min >= 60 ? Math.floor(min / 60) + " hr " : ""}${min % 60}:${sec < 10 ? "0" : ""}${sec}`;
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
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const userRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: getAuthHeaders(),
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setBalance(userData.balance);
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
    }
    fetchData();
  }, []);

  const joined = tournaments.filter(t => t.joined);
  const upcoming = tournaments.filter(t => !t.joined && (filterType === "All" || t.squadSize.toString() === filterType));

  function getCardClass(t) {
    let base = "clash-card";
    if (t.joined) return base + " joined";
    if (t.entryFee > 50) return base + " premium-high";
    if (t.entryFee > 30) return base + " premium-medium";
    return base;
  }

  async function confirmJoin() {
    const token = localStorage.getItem("token");
    if (!token || !modalTournament) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/join-match`, {
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

      const data = await res.json();
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
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join the tournament.");
      }
    } catch {
      alert("Server error occurred. Please try again.");
    }
  }

  function handleFilterChange(type) {
    setFilterType(type);
    setExpanded(null);
  }

  return (
    <div className="clashSquad-container">
      <header className="clashSquad-header">
        <button className="backBtn" onClick={() => window.history.back()}>Back</button>
        <span className="infoIcon" onClick={() => alert("Contact support at support@cashplayzz.com")}>i</span>
      </header>

      <div className="balanceSection">
        <h1>Balance: ₹{balance}</h1>
      </div>

      {joinMessage && <div className="joinMessage">{joinMessage}</div>}

      <button className="toggleJoinedBtn" onClick={() => setShowJoined(!showJoined)} style={{ display: joined.length ? "block" : "none" }}>
        {showJoined ? "Hide Joined Matches" : `Joined Matches (${joined.length})`}
      </button>

      {showJoined && (
        <div className="joinedTournaments">
          {joined.map(t => (
            <div key={t._id} className={getCardClass(t)}>
              <h3>{t.squadSize} Squad</h3>
              <p>Entry: ₹{t.entryFee}</p>
              <p>Prize: ₹{t.prizePool}</p>
              <p>Time: {formatDateTime(t.matchTime)}</p>
              <p>Status: Joined</p>
              <p>Players: {t.players}/{t.maxPlayers}</p>
            </div>
          ))}
        </div>
      )}

      <div className="filterBar">
        {SQUAD_FILTERS.map(f => (
          <button key={f} className={filterType === f ? "active" : ""} onClick={() => handleFilterChange(f)}>
            {f === "All" ? "All" : `${f}v${f}`}
          </button>
        ))}
      </div>

      <div className="upcomingTournaments">
        {upcoming.map(t => {
          const diff = new Date(t.matchTime).getTime() - Date.now();
          return (
            <div key={t._id} className={getCardClass(t)} onClick={() => setExpanded(expanded === t._id ? null : t._id)}>
              <h3>{t.squadSize} Squad</h3>
              <p>Entry: ₹{t.entryFee}</p>
              <p>Prize: ₹{t.prizePool}</p>
              <p>Starts in: {formatCountdown(diff)}</p>
              <button disabled={t.joined || balance < t.entryFee || diff <= 0} onClick={e => { e.stopPropagation(); handleFilterChange("All"); setModalTournament(t); }}>
                Join
              </button>
              {expanded === t._id && (
                <div className="details">
                  <ul>
                    {t.rules && t.rules.map((rule, idx) => <li key={idx}>{rule}</li>)}
                  </ul>
                  <p>Players: {t.players}/{t.maxPlayers}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalTournament && (
        <div className="modal">
          <div className="modalContent">
            <button className="closeBtn" onClick={() => setModalTournament(null)}>×</button>
            <h2>Join {modalTournament.squadSize} Squad</h2>
            <p>Entry Fee: ₹{modalTournament.entryFee}</p>
            <p>Prize Pool: ₹{modalTournament.prizePool}</p>
            <p>Scheduled: {formatDateTime(modalTournament.matchTime)}</p>
            <ul>
              {modalTournament.rules && modalTournament.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <button onClick={confirmJoin}>Confirm Join</button>
          </div>
        </div>
      )}
    </div>
  );
}
