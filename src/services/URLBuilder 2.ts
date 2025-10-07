/**
 * Centralized URL building service
 * Generates consistent URLs from team/fixture data
 */

import { Team, Fixture } from '../types';

class URLBuilderClass {
  /**
   * Generate team page URL using consolidated slug
   */
  team(team: Team): string {
    return `/club/${team.slug}`;
  }

  /**
   * Generate H2H page URL from team objects
   * Always generates correct URL format
   */
  h2h(team1: Team, team2: Team): string {
    // Canonical order (alphabetical)
    const [first, second] = [team1.slug, team2.slug].sort();
    return `/h2h/${first}-vs-${second}`;
  }

  /**
   * Generate H2H URL from slug strings (when you don't have team objects)
   */
  h2hFromSlugs(slug1: string, slug2: string): string {
    const [first, second] = [slug1, slug2].sort();
    return `/h2h/${first}-vs-${second}`;
  }

  /**
   * Generate fixture detail URL
   */
  fixture(fixture: Fixture): string {
    const date = new Date(fixture.kickoff_utc).toISOString().split('T')[0];
    return `/fixtures/${fixture.home.slug}-vs-${fixture.away.slug}-${date}`;
  }

  /**
   * Generate team fixtures URL
   */
  teamFixtures(team: Team): string {
    return `${this.team(team)}/fixtures`;
  }

  /**
   * Generate competition page URL
   */
  competition(competitionSlug: string): string {
    return `/competitions/${competitionSlug}`;
  }

  /**
   * Generate admin team page URL
   */
  adminTeam(team: Team): string {
    return `/admin/teams/${team.id}`;
  }

  /**
   * Generate admin fixture page URL
   */
  adminFixture(fixture: Fixture): string {
    return `/admin/fixtures/${fixture.id}`;
  }

  /**
   * Parse H2H slug to get team slugs
   * Example: "man-united-vs-chelsea" -> ["man-united", "chelsea"]
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
  canonicalH2HSlug(slug1: string, slug2: string): string {
    const [first, second] = [slug1, slug2].sort();
    return `${first}-vs-${second}`;
  }

  /**
   * Check if H2H slug needs canonical redirect
   */
  needsH2HRedirect(currentSlug: string): string | null {
    const parsed = this.parseH2HSlug(currentSlug);
    if (!parsed) return null;

    const canonical = this.canonicalH2HSlug(parsed.team1Slug, parsed.team2Slug);
    return currentSlug !== canonical ? canonical : null;
  }


}

// Export singleton instance
export const URLBuilder = new URLBuilderClass();