export interface Team {
  id: number;
  name: string;
  slug: string; // Consolidated slug field (previously url_slug values)
  crest: string | null;
  competition_id?: number;
  short_name?: string | null;
  club_colors?: string | null;
  website?: string | null;
  venue?: string | null;
  home_venue?: string | null;
  city?: string | null;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  slug?: string;
  url?: string;
  href?: string;
  status?: string;
}

export interface BlackoutInfo {
  is_blackout: boolean;
  reason?: string | null;
}

export interface FixtureScore {
  home: number | null;
  away: number | null;
}

/**
 * Round data from SportMonks API
 * Represents a matchweek/gameweek in league competitions
 * or a round (e.g., "Round of 16") in cup competitions
 */
export interface RoundData {
  id: number;
  name: string;
  league_id?: number;
  season_id?: number;
  stage_id?: number;
  starting_at?: string;
  ending_at?: string;
  finished?: boolean;
  is_current?: boolean;
  games_in_current_week?: boolean;
}

/**
 * Stage data from SportMonks API
 * Represents a phase of a competition (e.g., "Group Stage", "Knockout")
 */
export interface StageData {
  id: number;
  name: string;
  type?: string;
  league_id?: number;
  season_id?: number;
  starting_at?: string;
  ending_at?: string;
  [key: string]: any; // Allow additional fields from API
}

// Unified fixture interface combining both approaches
export interface Fixture {
  id: number;
  sport?: string;
  competition?: string;
  competition_id?: number;
  kickoff_utc: string;
  venue: string | null;
  home: Team;
  away: Team;
  providers_uk: Provider[];
  blackout: BlackoutInfo;
  status: string;
  score?: FixtureScore;
  broadcaster?: string; // Broadcaster name from database view
  broadcaster_id?: number; // Broadcaster provider ID from database view
  // API objects stored as-is (not transformed)
  round?: RoundData; // Round object from API (use getMatchweek() helper to extract number)
  stage?: StageData; // Stage object from API
  // matchweek removed - derive from round.name using getMatchweek() helper function
}

// Simple fixture interface for admin and lightweight operations
export interface SimpleFixture {
  id: number;
  kickoff_utc: string;
  home_team: string;
  away_team: string;
  home_slug?: string;        // Team slug for SEO-friendly URLs
  away_slug?: string;        // Team slug for SEO-friendly URLs
  home_crest?: string;
  away_crest?: string;
  broadcaster?: string;
  providerId?: number;
  isBlackout?: boolean;
  competition_id?: number;
  stage?: StageData | string;  // Can be object or string (backwards compatibility)
  round?: RoundData | string;  // Round object from API (preferred) or string
  home_score?: number | null;
  away_score?: number | null;
  status?: string;
  // Deprecated fields (use round object instead)
  /** @deprecated Use getRoundNumber(fixture) on round object instead */
  matchweek?: number;
}

// Competition interface
export interface Competition {
  id: number;
  name: string;
  slug: string;
  short_name?: string;
  is_production_visible?: boolean;
}

export interface FixturesApiParams {
  teamSlug?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  competitionId?: number;
}