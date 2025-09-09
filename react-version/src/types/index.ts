export interface Team {
  id: number;
  name: string;
  slug: string;
  crest: string | null;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  href?: string;
  status: string;
}

export interface BlackoutInfo {
  is_blackout: boolean;
  reason?: string | null;
}

export interface Fixture {
  id: number;
  sport: string;
  competition: string;
  matchweek: number | null;
  kickoff_utc: string;
  venue: string | null;
  home: Team;
  away: Team;
  providers_uk: Provider[];
  blackout: BlackoutInfo;
  status: string;
}

export interface FixturesApiParams {
  teamSlug?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  competitionId?: number;
}