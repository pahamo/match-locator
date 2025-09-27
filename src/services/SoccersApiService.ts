/**
 * SoccersAPI Service
 * Handles all interactions with the SoccersAPI for fixture and broadcast data
 */

export interface SoccersApiFixture {
  id: number;
  date: string;
  time: string;
  homeTeam: {
    id: number;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo?: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  status: string;
  venue?: string;
  broadcasts?: SoccersApiBroadcast[];
}

export interface SoccersApiBroadcast {
  id: number;
  name: string;
  country: string;
  type: 'tv' | 'streaming' | 'radio';
  url?: string;
}

export interface SoccersApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

class SoccersApiServiceClass {
  private baseUrl = 'https://api.soccersapi.com/v2.2';
  private apiKey: string;
  private username: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private requestCount = 0;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // 100ms between requests to avoid rate limiting

  constructor() {
    this.apiKey = process.env.REACT_APP_SOCCERSAPI_KEY || process.env.SOCCERSAPI_KEY || '';
    this.username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME || '';
    if (!this.apiKey) {
      console.warn('[SoccersAPI] API key not found. Service will not work.');
    }
    if (!this.username) {
      console.warn('[SoccersAPI] Username not found. Using fallback authentication.');
    }
  }

  /**
   * Make authenticated request to SoccersAPI
   */
  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<SoccersApiResponse<T>> {
    if (!this.apiKey) {
      throw new Error('SoccersAPI key not configured');
    }

    // Rate limiting - ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }

    // Build URL with parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add API key (try common auth patterns)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Try different authentication methods
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FixturesApp/1.0',
    };

    // SoccersAPI authentication format: user + token + t=list
    if (this.username) {
      url.searchParams.append('user', this.username);
      url.searchParams.append('token', this.apiKey);
      url.searchParams.append('t', 'list');
    } else {
      // Fallback to simple API key if no username
      url.searchParams.append('APIkey', this.apiKey);
    }

    try {
      this.lastRequestTime = Date.now();
      this.requestCount++;

      console.log(`[SoccersAPI] Request #${this.requestCount}: ${endpoint}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Extract rate limit info if available
      const rateLimit = {
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
        reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
      };

      console.log(`[SoccersAPI] Success. Rate limit remaining: ${rateLimit.remaining}`);

      return {
        success: true,
        data,
        rateLimit: rateLimit.remaining > 0 ? rateLimit : undefined,
      };

    } catch (error) {
      console.error(`[SoccersAPI] Request failed:`, error);

      return {
        success: false,
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get cached data if available and valid
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`[SoccersAPI] Cache hit: ${key}`);
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
      console.log('[SoccersAPI] Testing connection...');

      // Try to fetch competitions/leagues as a simple test
      const response = await this.makeRequest('/leagues', { country: 'England' });

      if (response.success) {
        console.log('[SoccersAPI] Connection successful!');
        return true;
      } else {
        console.error('[SoccersAPI] Connection failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('[SoccersAPI] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get fixtures for a specific league and date range
   */
  async getFixtures(leagueId: number, dateFrom?: string, dateTo?: string): Promise<SoccersApiFixture[]> {
    const cacheKey = `fixtures_${leagueId}_${dateFrom}_${dateTo}`;

    // Check cache first
    const cached = this.getFromCache<SoccersApiFixture[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params: Record<string, string> = {
      league: leagueId.toString(),
    };

    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;

    const response = await this.makeRequest<SoccersApiFixture[]>('/fixtures', params);

    if (response.success && response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get broadcast information for specific fixtures
   */
  async getBroadcasts(fixtureIds: number[]): Promise<Record<number, SoccersApiBroadcast[]>> {
    if (!fixtureIds.length) return {};

    const cacheKey = `broadcasts_${fixtureIds.join(',')}`;

    // Check cache first
    const cached = this.getFromCache<Record<number, SoccersApiBroadcast[]>>(cacheKey);
    if (cached) {
      return cached;
    }

    const broadcasts: Record<number, SoccersApiBroadcast[]> = {};

    // Fetch broadcasts for each fixture (may need to batch this)
    for (const fixtureId of fixtureIds) {
      const response = await this.makeRequest<{broadcasts: SoccersApiBroadcast[]}>(`/fixtures/${fixtureId}/broadcasts`);

      if (response.success && response.data?.broadcasts) {
        broadcasts[fixtureId] = response.data.broadcasts.filter(b =>
          b.country === 'England' || b.country === 'United Kingdom' || b.country === 'UK'
        );
      }

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.setCache(cacheKey, broadcasts);
    return broadcasts;
  }

  /**
   * Get leagues/competitions
   */
  async getLeagues(country?: string): Promise<any[]> {
    const cacheKey = `leagues_${country || 'all'}`;

    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params: Record<string, string> = {};
    if (country) params.country = country;

    const response = await this.makeRequest<any[]>('/leagues', params);

    if (response.success && response.data) {
      this.setCache(cacheKey, response.data);
      return response.data;
    }

    return [];
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[SoccersAPI] Cache cleared');
  }
}

// Export singleton instance
export const SoccersApiService = new SoccersApiServiceClass();