import React, { useState } from "react";
import "./FreeFireTournaments.css";

const FreeFireTournaments = () => {
  const [selectedMode, setSelectedMode] = useState("Clash Squad");

  const tournaments = [
    {
      id: 1,
      mode: "Clash Squad",
      time: "3:00 PM",
      entryFee: 10,
      reward: 50,
    },
    {
      id: 2,
      mode: "Battle Royale",
      time: "5:00 PM",
      entryFee: 20,
      reward: 100,
    },
    {
      id: 3,
      mode: "Lone Wolf",
      time: "7:00 PM",
      entryFee: 15,
      reward: 75,
    },
  ];

  const filteredTournaments = tournaments.filter(
    (t) => t.mode === selectedMode
  );

  return (
    <div className="ff-tournament-container">
      <img
        src="/assets/freefire-logo.png"
        alt="Free Fire"
        className="ff-logo"
      />
      <h2>Free Fire Tournaments</h2>

      <div className="mode-buttons">
        {["Clash Squad", "Battle Royale", "Lone Wolf"].map((mode) => (
          <button
            key={mode}
            className={`mode-btn ${selectedMode === mode ? "active" : ""}`}
            onClick={() => setSelectedMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="tournament-list">
        {filteredTournaments.map((match) => (
          <div key={match.id} className="tournament-card">
            <p><strong>Time:</strong> {match.time}</p>
            <p><strong>Entry Fee:</strong> ₹{match.entryFee}</p>
            <p><strong>Reward:</strong> ₹{match.reward}</p>
            <button className="join-btn">Join Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeFireTournaments;
