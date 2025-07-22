// components/LeaderboardAndGuide.jsx
import React from "react";

function LeaderboardAndGuide() {
  return (
    <div className="flex flex-col lg:flex-row justify-center items-start gap-6 mt-10 px-4">
      {/* === Leaderboard === */}
      <div className="bg-[#111] p-4 rounded-2xl text-white w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-3 border-b border-gray-600 pb-2">
          🏆 Top Players
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-base">
          <li className="text-yellow-400 font-semibold">Pranit – 1500 pts</li>
          <li className="text-gray-300">Faiz – 1300 pts</li>
          <li className="text-gray-300">Harsh – 1100 pts</li>
          <li className="text-gray-300">Kunal – 1000 pts</li>
          <li className="text-gray-300">Aryan – 950 pts</li>
        </ol>
      </div>

      {/* === How to Play === */}
      <div className="bg-blue-900 bg-opacity-40 p-4 rounded-2xl text-white text-sm w-full max-w-md shadow-md backdrop-blur">
        <h3 className="text-lg font-bold mb-2">📘 How to Play</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Select a match from the lobby or homepage</li>
          <li>Pay entry fee via UPI and fill deposit form</li>
          <li>Join your game lobby (e.g., BGMI, CODM)</li>
          <li>Play the match and win prizes</li>
          <li>Winnings will be credited to your wallet 💸</li>
        </ul>
      </div>
    </div>
  );
}

export default LeaderboardAndGuide;
