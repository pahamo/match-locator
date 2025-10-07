import { supabase } from './supabase';
import type { SimpleFixture, Competition } from '../types';

// Alias for backward compatibility
export type SimpleCompetition = Competition;

// Main UK broadcasters for frontend display
export const SIMPLE_BROADCASTERS = [
  { id: 1, name: 'Sky Sports' },
  { id: 2, name: 'TNT Sports' },
  { id: 3, name: 'BBC' },
  { id: 4, name: 'Amazon Prime Video' },
  { id: 999, name: '🚫 Blackout (No TV)' }
];

// Get fixtures with basic team info using simple JOINs
export async function getSimpleFixtures(competitionId?: number): Promise<SimpleFixture[]> {
  try {

    // Step 1: Load fixture basics only
    // Use a dynamic season start (Aug 1 of current season year)
    const now = new Date();
    const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    const seasonStartIso = `${seasonYear}-08-01T00:00:00.000Z`;

    let query = supabase
      .from('fixtures_with_teams')
      .select('id, utc_kickoff, home_team_id, away_team_id, home_team, away_team, home_crest, away_crest, matchday, competition_id, stage, round, status, home_score, away_score')
      .gte('utc_kickoff', seasonStartIso)
      .order('utc_kickoff', { ascending: true });

    // Only filter by competition if competitionId is provided
    if (competitionId !== undefined) {
      query = query.eq('competition_id', competitionId);
    }

    const { data: fixtures, error } = await query;

    if (error) {
      throw error;
    }
    if (!fixtures || fixtures.length === 0) {
      return [];
    }

    // Filter out test/dummy fixtures (same as main supabase service)
    const validFixtures = fixtures.filter(f => f.id && f.id > 30);
    

    // Team names are now included directly from fixtures_with_teams view

    // Step 3: Load broadcasts for these fixtures
    const fixtureIds = validFixtures.map((f: any) => f.id);
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('fixture_id, provider_id, channel_name')
      .in('fixture_id', fixtureIds);

    const broadcastLookup: Record<number, { providerId: number; channelName: string | null }> = {};
    (broadcasts || []).forEach((b: any) => {
      broadcastLookup[b.fixture_id] = {
        providerId: b.provider_id,
        channelName: b.channel_name
      };
    });

    // Step 4: Map to simple format
    return validFixtures.map((fixture: any) => {
      const broadcast = broadcastLookup[fixture.id];
      const providerId = broadcast?.providerId;
      const channelName = broadcast?.channelName;
      const isBlackout = providerId === 999;

      // Use specific channel name if available, otherwise fall back to provider name
      const broadcasterDisplay = isBlackout
        ? undefined
        : channelName || SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name || undefined;

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
        broadcaster: broadcasterDisplay,
        home_score: fixture.home_score ?? undefined,
        away_score: fixture.away_score ?? undefined,
        status: fixture.status || undefined,
      };
    });
  } catch (error) {
    return [];
  }
}

// Save broadcaster assignment (via API endpoint with service role key)
export async function saveBroadcaster(fixtureId: number, providerId: number | null): Promise<void> {
  try {
    
    // Use -1 for blackout consistently
    const normalizedProviderId = providerId;
    
    const response = await fetch('/.netlify/functions/save-broadcaster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fixtureId,
        providerId: normalizedProviderId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }
    
    
  } catch (error) {
    console.error('saveBroadcaster error:', error);
    throw error;
  }
}

// Get available competitions (with optional admin flag to see all)
export async function getSimpleCompetitions(includeHidden: boolean = false): Promise<Competition[]> {
  try {
    
    // First try with is_production_visible column
    let competitions: Competition[] = [];
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
      if (columnError.code === '42703' || columnError.message?.includes('column "is_production_visible" does not exist')) {
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
    
    return competitions;
    
  } catch (error) {
    // Return safe default - show all for admin, only EPL for production
    return includeHidden ? [
      { id: 1, name: 'Premier League', slug: 'premier-league', short_name: 'EPL', is_production_visible: true },
      { id: 2, name: 'UEFA Champions League', slug: 'champions-league', short_name: 'UCL', is_production_visible: false }
    ] : [
      { id: 1, name: 'Premier League', slug: 'premier-league', short_name: 'EPL', is_production_visible: true }
    ];
  }
}

// Save competition visibility setting (via API endpoint with service role key)
export async function saveCompetitionVisibility(competitionId: number, isVisible: boolean): Promise<void> {
  try {
    
    const response = await fetch('/.netlify/functions/save-competition-visibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        competitionId,
        isVisible
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }
    
    
  } catch (error: any) {
    throw error;
  }
}
