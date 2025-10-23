#!/bin/bash

# Sports Monks Migration - Legacy Script Cleanup
# This script archives old diagnostic and test scripts

set -e

echo "=== Legacy Script Cleanup ==="
echo ""

# Create archive directory
ARCHIVE_DIR="scripts/archive-legacy-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "📦 Archiving directory: $ARCHIVE_DIR"
echo ""

# Scripts to DELETE (temporary diagnostics created during migration)
echo "🗑️  Deleting temporary diagnostic scripts..."
rm -f scripts/analyze-manual-fixtures.mjs
rm -f scripts/audit-sportmonks-data.mjs
rm -f scripts/check-competition-columns.mjs
rm -f scripts/check-competition-logos.mjs
rm -f scripts/check-competition-slugs.mjs
rm -f scripts/check-data-sources.mjs
rm -f scripts/check-mappings.mjs
rm -f scripts/check-sportmonks-logos.mjs
rm -f scripts/debug-competitions.mjs
rm -f scripts/document-sportmonks-api.mjs
rm -f scripts/rebuild-competitions.mjs
echo "   ✅ Deleted 11 temporary scripts"
echo ""

# Scripts to ARCHIVE (soccersapi related - no longer used)
echo "📦 Archiving soccersapi scripts..."
mv scripts/explore-soccersapi.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/quick-soccersapi-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/sync-broadcasts-soccersapi.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-soccersapi.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/soccersapi-analysis.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/final-auth-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/key-only-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/debug-auth.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/simple-api-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-broadcasts.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-service-class.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
echo "   ✅ Archived soccersapi scripts"
echo ""

# Scripts to ARCHIVE (footballdata related - no longer used)
echo "📦 Archiving football-data.org scripts..."
mv scripts/backfill_teams_from_fd.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/import-premier-league.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/import-scores-fixed.js "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/import-scores.js "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-score-import.js "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-scores-api.js "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-simple-score.js "$ARCHIVE_DIR/" 2>/dev/null || true
echo "   ✅ Archived football-data scripts"
echo ""

# Scripts to ARCHIVE (old Sports Monks exploration/testing)
echo "📦 Archiving old Sports Monks test scripts..."
mv scripts/check-all-pages.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/comprehensive-fixture-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/comprehensive-retest.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/debug-api-basics.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/deep-api-investigation.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/final-fixture-test.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/find-english-premier-league.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/list-available-leagues.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/quick-retest.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/search-leagues.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/show-exact-api-response.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-alternative-endpoints.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-any-fixtures.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-austrian-bundesliga.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-danish-fixtures.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-premier-league-fixtures.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/test-sportmonks.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
echo "   ✅ Archived test scripts"
echo ""

# Scripts to ARCHIVE (old importers)
echo "📦 Archiving old importers..."
mv scripts/importers "$ARCHIVE_DIR/" 2>/dev/null || true
mv scripts/cleanup-manual-fixtures.mjs "$ARCHIVE_DIR/" 2>/dev/null || true
echo "   ✅ Archived importers"
echo ""

# Archive backup directories
echo "📦 Archiving old backups..."
mv "scripts/Scripts backup" "$ARCHIVE_DIR/" 2>/dev/null || true
mv "scripts backup" "$ARCHIVE_DIR/" 2>/dev/null || true
echo "   ✅ Archived backup directories"
echo ""

echo "=== CLEANUP COMPLETE ==="
echo ""
echo "Kept (active scripts):"
echo "  ✅ sync-sportmonks-fixtures.mjs (main sync)"
echo "  ✅ sync-competition-logos.mjs (logo sync reference)"
echo "  ✅ sync-sportmonks-livescores.mjs (future feature)"
echo "  ✅ check-current-fixtures.mjs (diagnostic)"
echo "  ✅ fix-competition-mappings.mjs (recovery tool)"
echo "  ✅ generate_sitemaps.mjs (build step)"
echo "  ✅ list-all-sportmonks-leagues.mjs (reference)"
echo "  ✅ map-sportmonks-leagues.mjs (setup tool)"
echo "  ✅ get-league-details.mjs (diagnostic)"
echo ""
echo "Archived to: $ARCHIVE_DIR"
echo ""
echo "To restore archived scripts:"
echo "  mv $ARCHIVE_DIR/script-name.mjs scripts/"
echo ""
