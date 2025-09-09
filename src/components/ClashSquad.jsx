// Similar structure as BattleRoyale, adjusted for ClashSquad mode filtering
import React, { useState, useEffect } from "react";
import "./ClashSquad.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem("token");

function getAuthHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
//... formatting functions same as above...

export default function ClashSquad() {
  // similar state declarations

  async function fetchData() {
    if (!token) return;
    try {
      const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, { headers: getAuthHeaders() });
      if(profileRes.ok) {
        const profile = await profileRes.json();
        setBalance(profile.balance);
      }
      const tourRes = await fetch(`${BACKEND_URL}/api/user/tournaments?mode=clashsquad`, {
        headers: getAuthHeaders(),
        cache:"no-store"
      });
      if (tourRes.ok) {
        const tours = await tourRes.json();
        setTournaments(tours);
      }
    } catch(e) {
      console.error(e);
    }
  }

  useEffect(() => { fetchData(); }, []);

  //... rest similar to BattleRoyale with join logic and filters...

}
