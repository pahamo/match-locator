import { createClient } from '@supabase/supabase-js';
import type { Fixture, FixturesApiParams, Provider, Team } from '../types';
import { mapCompetitionIdToSlug } from '../utils/competitionMapping';

// Require credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FixtureRow {
  id: number;
  matchday?: number | null;
  utc_kickoff: string;
  venue?: string | null;
  status?: string;
  competition_id?: number;
  stage?: string | null;
  round?: string | null;
  home_team_id: number;
  home_team: string;
  home_slug: string;
  home_url_slug?: string | null;
  home_crest?: string | null;
  away_team_id: number;
  away_team: string;
  away_slug: string;
  away_url_slug?: string | null;
  away_crest?: string | null;
}

interface BroadcastRow {
  fixture_id: number;
  provider_id: number;
}

interface ProviderRow {
  id: number;
  display_name?: string;
  name?: string;
  type?: string;
  url?: string;
}

function mapFixtureRow(row: FixtureRow, providersByFixture: Record<number, Provider[]> = {}): Fixture {
  const kickoffIso = row.utc_kickoff;
  const mw = row.matchday ?? null;
  const home: Team = {
    id: row.home_team_id,
    name: row.home_team,
    slug: row.home_slug,
    url_slug: row.home_url_slug || null,
    crest: row.home_crest || null,
  };
  const away: Team = {
    id: row.away_team_id,
    name: row.away_team,
    slug: row.away_slug,
    url_slug: row.away_url_slug || null,
    crest: row.away_crest || null,
  };
  const providers = providersByFixture[row.id] || [];

  // Check blackout status from providers (database-based)
  const isBlackout = providers.some(p => p.id === '999' && p.type === 'blackout');

  return {
    id: row.id,
    sport: 'football',
    competition: mapCompetitionIdToSlug(row.competition_id || 0),
    competition_id: row.competition_id,
    matchweek: mw,
    kickoff_utc: kickoffIso,
    venue: row.venue ?? null,
    home,
    away,
    providers_uk: providers,
    blackout: {
      is_blackout: isBlackout,
      reason: isBlackout ? 'No UK broadcaster announced' : null
    },
    status: row.status || 'scheduled',
    stage: row.stage ?? undefined,
    round: row.round ?? undefined,
  };
}

