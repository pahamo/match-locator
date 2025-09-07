/**
 * ================================================
 * Premier League TV Listings - Utility Functions
 * ================================================
 * Common utility functions for date handling, API calls, and data processing
 */

import { COMPETITIONS, DEFAULT_TZ } from './config.js';

// ===========================================
// COMPETITION UTILITIES
// ===========================================

/**
 * Gets competition configuration by slug
 * @param {string} slug - Competition slug
 * @returns {Object} Competition configuration
 */
export function getCompetition(slug) {
  return COMPETITIONS[slug] || COMPETITIONS['premier-league'];
}

/**
 * Get active competitions for selector
 * @returns {Array} Array of active competitions
 */
export function getActiveCompetitions() {
  return Object.values(COMPETITIONS).filter(c => c.isActive);
}

/**
 * Get current competition from URL or default
 * @returns {Object} Current competition configuration
 */
export function getCurrentCompetition() {
  const { path, params } = parseRoute();
  let competitionSlug = params.get('competition') || 'premier-league';
  
  // Extract from URL path (e.g., /football/bundesliga/fixtures)
  const pathParts = location.pathname.replace('/football/', '').split('/').filter(Boolean);
  if (pathParts.length > 0 && COMPETITIONS[pathParts[0]]) {
    competitionSlug = pathParts[0];
  }
  
  return getCompetition(competitionSlug);
}

/**
 * Updates navigation links to be competition-aware
 * @param {string} competitionSlug - Competition slug
 */
export function updateNavigationLinks(competitionSlug = 'premier-league') {
  const competition = getCompetition(competitionSlug);
  
  // Update main navigation links
  const navFixtures = document.getElementById('nav-fixtures');
  const navClubs = document.getElementById('nav-clubs');
  const navTable = document.getElementById('nav-table');
  
  if (navFixtures) navFixtures.href = `/football/${competition.slug}/fixtures`;
  if (navClubs) navClubs.href = `/football/${competition.slug}/clubs`;
  if (navTable) navTable.href = `/football/${competition.slug}/table`;
}

/**
 * Updates CSS custom properties for competition-specific styling
 * @param {string} competitionSlug - Competition slug
 */
export function updateCompetitionStyling(competitionSlug = 'premier-league') {
  const competition = getCompetition(competitionSlug);
  const root = document.documentElement;
  
  // Set CSS custom properties for competition colors
  root.style.setProperty('--competition-primary', competition.colors.primary);
  root.style.setProperty('--competition-secondary', competition.colors.secondary);
  
  // Add competition-specific class to body for additional styling
  document.body.className = document.body.className.replace(/\bcomp-\w+\b/g, '');
  document.body.classList.add(`comp-${competition.slug}`);
}

// ===========================================
// GENERAL UTILITIES
// ===========================================

/**
 * Sets the canonical URL for SEO
 * @param {string} url - The canonical URL to set
 */
export function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Converts text to URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Formats ISO date to YYYY-MM-DD
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date
 */
