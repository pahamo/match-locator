/**
 * ================================================
 * Premier League TV Listings - UI Components
 * ================================================
 * Reusable UI components and rendering functions
 */

import { getTeamAlias, createMatchSlug, groupFixturesByDayAndTime, parseUtcDate, createTimezoneFormatters, getCompetition } from './utils.js';
import { COMPETITIONS, TIMEZONE_OPTIONS } from './config.js';

/**
 * Renders a fixture card
 * @param {Object} fixture - Fixture data
 * @param {Object} broadcasts - Broadcast mappings
 * @param {boolean} withTime - Whether to include time display
 * @returns {string} HTML string for fixture card
 */
export function renderFixtureCard(fixture, broadcasts = {}, withTime = false) {
  const hasB = (broadcasts[fixture.id] || []).length > 0;
  const idSlug = `${fixture.id}-${createMatchSlug(fixture.home, fixture.away, fixture.utc_kickoff)}`;
  const href = `/football/matches/${idSlug}`;
  
  // Get competition info for badge
  const comp = fixture.competition_id ? 
    Object.values(COMPETITIONS).find(c => c.id === fixture.competition_id) : 
    getCompetition('premier-league');
  
  const compBadge = `<span class="comp-badge" style="font-size:11px;background:${comp.colors.primary};color:#fff;padding:2px 6px;border-radius:10px;margin-left:6px;">${comp.shortName}</span>`;
  
  const homeRow = `<div class="team-row">${fixture.home_badge ? `<img class="crest" alt="${fixture.home} badge" src="${fixture.home_badge}">` : ''}<strong>${getTeamAlias(fixture.home)}</strong></div>`;
  const awayRow = `<div class="team-row">${fixture.away_badge ? `<img class="crest" alt="${fixture.away} badge" src="${fixture.away_badge}">` : ''}<strong>${getTeamAlias(fixture.away)}</strong></div>`;
  
  return `
    <a class="cardlink" href="${href}">
      <div class="card">
        <div class="row">
          <div class="left">
            <div class="teams-stack">${homeRow}${awayRow}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${compBadge}
            <span class="${hasB ? 'btn small right' : 'btn small right disabled'}">${hasB ? 'Watch options' : 'Broadcasts (TBC)'}</span>
          </div>
        </div>
      </div>
    </a>`;
}

/**
 * Renders grouped fixtures by day and time
 * @param {Array} fixtures - Array of fixtures
 * @param {Object} broadcasts - Broadcast mappings
 * @param {string} timezone - IANA timezone
 * @returns {string} HTML string for grouped fixtures
 */
export function renderGroupedFixtures(fixtures, broadcasts, timezone) {
  const byDay = groupFixturesByDayAndTime(fixtures, timezone);
  const { dayKey: currentDayKey } = createTimezoneFormatters(timezone);
  const prettyDay = new Intl.DateTimeFormat('en-GB', { 
    timeZone: timezone, 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short' 
  });

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, byTime]) => {
      const sample = fixtures.find(f => currentDayKey.format(parseUtcDate(f.utc_kickoff)) === dayKey);
      const dayLabel = sample ? prettyDay.format(parseUtcDate(sample.utc_kickoff)) : dayKey;
      
      const timeBlocks = Array.from(byTime.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hhmm, list]) => 
          `<div class="time-group"><span class="time-dot"></span><strong>${hhmm}</strong></div>` + 
          list.map(f => renderFixtureCard(f, broadcasts)).join('')
        )
        .join('');
      
      return `<h3 class="muted">${dayLabel}</h3>${timeBlocks}`;
    })
    .join('');
}

/**
 * Renders team crest selector
 * @param {Array} teams - Array of team objects
 * @param {string} selectedTeam - Currently selected team filter
 * @returns {string} HTML string for crest selector
 */
export function renderCrestSelector(teams, selectedTeam = '') {
  return `
    <div class="crest-row" id="crestRow">
      <button class="crest-btn" data-team="" aria-pressed="${selectedTeam === '' ? 'true' : 'false'}">
        <span>All clubs</span>
      </button>
      ${teams.map(team => {
        const pressed = selectedTeam && team.name.toLowerCase() === selectedTeam.toLowerCase() ? 'true' : 'false';
        const img = team.crest_url ? `<img class="crest" alt="${team.name} badge" src="${team.crest_url}">` : '';
        return `<button class="crest-btn" data-team="${team.name}" aria-pressed="${pressed}">${img}<span>${team.name}</span></button>`;
      }).join('')}
    </div>`;
}

/**
 * Renders filter sidebar
 * @param {Array} matchweeks - Available matchweeks
 * @param {string} selectedMW - Selected matchweek
 * @param {string} selectedTZ - Selected timezone
 * @returns {string} HTML string for filters
 */
export function renderFilterSidebar(matchweeks = [], selectedMW = '', selectedTZ = 'Europe/London') {
  return `
    <div class="layout">
      <aside class="filters-rail">
        <h3>Filter</h3>
        <div class="filters">
          <label>Competition
            <select id="compFilter">
              <option value="pl">Premier League</option>
            </select>
          </label>
          <label>Matchweek
            <select id="mwFilter">
              <option value="">All</option>
              ${matchweeks.map(mw => `<option value="${mw}" ${selectedMW === String(mw) ? 'selected' : ''}>MW ${mw}</option>`).join('')}
            </select>
          </label>
          <label>Watching from
            <select id="tzFilter">
              ${TIMEZONE_OPTIONS.map(o => `<option value="${o.tz}" ${selectedTZ === o.tz ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </label>
          <div style="margin-top:10px">
            <small class="muted">Tip: use the crest buttons to filter by club.</small>
          </div>
        </div>
      </aside>
      <main id="listArea" class="main-col"></main>
    </div>`;
}

/**
 * Renders competition selector dropdown
 * @param {Array} competitions - Available competitions
 * @param {string} currentSlug - Current competition slug
 * @returns {string} HTML string for competition selector
 */
export function renderCompetitionSelector(competitions, currentSlug) {
  return `
    <div class="competition-selector">
      <button class="competition-btn" aria-expanded="false">
        <img src="/assets/crests/${currentSlug}.png" alt="${competitions.find(c => c.slug === currentSlug)?.name}" width="20" height="20">
        <span>${competitions.find(c => c.slug === currentSlug)?.name || 'Premier League'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      <div class="competition-dropdown" style="display: none;">
        ${competitions.map(comp => `
          <a href="/football/${comp.slug}" class="competition-option" data-competition="${comp.slug}">
            <img src="/assets/crests/${comp.slug}.png" alt="${comp.name}" width="16" height="16">
            <span>${comp.name}</span>
          </a>
        `).join('')}
      </div>
    </div>`;
}

/**
 * Renders error message
 * @param {string} message - Error message
 * @param {string} competitionName - Competition name for fallback links
 * @returns {string} HTML string for error display
 */
export function renderError(message, competitionName = 'Premier League') {
  return `
    <div class="card">
      <p class="muted">${message}</p>
      <p>
        <a href="/football/premier-league">Try Premier League</a> | 
        <a href="/football">← Home</a>
      </p>
    </div>`;
}

/**
 * Renders loading state
 * @param {string} message - Loading message
 * @returns {string} HTML string for loading state
 */
export function renderLoading(message = 'Loading...') {
  return `<div class="card"><p class="muted">${message}</p></div>`;
}

/**
 * Renders empty state
 * @param {string} message - Empty state message
 * @returns {string} HTML string for empty state
 */
export function renderEmpty(message = 'No fixtures found.') {
  return `<div class="card"><p class="muted">${message}</p></div>`;
}