async function getBroadcastsForFixtures(ids: number[]): Promise<BroadcastRow[]> {
  try {
    if (!ids || !ids.length) return [];
    
    const { data, error } = await supabase
      .from('broadcasts')
      .select('fixture_id,provider_id')
      .in('fixture_id', ids);
      
    if (error) {
      console.warn('[Supabase] getBroadcastsForFixtures error', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.warn('[Supabase] getBroadcastsForFixtures error', e);
    return [];
  }
}

async function getProvidersByIds(ids: number[] = []): Promise<Provider[]> {
  let rows: ProviderRow[] | null = null;
  try {
    let query = supabase
      .from('providers')
      .select('id,display_name,name,type')
      .order('display_name', { ascending: true });

    if (ids.length > 0) {
      query = query.in('id', ids);
    }

    const resp = await query;
    if (resp.error) {
      console.warn('[Supabase] getProvidersByIds error', resp.error);
    } else {
      rows = resp.data as any;
    }
  } catch (e) {
    console.warn('[Supabase] getProvidersByIds exception', e);
  }

  const mapped = (rows || []).map((p: ProviderRow) => ({
    id: String(p.id),
    name: p.display_name || p.name || 'Unknown',
    type: p.type || 'unknown',
    href: undefined,
    status: 'confirmed',
  }));

  // Fallbacks for common UK providers in case providers table is incomplete
  const byId = new Map<string, Provider>(mapped.map(p => [p.id, p]));
  const ensure = (numId: number, name: string, href: string) => {
    const key = String(numId);
    if (!byId.has(key) && ids.includes(numId)) {
      byId.set(key, { id: key, name, type: 'tv', href, status: 'confirmed' });
    }
  };
  ensure(1, 'Sky Sports', 'https://www.skysports.com/football/fixtures-results');
  ensure(2, 'TNT Sports', 'https://tntsports.co.uk/football');
  ensure(999, 'Sky Sports', 'https://www.skysports.com/football/fixtures-results');

  // Add fallback for any remaining unknown providers
  for (const id of ids) {
    const key = String(id);
    if (!byId.has(key)) {
      byId.set(key, { id: key, name: 'Unknown Provider', type: 'tv', href: '', status: 'confirmed' });
    }
  }

  return Array.from(byId.values());
}

export async function getFixtures(params: FixturesApiParams = {}): Promise<Fixture[]> {
  try {
    const {
      teamSlug,
      dateFrom,
      dateTo,
      limit = 100,
      order = 'asc',
      competitionId // Don't default to 1 anymore, let visibility settings control
    } = params;

    // If no specific competition is requested, filter by production-visible competitions
    let allowedCompetitionIds: number[] = [];
    if (!competitionId) {
      try {
        const { data: competitions, error } = await supabase
          .from('competitions')
          .select('id')
          .eq('is_active', true)
          .eq('is_production_visible', true);
        
        if (error) {
          console.warn('[Supabase] Failed to load production-visible competitions, defaulting to EPL and UCL:', error);
          allowedCompetitionIds = [1, 2]; // Fallback to Premier League and Champions League
        } else {
          allowedCompetitionIds = (competitions || []).map(c => c.id);
          if (allowedCompetitionIds.length === 0) {
            allowedCompetitionIds = [1, 2]; // Fallback to Premier League and Champions League
          }
        }
      } catch (e) {
        console.warn('[Supabase] Failed to check competition visibility, defaulting to EPL and UCL:', e);
        allowedCompetitionIds = [1, 2]; // Fallback to Premier League and Champions League
      }
    }

    let query = supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,competition_id,stage,round,
        home_team_id,home_team,home_slug,home_url_slug,home_crest,
        away_team_id,away_team,away_slug,away_url_slug,away_crest
      `)
      .order('utc_kickoff', { ascending: order === 'asc' })
      .limit(limit);

    if (dateFrom) {
      query = query.gte('utc_kickoff', dateFrom);
    } else {
      // Default to upcoming fixtures (from 2 hours ago to show recent/live games)
      const recentCutoff = new Date();
      recentCutoff.setHours(recentCutoff.getHours() - 2);
      query = query.gte('utc_kickoff', recentCutoff.toISOString());
    }

    if (dateTo) {
      query = query.lte('utc_kickoff', dateTo);
    }
    if (competitionId) {
      query = query.eq('competition_id', competitionId);
    } else if (allowedCompetitionIds.length > 0) {
      query = query.in('competition_id', allowedCompetitionIds);
    }

    const { data: rows, error } = await query;
    
    if (error) {
      console.warn('[Supabase] getFixtures error', error);
      return [];
    }
    
    if (!rows || !rows.length) return [];

    // Enrich providers in a second step
    const ids = rows.map(r => r.id).filter(Boolean);
    let providersByFixture: Record<number, Provider[]> = {};
    
    if (ids.length) {
      const bcasts = await getBroadcastsForFixtures(ids);
      const providerIds = Array.from(new Set(bcasts.map(b => b.provider_id).filter(Boolean)));
      const provs = providerIds.length ? await getProvidersByIds(providerIds) : [];
      const byPk = Object.fromEntries(provs.map(p => [p.id, p]));

      for (const b of bcasts) {
        const fId = b.fixture_id;
        const key = String(b.provider_id);
        const p = byPk[key];
        const entry = p ? { ...p } : undefined;
        if (!providersByFixture[fId]) providersByFixture[fId] = [];
        if (entry) providersByFixture[fId].push(entry);
      }
    }
    
    let mapped = rows.map(r => mapFixtureRow(r, providersByFixture));

    // Apply team filter if specified - check both old slug and new url_slug
    if (teamSlug) {
      mapped = mapped.filter(fx =>
        fx.home.slug === teamSlug ||
        fx.away.slug === teamSlug ||
        fx.home.url_slug === teamSlug ||
        fx.away.url_slug === teamSlug
      );
    }
    
    // Apply filtering logic to exclude test fixtures (IDs <= 30)
    // This matches the current SPA's filtering logic
    mapped = mapped.filter(f => f.id && f.id > 30);
    
    return mapped;
  } catch (e) {
    console.warn('[Supabase] getFixtures error', e);
    return [];
  }
}

export async function getFixtureById(id: number): Promise<Fixture | undefined> {
  try {
    if (!id) return undefined;
    
    const { data: rows, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,competition_id,stage,round,
        home_team_id,home_team,home_slug,home_crest,
        away_team_id,away_team,away_slug,away_crest
      `)
      .eq('id', id)
      .limit(1);
      
    if (error) {
      console.warn('[Supabase] getFixtureById error', error);
      return undefined;
    }
    
    const row = rows?.[0];
    if (!row) return undefined;
    
    const bcasts = await getBroadcastsForFixtures([row.id]);
    const providerIds = Array.from(new Set(bcasts.map(b => b.provider_id).filter(Boolean)));
    const provs = providerIds.length ? await getProvidersByIds(providerIds) : [];
    const byPk = Object.fromEntries(provs.map(p => [p.id, p]));

    const providersByFixture: Record<number, Provider[]> = {};
    providersByFixture[row.id] = bcasts.map(b => {
      const p = byPk[String(b.provider_id)];
      return p ? { ...p } : null;
    }).filter(Boolean) as Provider[];
    
    return mapFixtureRow(row, providersByFixture);
  } catch (e) {
    console.warn('[Supabase] getFixtureById error', e);
    return undefined;
  }
}

export async function getFixtureByTeamsAndDate(homeTeam: string, awayTeam: string, date: string): Promise<Fixture | undefined> {
  try {
    if (!homeTeam || !awayTeam || !date) return undefined;

    // Parse date format: "22-sep-2024" to "2024-09-22"
    const [day, monthStr, year] = date.split('-');
    const monthMap: Record<string, string> = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'sept': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    const month = monthMap[monthStr.toLowerCase()];
    if (!month) return undefined;

    const searchDate = `${year}-${month}-${day.padStart(2, '0')}`;

    // Search for fixture on the given date with matching teams (flexible team name matching)
    const { data: rows, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,competition_id,stage,round,
        home_team_id,home_team,home_slug,home_crest,
        away_team_id,away_team,away_slug,away_crest
      `)
      .gte('utc_kickoff', `${searchDate}T00:00:00.000Z`)
      .lt('utc_kickoff', `${searchDate}T23:59:59.999Z`)
      .limit(20); // Get potential matches for the date

    if (error) {
      console.warn('[Supabase] getFixtureByTeamsAndDate error', error);
      return undefined;
    }

    if (!rows?.length) return undefined;

    // Find matching fixture by team names (normalize for comparison)
    const normalizeTeamName = (name: string) => name.toLowerCase()
      .replace(/\s+(fc|afc|cf|united|city)$/i, '')
      .replace(/\s+fc$/i, '')
      .replace(/\s+afc$/i, '')
      .replace(/[^a-z0-9]/g, '');

    const normalizedHome = normalizeTeamName(homeTeam);
    const normalizedAway = normalizeTeamName(awayTeam);

    const matchingFixture = rows.find(row => {
      const rowHome = normalizeTeamName(row.home_team);
      const rowAway = normalizeTeamName(row.away_team);
      return rowHome === normalizedHome && rowAway === normalizedAway;
    });

    if (!matchingFixture) return undefined;

    // Load providers for the matching fixture
    const bcasts = await getBroadcastsForFixtures([matchingFixture.id]);
    const providerIds = Array.from(new Set(bcasts.map(b => b.provider_id).filter(Boolean)));
    const provs = providerIds.length ? await getProvidersByIds(providerIds) : [];
    const byPk = Object.fromEntries(provs.map(p => [p.id, p]));

    const providersByFixture: Record<number, Provider[]> = {};
    providersByFixture[matchingFixture.id] = bcasts.map(b => {
      const p = byPk[String(b.provider_id)];
      return p ? { ...p } : null;
    }).filter(Boolean) as Provider[];

    return mapFixtureRow(matchingFixture, providersByFixture);
  } catch (e) {
    console.warn('[Supabase] getFixtureByTeamsAndDate error', e);
    return undefined;
  }
}

// Admin API functions

export interface AdminFixture extends Fixture {
  broadcast?: {
    provider_id: number;
    provider_display_name?: string;
    channel?: string;
  } | null;
}

export const BROADCASTERS = [
  { id: 1, name: 'Sky Sports', type: 'tv' },
  { id: 2, name: 'TNT Sports', type: 'tv' },
  { id: 3, name: 'BBC Radio 5 Live', type: 'radio' },
  { id: 4, name: 'Amazon Prime Video', type: 'streaming' },
  { id: 999, name: '🚫 Blackout (No TV)', type: 'blackout' }
];

export async function getAdminFixtures(competitionId: number = 1): Promise<AdminFixture[]> {
  try {
    // Get fixtures from current season (dynamic calculation matching getSimpleFixtures)
    const now = new Date();
    const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const currentSeasonStart = `${seasonYear}-08-01T00:00:00.000Z`;

    const { data: rows, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,competition_id,stage,round,
        home_team_id,home_team,home_slug,home_crest,
        away_team_id,away_team,away_slug,away_crest
      `)
      .eq('competition_id', competitionId)
      .gte('utc_kickoff', currentSeasonStart)
      .order('utc_kickoff', { ascending: true });
      
    if (error) {
      console.warn('[Supabase] getAdminFixtures error', error);
      return [];
    }
    
    if (!rows || !rows.length) return [];

    // Apply same filtering as main app (exclude test fixtures)
    const validRows = rows.filter(r => r.id && r.id > 30);
    
    // Get all broadcasts for these fixtures
    const fixtureIds = validRows.map(r => r.id);
    const { data: broadcasts, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('fixture_id,provider_id')
      .in('fixture_id', fixtureIds);
      
    if (broadcastError) {
      console.warn('[Supabase] Error loading broadcasts:', broadcastError);
    }
    
    // Create broadcast lookup
    const broadcastLookup: Record<number, BroadcastRow> = {};
    (broadcasts || []).forEach(b => {
      broadcastLookup[b.fixture_id] = b;
    });
    
    // Map fixtures with broadcast info
    const adminFixtures: AdminFixture[] = validRows.map(row => {
      const broadcast = broadcastLookup[row.id] || null;
      const fixture = mapFixtureRow(row);
      
      return {
        ...fixture,
        broadcast: broadcast ? {
          provider_id: broadcast.provider_id,
          provider_display_name: BROADCASTERS.find(b => b.id === broadcast.provider_id)?.name || 'Unknown'
        } : null
      };
    });
    
    return adminFixtures;
  } catch (e) {
    console.warn('[Supabase] getAdminFixtures error', e);
    return [];
  }
}

export async function saveBroadcast(fixtureId: number, providerId: number | string | null): Promise<void> {
  try {
    if (providerId === '' || providerId === '0' || providerId === '-1' || providerId === null) {
      // Delete existing broadcast record
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureId);
        
      if (error) {
        throw error;
      }
      
      // Handle blackout by setting blackout provider
      if (providerId === '-1') {
        const { error: insertError } = await supabase
          .from('broadcasts')
          .insert({
            fixture_id: fixtureId,
            provider_id: 999 // Blackout provider
          });
        if (insertError) throw insertError;
      }
    } else {
      // Add/update broadcaster
      const broadcastData = {
        fixture_id: fixtureId,
        provider_id: parseInt(String(providerId))
      };
      
      // Upsert the broadcast record
      const { error } = await supabase
        .from('broadcasts')
        .upsert(broadcastData);
        
      if (error) {
        throw error;
      }
    }
  } catch (e) {
    console.error('[Supabase] saveBroadcast error', e);
    throw e;
  }
}

// Blackout helper functions (updated to use database-based approach)
export function isFixtureBlackout(fixture: AdminFixture): boolean {
  return !!(fixture.broadcast && fixture.broadcast.provider_id === 999);
}

export function isFixtureConfirmed(fixture: AdminFixture): boolean {
  return !!(fixture.broadcast && fixture.broadcast.provider_id && fixture.broadcast.provider_id !== 999);
}

export function isFixturePending(fixture: AdminFixture): boolean {
  return !fixture.broadcast || fixture.broadcast.provider_id === 999;
}

// Teams API
export async function getTeams(): Promise<Team[]> {
  try {
    // DEBUG: Force cache busting - fetch ALL teams without is_active filtering
    console.log('[DEBUG] getTeams called - fetching all teams');
    console.log('[DEBUG] Supabase client initialized and ready');

    const { data, error, count } = await supabase
      .from('teams')
      .select('id,name,slug,url_slug,crest_url,competition_id,short_name,club_colors,website,venue,city', { count: 'exact' })
      .order('name', { ascending: true });

    console.log(`[DEBUG] getTeams query result - count: ${count}, error: ${error ? JSON.stringify(error) : 'none'}`);

    if (error) {
      console.error('[Supabase] getTeams error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    console.log(`[DEBUG] getTeams returned ${(data || []).length} teams from database`);
    if (data && data.length > 0) {
      console.log('[DEBUG] First few teams:', data.slice(0, 3).map(t => ({ id: t.id, name: t.name, competition_id: t.competition_id })));
    }
    return (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      url_slug: t.url_slug ?? null,
      crest: t.crest_url ?? null,
      competition_id: t.competition_id,
      short_name: t.short_name ?? null,
      club_colors: t.club_colors ?? null,
      website: t.website ?? null,
      venue: t.venue ?? null,
      city: t.city ?? null,
    }));
  } catch (e) {
    console.warn('[Supabase] getTeams error', e);
    return [];
  }
}

// Get fixtures for a specific date range (e.g., today or tomorrow)
export async function getFixturesByDateRange(startDate: string, endDate: string): Promise<Fixture[]> {
  return getFixtures({
    dateFrom: startDate,
    dateTo: endDate,
    limit: 50,
    order: 'asc'
  });
}

/**
 * Get all fixtures between two teams (Head-to-Head)
 */
export async function getHeadToHeadFixtures(teamSlug1: string, teamSlug2: string): Promise<Fixture[]> {
  try {
    console.log(`Fetching H2H fixtures between ${teamSlug1} and ${teamSlug2}`);

    // Get fixtures with raw query for better performance
    const { data: fixtureRows, error: fixturesError } = await supabase
      .from('fixtures_with_teams')
      .select('*')
      .or(`and(home_slug.eq.${teamSlug1},away_slug.eq.${teamSlug2}),and(home_slug.eq.${teamSlug2},away_slug.eq.${teamSlug1})`)
      .order('utc_kickoff', { ascending: false });

    if (fixturesError) {
      console.error('Error fetching H2H fixtures:', fixturesError);
      throw fixturesError;
    }

    if (!fixtureRows || fixtureRows.length === 0) {
      console.log('No H2H fixtures found');
      return [];
    }

    // Get fixture IDs for broadcast lookup
    const fixtureIds = fixtureRows.map(row => row.id);

    // Get broadcast data for these fixtures
    const { data: broadcastRows, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id')
      .in('fixture_id', fixtureIds);

    if (broadcastError) {
      console.error('Error fetching broadcast data:', broadcastError);
      // Continue without broadcast data rather than fail completely
    }

    // Group providers by fixture
    const providersByFixture: Record<number, Provider[]> = {};
    if (broadcastRows) {
      broadcastRows.forEach(row => {
        if (!providersByFixture[row.fixture_id]) {
          providersByFixture[row.fixture_id] = [];
        }
        providersByFixture[row.fixture_id].push({
          id: row.provider_id,
          name: `Provider ${row.provider_id}`,
          type: 'tv', // Default since not available in view
          slug: '', // Default since not available in view
          url: '' // Default since not available in view
        });
      });
    }

    // Map to Fixture objects
    const fixtures = fixtureRows.map(row => mapFixtureRow(row, providersByFixture));

    console.log(`Found ${fixtures.length} H2H fixtures`);
    return fixtures;

  } catch (error) {
    console.error('Failed to fetch H2H fixtures:', error);
    throw error;
  }
}

/**
 * Get the next upcoming fixture between two teams
 */
export async function getNextHeadToHeadFixture(teamSlug1: string, teamSlug2: string): Promise<Fixture | null> {
  try {
    const now = new Date().toISOString();

    const { data: fixtureRows, error: fixturesError } = await supabase
      .from('fixtures_with_teams')
      .select('*')
      .or(`and(home_slug.eq.${teamSlug1},away_slug.eq.${teamSlug2}),and(home_slug.eq.${teamSlug2},away_slug.eq.${teamSlug1})`)
      .gte('utc_kickoff', now)
      .order('utc_kickoff', { ascending: true })
      .limit(1);

    if (fixturesError) {
      console.error('Error fetching next H2H fixture:', fixturesError);
      throw fixturesError;
    }

    if (!fixtureRows || fixtureRows.length === 0) {
      return null;
    }

    const row = fixtureRows[0];

    // Get broadcast data for this fixture
    const { data: broadcastRows, error: broadcastError } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id')
      .eq('fixture_id', row.id);

    if (broadcastError) {
      console.error('Error fetching broadcast data for next fixture:', broadcastError);
    }

    // Map providers
    const providers: Provider[] = [];
    if (broadcastRows) {
      broadcastRows.forEach(broadcastRow => {
        providers.push({
          id: broadcastRow.provider_id,
          name: `Provider ${broadcastRow.provider_id}`,
          type: 'tv', // Default since not available in view
          slug: '', // Default since not available in view
          url: '' // Default since not available in view
        });
      });
    }

    const providersByFixture = { [row.id]: providers };
    return mapFixtureRow(row, providersByFixture);

  } catch (error) {
    console.error('Failed to fetch next H2H fixture:', error);
    throw error;
  }
}

/**
 * Get team by slug
 */
export async function getTeamBySlug(slug: string): Promise<Team | null> {
  try {
    // First try matching the slug field
    let { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();

    // If no match on slug field, try url_slug field (for smart slugs)
    if (error && error.code === 'PGRST116') {
      const { data: urlSlugData, error: urlSlugError } = await supabase
        .from('teams')
        .select('*')
        .eq('url_slug', slug)
        .limit(1)
        .single();

      data = urlSlugData;
      error = urlSlugError;
    }

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching team by slug:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      url_slug: data.url_slug,
      crest: data.crest,
      short_name: data.short_name,
      competition_id: data.competition_id
    };

  } catch (error) {
    console.error('Failed to fetch team by slug:', error);
    throw error;
  }
}

/**
 * Intelligently resolve team slug by trying multiple patterns
 * Handles both Premier League teams (with -fc suffix) and international teams (without suffix)
 */
export async function getTeamBySlugIntelligent(seoSlug: string): Promise<Team | null> {
  // First try the SEO slug as-is (for international teams)
  let team = await getTeamBySlug(seoSlug);
  if (team) {
    console.log(`Found team with original slug: ${seoSlug} -> ${team.name}`);
    return team;
  }

  // Then try with -fc suffix (for Premier League teams)
  const fcSlug = `${seoSlug}-fc`;
  team = await getTeamBySlug(fcSlug);
  if (team) {
    console.log(`Found team with -fc suffix: ${fcSlug} -> ${team.name}`);
    return team;
  }

  // Try some common variations for international teams
  const variations = [
    seoSlug.replace(/-/g, '-'), // Already normalized, but just in case
    seoSlug.replace(/fc-/g, ''), // Remove fc- prefix
    seoSlug.replace(/-fc/g, ''), // Remove -fc suffix if present
    `fc-${seoSlug}`, // Add fc- prefix
  ];

  for (const variation of variations) {
    if (variation === seoSlug || variation === fcSlug) continue; // Skip already tried

    team = await getTeamBySlug(variation);
    if (team) {
      console.log(`Found team with variation: ${variation} -> ${team.name}`);
      return team;
    }
  }

  console.log(`No team found for slug: ${seoSlug} (tried: ${seoSlug}, ${fcSlug}, ${variations.join(', ')})`);
  return null;
}
