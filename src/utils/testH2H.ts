/**
 * Testing utilities for H2H functionality
 * Use this in development to verify H2H routes and redirects work
 */

import { generateAllPremierLeagueH2HRoutes, getPopularH2HMatchups, logH2HStats } from './generateH2HRoutes';
import { generateCanonicalH2HSlug } from './headToHead';

/**
 * Test data for common legacy match URLs that should redirect
 */
export const TEST_LEGACY_URLS = [
  '/matches/123-arsenal-vs-chelsea-premier-league-2025-01-15',
  '/matches/456-liverpool-vs-manchester-united-premier-league-12-jan-2025',
  '/matches/789-manchester-city-vs-tottenham-champions-league-2025-02-20',
  '/match/999-newcastle-vs-west-ham-2025-03-10'
];

/**
 * Expected H2H redirects for test URLs
 */
export const EXPECTED_REDIRECTS = [
  { from: '/matches/123-arsenal-vs-chelsea-premier-league-2025-01-15', to: '/h2h/arsenal-vs-chelsea' },
  { from: '/matches/456-liverpool-vs-manchester-united-premier-league-12-jan-2025', to: '/h2h/liverpool-vs-manchester-united' },
  { from: '/matches/789-manchester-city-vs-tottenham-champions-league-2025-02-20', to: '/h2h/manchester-city-vs-tottenham-hotspur' },
  { from: '/match/999-newcastle-vs-west-ham-2025-03-10', to: '/h2h/newcastle-united-vs-west-ham-united' }
];

/**
 * Test that all Premier League H2H routes are valid
 */
export function testH2HRoutes() {
  console.log('🧪 Testing H2H Route Generation...');

  const routes = generateAllPremierLeagueH2HRoutes();
  const popular = getPopularH2HMatchups();

  console.log(`✅ Generated ${routes.length} H2H routes`);
  console.log(`✅ ${popular.length} popular matchups identified`);

  // Test a few specific routes
  const testRoutes = [
    '/h2h/arsenal-vs-chelsea',
    '/h2h/liverpool-vs-manchester-united',
    '/h2h/manchester-city-vs-tottenham-hotspur'
  ];

  testRoutes.forEach(route => {
    const isGenerated = routes.includes(route);
    const isPopular = popular.includes(route);
    console.log(`${isGenerated ? '✅' : '❌'} ${route} - ${isPopular ? 'Popular' : 'Standard'}`);
  });

  return { totalRoutes: routes.length, popularCount: popular.length, testRoutes };
}

/**
 * Test canonical slug generation
 */
export function testCanonicalSlugs() {
  console.log('\n🧪 Testing Canonical Slug Generation...');

  const testCases = [
    { input: ['chelsea', 'arsenal'], expected: 'arsenal-vs-chelsea' },
    { input: ['tottenham-hotspur', 'arsenal'], expected: 'arsenal-vs-tottenham-hotspur' },
    { input: ['manchester-united', 'liverpool'], expected: 'liverpool-vs-manchester-united' },
    { input: ['west-ham-united', 'chelsea'], expected: 'chelsea-vs-west-ham-united' }
  ];

  testCases.forEach(({ input, expected }) => {
    const result = generateCanonicalH2HSlug(input[0], input[1]);
    const success = result === expected;
    console.log(`${success ? '✅' : '❌'} ${input.join(' vs ')} → ${result} ${success ? '' : `(expected: ${expected})`}`);
  });

  return testCases.map(({ input, expected }) => ({
    input,
    result: generateCanonicalH2HSlug(input[0], input[1]),
    expected,
    success: generateCanonicalH2HSlug(input[0], input[1]) === expected
  }));
}

/**
 * Simulate legacy URL redirect testing
 */
export function testLegacyRedirects() {
  console.log('\n🧪 Testing Legacy URL Redirect Logic...');

  const extractTeamsFromUrl = (url: string) => {
    const slug = url.split('/').pop() || '';
    const parts = slug.split('-vs-');
    if (parts.length < 2) return null;

    const team1Raw = parts[0].replace(/^\d+-/, '');
    const team2Raw = parts[1]
      .replace(/-premier-league.*$/, '')
      .replace(/-champions-league.*$/, '')
      .replace(/-\d{4}-\d{2}-\d{2}.*$/, '')
      .replace(/-\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)-\d{4}.*$/i, '');

    return { team1: team1Raw, team2: team2Raw };
  };

  EXPECTED_REDIRECTS.forEach(({ from, to }) => {
    const extracted = extractTeamsFromUrl(from);
    if (extracted) {
      const canonical = generateCanonicalH2HSlug(extracted.team1, extracted.team2);
      const generatedTo = `/h2h/${canonical}`;
      const success = generatedTo === to;
      console.log(`${success ? '✅' : '❌'} ${from} → ${generatedTo} ${success ? '' : `(expected: ${to})`}`);
    } else {
      console.log(`❌ Failed to extract teams from: ${from}`);
    }
  });
}

/**
 * Run all H2H tests
 */
export function runAllH2HTests() {
  console.log('🚀 Running H2H Architecture Tests\n');

  const routeResults = testH2HRoutes();
  const slugResults = testCanonicalSlugs();
  testLegacyRedirects();

  console.log('\n📊 Test Summary:');
  console.log(`- Total H2H routes: ${routeResults.totalRoutes}`);
  console.log(`- Popular matchups: ${routeResults.popularCount}`);
  console.log(`- Canonical slug tests: ${slugResults.filter(r => r.success).length}/${slugResults.length} passed`);

  // Log comprehensive stats
  console.log('\n📈 H2H Generation Statistics:');
  logH2HStats();

  return {
    routes: routeResults,
    slugs: slugResults,
    timestamp: new Date().toISOString()
  };
}

/**
 * Development helper: validate specific H2H URL
 */
export function validateH2HUrl(url: string): { valid: boolean; canonical?: string; reason?: string } {
  try {
    const slug = url.replace('/h2h/', '');
    const parts = slug.split('-vs-');

    if (parts.length !== 2) {
      return { valid: false, reason: 'Invalid format - should be team1-vs-team2' };
    }

    const [team1, team2] = parts;
    const canonical = generateCanonicalH2HSlug(team1, team2);

    if (canonical === slug) {
      return { valid: true, canonical };
    } else {
      return { valid: false, canonical: `/h2h/${canonical}`, reason: 'Not in canonical order' };
    }
  } catch (error) {
    return { valid: false, reason: `Error: ${error}` };
  }
}