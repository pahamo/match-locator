/**
 * Smart URL Builder for H2H Pages
 *
 * Multi-layer defense system:
 * - Layer 1: Direct SEO URL (best for SEO, fastest)
 * - Layer 2: Fixture ID fallback (always works, redirects)
 * - Layer 3: Graceful failure (disabled link)
 *
 * This ensures the system never fully breaks.
 */

/**
 * Slug validation regex
 * Format: lowercase letters, numbers, hyphens only
 * Examples: "arsenal", "west-ham-united", "manchester-city"
 */
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validate if a string is a properly formatted team slug
 */
export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  if (slug.length < 2 || slug.length > 100) return false;
  return SLUG_REGEX.test(slug);
}

/**
 * URL Build Result
 * Includes the URL, strategy used, and any warnings for monitoring
 */
export interface URLBuildResult {
  url: string;
  strategy: 'direct-seo' | 'fixture-id' | 'failed';
  warning?: string;
}

/**
 * Generate canonical H2H URL from team slugs
 * Sorts alphabetically for consistency (prevents duplicate pages)
 *
 * Example: generateCanonicalH2HUrl('chelsea', 'arsenal') → '/h2h/arsenal-vs-chelsea'
 */
function generateCanonicalH2HUrl(slug1: string, slug2: string): string {
  const [first, second] = [slug1, slug2].sort();
  return `/h2h/${first}-vs-${second}`;
}

/**
 * Smart H2H URL Builder with Multi-Layer Fallback
 *
 * Strategy Priority:
 * 1. Direct SEO URL (if slugs valid) - BEST for SEO, no redirect
 * 2. Fixture ID URL (fallback) - ALWAYS works, redirects to SEO URL
 * 3. Disabled link (data unavailable) - Shouldn't happen
 *
 * @param fixture - SimpleFixture or Fixture with at least an ID
 * @returns URL build result with strategy used
 *
 * @example
 * // Best case - valid slugs
 * buildH2HUrl({ id: 123, home_slug: 'arsenal', away_slug: 'chelsea' })
 * // → { url: '/h2h/arsenal-vs-chelsea', strategy: 'direct-seo' }
 *
 * @example
 * // Fallback case - missing slugs
 * buildH2HUrl({ id: 123, home_slug: undefined, away_slug: undefined })
 * // → { url: '/h2h/123', strategy: 'fixture-id', warning: '...' }
 */
export function buildH2HUrl(
  fixture: {
    id: number;
    home_slug?: string | null;
    away_slug?: string | null;
  } | {
    id: number;
    home: { slug: string };
    away: { slug: string };
  }
): URLBuildResult {

  // Extract slugs based on fixture type
  let homeSlug: string | null | undefined;
  let awaySlug: string | null | undefined;

  if ('home_slug' in fixture) {
    // SimpleFixture format
    homeSlug = fixture.home_slug;
    awaySlug = fixture.away_slug;
  } else if ('home' in fixture && 'away' in fixture) {
    // Full Fixture format
    homeSlug = fixture.home.slug;
    awaySlug = fixture.away.slug;
  }

  // STRATEGY 1: Direct SEO URL (BEST - 100% link equity, fastest)
  if (isValidSlug(homeSlug) && isValidSlug(awaySlug)) {
    return {
      url: generateCanonicalH2HUrl(homeSlug, awaySlug),
      strategy: 'direct-seo'
    };
  }

  // STRATEGY 2: Fixture ID Fallback (ROBUST - always works)
  if (fixture.id && fixture.id > 0) {
    const warning = !isValidSlug(homeSlug) || !isValidSlug(awaySlug)
      ? `Fixture ${fixture.id}: Slugs missing or invalid (home: "${homeSlug}", away: "${awaySlug}"). Using fixture ID fallback.`
      : undefined;

    // Log warning for monitoring (only in production)
    if (warning && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn('[URL_BUILDER_FALLBACK]', warning);
    }

    return {
      url: `/h2h/${fixture.id}`,
      strategy: 'fixture-id',
      warning
    };
  }

  // STRATEGY 3: Complete Failure (shouldn't happen - fixture should always have ID)
  console.error('[URL_BUILDER_FAILED] Cannot generate URL - no valid fixture ID', {
    fixture,
    homeSlug,
    awaySlug
  });

  return {
    url: '#',  // Disabled link
    strategy: 'failed',
    warning: 'Unable to generate match URL - missing fixture data'
  };
}

/**
 * Batch URL builder for performance
 * Processes multiple fixtures efficiently
 *
 * @param fixtures - Array of fixtures
 * @returns Map of fixture ID to URL build result
 */
export function buildH2HUrlsBatch(
  fixtures: Array<{
    id: number;
    home_slug?: string | null;
    away_slug?: string | null;
  }>
): Map<number, URLBuildResult> {
  const results = new Map<number, URLBuildResult>();

  for (const fixture of fixtures) {
    results.set(fixture.id, buildH2HUrl(fixture));
  }

  return results;
}

/**
 * URL Strategy Statistics
 * Useful for monitoring system health
 *
 * @param results - Array of URL build results
 * @returns Statistics about URL generation strategies
 */
export function getUrlStrategyStats(
  results: URLBuildResult[]
): {
  directSeo: number;
  fixtureId: number;
  failed: number;
  total: number;
  healthScore: number;  // 0-100 (100 = all direct SEO, 0 = all failed)
} {
  const stats = {
    directSeo: results.filter(r => r.strategy === 'direct-seo').length,
    fixtureId: results.filter(r => r.strategy === 'fixture-id').length,
    failed: results.filter(r => r.strategy === 'failed').length,
    total: results.length
  };

  // Health score calculation:
  // - Direct SEO: 100 points (optimal)
  // - Fixture ID: 50 points (works, but redirect)
  // - Failed: 0 points (broken)
  const healthScore = stats.total > 0
    ? Math.round((stats.directSeo * 100 + stats.fixtureId * 50) / stats.total)
    : 0;

  return { ...stats, healthScore };
}
