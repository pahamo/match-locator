# Sports Monks Integration - Quick Start Guide

**⏱️ 15-Minute Setup | Week 1 Testing**

---

## Step 1: Run Database Migrations (5 minutes)

```bash
# Connect to your Supabase database
psql -h your-project.supabase.co -U postgres -d postgres

# Or use Supabase SQL Editor in dashboard
```

Run these 3 migrations in order:

```sql
-- 1. Add Sports Monks metadata columns
\i database/migrations/add-sportmonks-metadata.sql

-- 2. Create competition mappings
\i database/migrations/sportmonks-league-mapping.sql

-- 3. Create TV station mappings
\i database/migrations/sportmonks-tv-station-mapping.sql
```

Verify:
```sql
-- Should show 3 new tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'api_%';

-- Should show: api_competition_mapping, api_tv_station_mapping, api_sync_log
```

---

## Step 2: Configure Environment Variables (3 minutes)

Add to your `.env` file:

```bash
# Database (you already have these)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Sports Monks API
SPORTMONKS_TOKEN=your_sportmonks_api_token

# Feature Flags - Week 1 (Test Mode)
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_TEST_MODE=true              # ⚠️ TEST MODE - No database writes
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1         # Premier League only
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true
```

---

## Step 3: Install Dependencies (2 minutes)

```bash
# If you don't have these already
npm install dotenv @supabase/supabase-js
```

---

## Step 4: Test Connection (1 minute)

```bash
node scripts/test-sportmonks.mjs
```

**Expected Output**:
```
✅ Connection successful!
✅ Found Premier League (ID: 8)
✅ Found 25 fixtures
✅ Found 59 TV stations
✅ Rate limit: 2996/3000 remaining
```

If you see errors, check:
- `SPORTMONKS_TOKEN` is correct
- Internet connection works
- API key is active

---

## Step 5: Run Test Sync (4 minutes)

```bash
node scripts/sync-sportmonks-fixtures.mjs --dry-run --verbose
```

**What to Check**:

✅ **Fixture Count**: Should see ~380 Premier League fixtures
```
📅 Syncing Premier League (Competition 1, Sports Monks 8)...
   Found 380 fixtures
```

✅ **Team Mapping**: Team names should match correctly
```
   [TEST MODE] Would create fixture: Arsenal vs Liverpool
   [TEST MODE] Would update fixture: Chelsea vs Manchester United
```

✅ **TV Stations**: Should see UK broadcasters
```
   [TEST MODE] Would create broadcast: Sky Sports Main Event (Provider 1)
   [TEST MODE] Would create broadcast: TNT Sports 1 (Provider 2)
```

✅ **No Errors**: Check summary at end
```
✅ Sync Complete!
   Fixtures Processed: 380
   Fixtures Created:   350
   Fixtures Updated:   30
   Errors:             0  ⬅️ SHOULD BE ZERO
```

---

## ✅ Success Criteria

If you see:
- ✅ 300+ fixtures found
- ✅ Team names matching correctly (Arsenal, not Arsenal FC)
- ✅ UK TV broadcasters mapped (Sky, TNT, Amazon)
- ✅ Zero errors

**You're ready for Week 2!**

---

## 🚨 Troubleshooting

### Issue: "Missing Supabase credentials"
```bash
# Make sure these are set in .env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...  # Service role key, not anon key
```

### Issue: "Missing Sports Monks API token"
```bash
# Add to .env
SPORTMONKS_TOKEN=your_sportmonks_api_token
```

### Issue: "Sports Monks sync is not enabled"
```bash
# Make sure these are in .env
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
```

### Issue: "No Sports Monks mapping found"
```bash
# Re-run the migration
psql -f database/migrations/sportmonks-league-mapping.sql
```

### Issue: Fewer than 300 fixtures found
```bash
# Try different date range
node scripts/sync-sportmonks-fixtures.mjs \
  --dry-run \
  --date-from=2024-08-01 \
  --date-to=2025-05-31
```

---

## 📋 Next Steps After Testing

### Week 2: Go Live (Premier League)

1. Update `.env`:
   ```bash
   REACT_APP_FF_SPORTMONKS_TEST_MODE=false  # ⚠️ LIVE MODE
   ```

2. Run live sync:
   ```bash
   node scripts/sync-sportmonks-fixtures.mjs --competition-id=1
   ```

3. Check website - TV broadcasts should appear!

### Week 3: Expand to All Competitions

1. Update `.env`:
   ```bash
   REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8
   ```

2. Run full sync:
   ```bash
   node scripts/sync-sportmonks-fixtures.mjs
   ```

### Week 4: Enable All Features

1. Update `.env`:
   ```bash
   REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true
   REACT_APP_FF_SPORTMONKS_LINEUPS=true
   REACT_APP_FF_SPORTMONKS_MATCH_STATS=true
   REACT_APP_FF_SPORTMONKS_H2H_DATA=true
   ```

2. Start live scores:
   ```bash
   node scripts/sync-sportmonks-livescores.mjs
   ```

---

## 📚 Full Documentation

- `SPORTMONKS_INTEGRATION_SUMMARY.md` - Complete overview
- `SPORTMONKS_SYNC_PIPELINE.md` - Detailed sync guide
- `SPORTMONKS_FEATURE_FLAGS.md` - Feature flag system
- `AVAILABLE_COMPETITIONS.md` - League coverage

---

## 🎯 Quick Reference

**Test sync (dry run)**:
```bash
node scripts/sync-sportmonks-fixtures.mjs --dry-run --verbose
```

**Live sync (Premier League)**:
```bash
node scripts/sync-sportmonks-fixtures.mjs --competition-id=1
```

**Live sync (all competitions)**:
```bash
node scripts/sync-sportmonks-fixtures.mjs
```

**Check sync logs**:
```sql
SELECT * FROM recent_sync_activity LIMIT 10;
```

**Emergency rollback**:
```bash
# Set in .env or Netlify
REACT_APP_FF_USE_SPORTMONKS=false
```

---

**Ready to test? Start with Step 1! 🚀**
