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
  competition_id?: number; // Added to track competition
  stage?: string; // Champions League stage
  round?: string; // Champions League round
}

export interface SimpleCompetition {
  id: number;
  name: string;
  slug: string;
  short_name?: string;
  is_production_visible?: boolean;
}

// Only Sky Sports and TNT Sports for simplicity (plus blackout)
export const SIMPLE_BROADCASTERS = [
  { id: 1, name: 'Sky Sports' },
  { id: 2, name: 'TNT Sports' },
  { id: 999, name: '🚫 Blackout (No TV)' }
];

// Get fixtures with basic team info using simple JOINs
export async function getSimpleFixtures(competitionId: number = 1): Promise<SimpleFixture[]> {
  try {
    console.log(`[Supabase] Loading full season fixtures for competition ${competitionId}...`);

    // Step 1: Load fixture basics only
    // Use a dynamic season start (Aug 1 of current season year)
    const now = new Date();
    const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const seasonStartIso = `${seasonYear}-08-01T00:00:00.000Z`;

    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select('id, utc_kickoff, home_team_id, away_team_id, home_team, away_team, home_crest, away_crest, matchday, competition_id, stage, round')
      .eq('competition_id', competitionId) // Support any competition
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
    
    // Debug: Log fixtures on the 13th for investigation
    const fixtures13th = validFixtures.filter(f => {
      const kickoffDate = new Date(f.utc_kickoff);
      return kickoffDate.getUTCDate() === 13;
    });
    if (fixtures13th.length > 0) {
      console.log(`[Debug] Found ${fixtures13th.length} fixtures on 13th:`, fixtures13th.map(f => ({
        id: f.id,
        kickoff: f.utc_kickoff,
        home: f.home_team,
        away: f.away_team
      })));
    }

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
        competition_id: fixture.competition_id || undefined,
        stage: fixture.stage || undefined,
        round: fixture.round || undefined,
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

// Get available competitions (with optional admin flag to see all)
export async function getSimpleCompetitions(includeHidden: boolean = false): Promise<SimpleCompetition[]> {
  try {
    console.log('[Supabase] Loading available competitions...');
    
    // First try with is_production_visible column
    let competitions: SimpleCompetition[] = [];
    try {
      let query = supabase
        .from('competitions')
        .select('id, name, slug, short_name, is_production_visible')
        .eq('is_active', true);
      
      if (!includeHidden) {
        query = query.eq('is_production_visible', true);
      }
      
      const { data, error } = await query.order('id');
      if (error) throw error;
      competitions = data || [];
      
    } catch (columnError: any) {
      // If is_production_visible column doesn't exist, fall back to basic query
      console.error('[Supabase] Error loading competitions with is_production_visible:', columnError);
      if (columnError.code === '42703' || columnError.message?.includes('column "is_production_visible" does not exist')) {
        console.log('[Supabase] is_production_visible column not found, using fallback...');
        const { data, error } = await supabase
          .from('competitions')
          .select('id, name, slug, short_name')
          .eq('is_active', true)
          .order('id');
          
        if (error) throw error;
        
        // Add default visibility values ONLY if column doesn't exist
        // This should not run if the column was added but there's a different error
        competitions = (data || []).map(comp => ({
          ...comp,
          is_production_visible: true // Default all to visible when column missing
        }));
        
        // Filter by visibility if not including hidden
        if (!includeHidden) {
          competitions = competitions.filter(comp => comp.is_production_visible);
        }
      } else {
        throw columnError;
      }
    }
    
    console.log(`[Supabase] Found ${competitions.length} competitions (includeHidden: ${includeHidden})`);
    return competitions;
    
  } catch (error) {
    console.error('[Supabase] Unexpected error loading competitions:', error);
    // Return safe default - show all for admin, only EPL for production
    return includeHidden ? [
      { id: 1, name: 'Premier League', slug: 'premier-league', short_name: 'EPL', is_production_visible: true },
      { id: 2, name: 'UEFA Champions League', slug: 'champions-league', short_name: 'UCL', is_production_visible: false }
    ] : [
      { id: 1, name: 'Premier League', slug: 'premier-league', short_name: 'EPL', is_production_visible: true }
    ];
  }
}

// Save competition visibility setting
export async function saveCompetitionVisibility(competitionId: number, isVisible: boolean): Promise<void> {
  try {
    console.log(`[Supabase] Updating competition ${competitionId} visibility to ${isVisible}...`);
    
    const { error } = await supabase
      .from('competitions')
      .update({ is_production_visible: isVisible })
      .eq('id', competitionId);
      
    if (error) throw error;
    console.log(`[Supabase] Successfully updated competition ${competitionId} visibility`);
    
  } catch (error: any) {
    console.error(`[Supabase] Error updating competition visibility:`, error);
    if (error.code === '42703') {
      console.error('[Supabase] Column is_production_visible does not exist in competitions table');
    }
    throw error;
  }
}
