import React, { useState, useEffect } from "react";
import "./BattleRoyale.css";

const DEMO_TOURNAMENTS = [
  {
    id: 1,
    teamType: "Solo",
    entryFee: 15,
    prizePool: 200,
    matchTime: new Date(Date.now() + 16 * 60 * 1000),
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
    entryFee: 30,
    prizePool: 350,
    matchTime: new Date(Date.now() + 42 * 60 * 1000),
    joined: false,
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
    entryFee: 50,
    prizePool: 800,
    matchTime: new Date(Date.now() + 70 * 60 * 1000),
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

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec < 10 ? "0" : ""}${sec} min`;
}

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState(DEMO_TOURNAMENTS);
  const [expanded, setExpanded] = useState(null);
  const [balance, setBalance] = useState(69);

  useEffect(() => {
    const interval = setInterval(() => setTournaments((prev) => [...prev]), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (tournament) => {
    if (balance < tournament.entryFee) {
      alert("Insufficient balance!");
      return;
    }
    if (window.confirm(`Confirm join for ₹${tournament.entryFee}?`)) {
      setBalance((bal) => bal - tournament.entryFee);
      setTournaments((prev) =>
        prev.map((t) => (t.id === tournament.id ? { ...t, joined: true } : t))
      );
    }
  };

  return (
    <div className="battle-container">
      <h2 className="battle-title">Battle Royale Tournaments</h2>
      <div style={{ color: "#00ffe7", fontWeight: 600, marginBottom: 20, textAlign: "center", fontSize: 18 }}>
        Your Balance: <span style={{ color: "#4affbe" }}>₹{balance}</span>
      </div>

      {tournaments.map((t) => {
        const timeDiff = t.matchTime.getTime() - Date.now();
        return (
          <div
            key={t.id}
            className="tournament-card"
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}
          >
            <div className="tournament-header">{t.teamType} Tournament</div>
            <div className="tournament-info">
              <span>Entry: ₹{t.entryFee}</span>
              <span>Prize: ₹{t.prizePool}</span>
              <span>Starts in: {formatCountdown(timeDiff)}</span>
            </div>
            <button
              className="join-button"
              disabled={t.joined || balance < t.entryFee || timeDiff <= 0}
              onClick={(e) => {
                e.stopPropagation();
                handleJoin(t);
              }}
            >
              {t.joined ? "Joined" : "Join"}
            </button>

            {expanded === t.id && (
              <div className="tournament-details">
                <p>
                  <b>Room ID:</b> <span style={{ color: "#ffd200" }}>{t.roomId}</span>{" "}
                  <b>Pass:</b> <span style={{ color: "#16ff77" }}>{t.roomPassword}</span>{" "}
                  <b>Players:</b> {t.players}/{t.maxPlayers}
                </p>
                <p>
                  <b style={{ color: "#43fff8" }}>Rules:</b>
                </p>
                <ul>{t.rules.map((rule, i) => <li key={i}>{rule}</li>)}</ul>
                <p style={{ marginTop: 10 }}>
                  <b style={{ color: "#66ffb6" }}>Prize Pool:</b> ₹{t.prizePool}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
