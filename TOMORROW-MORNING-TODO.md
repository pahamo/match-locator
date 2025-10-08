# Tomorrow Morning - Quick Start Guide

**Status:** ✅ Root cause fixed, data synced. Just need to update database view.

---

## 1. Update Database View (5 minutes)

Open **Supabase SQL Editor** and run:

```sql
DROP VIEW IF EXISTS fixtures_with_teams CASCADE;

CREATE VIEW fixtures_with_teams AS
SELECT
  f.id,
  f.competition_id,
  f.home_team_id,
  f.away_team_id,
  f.utc_kickoff,
  f.matchday,
  f.season,
  f.venue,
  f.status,
  f.home_score,
  f.away_score,
  f.sportmonks_fixture_id,
  f.round,
  f.stage,
  ht.id as home_team_db_id,
  ht.name as home_team,
  ht.slug as home_team_slug,
  ht.crest_url as home_crest,
  at.id as away_team_db_id,
  at.name as away_team,
  at.slug as away_team_slug,
  at.crest_url as away_crest,
  (
    SELECT b.channel_name
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('EN', 'GB', 'GBR'))
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster,
  (
    SELECT b.sportmonks_tv_station_id
    FROM broadcasts b
    WHERE b.fixture_id = f.id
      AND (b.country_code IN ('EN', 'GB', 'GBR'))
    ORDER BY b.channel_name ASC
    LIMIT 1
  ) AS broadcaster_id
FROM fixtures f
LEFT JOIN teams ht ON f.home_team_id = ht.id
LEFT JOIN teams at ON f.away_team_id = at.id;
```

---

## 2. Verify It Worked (2 minutes)

Run this SQL:

```sql
SELECT id, home_team, away_team, broadcaster, broadcaster_id
FROM fixtures_with_teams
WHERE id = 6057;
```

**Expected:**
- broadcaster: "Amazon Prime Video"
- broadcaster_id: 999

---

## 3. Check Admin Page (2 minutes)

Visit: `http://localhost:5173/admin/matches`

Filter: Matchday 4, Premier League

**Look at fixture 6057:**
- "Broadcaster (View Selection)": Amazon Prime Video
- "All Channels (SportMonks API)": 5 England channels listed

---

## 4. What We Fixed Yesterday

✅ **Root Cause:** Filtered by country_id (462=England) instead of channel name
✅ **UK vs Ireland:** Separated them (different broadcasters)
✅ **FK Constraint:** Set country_id to null to avoid database constraint
✅ **Provider Mapping:** Removed custom grouping, using raw API data

**Current Data for Fixture 6057:**
- Amazon Prime Video (API ID: 999)
- Discover+ App (API ID: 997)
- Discovery+ (API ID: 729)
- TNT Sports 1 (API ID: 860)
- TNT Sports Ultimate (API ID: 998)

---

## 5. Questions to Discuss

1. **Amazon Prime:** You said "Amazon have no games in the premier league this season"
   - Is the API wrong?
   - Should we manually exclude Amazon?

2. **Selection Strategy:** Currently alphabetical (Amazon first)
   - Should we prioritize TNT Sports or Discovery+?
   - Or keep alphabetical?

3. **Discovery+ vs TNT:** Are they the same platform?
   - Discovery owns TNT Sports
   - Should we treat them as one?

---

## 6. Next Steps (Optional)

If everything looks good:

### Full Season Re-sync (30-60 minutes):

```bash
# Clean old bad data
# In Supabase SQL Editor:
DELETE FROM broadcasts WHERE country_code IN ('GBR', 'GB') OR country_code IS NULL;

# Re-sync full season
node scripts/sync-sportmonks-fixtures.mjs --date-from=2025-08-01 --date-to=2026-05-31 --verbose
```

---

## Files to Reference

- `BROADCASTER-FIX-STATUS.md` - Full detailed status
- `scripts/remove-provider-mapping.sql` - The SQL to run
- `scripts/check-fixture-6057-broadcasts.mjs` - Diagnostic script

---

**Total Time Needed: ~10 minutes to verify everything works** ✅
