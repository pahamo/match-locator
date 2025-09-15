/**
 * Common utilities for data import scripts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') });

/**
 * Environment validation
 */
export function validateEnvironment() {
  // Check for required environment variables with fallback names
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const footballDataKey = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_DATA_TOKEN;

  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  if (!footballDataKey) missing.push('FOOTBALL_DATA_API_KEY or FOOTBALL_DATA_TOKEN');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Create Supabase client with service role
 */
export function createSupabaseClient() {
  validateEnvironment();

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  return createClient(
    process.env.SUPABASE_URL,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );
}

/**
 * Slugify a string for URL-safe names
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Normalize team names for matching
 */
export function normalizeTeamName(name) {
  return name
    .toLowerCase()
    .replace(/\b(fc|afc|football club)\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map Football-Data.org status to our internal status
 */
export function mapMatchStatus(fdStatus) {
  const statusMap = {
    SCHEDULED: 'scheduled',
    TIMED: 'scheduled',
    IN_PLAY: 'live',
    PAUSED: 'live',
    FINISHED: 'finished',
    POSTPONED: 'postponed',
    SUSPENDED: 'suspended',
    CANCELED: 'canceled'
  };

  return statusMap[fdStatus] || 'scheduled';
}

/**
 * Rate limiting helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch from Football-Data.org API with error handling
 */
export async function fetchFromFootballData(endpoint) {
  const url = `https://api.football-data.org/v4${endpoint}`;
  const footballDataKey = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_DATA_TOKEN;

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': footballDataKey
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Football-Data API error ${response.status}: ${text}`);
  }

  return response.json();
}

/**
 * Batch processing helper
 */
export async function processBatches(items, batchSize, processor) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)} (${batch.length} items)`);

    const batchResult = await processor(batch);
    results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));

    // Rate limiting between batches
    if (i + batchSize < items.length) {
      await sleep(200);
    }
  }

  return results;
}

/**
 * Team name aliases for better matching
 */
export const TEAM_NAME_ALIASES = new Map([
  ['Wolves', 'Wolverhampton Wanderers FC'],
  ['Nottingham Forest', 'Nottingham Forest FC'],
  ['Brighton Hove Albion', 'Brighton & Hove Albion FC'],
  ['Brighton and Hove Albion FC', 'Brighton & Hove Albion FC'],
  ['Bournemouth', 'AFC Bournemouth'],
  ['Man City', 'Manchester City FC'],
  ['Manchester City', 'Manchester City FC'],
  ['Man United', 'Manchester United FC'],
  ['Manchester United', 'Manchester United FC'],
  ['Spurs', 'Tottenham Hotspur FC'],
  ['Tottenham', 'Tottenham Hotspur FC'],
  ['Newcastle', 'Newcastle United FC'],
  ['West Ham', 'West Ham United FC'],
  ['Leeds', 'Leeds United FC'],
  ['Fulham', 'Fulham FC'],
  ['Everton', 'Everton FC'],
  ['Arsenal', 'Arsenal FC'],
  ['Chelsea', 'Chelsea FC'],
  ['Liverpool', 'Liverpool FC'],
  ['Aston Villa', 'Aston Villa FC'],
  ['Crystal Palace', 'Crystal Palace FC'],
  ['Brentford', 'Brentford FC'],
  ['Burnley', 'Burnley FC']
]);

/**
 * Apply team name normalization with aliases
 */
export function normalizeTeamNameWithAliases(apiName) {
  return TEAM_NAME_ALIASES.get(apiName) ||
         `${apiName.endsWith('FC') ? apiName : apiName + ' FC'}`;
}