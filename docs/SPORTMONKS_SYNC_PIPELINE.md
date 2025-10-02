# Sports Monks Sync Pipeline

**Status**: ✅ Ready for Testing
**Last Updated**: 2025-10-02

## Overview

Automated data synchronization pipeline for Sports Monks API integration. Syncs fixtures, TV broadcasts, and live scores to your database with zero downtime.

## Scripts

### 1. Fixtures Sync (`sync-sportmonks-fixtures.mjs`)

Syncs upcoming fixtures and TV broadcast data from Sports Monks.

**Features**:
- ✅ Fixture creation and updates
- ✅ TV station mapping and broadcast creation
- ✅ Team auto-discovery and mapping
- ✅ Competition filtering
- ✅ Test mode (dry run)
- ✅ Comprehensive logging
- ✅ Rate limiting (200ms between requests)

**Usage**:
```bash
# Sync all enabled competitions for next 30 days
node scripts/sync-sportmonks-fixtures.mjs

# Sync specific competition only
node scripts/sync-sportmonks-fixtures.mjs --competition-id=1

# Custom date range
node scripts/sync-sportmonks-fixtures.mjs --date-from=2025-10-01 --date-to=2025-11-01

# Test mode (no database writes)
node scripts/sync-sportmonks-fixtures.mjs --dry-run

# Verbose output
node scripts/sync-sportmonks-fixtures.mjs --verbose
```

**Options**:
- `--competition-id=N` - Sync specific competition only
- `--date-from=YYYY-MM-DD` - Start date (default: today)
- `--date-to=YYYY-MM-DD` - End date (default: +30 days)
- `--dry-run` - Test mode, no database writes
- `--verbose` - Show detailed logs

**Recommended Schedule**:
```bash
# Daily sync at 2am (cron)
0 2 * * * /usr/bin/node /path/to/scripts/sync-sportmonks-fixtures.mjs
```

### 2. Live Scores Sync (`sync-sportmonks-livescores.mjs`)

Real-time sync of live match scores and status updates.

**Features**:
- ✅ Real-time score updates
- ✅ Match status tracking (scheduled, live, finished)
- ✅ Daemon mode (continuous updates)
- ✅ Configurable update interval
- ✅ Graceful shutdown

**Usage**:
```bash
# Run as daemon (updates every 30 seconds)
node scripts/sync-sportmonks-livescores.mjs

# Custom interval (every 60 seconds)
node scripts/sync-sportmonks-livescores.mjs --interval=60

# Run once and exit
node scripts/sync-sportmonks-livescores.mjs --once

# Verbose output
node scripts/sync-sportmonks-livescores.mjs --verbose
```

**Options**:
- `--interval=N` - Update interval in seconds (default: 30)
- `--once` - Run once and exit (no daemon)
- `--verbose` - Show detailed logs

**Recommended Setup**:
```bash
# Run as background daemon on match days
nohup node scripts/sync-sportmonks-livescores.mjs > logs/livescores.log 2>&1 &

# Or use PM2 for process management
pm2 start scripts/sync-sportmonks-livescores.mjs --name sportmonks-livescores
```

## Prerequisites

### 1. Database Migrations

Run these migrations first:

```bash
# 1. Add Sports Monks metadata columns
psql -f database/migrations/add-sportmonks-metadata.sql

# 2. Create competition mapping table
psql -f database/migrations/sportmonks-league-mapping.sql

# 3. Create TV station mapping table
psql -f database/migrations/sportmonks-tv-station-mapping.sql
```

### 2. Environment Variables

Configure in `.env`:

```bash
# Database credentials
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Sports Monks API
SPORTMONKS_TOKEN=your_api_token

# Feature flags (enable sync)
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true

# Competition filtering (optional, empty = all)
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3
```

### 3. Competition Mappings

Ensure `api_competition_mapping` table has your competition mappings:

```sql
SELECT * FROM api_competition_mapping WHERE is_active = true;
```

