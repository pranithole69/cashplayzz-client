import React, { useState, useEffect } from "react";
import "./BattleRoyale.css";

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

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalTournament, setModalTournament] = useState(null);
  const [balance, setBalance] = useState(0);
  const [showJoined, setShowJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [filterType, setFilterType] = useState("All");

  const fetchTournamentsAndProfile = async () => {
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

      const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (tourRes.ok) {
        const toursData = await tourRes.json();
        setTournaments(toursData);
      } else {
        setTournaments([]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      setTournaments([]);
    }
  };

  useEffect(() => {
    fetchTournamentsAndProfile();
  }, []);

  const joined = tournaments.filter((t) => t.joined);
  const upcoming = tournaments.filter(
    (t) =>
      !t.joined &&
      (filterType === "All" || t.teamType.toLowerCase() === filterType.toLowerCase())
  );

  const getCardClass = (t) => {
    let base = "battle-card";
    if (t.joined) return `${base} joined`;
    if (t.entryFee > 50) return `${base} super-premium`;
    if (t.entryFee > 30) return `${base} premium`;
    return base;
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
        body: JSON.stringify({ entryFee: modalTournament.entryFee, matchId: modalTournament._id }),
      });
      const data = await response.json();

      if (data.success) {
        setJoinMessage("Be ready for the battle");
        await fetchTournamentsAndProfile();
        setShowJoined(true);
        setModalTournament(null);
        setExpanded(null);
        setTimeout(() => setJoinMessage(""), 4000);
      } else {
        alert(data.message || "Failed to join the match.");
      }
    } catch (err) {
      alert("Server error occurred, please try again.");
      console.error(err);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setExpanded(null);
  };

  return (
    <div className="battle-bg">
      {/* Your JSX unchanged... */}
      {/* Use above confirmed joinMessage, joined toggle, lists, modal, etc */}
    </div>
  );
}
