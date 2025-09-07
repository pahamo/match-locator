/**
 * ================================================
 * Premier League TV Listings - Main Application
 * ================================================
 * Core application logic, routing, and initialization
 */

import { APP_VERSION, SUPABASE_CONFIG, DEFAULT_TZ } from './config.js';
import { 
  getCurrentCompetition, 
  updateNavigationLinks, 
  updateCompetitionStyling, 
  parseRoute, 
  navigate, 
  setCanonical, 
  apiRequest,
  parseUtcDate,
  createTimezoneFormatters
} from './utils.js';
import { 
  renderGroupedFixtures, 
  renderFilterSidebar, 
  renderCrestSelector, 
  renderError, 
  renderLoading, 
  renderEmpty 
} from './components.js';

// ===========================================
// GLOBAL STATE AND INITIALIZATION
// ===========================================

// Set app version globally
window.APP_VERSION = APP_VERSION;

// Supabase client initialization
let supabase;
if (typeof window.supabase !== 'undefined') {
  supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// ===========================================
// DATA LOADING FUNCTIONS
// ===========================================

/**
 * Loads fixtures from Supabase
 * @param {number} competitionId - Competition ID
 * @param {boolean} useRobustLoader - Whether to use robust loading
 * @returns {Promise<Array>} Fixtures data
 */
async function loadFixtures(competitionId, useRobustLoader = false) {
  const cacheKey = `fixtures_${competitionId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        id,
        utc_kickoff,
        matchday,
        home_team,
        away_team,
        competition_id,
        home_crest,
        away_crest
      `)
      .eq('competition_id', competitionId)
      .order('utc_kickoff', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Failed to load fixtures:', error);
    if (useRobustLoader) {
      // Fallback to empty array for robust loading
      return [];
    }
    throw error;
  }
}

/**
 * Loads teams from Supabase
 * @param {number} competitionId - Competition ID
 * @param {boolean} useRobustLoader - Whether to use robust loading
 * @returns {Promise<Array>} Teams data
 */
