/**
 * URL Generation Health Check
 *
 * Verifies that H2H URL generation is working correctly
 * Monitors the percentage of direct SEO URLs vs fallback fixture IDs
 *
 * Run with: node scripts/health/check-url-generation.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Slug validation (same as urlBuilder.ts)
 */
function isValidSlug(slug) {
  if (typeof slug !== 'string') return false;
  if (slug.length < 2 || slug.length > 100) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * Build H2H URL (same logic as urlBuilder.ts)
 */
function buildH2HUrl(fixture) {
  const homeSlug = fixture.home_slug;
  const awaySlug = fixture.away_slug;

  // Direct SEO URL (best)
  if (isValidSlug(homeSlug) && isValidSlug(awaySlug)) {
    const [first, second] = [homeSlug, awaySlug].sort();
    return {
      url: `/h2h/${first}-vs-${second}`,
      strategy: 'direct-seo'
    };
  }

  // Fixture ID fallback (robust)
  if (fixture.id) {
    return {
      url: `/h2h/${fixture.id}`,
      strategy: 'fixture-id',
      warning: `Slugs invalid for fixture ${fixture.id}`
    };
  }

  // Failed
  return {
    url: '#',
    strategy: 'failed',
    warning: 'No fixture ID'
  };
}

/**
 * Calculate health statistics
 */
function getUrlStrategyStats(results) {
  const stats = {
    directSeo: results.filter(r => r.strategy === 'direct-seo').length,
    fixtureId: results.filter(r => r.strategy === 'fixture-id').length,
    failed: results.filter(r => r.strategy === 'failed').length,
    total: results.length
  };

  // Health score: 100 = all direct SEO, 50 = all fixture ID, 0 = all failed
  const healthScore = stats.total > 0
    ? Math.round((stats.directSeo * 100 + stats.fixtureId * 50) / stats.total)
    : 0;

  return { ...stats, healthScore };
}

/**
 * Main health check
 */
async function runHealthCheck() {
  console.log('🔍 Running URL Generation Health Check...\n');

  try {
    // Fetch fixtures from database
    console.log('📡 Fetching fixtures from database...');
    const { data: fixtures, error } = await supabase
      .from('fixtures_with_teams')
      .select('id, home_slug, away_slug')
      .limit(100);

    if (error) {
      console.error('❌ Database query failed:', error.message);
      process.exit(1);
    }

    if (!fixtures || fixtures.length === 0) {
      console.error('❌ No fixtures found in database');
      console.error('   Check that fixtures_with_teams view exists and has data');
      process.exit(1);
    }

    console.log(`✅ Fetched ${fixtures.length} fixtures\n`);

    // Test URL generation
    console.log('🧪 Testing URL generation...');
    const results = fixtures.map(f => buildH2HUrl(f));
    const stats = getUrlStrategyStats(results);

    // Report results
    console.log('\n📊 URL Generation Statistics:');
    console.log('━'.repeat(60));
    console.log(`  Total fixtures tested:     ${stats.total}`);
    console.log(`  ✅ Direct SEO URLs:        ${stats.directSeo} (${Math.round(stats.directSeo/stats.total*100)}%)`);
    console.log(`  ⚠️  Fixture ID fallback:   ${stats.fixtureId} (${Math.round(stats.fixtureId/stats.total*100)}%)`);
    console.log(`  ❌ Failed:                 ${stats.failed} (${Math.round(stats.failed/stats.total*100)}%)`);
    console.log('━'.repeat(60));
    console.log(`  🎯 Health Score:           ${stats.healthScore}/100\n`);

    // Health assessment
    if (stats.healthScore >= 95) {
      console.log('✅ EXCELLENT: System is healthy!');
    } else if (stats.healthScore >= 80) {
      console.log('⚠️  GOOD: System is working, but some fixtures use fallback.');
    } else if (stats.healthScore >= 50) {
      console.log('⚠️  WARNING: Many fixtures using fallback. Check slug data quality.');
    } else {
      console.log('❌ CRITICAL: System health is poor. Immediate action required.');
    }

    // Alert thresholds
    if (stats.failed > 0) {
      console.error('\n❌ CRITICAL: Some fixtures have no valid URL!');
      console.error('   Check that all fixtures have valid IDs.');

      // Show failed fixtures
      const failedFixtures = results
        .map((r, i) => ({ result: r, fixture: fixtures[i] }))
        .filter(({ result }) => result.strategy === 'failed')
        .slice(0, 5);

      console.error('\n   Failed fixtures (first 5):');
      failedFixtures.forEach(({ fixture }) => {
        console.error(`     - Fixture ${fixture.id || 'NO_ID'}`);
      });

      process.exit(1);
    }

    if (stats.directSeo / stats.total < 0.90) {
      console.warn('\n⚠️  NOTICE: Less than 90% using direct SEO URLs.');
      console.warn('   This is acceptable but not optimal for SEO.');
      console.warn('   Consider checking if slug fields are populated in database.\n');

      // Show sample fallback fixtures
      const fallbackFixtures = results
        .map((r, i) => ({ result: r, fixture: fixtures[i] }))
        .filter(({ result }) => result.strategy === 'fixture-id')
        .slice(0, 5);

      if (fallbackFixtures.length > 0) {
        console.warn('   Sample fixtures using fallback (first 5):');
        fallbackFixtures.forEach(({ fixture }) => {
          console.warn(`     - Fixture ${fixture.id}: home_slug="${fixture.home_slug}", away_slug="${fixture.away_slug}"`);
        });
        console.log('');
      }
    }

    // Success - show examples
    console.log('\n📝 Sample URLs:');
    console.log('━'.repeat(60));
    results.slice(0, 10).forEach((result, i) => {
      const indicator = result.strategy === 'direct-seo' ? '✅' :
                       result.strategy === 'fixture-id' ? '⚠️ ' : '❌';
      console.log(`  ${i + 1}. ${indicator} ${result.url.padEnd(45)} [${result.strategy}]`);
    });
    console.log('━'.repeat(60));

    console.log('\n✅ Health check completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Health check failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the health check
runHealthCheck();
