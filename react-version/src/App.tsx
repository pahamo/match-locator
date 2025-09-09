import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ClubPage from './pages/ClubPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import ClubsPage from './pages/ClubsPage';
import FixturesPage from './pages/FixturesPage';
import './App.css';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/matches/:matchId" element={<MatchPage />} />
          <Route path="/matches/:id" element={<MatchPage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
          <Route path="/club/:clubId" element={<ClubPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:slug" element={<ClubPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
