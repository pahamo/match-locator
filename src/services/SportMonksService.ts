/**
 * Sports Monks API Service
 *
 * Handles all interactions with Sports Monks API for:
 * - Fixtures data
 * - TV Stations (broadcast data)
 * - Livescores
 * - Lineups
 * - Match statistics
 * - H2H data
 *
 * Tier: Standard (Europe) + UCL/Europa/Conference
 * Rate Limit: 3000 requests/hour
 * Docs: https://docs.sportmonks.com/football
 */

export interface SportMonksFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  round_id: number;
  name: string;
  starting_at: string; // ISO timestamp
  starting_at_timestamp: number;
  result_info: string | null;
  leg: string;
  details: string | null;
  length: number;
  placeholder: boolean;
  has_odds: boolean;
  has_premium_odds: boolean;
  state: {
    id: number;
    state: 'NS' | 'LIVE' | 'FT' | 'HT' | 'CANCELLED' | 'POSTPONED' | 'ABANDONED';
    name: string;
    short_name: string;
    developer_name: string;
  };
  participants: Array<{
    id: number;
    sport_id: number;
    country_id: number;
    venue_id: number;
    gender: string;
    name: string;
    short_code: string;
    image_path: string;
    founded: number;
    type: string;
    placeholder: boolean;
    last_played_at: string;
    meta: {
      location: string;
      winner: boolean;
      position: number;
    };
  }>;
  venue?: {
    id: number;
    country_id: number;
    city_id: number;
    name: string;
    address: string | null;
    zip_code: string | null;
    latitude: number;
    longitude: number;
    capacity: number;
    image_path: string;
    city_name: string;
    surface: string;
    national_team: boolean;
  };
}

export interface SportMonksTvStation {
  id: number;
  fixture_id: number;
  tvstation: {
    id: number;
    name: string;
    url: string | null;
    image_path: string | null;
    type: 'tv' | 'streaming' | 'radio';
    related_id: number | null;
  };
}

export interface SportMonksLivescore {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  round_id: number;
  name: string;
  starting_at: string;
  result_info: string;
  state: {
    id: number;
    state: 'NS' | 'LIVE' | 'FT' | 'HT';
    name: string;
  };
  scores: Array<{
    id: number;
    fixture_id: number;
    type_id: number;
    participant_id: number;
    score: {
      goals: number;
      participant: string;
    };
    description: string;
  }>;
  participants: Array<{
    id: number;
    name: string;
    image_path: string;
    meta: {
      location: string;
      winner: boolean;
      position: number;
    };
  }>;
}

export interface SportMonksLineup {
  id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  position_id: number;
  formation_field: string | null;
  formation_position: number | null;
  type_id: number;
  start: boolean;
  captain: boolean;
  jersey_number: number;
  player: {
    id: number;
    sport_id: number;
    country_id: number;
    nationality_id: number;
    position_id: number;
    detailed_position_id: number;
    type_id: number;
    common_name: string;
    firstname: string;
    lastname: string;
    name: string;
    display_name: string;
    image_path: string;
    height: number;
    weight: number;
    date_of_birth: string;
  };
}

export interface SportMonksResponse<T> {
  data: T;
  subscription?: Array<{
    meta: any;
    plans: Array<{
      plan: string;
      sport: string;
      category: string;
    }>;
  }>;
  rate_limit?: {
    resets_in_seconds: number;
    remaining: number;
    requested_entity: string;
  };
  timezone?: string;
}

class SportMonksServiceClass {
  private baseUrl = 'https://api.sportmonks.com/v3/football';
  private apiToken: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  private requestCount = 0;
  private requestsThisHour = 0;
  private hourlyResetTime = Date.now() + 3600000; // Reset in 1 hour
  private maxRequestsPerHour = 3000;
  private minRequestInterval = 200; // 200ms between requests
  private lastRequestTime = 0;

  constructor() {
    this.apiToken = process.env.REACT_APP_SPORTMONKS_TOKEN || '';
    if (!this.apiToken) {
      console.warn('[SportMonks] API token not found. Service will not work.');
    }
  }

