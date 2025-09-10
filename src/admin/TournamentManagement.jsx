// src/admin/TournamentManagement.jsx
import React, { useState } from 'react';

const TournamentManagement = () => {
  const [formData, setFormData] = useState({
    teamType: '',
    entryFee: '',
    maxPlayers: '',
    matchTime: '',
    gameMode: '',
    roomId: '',
    roomPassword: '',
    description: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Submit to backend with auth token

    setMessage('Tournament created (simulation)');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Tournament</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="teamType" placeholder="Team Type" value={formData.teamType} onChange={handleChange} required />
        <input name="entryFee" type="number" placeholder="Entry Fee" value={formData.entryFee} onChange={handleChange} required />
        <input name="maxPlayers" type="number" placeholder="Max Players" value={formData.maxPlayers} onChange={handleChange} required />
        <input name="matchTime" type="datetime-local" value={formData.matchTime} onChange={handleChange} required />
        <input name="gameMode" placeholder="Game Mode" value={formData.gameMode} onChange={handleChange} required />
        <input name="roomId" placeholder="Room ID" value={formData.roomId} onChange={handleChange} />
        <input name="roomPassword" placeholder="Room Password" value={formData.roomPassword} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <button type="submit">Create Tournament</button>
      </form>
    </div>
  );
};

export default TournamentManagement;
