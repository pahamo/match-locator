# Diagnostic Scripts

One-off scripts for checking data, debugging issues, and verifying API responses. These are **not** used in production - they're development tools.

## Purpose

These scripts help with:
- 🔍 Investigating data issues (check-*.mjs)
- 🧪 Testing API responses (test-*.mjs)
- ✅ Verifying database state
- 🐛 Debugging broadcaster/fixture sync problems

## Usage Pattern

Most scripts follow this pattern:
```bash
node scripts/diagnostics/check-[something].mjs
```

They typically:
1. Connect to Supabase
2. Query specific data
3. Print results to console
4. Exit (no modifications)

## Common Scripts

### Broadcaster Verification
- `check-arsenal-broadcaster.mjs` - Check Arsenal fixture broadcasters
- `check-ucl-broadcasters-pattern.mjs` - Verify UCL broadcaster patterns
- `check-broadcasts-table.mjs` - Inspect broadcasts table schema
- `test-broadcaster-filtering.mjs` - Test broadcaster filtering logic

### Fixture Checks
- `check-fixture-6187.mjs` - Check specific fixture details
- `check-tomorrow-ucl-scores.mjs` - Verify score data for upcoming UCL fixtures
- `check-all-ucl-scores.mjs` - Check all UCL fixture scores
- `check-current-fixtures.mjs` - View current fixtures in database

### API Testing
- `test-connection.js` - Test Supabase connection
- `check-sportmonks-fixture-6057.mjs` - Test SportMonks API response
- `check-arsenal-atletico-api.mjs` - Check specific match API data

## When to Use

### During Development
Run these scripts to:
- Verify data after running sync scripts
- Check if a specific fixture has correct data
- Debug why a broadcaster isn't showing up

### After Sync Issues
If production sync fails:
1. Check GitHub Actions logs
2. Run relevant diagnostic script locally
3. Investigate the specific issue
4. Fix the production script
5. Re-run sync

### Creating New Diagnostics
When you create a new diagnostic script:
1. Prefix with `check-` or `test-`
2. Make it read-only (no database modifications)
3. Add helpful console output
4. Save to this folder

## Example Usage

```bash
# Check what broadcasters Arsenal has
node scripts/diagnostics/check-arsenal-broadcaster.mjs

# Verify tomorrow's UCL fixtures don't have 0-0 scores
node scripts/diagnostics/check-tomorrow-ucl-scores.mjs

# Test broadcaster filtering logic
node scripts/diagnostics/test-broadcaster-filtering.mjs
```

## Notes

- ✅ Safe to run anytime (read-only)
- ✅ Can be deleted if obsolete
- ✅ Not used in GitHub Actions
- ⚠️ May reference specific fixture IDs that become outdated
- ⚠️ Some may fail if data has changed since they were written

## Archiving Old Scripts

If a diagnostic script is no longer useful (e.g., it checks a specific fixture from weeks ago):
```bash
mv scripts/diagnostics/check-old-thing.mjs scripts/archive-2025-10-08/
```

Scripts older than 2 weeks that check specific issues can usually be archived.
