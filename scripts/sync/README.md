# Sync Scripts

Active synchronization scripts for importing data from SportMonks API. These scripts are **not** in production GitHub Actions but are useful for manual syncs and development.

## Scripts

### sync-pl-by-rounds.mjs
**Purpose:** Sync Premier League fixtures round by round
**Usage:** `node scripts/sync/sync-pl-by-rounds.mjs`
**When to use:** When you need to sync specific Premier League matchweeks

### sync-next-rounds.mjs
**Purpose:** Sync upcoming rounds across multiple competitions
**Usage:** `node scripts/sync/sync-next-rounds.mjs`
**When to use:** Quick sync of next week's fixtures for all competitions

### sync-round-9.mjs
**Purpose:** Sync specific round (round 9) - example script
**Usage:** `node scripts/sync/sync-round-9.mjs`
**Note:** Template for syncing specific rounds

### sync-round-by-id.mjs
**Purpose:** Sync a specific round by its SportMonks round ID
**Usage:** `node scripts/sync/sync-round-by-id.mjs --round-id=123456`
**When to use:** When you have a specific round ID from the API

### sync-sportmonks-livescores.mjs
**Purpose:** Sync live scores during matches
**Usage:** `node scripts/sync/sync-sportmonks-livescores.mjs`
**When to use:** Real-time score updates (experimental)

### sync-competition-logos.mjs
**Purpose:** Sync competition logo URLs from API
**Usage:** `node scripts/sync/sync-competition-logos.mjs`
**When to use:** One-time setup or when adding new competitions

### sync-missing-broadcasters.mjs
**Purpose:** Find and sync fixtures with missing broadcaster data
**Usage:** `node scripts/sync/sync-missing-broadcasters.mjs`
**When to use:** After discovering gaps in broadcaster coverage

### sync-mw7-scores.mjs
**Purpose:** Sync scores for specific matchweek (example: MW7)
**Usage:** `node scripts/sync/sync-mw7-scores.mjs`
**Note:** Template for matchweek-specific score syncs

## vs. Production Scripts

**Production scripts** (`scripts/production/`):
- Used in GitHub Actions
- Run automatically on schedule
- Critical infrastructure
- ⚠️ DO NOT MODIFY without testing

**Sync scripts** (this folder):
- Manual or ad-hoc use
- Development and debugging
- Specific use cases
- ✅ Safe to modify and experiment

## Environment Variables Required

All sync scripts require:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SPORTMONKS_TOKEN=your_sportmonks_token
```

## Common Workflow

1. **Check what needs syncing:**
   ```bash
   node scripts/diagnostics/check-current-fixtures.mjs
   ```

2. **Run specific sync:**
   ```bash
   node scripts/sync/sync-next-rounds.mjs
   ```

3. **Verify results:**
   ```bash
   node scripts/diagnostics/check-fixtures.mjs
   ```

## Related Documentation

- Production sync pipeline: `docs/SPORTMONKS_SYNC_PIPELINE.md`
- Architecture: `docs/ARCHITECTURE.md`
- Production scripts: `scripts/production/README.md`
