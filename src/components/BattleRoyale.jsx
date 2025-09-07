// client/src/components/BattleRoyale.jsx
import React, { useState, useEffect } from "react";

const DEMO_TOURNAMENTS = [
  {
    id: 1,
    teamType: "Solo",
    entryFee: 15,
    prizePool: 200,
    matchTime: new Date(Date.now() + 16 * 60 * 1000), // 16 mins from now
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
    matchTime: new Date(Date.now() + 42 * 60 * 1000), // 42 mins from now
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
    matchTime: new Date(Date.now() + 70 * 60 * 1000), // 70 mins from now
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

const typeColors = {
  Solo: "text-purple-400 border-purple-600",
  Duo: "text-cyan-400 border-cyan-600",
  Squad: "text-orange-400 border-orange-600",
};

function formatCountdown(ms) {
  if (ms < 0) return "Started";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec < 10 ? "0" : ""}${sec} min`;
}

export default function BattleRoyale() {
  const [tournaments, setTournaments] = useState(DEMO_TOURNAMENTS);
  const [expanded, setExpanded] = useState(null);
  const [balance, setBalance] = useState(69); // Simulated user balance

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => setTournaments([...tournaments]), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const handleJoin = (tournament) => {
    if (balance < tournament.entryFee) {
      alert("Insufficient balance!");
      return;
    }
    if (window.confirm(`Confirm join for ₹${tournament.entryFee}?`)) {
      setBalance((bal) => bal - tournament.entryFee);
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === tournament.id ? { ...t, joined: true } : t
        )
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center py-6"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mb-5 w-full max-w-md mx-auto text-center">
        <div className="text-lg font-mono text-cyan-300 font-bold py-2">
          Your Balance: <span className="text-green-400">₹{balance}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{textShadow:"0 0 7px #0ff, 0 0 24px #43fff8"}}>
          Battle Royale Tournaments
        </h2>
      </div>
      <div className="flex flex-col gap-5 w-full max-w-md">
        {tournaments.map((t) => {
          const timeDiff = t.matchTime.getTime() - Date.now();
          return (
            <div
              key={t.id}
              className={`bg-black/80 rounded-xl border border-gray-700 px-5 py-4 transition-all ${
                expanded === t.id ? "shadow-lg scale-105" : ""
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row gap-2 justify-between items-center cursor-pointer"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className={`font-bold uppercase border-l-4 pl-3 text-xl ${typeColors[t.teamType]}`}>
                  {t.teamType}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1 text-sm mt-1 md:mt-0">
                  <div>
                    Entry: <span className="font-semibold text-green-400">₹{t.entryFee}</span>
                  </div>
                  <div>
                    Prize: <span className="font-semibold text-yellow-400">₹{t.prizePool}</span>
                  </div>
                  <div>
                    Starts in:{" "}
                    <span className="font-mono text-cyan-400">
                      {formatCountdown(timeDiff)}
                    </span>
                  </div>
                </div>
                <button
                  className={`rounded-full px-4 py-2 font-bold mt-2 md:mt-0
                  ${t.joined ? "bg-gray-700 text-gray-300 cursor-not-allowed" : "bg-cyan-700 hover:bg-cyan-500 text-white"}
                  transition`}
                  disabled={t.joined || balance < t.entryFee || timeDiff <= 0}
                  onClick={e => { e.stopPropagation(); handleJoin(t); }}>
                  {t.joined ? "Joined" : "Join"}
                </button>
              </div>
              {/* Card Details */}
              {expanded === t.id && (
                <div className="mt-4 bg-black/60 rounded-lg p-3 text-gray-100 border border-gray-700">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-900 rounded">
                      Room ID: <span className="text-yellow-300">{t.roomId}</span>
                    </span>
                    <span className="px-2 py-1 bg-gray-900 rounded">
                      Pass: <span className="text-green-300">{t.roomPassword}</span>
                    </span>
                    <span className="px-2 py-1 bg-gray-900 rounded">
                      Players: {t.players}/{t.maxPlayers}
                    </span>
                  </div>
                  <div className="mt-2">
                    <b className="text-cyan-300">Rules:</b>
                    <ul className="pl-5 text-sm list-disc">
                      {t.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-green-200 font-bold">Prize Pool: ₹{t.prizePool}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