export function formatDateYMD(isoDate) {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates SEO-friendly match slug from team names and date
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @param {string} utcKickoff - UTC kickoff time
 * @returns {string} Match slug for URLs
 */
export function createMatchSlug(homeTeam, awayTeam, utcKickoff) {
  return `${slugify(homeTeam)}-vs-${slugify(awayTeam)}-${formatDateYMD(utcKickoff)}`;
}

/** Team name aliases for compact display */
const TEAM_ALIASES = {
  'Wolverhampton Wanderers': 'Wolves',
  'Brighton & Hove Albion': 'Brighton',
  'Manchester United': 'Man Utd',
  'Manchester City': 'Man City',
  'Tottenham Hotspur': 'Spurs',
  'West Ham United': 'West Ham',
  'Newcastle United': 'Newcastle',
  'Nottingham Forest': 'Nottm Forest',
  'Sheffield United': 'Sheff Utd',
  'Leicester City': 'Leicester',
  'Leeds United': 'Leeds',
  'West Bromwich Albion': 'West Brom'
};

/**
 * Gets team alias for compact display
 * @param {string} teamName - Full team name
 * @returns {string} Alias or original name
 */
export const getTeamAlias = (teamName) => TEAM_ALIASES[teamName] || teamName;

// ===========================================
// DATE & TIME UTILITIES
// ===========================================

/**
 * Robust UTC date parser handling multiple input formats
 * @param {string|Date} dateInput - Date input in various formats
 * @returns {Date} Parsed Date object
 */
export function parseUtcDate(dateInput) {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput !== 'string') return new Date(dateInput);
  
  if (dateInput.includes('T')) {
    // ISO format with timezone info
    if (dateInput.endsWith('Z') || dateInput.includes('+') || dateInput.includes('-')) {
      return new Date(dateInput);
    } else {
      // No timezone info, assume UTC
      return new Date(dateInput + 'Z');
    }
  }
  
  // Normalize space-separated format and handle timezone suffixes
  const normalized = dateInput.replace(' ', 'T').replace(/(\+00(?::?00)?)$/, 'Z');
  if (!normalized.endsWith('Z') && !normalized.includes('+') && !normalized.includes('-')) {
    return new Date(normalized + 'Z');
  }
  return new Date(normalized);
}

/**
 * Creates timezone-specific formatters for day and time display
 * @param {string} timezone - IANA timezone identifier
 * @returns {Object} Object with dayKey and timeKey formatters
 */
export function createTimezoneFormatters(timezone) {
  return {
    dayKey: new Intl.DateTimeFormat('en-CA', { 
      timeZone: timezone, 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }),
    timeKey: new Intl.DateTimeFormat('en-GB', { 
      timeZone: timezone, 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  };
}

/**
 * Groups fixtures by day and time for organized display
 * @param {Array} fixtures - Array of fixture objects
 * @param {string} timezone - IANA timezone identifier
 * @returns {Object} Grouped fixtures by day and time
 */
export function groupFixturesByDayAndTime(fixtures, timezone = DEFAULT_TZ) {
  const { dayKey: dayFormatter, timeKey: timeFormatter } = createTimezoneFormatters(timezone);
  const grouped = {};

  fixtures.forEach(fixture => {
    const kickoffDate = parseUtcDate(fixture.utc_kickoff);
    const dayKey = dayFormatter.format(kickoffDate);
    const timeKey = timeFormatter.format(kickoffDate);

    if (!grouped[dayKey]) {
      grouped[dayKey] = {};
    }
    if (!grouped[dayKey][timeKey]) {
      grouped[dayKey][timeKey] = [];
    }
    grouped[dayKey][timeKey].push(fixture);
  });

  return grouped;
}

// ===========================================
// API UTILITIES
// ===========================================

/**
 * Generic API request function with error handling
 * @param {string} endpoint - API endpoint URL
 * @returns {Promise<any>} API response data
 */
export async function apiRequest(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// ===========================================
// ROUTING UTILITIES
// ===========================================

/**
 * Parses the current URL route
 * @returns {Object} Object with path and params
 */
export function parseRoute() {
  const [path, search] = location.hash.slice(1).split('?');
  return {
    path: path || '',
    params: new URLSearchParams(search || '')
  };
}

/**
 * Navigates to a new route
 * @param {string} to - Target route
 */
export function navigate(to) {
  if (to.startsWith('http')) {
    location.href = to;
    return;
  }
  
  location.hash = to;
}

// ===========================================
// TIMEZONE OPTIONS
// ===========================================

/** Available timezone options for user selection */
export const TIMEZONE_OPTIONS = [
  { label: 'UK', tz: 'Europe/London' },
  { label: 'Netherlands', tz: 'Europe/Amsterdam' },
  { label: 'USA (Eastern)', tz: 'America/New_York' },
  { label: 'USA (Pacific)', tz: 'America/Los_Angeles' },
  { label: 'India', tz: 'Asia/Kolkata' },
  { label: 'Australia (Sydney)', tz: 'Australia/Sydney' }
];