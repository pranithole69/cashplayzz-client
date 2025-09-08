import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';                               // Main app (home, login/signup UI)
import BattleRoyale from './components/BattleRoyale.jsx'; // Battle Royale page
import ClashSquad from './components/ClashSquad.jsx';     // Clash Squad page
import Dashboard from './Dashboard.jsx';
import AdminRoutes from './admin/AdminRoutes.jsx';

import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />                      {/* Root route */}
        <Route path="/battle-royale" element={<BattleRoyale />} />
        <Route path="/clash-squad" element={<ClashSquad />} />     {/* Clash Squad route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
