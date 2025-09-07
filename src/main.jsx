import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';               // Home component extracted from old App.jsx
import BattleRoyale from './components/BattleRoyale';
import Dashboard from './Dashboard.jsx';
import AdminRoutes from './admin/AdminRoutes.jsx';

import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />               {/* Home page */}
        <Route path="/battle-royale" element={<BattleRoyale />} />  {/* Battle Royale page */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