Should show:
```
our_competition_id | sportmonks_league_id | sportmonks_league_name
-------------------+----------------------+------------------------
1                  | 8                    | Premier League
2                  | 2                    | Champions League
3                  | 24                   | FA Cup
4                  | 27                   | Carabao Cup
...
```

### 4. TV Station Mappings

Ensure `api_tv_station_mapping` table has UK broadcaster mappings:

```sql
SELECT * FROM api_tv_station_mapping WHERE is_uk_broadcaster = true;
```

Should show:
```
sportmonks_tv_station_id | our_provider_id | sportmonks_tv_station_name
--------------------------+-----------------+----------------------------
60                       | 1               | Sky Go
928                      | 2               | TNT Sports 2
999                      | 4               | Amazon Prime Video
...
```

## Testing

### Week 1: Test Mode Validation

**Goal**: Validate sync logic without touching the database

```bash
# 1. Enable test mode
export REACT_APP_FF_SPORTMONKS_TEST_MODE=true
export REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1  # Premier League only

# 2. Run fixtures sync in dry run mode
node scripts/sync-sportmonks-fixtures.mjs --dry-run --verbose

# 3. Review output
# - Check fixture mapping correctness
# - Verify TV station mappings
# - Confirm team name matching
# - Check for errors
```

**Expected Output**:
```
📅 Syncing Premier League (Competition 1, Sports Monks 8)...
   Found 38 fixtures
   [TEST MODE] Would create fixture: Arsenal vs Liverpool
   [TEST MODE] Would create broadcast: Sky Sports Main Event (Provider 1)
   ...
✅ Sync Complete!
   Fixtures Processed: 38
   Fixtures Created:   35
   Fixtures Updated:   3
   Errors:             0
```

### Week 2: Go Live (Premier League)

**Goal**: Enable live sync for Premier League with TV stations

```bash
# 1. Disable test mode
export REACT_APP_FF_SPORTMONKS_TEST_MODE=false

# 2. Run fixtures sync (live mode)
node scripts/sync-sportmonks-fixtures.mjs --competition-id=1

# 3. Verify in database
psql -c "SELECT COUNT(*) FROM fixtures WHERE data_source = 'sportmonks';"
psql -c "SELECT COUNT(*) FROM broadcasts WHERE data_source = 'sportmonks';"

# 4. Check website - TV broadcasts should appear
```

### Week 3: Full Rollout

**Goal**: Enable all 8 competitions

```bash
# 1. Update feature flags
export REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8

# 2. Run full sync
node scripts/sync-sportmonks-fixtures.mjs

# 3. Start live scores daemon
node scripts/sync-sportmonks-livescores.mjs
```

## Monitoring

### Check Sync Logs

```sql
-- Recent sync activity
SELECT * FROM recent_sync_activity LIMIT 10;

-- Failed syncs
SELECT * FROM api_sync_log
WHERE status = 'error'
ORDER BY started_at DESC
LIMIT 10;

-- Sync statistics
SELECT
  sync_type,
  COUNT(*) as total_runs,
  SUM(fixtures_created) as total_created,
  SUM(fixtures_updated) as total_updated,
  SUM(fixtures_errors) as total_errors,
  AVG(duration_seconds) as avg_duration
FROM api_sync_log
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY sync_type;
```

### Check Fixtures Status

```sql
-- Fixtures pending sync
SELECT * FROM fixtures_pending_sync LIMIT 20;

-- Fixtures by data source
SELECT
  data_source,
  COUNT(*) as count,
  MIN(utc_kickoff) as earliest,
  MAX(utc_kickoff) as latest
FROM fixtures
GROUP BY data_source;

-- TV broadcasts by source
SELECT
  b.data_source,
  COUNT(*) as broadcast_count,
  COUNT(DISTINCT b.fixture_id) as fixture_count
FROM broadcasts b
GROUP BY b.data_source;
```

### Rate Limit Monitoring

Sports Monks rate limit: **3000 requests/hour**

