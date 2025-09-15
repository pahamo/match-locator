import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Keep HomePage eager for LCP
import MatchPage from './pages/MatchPage'; // Keep MatchPage eager for SEO

import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { FixtureCardSkeleton } from './components/SkeletonLoader';
import { injectDesignTokens } from './design-system';
import './App.css';

// Lazy load non-critical CSS
const loadNonCriticalCSS = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/static/css/non-critical.css';
  document.head.appendChild(link);
};

// Load non-critical CSS after initial render
setTimeout(loadNonCriticalCSS, 100);

// Lazy load non-critical pages
const ClubPage = React.lazy(() => import('./pages/ClubPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminTeamsPage = React.lazy(() => import('./pages/admin/AdminTeamsPage'));
const AdminMatchesPage = React.lazy(() => import('./pages/admin/AdminMatchesPage'));
const AdminCompetitionsPage = React.lazy(() => import('./pages/admin/AdminCompetitionsPage'));
const ClubsPage = React.lazy(() => import('./pages/ClubsPage'));
const FixturesPage = React.lazy(() => import('./pages/FixturesPage'));
const CompetitionsOverviewPage = React.lazy(() => import('./pages/CompetitionsOverviewPage'));
const CompetitionPage = React.lazy(() => import('./pages/CompetitionPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const ProviderPage = React.lazy(() => import('./pages/ProviderPage'));
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = React.lazy(() => import('./pages/legal/CookiePolicy'));
const Terms = React.lazy(() => import('./pages/legal/Terms'));
const CookieSettingsModal = React.lazy(() => import('./components/cookies/CookieSettingsModal'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ padding: '20px' }}>
    <FixtureCardSkeleton />
    <FixtureCardSkeleton />
  </div>
);

function App() {
  const [cookieOpen, setCookieOpen] = React.useState(false);
  // Blackout state for fixtures (ensures setBlackoutIds exists)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [blackoutIds, setBlackoutIds] = React.useState<string[]>([]);
  
  // Initialize design system
  useEffect(() => {
    injectDesignTokens();
  }, []);

  // Hydrate blackout ids once on mount if nothing else does it
  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
      if (Array.isArray(stored)) setBlackoutIds(stored);
    } catch {
      // ignore
    }
  }, []);
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              {/* Competition routes */}
              <Route path="/competitions" element={<CompetitionsOverviewPage />} />
              <Route path="/competitions/:slug" element={<CompetitionPage />} />
              {/* SEO-friendly match URLs with slugs */}
              <Route path="/matches/:matchSlug" element={<MatchPage />} />
              {/* Legacy support for simple match IDs */}
              <Route path="/match/:matchId" element={<MatchPage />} />
              {/* Legacy club routes */}
              <Route path="/club/:clubId" element={<ClubPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:slug" element={<ClubPage />} />
              <Route path="/providers/:slug" element={<ProviderPage />} />
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/teams" element={<AdminTeamsPage />} />
              <Route path="/admin/matches" element={<AdminMatchesPage />} />
              <Route path="/admin/competitions" element={<AdminCompetitionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Footer onOpenCookieSettings={() => setCookieOpen(true)} />
          <Suspense fallback={null}>
            <CookieSettingsModal open={cookieOpen} onClose={() => setCookieOpen(false)} />
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
