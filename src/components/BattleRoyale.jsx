import React, { useState, useEffect } from "react";
import "./BattleRoyale.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Formatting functions as before...
function formatDateTime(date) { /*...*/ }
function formatCountdown(ms) { /*...*/ }

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, { headers: getAuthHeaders() });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setBalance(profileData.balance);
        }

        const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        if (tourRes.ok) {
          const toursData = await tourRes.json();
          setTournaments(toursData);
        } else {
          setTournaments([]);
        }
      } catch {
        setTournaments([]);
      }
    }
    fetchData();
  }, []);

  const joined = tournaments.filter(t => t.joined);
  const upcoming = tournaments.filter(t => !t.joined && (filterType === "All" || t.teamType.toLowerCase() === filterType.toLowerCase()));

  const getCardClass = (t) => {
    let base = "battle-card";
    if (t.joined) return base + " joined";
    if (t.entryFee > 50) return base + " premium-high";
    if (t.entryFee > 30) return base + " premium-medium";
    return base;
  };

  const confirmJoin = async () => {
    if (!modalTournament) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/join-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ entryFee: modalTournament.entryFee, matchId: modalTournament._id }),
      });
      const data = await response.json();
      if (data.success) {
        setJoinMessage("Be ready for the battle");
        setBalance(data.balance);
        const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments`, { headers: getAuthHeaders(), cache: "no-store" });
        if (tourRes.ok) {
          const toursData = await tourRes.json();
          setTournaments(toursData);
        }
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

  // Rest of your component continues unchanged with existing JSX...

  return (
    <div className="battle-bg">
      {/* Existing BattleRoyale JSX content */}
    </div>
  );
}
