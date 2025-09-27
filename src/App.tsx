/**
 * Football TV Schedule - Live at matchlocator.com
 *
 * 🚀 Live Site: https://matchlocator.com
 * 🔧 Admin: https://matchlocator.com/admin
 * 📚 Docs: /docs folder (README.md, ARCHITECTURE.md, etc.)
 * 📊 Analytics: [Plausible Analytics - add URL when available]
 * 🗃️ Database: Supabase Dashboard
 * 🚀 Hosting: Netlify Dashboard
 *
 * Current: v2.1.0 - Multi-competition platform with affiliate readiness
 * Stack: React 18 + TypeScript + Supabase + Netlify
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// TodayFixturesPage imported as homepage below
import SmartFixtureRouter from './components/SmartFixtureRouter';

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
const AdminTeamsExportPage = React.lazy(() => import('./pages/admin/AdminTeamsExportPage'));
const AdminRedirectsPage = React.lazy(() => import('./pages/admin/AdminRedirectsPage'));
const AdminFixDataPage = React.lazy(() => import('./pages/admin/AdminFixDataPage'));
const ClubsPage = React.lazy(() => import('./pages/ClubsPage'));
const FixturesPage = React.lazy(() => import('./pages/FixturesPage'));
const CompetitionsOverviewPage = React.lazy(() => import('./pages/CompetitionsOverviewPage'));
const CompetitionPage = React.lazy(() => import('./pages/CompetitionPage'));
const ChampionsLeagueGroupStagePage = React.lazy(() => import('./pages/ChampionsLeagueGroupStagePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const ProviderPage = React.lazy(() => import('./pages/ProviderPage'));
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = React.lazy(() => import('./pages/legal/CookiePolicy'));
const Terms = React.lazy(() => import('./pages/legal/Terms'));
const HowWeSupportThisSitePage = React.lazy(() => import('./pages/HowWeSupportThisSitePage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TodayFixturesPage = React.lazy(() => import('./pages/TodayFixturesPage'));
const TomorrowFixturesPage = React.lazy(() => import('./pages/TomorrowFixturesPage'));
const ThisWeekendFixturesPage = React.lazy(() => import('./pages/ThisWeekendFixturesPage'));
const HowToWatchPage = React.lazy(() => import('./pages/HowToWatchPage'));
const CookieSettingsModal = React.lazy(() => import('./components/cookies/CookieSettingsModal'));
const DesignSystemDemo = React.lazy(() => import('./design-system/demo-page'));
const DatabaseAnalysisPage = React.lazy(() => import('./pages/DatabaseAnalysisPage'));
const TestSoccersAPIPage = React.lazy(() => import('./pages/TestSoccersAPIPage'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ padding: '20px' }}>
    <FixtureCardSkeleton />
    <FixtureCardSkeleton />
  </div>
);

function App() {
  // Initialize design tokens
  React.useEffect(() => {
    injectDesignTokens();
  }, []);
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
              <Route path="/" element={<TodayFixturesPage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              {/* Dynamic fixtures pages */}
              <Route path="/fixtures/today" element={<TodayFixturesPage />} />
              <Route path="/fixtures/tomorrow" element={<TomorrowFixturesPage />} />
              <Route path="/fixtures/this-weekend" element={<ThisWeekendFixturesPage />} />
              {/* Competition routes */}
              <Route path="/competitions" element={<CompetitionsOverviewPage />} />
              <Route path="/competitions/champions-league/group-stage" element={<ChampionsLeagueGroupStagePage />} />
              <Route path="/competitions/:slug" element={<CompetitionPage />} />
              {/* H2H pages - primary route */}
              <Route path="/h2h/:matchSlug" element={<SmartFixtureRouter />} />
              {/* Content pages - H2H, guides, etc. */}
              <Route path="/content/:contentSlug" element={<SmartFixtureRouter />} />
              {/* SEO-friendly match URLs and H2H - new format */}
              <Route path="/fixtures/:matchSlug" element={<SmartFixtureRouter />} />
              {/* DISABLED: Individual match pages - now redirect to H2H */}
              <Route path="/matches/:matchSlug" element={<SmartFixtureRouter />} />
              {/* Legacy support for simple match IDs - redirect to H2H */}
              <Route path="/match/:matchId" element={<SmartFixtureRouter />} />
              {/* Legacy club routes */}
              <Route path="/club/:clubId" element={<ClubPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:slug" element={<ClubPage />} />
              <Route path="/providers/:slug" element={<ProviderPage />} />
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/teams" element={<AdminTeamsPage />} />
              <Route path="/admin/teams/export" element={<AdminTeamsExportPage />} />
              <Route path="/admin/matches" element={<AdminMatchesPage />} />
              <Route path="/admin/competitions" element={<AdminCompetitionsPage />} />
              <Route path="/admin/redirects" element={<AdminRedirectsPage />} />
              <Route path="/admin/fix-data" element={<AdminFixDataPage />} />
              <Route path="/test-soccersapi" element={<TestSoccersAPIPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/support" element={<HowWeSupportThisSitePage />} />
              <Route path="/how-we-make-money" element={<HowWeSupportThisSitePage />} />
              <Route path="/how-to-watch/:slug" element={<HowToWatchPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/design-demo" element={<DesignSystemDemo />} />
              <Route path="/database-analysis" element={<DatabaseAnalysisPage />} />
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
