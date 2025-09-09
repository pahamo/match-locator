import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ClubPage from './pages/ClubPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import TeamsPage from './pages/TeamsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
          <Route path="/club/:clubId" element={<ClubPage />} />
          <Route path="/clubs" element={<TeamsPage />} />
          <Route path="/clubs/:slug" element={<ClubPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
