import React, { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min >= 60 ? `${Math.floor(min / 60)} hr ` : ""}${min % 60}:${
    sec < 10 ? "0" : ""
  }${sec}`;
}

export default function JoinedMatches({ onClose }) {
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function fetchJoined() {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/user/joined-matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setJoinedMatches(data);
      }
      setLoading(false);
    }
    fetchJoined();

    // Update current time every second for countdown
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const canShowRoomDetails = (match) => {
    const startTimeMs = new Date(match.matchTime).getTime();
    return startTimeMs - now <= 5 * 60 * 1000 && match.roomId && match.roomPassword;
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.9)",
        padding: 20,
        borderRadius: 12,
        maxWidth: 480,
        margin: "auto",
        color: "#d1fcff",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 16,
          background: "transparent",
          border: "none",
          fontSize: 24,
          color: "#0af",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        ×
      </button>

      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#30e0ff" }}>
        Your Joined Matches
      </h2>

      {loading && <p>Loading...</p>}

      {!loading && !joinedMatches.length && (
        <p style={{ textAlign: "center", color: "#888" }}>You have no joined matches.</p>
      )}

      {joinedMatches.map((match) => {
        const startTimeMs = new Date(match.matchTime).getTime();
        const countdownMs = startTimeMs - now;

        return (
          <div
            key={match.id}
            style={{
              background: "linear-gradient(120deg, rgba(10,30,45,0.7), rgba(10,30,45,0.85))",
              borderRadius: 14,
              boxShadow: "0 0 12px 3px #00e5ff7d",
              padding: 20,
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                borderLeft: "6px solid #0ff",
                paddingLeft: 14,
                color: "#40dfff",
                textTransform: "uppercase",
                marginBottom: 10,
                fontWeight: "bold",
              }}
            >
              {match.mode || match.teamType || "Tournament"}
            </h3>
            <div
              style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 16 }}
            >
              <span>Entry: ₹{match.entryFee}</span>
              <span>Prize: ₹{match.prizePool}</span>
              <span>Starts: {formatCountdown(countdownMs)}</span>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "rgba(0,0,30,0.3)", borderRadius: 8 }}>
              {canShowRoomDetails(match) ? (
                <>
                  <p>
                    <b>Room ID:</b> {match.roomId}
                  </p>
                  <p>
                    <b>Password:</b> {match.roomPassword}
                  </p>
                </>
              ) : (
                <p>Room details will be visible 5 minutes before the match starts.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
