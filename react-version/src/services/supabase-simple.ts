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
    console.log('[Supabase] Loading fixtures with basic table JOINs...');
    
    // Use basic tables with simple JOINs - no views
    const { data: fixtures, error } = await supabase
      .from('fixtures')
      .select(`
        id,
        utc_kickoff,
        home_team_id,
        away_team_id,
        home_team:home_team_id(name),
        away_team:away_team_id(name)
      `)
      .gte('utc_kickoff', '2024-08-01T00:00:00.000Z')
      .order('utc_kickoff', { ascending: true })
      .limit(20);
      
    if (error) {
      console.error('[Supabase] Error loading fixtures:', error);
      return [];
    }
    
    if (!fixtures) {
      console.warn('[Supabase] No fixtures returned');
      return [];
    }
    
    console.log(`[Supabase] Loaded ${fixtures.length} fixtures successfully`);
    
    // Get broadcast data for these fixtures
    const fixtureIds = fixtures.map(f => f.id);
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id')
      .in('fixture_id', fixtureIds);
    
    // Create broadcast lookup
    const broadcastLookup: Record<number, number> = {};
    (broadcasts || []).forEach(b => {
      broadcastLookup[b.fixture_id] = b.provider_id;
    });
    
    // Map to simple format
    return fixtures.map(fixture => ({
      id: fixture.id,
      kickoff_utc: fixture.utc_kickoff,
      home_team: (fixture as any).home_team?.name || 'Unknown',
      away_team: (fixture as any).away_team?.name || 'Unknown',
      broadcaster: SIMPLE_BROADCASTERS.find(b => b.id === broadcastLookup[fixture.id])?.name || undefined
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