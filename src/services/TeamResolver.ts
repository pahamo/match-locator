/**
 * Centralized team resolution service
 * Handles all team lookup variations and caching
 */

import { Team } from '../types';
import { supabase } from './supabase';

class TeamResolverClass {
  private cache = new Map<string, Team | null>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  /**
   * Resolve any team slug format to a Team object
   * Handles: smart slugs, old slugs, url_slugs, variations
   */
  async resolve(anySlug: string): Promise<Team | null> {
    if (!anySlug?.trim()) return null;

    const cacheKey = anySlug.toLowerCase();

    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    let team: Team | null = null;

    try {
      // Try exact matches first (most common case)
      team = await this.tryExactMatch(anySlug);

      // If no exact match, try variations
      if (!team) {
        team = await this.tryVariations(anySlug);
      }

      // Cache the result (including null results to avoid repeated lookups)
      this.cache.set(cacheKey, team);
      this.cacheTimestamps.set(cacheKey, Date.now());

    } catch (error) {
      console.error(`TeamResolver: Error resolving "${anySlug}":`, error);
      // Don't cache errors
    }

    return team;
  }

  /**
   * Parse H2H slug into two team objects
   * Example: "man-united-vs-chelsea" -> [Team, Team]
   */
  async parseH2HSlug(h2hSlug: string): Promise<{ team1: Team; team2: Team } | null> {
    if (!h2hSlug) return null;

    const parts = h2hSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [team1Slug, team2Slug] = parts;
    if (!team1Slug?.trim() || !team2Slug?.trim()) return null;

    const [team1, team2] = await Promise.all([
      this.resolve(team1Slug),
      this.resolve(team2Slug)
    ]);

    if (!team1 || !team2) return null;

    return { team1, team2 };
  }

  /**
   * Generate canonical H2H slug from team data
   * Uses the team's consolidated slug
   */
  generateH2HSlug(team1: Team, team2: Team): string {
    // Alphabetical order for consistency
    const [first, second] = [team1.slug, team2.slug].sort();
    return `${first}-vs-${second}`;
  }

  /**
   * Clear cache (useful for testing or data updates)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  private async tryExactMatch(slug: string): Promise<Team | null> {
    // Single slug field lookup after Phase 3 migration
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single();

    if (data && !error) {
      return this.mapTeamData(data);
    }

    return null;
  }

  private async tryVariations(originalSlug: string): Promise<Team | null> {
    // Common variations to try
    const variations = this.generateSlugVariations(originalSlug);

    for (const variation of variations) {
      if (variation === originalSlug) continue; // Skip original

      const team = await this.tryExactMatch(variation);
      if (team) return team;
    }

    return null;
  }

  private generateSlugVariations(slug: string): string[] {
    const variations = new Set([slug]);

    // Common transformations
    variations.add(slug + '-fc');
    variations.add(slug.replace(/-fc$/, ''));
    variations.add(slug.replace(/^afc-/, ''));
    variations.add('afc-' + slug);

    // Manchester United variations
    if (slug.includes('manchester-united')) {
      variations.add(slug.replace('manchester-united', 'man-united'));
    }
    if (slug.includes('man-united')) {
      variations.add(slug.replace('man-united', 'manchester-united'));
    }

    // Manchester City variations
    if (slug.includes('manchester-city')) {
      variations.add(slug.replace('manchester-city', 'man-city'));
    }
    if (slug.includes('man-city')) {
      variations.add(slug.replace('man-city', 'manchester-city'));
    }

    // Brighton variations
    if (slug.includes('brighton-hove-albion')) {
      variations.add(slug.replace('brighton-hove-albion', 'brighton'));
    }
    if (slug === 'brighton') {
      variations.add('brighton-hove-albion');
    }

    // Sunderland variations
    if (slug.includes('sunderland-afc')) {
      variations.add(slug.replace('sunderland-afc', 'sunderland'));
    }
    if (slug === 'sunderland') {
      variations.add('sunderland-afc');
    }

    return Array.from(variations);
  }

  private mapTeamData(data: any): Team {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug, // Consolidated slug field
      crest: data.crest_url,
      short_name: data.short_name,
      competition_id: data.competition_id
    };
  }

  private isValidCache(key: string): boolean {
    if (!this.cache.has(key)) return false;

    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;

    return (Date.now() - timestamp) < this.cacheTimeout;
  }
}

// Export singleton instance
export const TeamResolver = new TeamResolverClass();