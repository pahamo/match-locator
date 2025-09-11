import { createClient } from '@supabase/supabase-js';
import type { Fixture, FixturesApiParams, Provider, Team } from '../types';

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
  home_team_id: number;
  home_team: string;
  home_slug: string;
  home_crest?: string | null;
  away_team_id: number;
  away_team: string;
  away_slug: string;
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
    crest: row.home_crest || null,
  };
  const away: Team = {
    id: row.away_team_id,
    name: row.away_team,
    slug: row.away_slug,
    crest: row.away_crest || null,
  };
  const providers = providersByFixture[row.id] || [];

  // Check blackout status from providers (database-based)
  const isBlackout = providers.some(p => p.id === '999' && p.type === 'blackout');

  return {
    id: row.id,
    sport: 'football',
    competition: 'premier-league',
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
          console.warn('[Supabase] Failed to load production-visible competitions, defaulting to Premier League only:', error);
          allowedCompetitionIds = [1]; // Fallback to Premier League only
        } else {
          allowedCompetitionIds = (competitions || []).map(c => c.id);
          if (allowedCompetitionIds.length === 0) {
            allowedCompetitionIds = [1]; // Fallback to Premier League only
          }
        }
      } catch (e) {
        console.warn('[Supabase] Failed to check competition visibility, defaulting to Premier League only:', e);
        allowedCompetitionIds = [1]; // Fallback to Premier League only
      }
    }

    let query = supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,
        home_team_id,home_team,home_slug,home_crest,
        away_team_id,away_team,away_slug,away_crest
      `)
      .order('utc_kickoff', { ascending: order === 'asc' })
      .limit(limit);
      
    if (dateFrom) {
      query = query.gte('utc_kickoff', dateFrom);
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

    // Apply team filter if specified
    if (teamSlug) {
      mapped = mapped.filter(fx => fx.home.slug === teamSlug || fx.away.slug === teamSlug);
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
        id,matchday,utc_kickoff,venue,status,
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
  { id: 3, name: 'BBC Sport', type: 'tv' },
  { id: 4, name: 'Amazon Prime Video', type: 'streaming' },
  { id: -1, name: '🚫 Blackout (No TV)', type: 'blackout' }
];

export async function getAdminFixtures(competitionId: number = 1): Promise<AdminFixture[]> {
  try {
    // Get fixtures from current season
    const currentSeasonStart = '2024-08-01T00:00:00.000Z';
    
    const { data: rows, error } = await supabase
      .from('fixtures_with_teams')
      .select(`
        id,matchday,utc_kickoff,venue,status,
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
    const { data, error } = await supabase
      .from('teams')
      .select('id,name,slug,crest_url')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('[Supabase] getTeams error', error);
      return [];
    }
    return (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      crest: t.crest_url ?? null,
    }));
  } catch (e) {
    console.warn('[Supabase] getTeams error', e);
    return [];
  }
}