async function loadTeams(competitionId, useRobustLoader = false) {
  const cacheKey = `teams_${competitionId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('teams')
      .select('id, name, crest_url, competition_id')
      .eq('competition_id', competitionId)
      .order('name', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Failed to load teams:', error);
    if (useRobustLoader) {
      return [];
    }
    throw error;
  }
}

/**
 * Loads broadcast mappings
 * @param {Array} fixtureIds - Array of fixture IDs
 * @returns {Promise<Object>} Broadcast mappings
 */
async function loadBroadcasts(fixtureIds) {
  if (!fixtureIds.length) return {};

  try {
    if (!supabase) {
      return {};
    }

    const { data, error } = await supabase
      .from('broadcasts')
      .select('fixture_id, broadcaster, kickoff_time')
      .in('fixture_id', fixtureIds);

    if (error) throw error;

    const broadcasts = {};
    (data || []).forEach(b => {
      if (!broadcasts[b.fixture_id]) {
        broadcasts[b.fixture_id] = [];
      }
      broadcasts[b.fixture_id].push(b);
    });

    return broadcasts;
  } catch (error) {
    console.error('Failed to load broadcasts:', error);
    return {};
  }
}

// ===========================================
// ROUTING AND NAVIGATION
// ===========================================

/**
 * Sets up navigation event handlers
 */
function setupNavigation() {
  // Handle hash changes
  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);

  // Handle competition selector
  document.addEventListener('click', (e) => {
    if (e.target.matches('.competition-option')) {
      e.preventDefault();
      const competitionSlug = e.target.dataset.competition;
      navigate(`/football/${competitionSlug}`);
    }
  });

  // Handle filter interactions
  document.addEventListener('change', (e) => {
    if (e.target.matches('#tzFilter, #mwFilter, #compFilter')) {
      applyFilters();
    }
  });

  // Handle crest selector
  document.addEventListener('click', (e) => {
    if (e.target.matches('.crest-btn')) {
      const teamName = e.target.dataset.team;
      updateTeamFilter(teamName);
    }
  });
}

/**
 * Updates team filter and re-renders
 * @param {string} teamName - Team name to filter by
 */
function updateTeamFilter(teamName) {
  const { path, params } = parseRoute();
  
  if (teamName) {
    params.set('team', teamName.toLowerCase());
  } else {
    params.delete('team');
  }

  const newHash = path + (params.toString() ? '?' + params.toString() : '');
  navigate(newHash);
}

/**
 * Applies filters and updates URL
 */
function applyFilters() {
  const tzFilter = document.getElementById('tzFilter');
  const mwFilter = document.getElementById('mwFilter');
  const { path, params } = parseRoute();

  if (tzFilter && tzFilter.value !== DEFAULT_TZ) {
    params.set('tz', tzFilter.value);
  } else {
    params.delete('tz');
  }

  if (mwFilter && mwFilter.value) {
    params.set('mw', mwFilter.value);
  } else {
    params.delete('mw');
  }

  const newHash = path + (params.toString() ? '?' + params.toString() : '');
  navigate(newHash);
}

/**
 * Sets active navigation item
 */
function setActiveNav() {
  const { path } = parseRoute();
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  
  if (path.includes('/fixtures')) {
    document.getElementById('nav-fixtures')?.classList.add('active');
  } else if (path.includes('/clubs')) {
    document.getElementById('nav-clubs')?.classList.add('active');
  } else if (path.includes('/table')) {
    document.getElementById('nav-table')?.classList.add('active');
  }
}

// ===========================================
// VIEW RENDERING FUNCTIONS
// ===========================================

/**
 * Renders the home/fixtures view
 * @param {URLSearchParams} params - URL parameters
 * @param {string} competitionSlug - Competition slug
 */
async function renderHomeView(params, competitionSlug = 'premier-league') {
  const app = document.getElementById('app');
  const competition = getCurrentCompetition();
  
  // Extract parameters
  const tzParam = params.get('tz');
  const TZ = tzParam || DEFAULT_TZ;
  const teamFilter = (params.get('team') || '').toLowerCase();
  const mwParam = params.get('mw') || '';
  
  app.innerHTML = renderLoading('Loading fixtures...');

  try {
    // Load data
    const fixtures = await loadFixtures(competition.id, true);
    const broadcasts = await loadBroadcasts(fixtures.map(f => f.id));
    
    if (!fixtures.length) {
      app.innerHTML = renderEmpty('No fixtures found.');
      return;
    }

    // Process fixtures
    const processedFixtures = fixtures.map(f => ({
      id: f.id,
      utc_kickoff: f.utc_kickoff,
      matchday: f.matchday ?? null,
      home: f.home_team,
      away: f.away_team,
      home_badge: f.home_crest || null,
      away_badge: f.away_crest || null,
      competition_id: f.competition_id
    })).filter(f => f.home && f.away && !Number.isNaN(Date.parse(f.utc_kickoff)));

    // Apply filters
    const filteredFixtures = processedFixtures.filter(f => {
      const teamOK = teamFilter ? 
        (f.home.toLowerCase().includes(teamFilter) || f.away.toLowerCase().includes(teamFilter)) : 
        true;
      const mwOK = mwParam ? String(f.matchday || '') === mwParam : true;
      return teamOK && mwOK;
    });

    // Show upcoming fixtures (next 10)
    const now = new Date();
    const upcoming = filteredFixtures
      .filter(f => parseUtcDate(f.utc_kickoff) > now)
      .slice(0, 10);

    if (!upcoming.length) {
      app.innerHTML = renderEmpty('No upcoming fixtures.');
      return;
    }

    // Render grouped fixtures
    const groupedHTML = renderGroupedFixtures(upcoming, broadcasts, TZ);
    
    // Calculate date range for display
    const dates = upcoming.map(f => parseUtcDate(f.utc_kickoff)).sort((a, b) => a - b);
    const prettyDate = new Intl.DateTimeFormat('en-GB', { 
      timeZone: TZ, 
      day: 'numeric', 
      month: 'short' 
    });
    const first = prettyDate.format(dates[0]);
    const last = prettyDate.format(dates[dates.length - 1]);
    const range = first === last ? first : `${first} – ${last}`;

    app.innerHTML = `
      <section class="section mw featured">
        <div class="mw-head">
          <h2>Upcoming matches</h2>
          <span class="pill">${range}</span>
        </div>
        ${groupedHTML}
      </section>
      <a class="floater" href="/football/${competition.slug}/fixtures" aria-label="See all fixtures">
        See all fixtures • scroll for more ↓
      </a>`;

  } catch (error) {
    console.error('Failed to render home view:', error);
    app.innerHTML = renderError('Unable to load fixtures. Please try refreshing.', competition.name);
  }
}

/**
 * Main render function - routes to appropriate view
 */
async function render() {
  try {
    const { path, params } = parseRoute();
    const competition = getCurrentCompetition();
    
    // Update navigation and styling
    updateNavigationLinks(competition.slug);
    updateCompetitionStyling(competition.slug);
    setActiveNav();
    
    // Set canonical URL
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    setCanonical(canonicalUrl);

    // Route to appropriate view
    if (path === '' || path === '/' || path.includes('/home')) {
      await renderHomeView(params, competition.slug);
    } else if (path.includes('/fixtures')) {
      await renderHomeView(params, competition.slug); // For now, use same view
    } else {
      // Default fallback
      await renderHomeView(params, competition.slug);
    }

  } catch (error) {
    console.error('Render error:', error);
    const app = document.getElementById('app');
    app.innerHTML = renderError('An error occurred while loading the page.');
  }
}

// ===========================================
// APPLICATION INITIALIZATION
// ===========================================

/**
 * Initializes the application
 */
function init() {
  console.log('Initializing fixtures.app', APP_VERSION);
  
  // Setup navigation
  setupNavigation();
  
  // Handle feature flags
  const featureFlags = new URLSearchParams((location.hash.split('?')[1] || ''));
  if (featureFlags.get('largeCrests') === '1') {
    document.documentElement.classList.add('large-crests');
  }
  
  // Initial render
  render();
}

// ===========================================
// GLOBAL EXPOSURE FOR COMPATIBILITY
// ===========================================

// Expose functions that might be called from inline scripts
window.navigate = navigate;
window.APP_VERSION = APP_VERSION;

// ===========================================
// START APPLICATION
// ===========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}