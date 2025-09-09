import React, { useState, useEffect } from "react";
import "./BattleRoyale.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem("token");

function getAuthHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
}

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const min = Math.floor(ms/60000);
  const sec = Math.floor((ms % 60000)/1000);
  return `${min >= 60 ? `${Math.floor(min/60)} hr ` : ""}${min % 60}:${sec < 10 ? "0":""}${sec}`;
}

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");

  async function fetchData() {
    if (!token) return;
    try {
      const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, { headers: getAuthHeaders() });
      if(profileRes.ok) {
        const profile = await profileRes.json();
        setBalance(profile.balance);
      }
      const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments`, { headers: getAuthHeaders(), cache: "no-store" });
      if (tourRes.ok) {
        const tours = await tourRes.json();
        setTournaments(tours);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const joined = tournaments.filter(t => t.joined);
  const upcoming = tournaments.filter(t => !t.joined && (filterType === "All" || t.teamType.toLowerCase() === filterType.toLowerCase()));

  function getClass(t) {
    let cls = "battle-card";
    if (t.joined) return cls + " joined";
    if (t.entryFee > 50) return cls + " premium-high";
    if (t.entryFee > 30) return cls + " premium-medium";
    return cls;
  }

  async function confirmJoin() {
    if (!modalTournament) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/join-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          entryFee: modalTournament.entryFee,
          matchId: modalTournament._id
        }),
      });
      const data = await response.json();
      if (data.success) {
        setJoinMessage("Be ready for the battle");
        await fetchData();
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join.");
      }
    } catch {
      alert("Server error, please retry.");
    }
  }

  return (
    <div className="battle-bg">
      {/* Your existing JSX here unchanged */}
      {/* Use tournament data and join modals similarly */}
    </div>
  );
}
