import React, { useState, useEffect } from "react";

export default function JoinedMatches({ matches, onClose }) {
  // Your existing joined matches rendering code, updated to use matches prop

  return (
    <div className="joined-matches-container">
      {matches.length === 0 && <p>You have no joined matches.</p>}
      {matches.map(match => (
        <div key={match.id} className="joined-match">
          <h3>{match.teamType} Tournament</h3>
          <p>Entry Fee: ₹{match.entryFee}</p>
          <p>Prize Pool: ₹{match.prizePool}</p>
          <p>Start Time: {new Date(match.matchTime).toLocaleString()}</p>
          {/* Optional: room info only close to match time */}
          {match.roomId && <p>Room ID: {match.roomId}</p>}
          {match.roomPassword && <p>Password: {match.roomPassword}</p>}
        </div>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
