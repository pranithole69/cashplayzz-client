import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import BattleRoyale from './components/BattleRoyale.jsx';
import ClashSquad from './components/ClashSquad.jsx';
import Dashboard from './Dashboard.jsx';
import AdminRoutes from './admin/AdminRoutes.jsx';

// CSS imports - order matters!
import 'antd/dist/reset.css';
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/battle-royale" element={<BattleRoyale />} />
        <Route path="/clash-squad" element={<ClashSquad />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
