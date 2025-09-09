import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkfuzkrazehjivzmdrvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZnV6a3JhemVoaml2em1kcnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjI5MzAsImV4cCI6MjA3MjgzODkzMH0.CNW1EUtcC4JWfDy-WzOIVDfv7rnXzsz1qqQyRTZVyXU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple, minimal types
export interface SimpleFixture {
  id: number;
  kickoff_utc: string;
  home_team: string;
  away_team: string;
  broadcaster?: string;
}

// Only Sky Sports and TNT Sports for simplicity
export const SIMPLE_BROADCASTERS = [
  { id: 1, name: 'Sky Sports' },
  { id: 2, name: 'TNT Sports' }
];

// Get fixtures with basic team info using simple JOINs
export async function getSimpleFixtures(): Promise<SimpleFixture[]> {
  try {
    console.log('[Supabase] Loading fixtures (no JOINs)...');

    // Step 1: Load fixture basics only
    // Use a dynamic season start (Aug 1 of current season year)
    const now = new Date();
    const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const seasonStartIso = `${seasonYear}-08-01T00:00:00.000Z`;

    const { data: fixtures, error } = await supabase
      .from('fixtures')
      .select('id, utc_kickoff, home_team_id, away_team_id')
      .gte('utc_kickoff', seasonStartIso)
      .order('utc_kickoff', { ascending: true })
      .limit(20);

    if (error) {
      console.error('[Supabase] Error loading fixtures:', error);
      throw error;
    }
    if (!fixtures || fixtures.length === 0) {
      console.warn('[Supabase] No fixtures returned');
      return [];
    }

    // Step 2: Load team names in one query
    const teamIds = Array.from(
      new Set([
        ...fixtures.map((f: any) => f.home_team_id),
        ...fixtures.map((f: any) => f.away_team_id),
      ].filter(Boolean))
    );

    let teamNameById: Record<number, string> = {};
    if (teamIds.length > 0) {
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);
      if (teamError) {
        console.warn('[Supabase] Error loading teams:', teamError);
      } else {
        (teams || []).forEach((t: any) => {
          teamNameById[t.id] = t.name;
        });
      }
    }

    // Step 3: Load broadcasts for these fixtures
    const fixtureIds = fixtures.map((f: any) => f.id);
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id')
      .in('fixture_id', fixtureIds);

    const broadcastLookup: Record<number, number> = {};
    (broadcasts || []).forEach((b: any) => {
      broadcastLookup[b.fixture_id] = b.provider_id;
    });

    // Step 4: Map to simple format
    return fixtures.map((fixture: any) => ({
      id: fixture.id,
      kickoff_utc: fixture.utc_kickoff,
      home_team: teamNameById[fixture.home_team_id] || 'Unknown',
      away_team: teamNameById[fixture.away_team_id] || 'Unknown',
      broadcaster: SIMPLE_BROADCASTERS.find(b => b.id === broadcastLookup[fixture.id])?.name || undefined,
    }));
  } catch (error) {
    console.error('[Supabase] Unexpected error:', error);
    return [];
  }
}

// Save broadcaster assignment (simple)
export async function saveBroadcaster(fixtureId: number, providerId: number | null): Promise<void> {
  try {
    console.log(`[Supabase] Saving broadcaster for fixture ${fixtureId}: provider ${providerId}`);
    
    if (!providerId) {
      // Remove broadcaster
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
