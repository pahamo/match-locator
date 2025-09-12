import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Keep HomePage eager for LCP
import MatchPage from './pages/MatchPage'; // Keep MatchPage eager for SEO
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
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { FixtureCardSkeleton } from './components/SkeletonLoader';

// Lazy load non-critical pages
const ClubPage = React.lazy(() => import('./pages/ClubPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ClubsPage = React.lazy(() => import('./pages/ClubsPage'));
const FixturesPage = React.lazy(() => import('./pages/FixturesPage'));
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
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              {/* SEO-friendly match URLs with slugs */}
              <Route path="/matches/:matchSlug" element={<MatchPage />} />
              {/* Legacy support for simple match IDs */}
              <Route path="/match/:matchId" element={<MatchPage />} />
              {/* Legacy club routes */}
              <Route path="/club/:clubId" element={<ClubPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:slug" element={<ClubPage />} />
              <Route path="/providers/:slug" element={<ProviderPage />} />
              <Route path="/admin" element={<AdminPage />} />
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
