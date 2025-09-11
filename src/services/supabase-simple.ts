import { supabase } from './supabase';

// Simple, minimal types
export interface SimpleFixture {
  id: number;
  kickoff_utc: string;
  home_team: string;
  away_team: string;
  home_crest?: string;
  away_crest?: string;
  broadcaster?: string;
  matchweek?: number;
  providerId?: number; // Added to track the actual provider ID for admin
  isBlackout?: boolean; // Added to track blackout status
}

// Only Sky Sports and TNT Sports for simplicity (plus blackout)
export const SIMPLE_BROADCASTERS = [
  { id: 1, name: 'Sky Sports' },
  { id: 2, name: 'TNT Sports' },
  { id: 999, name: '🚫 Blackout (No TV)' }
];

// Get fixtures with basic team info using simple JOINs
export async function getSimpleFixtures(): Promise<SimpleFixture[]> {
  try {
    console.log('[Supabase] Loading full season fixtures (no JOINs)...');

    // Step 1: Load fixture basics only
    // Use a dynamic season start (Aug 1 of current season year)
    const now = new Date();
    const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const seasonStartIso = `${seasonYear}-08-01T00:00:00.000Z`;

    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select('id, utc_kickoff, home_team_id, away_team_id, home_team, away_team, home_crest, away_crest, matchday, competition_id')
      .eq('competition_id', 1) // Only Premier League fixtures
      .gte('utc_kickoff', seasonStartIso)
      .order('utc_kickoff', { ascending: true });

    if (error) {
      console.error('[Supabase] Error loading fixtures:', error);
      throw error;
    }
    if (!fixtures || fixtures.length === 0) {
      console.warn('[Supabase] No fixtures returned');
      return [];
    }

    // Filter out test/dummy fixtures (same as main supabase service)
    const validFixtures = fixtures.filter(f => f.id && f.id > 30);
    console.log(`[Supabase] Filtered ${fixtures.length} -> ${validFixtures.length} fixtures (excluded test fixtures <= 30)`);

    // Team names are now included directly from fixtures_with_teams view

    // Step 3: Load broadcasts for these fixtures
    const fixtureIds = validFixtures.map((f: any) => f.id);
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id')
      .in('fixture_id', fixtureIds);

    const broadcastLookup: Record<number, number> = {};
    (broadcasts || []).forEach((b: any) => {
      broadcastLookup[b.fixture_id] = b.provider_id;
    });

    // Step 4: Map to simple format
    return validFixtures.map((fixture: any) => {
      const providerId = broadcastLookup[fixture.id];
      const isBlackout = providerId === 999;
      
      return {
        id: fixture.id,
        kickoff_utc: fixture.utc_kickoff,
        home_team: fixture.home_team || 'Unknown',
        away_team: fixture.away_team || 'Unknown',
        home_crest: fixture.home_crest || undefined,
        away_crest: fixture.away_crest || undefined,
        matchweek: fixture.matchday || undefined,
        providerId: providerId || undefined,
        isBlackout: isBlackout,
        // Only show broadcaster name if it's not blackout
        broadcaster: isBlackout 
          ? undefined 
          : SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name || undefined,
      };
    });
  } catch (error) {
    console.error('[Supabase] Unexpected error:', error);
    return [];
  }
}

// Save broadcaster assignment (simple)
export async function saveBroadcaster(fixtureId: number, providerId: number | null): Promise<void> {
  try {
    console.log(`[Supabase] Saving broadcaster for fixture ${fixtureId}: provider ${providerId}`);
    
    if (providerId === 999 || providerId === -1) {
      // Blackout: Set blackout provider (999) in database  
      const { error } = await supabase
        .from('broadcasts')
        .upsert({
          fixture_id: fixtureId,
          provider_id: 999 // Use blackout provider ID
        });
      if (error) throw error;
      console.log(`[Supabase] Set blackout for fixture ${fixtureId}`);

    } else if (!providerId) {
      // Remove broadcaster (TBD)
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureId);
        
      if (error) throw error;
      console.log(`[Supabase] Removed broadcaster for fixture ${fixtureId}`);
    } else {
      // Add/update broadcaster
      const { error } = await supabase
        .from('broadcasts')
        .upsert({
          fixture_id: fixtureId,
          provider_id: providerId
        });
        
      if (error) throw error;
      console.log(`[Supabase] Saved broadcaster for fixture ${fixtureId}`);
    }
  } catch (error) {
    console.error(`[Supabase] Error saving broadcaster:`, error);
    throw error;
  }
}
