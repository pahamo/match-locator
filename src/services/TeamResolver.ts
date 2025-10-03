/**
 * Centralized team resolution service - SIMPLIFIED
 *
 * NOTE: This service is being phased out. H2H pages now load fixtures directly
 * and extract team data from fixture results (zero separate team queries).
 *
 * Keep this minimal version for backward compatibility only.
 */

import { Team } from '../types';
import { supabase } from './supabase';

class TeamResolverClass {
  private cache = new Map<string, Team | null>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  /**
   * Simple slug-based team lookup (no variations, no complexity)
   */
  async resolve(slug: string): Promise<Team | null> {
    if (!slug?.trim()) return null;

    const cacheKey = slug.toLowerCase();

    // Check cache
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .single();

      const team = (data && !error) ? this.mapTeamData(data) : null;

      // Cache result
      this.cache.set(cacheKey, team);
      this.cacheTimestamps.set(cacheKey, Date.now());

      return team;
    } catch (error) {
      console.error(`TeamResolver: Error resolving "${slug}":`, error);
      return null;
    }
  }

  /**
   * Parse H2H slug into two team slugs (simple split)
   * Example: "arsenal-vs-chelsea" -> { team1Slug: "arsenal", team2Slug: "chelsea" }
   */
  parseH2HSlug(h2hSlug: string): { team1Slug: string; team2Slug: string } | null {
    if (!h2hSlug) return null;

    const parts = h2hSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [team1Slug, team2Slug] = parts;
    if (!team1Slug?.trim() || !team2Slug?.trim()) return null;

    return { team1Slug, team2Slug };
  }

  /**
   * Generate canonical H2H slug (alphabetical order)
   */
  generateH2HSlug(slug1: string, slug2: string): string {
    const [first, second] = [slug1, slug2].sort();
    return `${first}-vs-${second}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  private mapTeamData(data: any): Team {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
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