```bash
# Check current rate limit status (view API response headers)
curl -I "https://api.sportmonks.com/v3/football/leagues?api_token=YOUR_TOKEN"
```

**Response headers**:
```
X-RateLimit-Limit: 3000
X-RateLimit-Remaining: 2985
```

**Calculation**:
- Fixtures sync: ~1-2 requests per competition
- TV stations: 1 request per fixture (if enabled)
- Live scores: 1 request per sync cycle

**Example**:
- 380 Premier League fixtures/season
- With TV stations: 380 + 1 = 381 requests
- Safe margin: 200ms delay = max 18,000 requests/hour (well under limit)

## Troubleshooting

### Issue: "Sports Monks sync is not enabled"

**Solution**: Enable feature flags

```bash
export REACT_APP_FF_USE_SPORTMONKS=true
export REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
```

### Issue: "No Sports Monks mapping found"

**Solution**: Run league mapping migration

```bash
psql -f database/migrations/sportmonks-league-mapping.sql
```

### Issue: TV broadcasts not appearing

**Solution**:
1. Enable TV stations feature flag:
   ```bash
   export REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
   ```

2. Check TV station mappings exist:
   ```sql
   SELECT * FROM api_tv_station_mapping WHERE is_uk_broadcaster = true;
   ```

3. Re-run fixtures sync with verbose:
   ```bash
   node scripts/sync-sportmonks-fixtures.mjs --verbose
   ```

### Issue: Rate limit exceeded

**Symptoms**: HTTP 429 errors

**Solution**: Increase delay between requests

Edit sync script:
```javascript
// Change from 200ms to 300ms
await new Promise(resolve => setTimeout(resolve, 300));
```

### Issue: Team names not matching

**Solution**: Check team mapping logic in `getOrCreateTeamMapping()` function

```bash
# View team mapping mismatches
psql -c "SELECT name FROM teams WHERE sportmonks_team_id IS NULL;"
```

## Emergency Rollback

**Scenario**: Critical issue, need to disable Sports Monks immediately

**Action**:
```bash
# 1. Disable master switch
export REACT_APP_FF_USE_SPORTMONKS=false

# 2. Stop live scores daemon (if running)
pkill -f sync-sportmonks-livescores

# 3. Redeploy app (Netlify will pick up new env vars)

# 4. Verify fallback to manual data
psql -c "SELECT data_source, COUNT(*) FROM fixtures GROUP BY data_source;"
```

**Result**: Instant fallback to Football-Data.org API and manual entry

## Production Deployment

### Netlify Environment Variables

Set in Netlify Dashboard → Site Settings → Environment Variables:

```
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_TEST_MODE=false
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true
```

### Automated Sync (GitHub Actions)

Create `.github/workflows/sync-sportmonks.yml`:

```yaml
name: Sports Monks Sync

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am UTC
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Sync fixtures
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          SPORTMONKS_TOKEN: ${{ secrets.SPORTMONKS_TOKEN }}
          REACT_APP_FF_USE_SPORTMONKS: 'true'
          REACT_APP_FF_SPORTMONKS_ENABLE_SYNC: 'true'
          REACT_APP_FF_SPORTMONKS_TV_STATIONS: 'true'
        run: node scripts/sync-sportmonks-fixtures.mjs
```

## Next Steps

1. ✅ Scripts created
2. ⏳ Run Week 1 testing (dry run mode)
3. ⏳ Review test output and fix any issues
4. ⏳ Run Week 2 (Premier League live)
5. ⏳ Monitor for 1 week, verify TV broadcast accuracy
6. ⏳ Week 3: Expand to all competitions
7. ⏳ Week 4: Enable all features (live scores, lineups, stats)
8. ⏳ Set up automated sync (GitHub Actions or cron)

---

**Questions?** See:
- `docs/SPORTMONKS_FEATURE_FLAGS.md` - Feature flag system
- `docs/SPORTMONKS_API_FINDINGS.md` - API research
- `docs/AVAILABLE_COMPETITIONS.md` - League coverage
