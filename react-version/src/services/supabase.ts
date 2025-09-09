import { createClient } from '@supabase/supabase-js';
import type { Fixture, FixturesApiParams, Provider, Team } from '../types';

// Get credentials from environment variables with fallbacks
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://nkfuzkrazehjivzmdrvt.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZnV6a3JhemVoaml2em1kcnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjI5MzAsImV4cCI6MjA3MjgzODkzMH0.CNW1EUtcC4JWfDy-WzOIVDfv7rnXzsz1qqQyRTZVyXU';

// Log a warning if using fallback credentials
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Using fallback credentials. Consider setting REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
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
  slug?: string;
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

  // Check blackout status from localStorage (matching original SPA logic)
  const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
  const isBlackout = blackoutFixtures.includes(row.id);

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
  try {
    let query = supabase
      .from('providers')
      .select('id,slug,display_name,type,url')
      .order('display_name', { ascending: true });
      
    if (ids.length > 0) {
      query = query.in('id', ids);
    }
    
    const { data: rows, error } = await query;
    
    if (error) {
      console.warn('[Supabase] getProvidersByIds error', error);
      return [];
    }
    
    return (rows || []).map((p: ProviderRow) => ({
      id: p.slug || String(p.id),
      name: p.display_name || p.name || 'Unknown',
      type: p.type || 'unknown',
      href: p.url || undefined,
      status: 'confirmed',
    }));
  } catch (e) {
    console.warn('[Supabase] getProvidersByIds error', e);
    return [];
  }
}

export async function getFixtures(params: FixturesApiParams = {}): Promise<Fixture[]> {
  try {
    const {
      teamSlug,
      dateFrom,
      dateTo,
      limit = 100,
      order = 'asc',
      competitionId
    } = params;

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
        const p = byPk[String(b.provider_id)];
        const entry = p ? { ...p } : null;
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
      
      // Handle blackout localStorage logic
      if (providerId === '-1') {
        const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
        if (!blackoutFixtures.includes(fixtureId)) {
          blackoutFixtures.push(fixtureId);
          localStorage.setItem('blackoutFixtures', JSON.stringify(blackoutFixtures));
        }
      } else {
        // Remove from blackout list if setting to empty
        const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
        const updatedBlackout = blackoutFixtures.filter((id: number) => id !== fixtureId);
        localStorage.setItem('blackoutFixtures', JSON.stringify(updatedBlackout));
      }
    } else {
      // Add/update broadcaster - remove from blackout list first
      const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
      const updatedBlackout = blackoutFixtures.filter((id: number) => id !== fixtureId);
      localStorage.setItem('blackoutFixtures', JSON.stringify(updatedBlackout));
      
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

// Blackout helper functions
export function isFixtureBlackout(fixtureId: number): boolean {
  const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
  return blackoutFixtures.includes(fixtureId);
}

export function isFixtureConfirmed(fixture: AdminFixture): boolean {
  return !!(fixture.broadcast && fixture.broadcast.provider_id && !isFixtureBlackout(fixture.id));
}

export function isFixturePending(fixture: AdminFixture): boolean {
  return !fixture.broadcast && !isFixtureBlackout(fixture.id);
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
