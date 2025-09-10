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
import ProviderPage from './pages/ProviderPage';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CookiePolicy from './pages/legal/CookiePolicy';
import Terms from './pages/legal/Terms';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          {/* SEO-friendly match URLs with slugs */}
          <Route path="/matches/:matchSlug" element={<MatchPage />} />
          {/* Fallback SEO route with numeric id only */}
          <Route path="/matches/:id" element={<MatchPage />} />
          {/* Legacy support for simple match IDs */}
          <Route path="/match/:matchId" element={<MatchPage />} />
          {/* Legacy club routes */}
          <Route path="/club/:clubId" element={<ClubPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:slug" element={<ClubPage />} />
          <Route path="/providers/:slug" element={<ProviderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Legal */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer onOpenCookieSettings={() => {
          // Stub: replace with cookie preference manager
          // eslint-disable-next-line no-alert
          alert('Cookie settings coming soon.');
        }} />
      </div>
    </Router>
  );
}

export default App;
