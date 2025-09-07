import React, { useState, useEffect } from "react";
import "./BattleRoyale.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DEMO_TOURNAMENTS = [
  {
    id: 1,
    teamType: "Solo",
    entryFee: 15,
    prizePool: 200,
    matchTime: new Date(Date.now() + 10 * 60 * 1000),
    joined: false,
    players: 11,
    maxPlayers: 48,
    roomId: "124542",
    roomPassword: "21asdz",
    rules: [
      "No emulators allowed.",
      "Room ID & Pass shared 5 min prior.",
      "Prize after result screenshot.",
    ],
  },
  {
    id: 2,
    teamType: "Duo",
    entryFee: 50,
    prizePool: 800,
    matchTime: new Date(Date.now() + 22 * 60 * 1000),
    joined: true,
    players: 24,
    maxPlayers: 96,
    roomId: "987653",
    roomPassword: "duo789",
    rules: [
      "Classic mode only.",
      "Teaming with others is strictly prohibited.",
      "Winners must submit screenshot.",
    ],
  },
  {
    id: 3,
    teamType: "Squad",
    entryFee: 85,
    prizePool: 1800,
    matchTime: new Date(Date.now() + 40 * 60 * 1000),
    joined: false,
    players: 38,
    maxPlayers: 100,
    roomId: "830141",
    roomPassword: "squad007",
    rules: [
      "Prize split as per rules.",
      "Stream sniping not allowed.",
      "Any hacks = instant ban.",
    ],
  },
];

function formatDateTime(date) {
  return date.toLocaleTimeString("en-IN", {
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

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState(DEMO_TOURNAMENTS);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(69);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setBalance(json.balance);
        }
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTournaments((prev) => [...prev]), 950);
    return () => clearInterval(interval);
  }, []);

  const joined = tournaments.filter((t) => t.joined);
  const upcoming = tournaments.filter((t) => !t.joined);

  const getCardClass = (t) => {
    if (t.entryFee > 50) return "battle-card super-premium";
    if (t.entryFee > 30) return "battle-card premium";
    return "battle-card";
  };

  const handleJoin = (t) => setModalTournament(t);

  const confirmJoin = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/user/join-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entryFee: modalTournament.entryFee, matchId: modalTournament.id }),
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setTournaments((prev) =>
          prev.map((t) => (t.id === modalTournament.id ? { ...t, joined: true } : t))
        );
        // Show joined section and join message
        setShowJoined(true);
        setJoinMessage("Be ready for the battle");
        setModalTournament(null);
        setExpanded(null);
        // Clear join message after 4 seconds
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join the match.");
      }
    } catch (err) {
      alert("Server error occurred, please try again.");
      console.error(err);
    }
  };

  return (
    <div className="battle-bg">
      <div className="battle-topbar" style={{ position: "relative" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            position: "absolute",
            left: 15,
            top: 12,
            background: "none",
            border: "none",
            color: "#00ffe7",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ marginLeft: "auto", position: "absolute", right: 15, top: 12, cursor: "pointer", color: "#00ffe7", fontSize: 22 }}
          onClick={() =>
            alert("Contact support@cashplayzz.com or WhatsApp 24x7!")
          }
          role="button"
          aria-label="Help"
        >
          &#9432;
        </span>
      </div>
      <div className="battle-greeting">Welcome, Survivor!</div>

      <div className="balance-box">
        <span>Balance:</span> <span style={{ color: "#00ffe7" }}>₹{balance}</span>
      </div>

      {joinMessage && (
        <div style={{ color: "#00ffe7", fontWeight: "bold", textAlign: "center", marginTop: 12 }}>
          {joinMessage}
        </div>
      )}

      <button
        className="battle-collapse-toggle"
        onClick={() => setShowJoined((j) => !j)}
        style={{ display: joined.length ? "block" : "none" }}
      >
        {showJoined ? "Hide Joined Matches" : `Joined Matches (${joined.length})`}
      </button>
      {showJoined && (
        <div className="battle-cards-section">
          {joined.map((t) => (
            <div key={t.id} className={getCardClass(t)}>
              <div className="battle-card-type">{t.teamType} Tournament</div>
              <div className="battle-card-info">
                <span>Entry: <b>₹{t.entryFee}</b></span>
                <span>Prize: <b>₹{t.prizePool}</b></span>
                <span>Match time: <b>{formatDateTime(t.matchTime)}</b></span>
              </div>
              <span style={{ color: "#00ffe7", fontWeight: 700 }}>Status: Joined</span>
              <div style={{ marginTop: 7, fontSize: 13 }}>
                Players: {t.players}/{t.maxPlayers}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-label">Upcoming Matches</div>
      <div className="battle-cards-section">
        {upcoming.map((t) => {
          const timeDiff = t.matchTime.getTime() - Date.now();
          return (
            <div
              key={t.id}
              className={getCardClass(t)}
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div className="battle-card-type">{t.teamType} Tournament</div>
              <div className="battle-card-info">
                <span>Entry: ₹{t.entryFee}</span>
                <span>Prize: ₹{t.prizePool}</span>
                <span>
                  {timeDiff > 0
                    ? `Starts: ${formatCountdown(timeDiff)} | ${formatDateTime(t.matchTime)}`
                    : "Started"}
                </span>
              </div>
              <button
                className="battle-join-btn"
                disabled={t.joined || balance < t.entryFee || timeDiff <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(t);
                }}
              >
                Join
              </button>
              {expanded === t.id && (
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
            <button
              className="battle-modal-close"
              onClick={() => setModalTournament(null)}
            >
              &times;
            </button>
            <div className="battle-modal-title">
              Join {modalTournament.teamType} Tournament
            </div>
            <div className="battle-modal-info">
              Entry Fee: <b style={{ color: "#00ffe7" }}>₹{modalTournament.entryFee}</b>
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