  /**
   * Check and enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset hourly counter if needed
    if (now >= this.hourlyResetTime) {
      this.requestsThisHour = 0;
      this.hourlyResetTime = now + 3600000;
      console.log('[SportMonks] Hourly rate limit reset');
    }

    // Check if we've hit the hourly limit
    if (this.requestsThisHour >= this.maxRequestsPerHour) {
      const waitTime = this.hourlyResetTime - now;
      console.warn(`[SportMonks] Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestsThisHour = 0;
      this.hourlyResetTime = Date.now() + 3600000;
    }

    // Enforce minimum interval between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
  }

  /**
   * Make authenticated request to Sports Monks API
   */
  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<SportMonksResponse<T>> {
    if (!this.apiToken) {
      throw new Error('Sports Monks API token not configured');
    }

    await this.enforceRateLimit();

    // Build URL
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_token', this.apiToken);

    // Add additional parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      this.lastRequestTime = Date.now();
      this.requestCount++;
      this.requestsThisHour++;

      console.log(`[SportMonks] Request #${this.requestCount} (${this.requestsThisHour}/3000 this hour): ${endpoint}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: SportMonksResponse<T> = await response.json();

      // Log rate limit info if available
      if (data.rate_limit) {
        console.log(`[SportMonks] Rate limit: ${data.rate_limit.remaining} remaining, resets in ${data.rate_limit.resets_in_seconds}s`);
      }

      return data;

    } catch (error) {
      console.error(`[SportMonks] Request failed:`, error);
      throw error;
    }
  }

  /**
   * Get cached data if available and valid
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`[SportMonks] Cache hit: ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[SportMonks] Testing connection...');

      // Simple leagues request to verify auth
      const response = await this.makeRequest<any[]>('/leagues', {
        include: 'country'
      });

      if (response.data) {
        console.log('[SportMonks] ✅ Connection successful!');
        console.log(`[SportMonks] Found ${response.data.length} leagues`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[SportMonks] ❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get fixtures for a specific league and date range
   * Includes: participants (teams), venue, state (match status)
   */
  async getFixtures(
    leagueId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<SportMonksFixture[]> {
    const cacheKey = `fixtures_${leagueId}_${dateFrom}_${dateTo}`;

    // Check cache first
    const cached = this.getFromCache<SportMonksFixture[]>(cacheKey);
    if (cached) return cached;

    const params: Record<string, string> = {
      include: 'participants,venue,state,tvstations',
      filters: `fixtureLeagues:${leagueId}`,
    };

    if (dateFrom) params.starting_at = `>=${dateFrom}`;
    if (dateTo && dateFrom) params.starting_at = `${dateFrom},${dateTo}`;

    const response = await this.makeRequest<SportMonksFixture[]>('/fixtures', params);

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get TV stations (broadcast info) for specific fixtures
   */
  async getTvStations(fixtureId: number): Promise<SportMonksTvStation[]> {
    const cacheKey = `tvstations_${fixtureId}`;

    const cached = this.getFromCache<SportMonksTvStation[]>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<SportMonksTvStation[]>(
      `/fixtures/${fixtureId}/tvstations`,
      { include: 'tvstation' }
    );

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get livescores for today's matches
   * Use this for real-time score updates
   */
  async getLivescores(): Promise<SportMonksLivescore[]> {
    const cacheKey = `livescores_${new Date().toISOString().split('T')[0]}`;

    // Livescores have shorter cache (30 seconds)
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 30000) {
      return cached.data;
    }

    const response = await this.makeRequest<SportMonksLivescore[]>(
      '/livescores',
      { include: 'scores,participants,state' }
    );

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get lineups for a specific fixture
   */
  async getLineups(fixtureId: number): Promise<SportMonksLineup[]> {
    const cacheKey = `lineups_${fixtureId}`;

    const cached = this.getFromCache<SportMonksLineup[]>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<SportMonksLineup[]>(
      `/fixtures/${fixtureId}/lineups`,
      { include: 'player' }
    );

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get all leagues/competitions
   */
  async getLeagues(countryId?: number): Promise<any[]> {
    const cacheKey = `leagues_${countryId || 'all'}`;

    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    const params: Record<string, string> = {
      include: 'country,seasons',
    };

    if (countryId) {
      params.filters = `countryId:${countryId}`;
    }

    const response = await this.makeRequest<any[]>('/leagues', params);

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get head-to-head data between two teams
   */
  async getHeadToHead(team1Id: number, team2Id: number): Promise<any> {
    const cacheKey = `h2h_${team1Id}_${team2Id}`;

    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const response = await this.makeRequest<any>(
      `/head-to-head/${team1Id}/${team2Id}`,
      { include: 'participants,state,scores' }
    );

    if (response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return null;
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return {
      totalRequests: this.requestCount,
      requestsThisHour: this.requestsThisHour,
      remainingThisHour: this.maxRequestsPerHour - this.requestsThisHour,
      hourlyResetIn: Math.ceil((this.hourlyResetTime - Date.now()) / 1000),
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[SportMonks] Cache cleared');
  }
}

// Export singleton instance
export const SportMonksService = new SportMonksServiceClass();
