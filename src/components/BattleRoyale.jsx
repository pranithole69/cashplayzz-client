import React, { useState, useEffect } from "react";

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
        prev.map((t) =>
          t.id === tournament.id ? { ...t, joined: true } : t
        )
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center py-8 px-4"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mb-6 w-full max-w-lg mx-auto text-center">
        <div className="text-lg font-mono text-cyan-300 font-bold py-3">
          Your Balance: <span className="text-green-400">₹{balance}</span>
        </div>
        <h2
          className="text-3xl font-bold mb-6"
          style={{ textShadow: "0 0 12px #0ff, 0 0 30px #43fff8" }}
        >
          Battle Royale Tournaments
        </h2>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-lg">
        {tournaments.map((t) => {
          const timeDiff = t.matchTime.getTime() - Date.now();
          return (
            <div
              key={t.id}
              className={`bg-black/80 rounded-xl border border-gray-700 px-6 py-5 shadow-md transition-transform duration-300 ease-in-out ${
                expanded === t.id ? "shadow-lg scale-105" : "hover:scale-[1.03]"
              }`}
            >
              {/* Card Header */}
              <div
                className="flex flex-col md:flex-row gap-3 justify-between items-center cursor-pointer"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div
                  className={`font-bold uppercase border-l-4 pl-4 text-2xl ${typeColors[t.teamType]}`}
                >
                  {t.teamType}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-base mt-2 md:mt-0">
                  <div>
                    Entry:{" "}
                    <span className="font-semibold text-green-400">₹{t.entryFee}</span>
                  </div>
                  <div>
                    Prize:{" "}
                    <span className="font-semibold text-yellow-400">₹{t.prizePool}</span>
                  </div>
                  <div>
                    Starts in:{" "}
                    <span className="font-mono text-cyan-400">{formatCountdown(timeDiff)}</span>
                  </div>
                </div>
                <button
                  className={`rounded-full px-5 py-3 font-bold mt-4 md:mt-0 ${
                    t.joined
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-700 hover:bg-cyan-500 text-white"
                  } transition`}
                  disabled={t.joined || balance < t.entryFee || timeDiff <= 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoin(t);
                  }}
                >
                  {t.joined ? "Joined" : "Join"}
                </button>
              </div>
              {/* Card Details */}
              {expanded === t.id && (
                <div className="mt-5 bg-black/70 rounded-lg p-4 text-gray-200 border border-gray-700">
                  <div className="flex flex-wrap gap-3 text-sm mb-3">
                    <span className="px-3 py-1 bg-gray-900 rounded-lg">
                      Room ID: <span className="text-yellow-300">{t.roomId}</span>
                    </span>
                    <span className="px-3 py-1 bg-gray-900 rounded-lg">
                      Pass: <span className="text-green-300">{t.roomPassword}</span>
                    </span>
                    <span className="px-3 py-1 bg-gray-900 rounded-lg">
                      Players: {t.players}/{t.maxPlayers}
                    </span>
                  </div>
                  <div>
                    <b className="text-cyan-300">Rules:</b>
                    <ul className="pl-5 list-disc mt-2 text-sm space-y-1">
                      {t.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 font-semibold text-green-300">
                    Prize Pool: ₹{t.prizePool}
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
