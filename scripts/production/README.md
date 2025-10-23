# Production Scripts

⚠️ **CRITICAL - DO NOT DELETE OR MODIFY WITHOUT TESTING** ⚠️

These scripts are used by GitHub Actions workflows and run automatically in production.

## Active Production Scripts

### sync-sportmonks-fixtures.mjs
**Used in:** `.github/workflows/sync-fixtures.yml` and `.github/workflows/sync-sportmonks.yml`
**Runs:** Scheduled (cron) and manual dispatch
**Purpose:** Syncs fixtures, scores, and TV stations from SportMonks API to Supabase database

**Usage:**
```bash
# Sync today to +30 days (default)
node scripts/production/sync-sportmonks-fixtures.mjs

# Sync specific date range
node scripts/production/sync-sportmonks-fixtures.mjs --date-from=2025-10-15 --date-to=2025-11-15
```

**Environment variables required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SPORTMONKS_TOKEN`

---

### sync-upcoming-broadcasters.mjs
**Used in:** `.github/workflows/sync-fixtures.yml`
**Runs:** After fixture sync completes
**Purpose:** Updates broadcaster data for upcoming fixtures and currently playing matches

**Usage:**
```bash
# Sync all active competitions
node scripts/production/sync-upcoming-broadcasters.mjs

# Sync specific competition
node scripts/production/sync-upcoming-broadcasters.mjs --competition-id=2
```

**Environment variables required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SPORTMONKS_TOKEN`

---

## Testing Changes

Before modifying these scripts:

1. Test locally with `.env` file:
```bash
cp .env.example .env
# Add your credentials
node scripts/production/[script-name].mjs
```

2. Check GitHub Actions after pushing:
```bash
git push
# Monitor: https://github.com/[your-repo]/actions
```

3. Verify data in Supabase:
- Check `fixtures` table for new data
- Check `broadcasts` table for broadcaster updates
- Use scripts in `scripts/diagnostics/` to verify

---

## Rollback Procedure

If a production script breaks:

1. Revert the commit:
```bash
git revert HEAD
git push
```

2. Check GitHub Actions to confirm it's using the old version

3. Fix the script locally and test before pushing again

---

## Related Documentation

- Main sync pipeline: `docs/SPORTMONKS_SYNC_PIPELINE.md`
- Architecture: `docs/ARCHITECTURE.md`
- Deployment: `docs/migrations/READY-TO-DEPLOY.md`
