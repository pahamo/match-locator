# Sports Monks API Documentation

## Overview

This project uses Sports Monks API v3 as the primary data source. This document outlines:
1. What data Sports Monks provides
2. What data we're currently using
3. What data we're NOT using but should consider
4. Migration notes from previous APIs

---

## API Subscription

**Plan**: European Plan + European Club Tournaments
**Leagues**: 30 total (10 actively synced)
**Rate Limit**: 3000 requests/hour
**Trial Ends**: 2025-10-09
**Subscription Ends**: 2025-11-02

---

## Active Competitions

| Competition | Our ID | SM ID | Status |
|------------|--------|-------|--------|
| Premier League | 1 | 8 | ✅ Active |
| Champions League | 2 | 2 | ✅ Active |
| Bundesliga | 3 | 82 | ✅ Active |
| La Liga | 4 | 564 | ✅ Active |
| Serie A | 5 | 384 | ✅ Active |
| Ligue 1 | 6 | 301 | ✅ Active |
| Primeira Liga | 7 | 462 | ✅ Active |
| Eredivisie | 8 | 72 | ✅ Active |
| Championship | 9 | 9 | ✅ Active |
| Europa League | 11 | 5 | ✅ Active |

---

## API Endpoints Used

### 1. `/fixtures/date/{date}`

**Purpose**: Fetch fixtures for a specific date
**Used in**: `scripts/sync-sportmonks-fixtures.mjs`
**Include parameters**: `participants`

**Why day-by-day instead of `/fixtures/between/`?**
- The `/fixtures/between/` endpoint doesn't return complete data with our subscription type
- Day-by-day queries with `/fixtures/date/` provide full access to all fixtures
- Rate limiting handled with 200ms delays between requests

**Example**:
```bash
GET /fixtures/date/2025-08-16?include=participants&api_token=xxx
```

**Response structure**:
```json
{
  "data": [
    {
      "id": 19427457,
      "sport_id": 1,
      "league_id": 8,
      "season_id": 23818,
      "stage_id": 77457869,
      "group_id": null,
      "aggregate_id": null,
      "round_id": 274145,
      "state_id": 1,
      "venue_id": 214,
      "name": "Arsenal vs Chelsea",
      "starting_at": "2025-08-16T14:00:00+00:00",
      "result_info": null,
      "leg": "1/1",
      "details": null,
      "length": 90,
      "placeholder": false,
      "has_odds": false,
      "starting_at_timestamp": 1723812000,
      "participants": [
        {
          "id": 85,
          "sport_id": 1,
          "country_id": 462,
          "venue_id": 214,
          "gender": "male",
          "name": "Arsenal",
          "short_code": "ARS",
          "image_path": "https://cdn.sportmonks.com/images/soccer/teams/21/85.png",
          "founded": 1886,
          "type": "domestic",
          "placeholder": false,
          "last_played_at": "2025-09-29 14:00:00",
          "meta": {
            "location": "home",
            "winner": null,
            "position": 1
          }
        },
        {
          "id": 81,
          "name": "Chelsea",
          "short_code": "CHE",
          "image_path": "https://cdn.sportmonks.com/images/soccer/teams/17/81.png",
          "meta": {
            "location": "away",
            "winner": null,
            "position": 2
          }
        }
      ]
    }
  ]
}
```

---

### 2. `/leagues/{id}`

**Purpose**: Get competition details including logo
**Used in**: `scripts/sync-competition-logos.mjs`

**Example**:
```bash
GET /leagues/8?api_token=xxx
```

**Response**:
```json
{
  "data": {
    "id": 8,
    "sport_id": 1,
    "country_id": 462,
    "name": "Premier League",
    "active": true,
    "short_code": "UK PL",
    "image_path": "https://cdn.sportmonks.com/images/soccer/leagues/8/8.png",
    "type": "league",
    "sub_type": "domestic",
    "last_played_at": "2025-09-29 19:00:00",
    "category": 1,
    "has_jerseys": false
  }
}
```

---

### 3. `/tvstations` (via fixtures include)

**Purpose**: Get broadcasters for fixtures
**Status**: ⚠️ **NOT YET IMPLEMENTED** (flag exists but needs testing)

**Include parameter**: `tvstations`
**Expected structure**:
```json
{
  "tvstations": [
    {
      "id": 123,
      "name": "Sky Sports",
      "url": "https://skysports.com",
      "image_path": "https://cdn.sportmonks.com/images/tvstations/...",
      "type": "tv"
    }
  ]
}
```

---

## Data We're Using

### Fixtures Table
| Field | Source | Notes |
|-------|--------|-------|
| `sportmonks_fixture_id` | `fixture.id` | Primary key for Sports Monks |
| `utc_kickoff` | `fixture.starting_at` | ISO 8601 datetime |
| `home_team_id` | `participants[0].id` → mapped | Our internal team ID |
| `away_team_id` | `participants[1].id` → mapped | Our internal team ID |
| `competition_id` | Via `api_competition_mapping` | Our internal competition ID |
| `data_source` | Hardcoded `'sportmonks'` | Track data origin |
| `sync_status` | Set to `'synced'` | Sync tracking |
| `last_synced_at` | Current timestamp | Last update time |

### Teams Table
| Field | Source | Notes |
|-------|--------|-------|
| `sportmonks_team_id` | `participant.id` | Sports Monks team ID |
| `name` | `participant.name` | Full team name (format with `formatTeamNameShort()`) |
| `slug` | Generated from name | URL-safe identifier |
| `last_synced_at` | Current timestamp | Last sync time |

### Competitions Table
| Field | Source | Notes |
|-------|--------|-------|
| `name` | Hardcoded | Manually set |
| `slug` | Hardcoded | Manually set |
| `colors_primary` | Hardcoded | From config |
| `colors_secondary` | Hardcoded | From config |

### Competition Config (Frontend)
| Field | Source | Notes |
|-------|--------|-------|
| `logo` | `league.image_path` | ✅ Now using Sports Monks CDN |
| `colors` | Hardcoded | Manually defined |
| `description` | Hardcoded | SEO descriptions |

---

## Data We're NOT Using (But Sports Monks Provides)

### Available but Unused:

1. **Team Logos**: `participant.image_path`
   - Currently using hardcoded team crests or local assets
   - **Should migrate to**: Sports Monks CDN URLs

2. **Team Short Codes**: `participant.short_code`
   - Sports Monks provides official abbreviations (e.g., "ARS", "CHE")
   - Currently generating our own

3. **Match State**: `fixture.state_id` and `state.state`
   - Provides live match status (scheduled, in_play, finished, etc.)
   - Could replace our `getMatchStatus()` utility

4. **Venue Information**: `fixture.venue_id`
   - Stadium details available via `/venues/{id}`
   - Not currently storing venue data

5. **Round/Stage Information**: `fixture.round_id`, `fixture.stage_id`
   - Match week/round number
   - Could enhance fixture display

6. **Scores**: Available via `?include=scores`
   - Live scores, half-time scores, etc.
   - Not syncing yet (feature flag exists)

7. **TV Stations**: Available via `?include=tvstations`
   - Broadcaster information with logos
   - **Partially implemented** but needs testing

---

## Migration Issues & Lessons Learned

### Issue 1: Hard-coded Logos from Wikipedia/Brandfetch
**Problem**: Used external logo sources when Sports Monks provides them
**Root Cause**: Didn't check what fields the API returns
**Fix**: Updated `src/config/competitions.ts` to use `league.image_path`
**Lesson**: Always audit API responses before implementing

### Issue 2: Wrong Competition Mappings
**Problem**: UCL fixtures showing as Serie A, etc.
**Root Cause**: `api_competition_mapping` table had incorrect Sports Monks league IDs
**Fix**: Created `scripts/fix-competition-mappings.mjs` to rebuild mappings
**Lesson**: Validate mappings after initial setup

### Issue 3: `/fixtures/between/` Doesn't Work
**Problem**: Only returned 0-2 fixtures instead of hundreds
**Root Cause**: Subscription type doesn't support bulk date range queries
**Fix**: Changed to day-by-day `/fixtures/date/` iteration
**Lesson**: Test different query methods with subscription limitations

### Issue 4: Assumed Wrong Subscription Limits
**Problem**: Incorrectly concluded they lacked Premier League access
**Root Cause**: Query method issue, not subscription issue
**Fix**: User corrected me - they have 30 leagues including EPL
**Lesson**: Read documentation carefully, don't make assumptions

---

## Best Practices

### 1. Always Use Sports Monks Data When Available
- ✅ DO: Use `league.image_path` for logos
- ✅ DO: Use `participant.image_path` for team crests
- ✅ DO: Use `fixture.starting_at` for times
- ❌ DON'T: Hard-code data that the API provides
- ❌ DON'T: Use Wikipedia, brandfetch, or other external sources

### 2. Query Patterns
- ✅ DO: Use `/fixtures/date/{date}` for fixture queries
- ✅ DO: Filter by `league_id` after fetching
- ✅ DO: Include 200ms delays between requests (rate limiting)
- ❌ DON'T: Use `/fixtures/between/` (doesn't work with subscription)

### 3. Data Mapping
- ✅ DO: Store Sports Monks IDs in `sportmonks_*` columns
- ✅ DO: Use `api_competition_mapping` to link our IDs to theirs
- ✅ DO: Track `data_source` to distinguish from legacy data
- ❌ DON'T: Mix data from multiple sources without tracking origin

### 4. Team Names
- ✅ DO: Store full name from `participant.name`
- ✅ DO: Use `formatTeamNameShort()` for display
- ❌ DON'T: Store shortened names in database

---

## TODO: Cleanup Tasks

### Scripts to Remove (Temporary Diagnostic):
- `scripts/analyze-manual-fixtures.mjs` ❌
- `scripts/check-data-sources.mjs` ❌
- `scripts/debug-competitions.mjs` ❌
- `scripts/check-mappings.mjs` ❌
- `scripts/rebuild-competitions.mjs` ❌
- `scripts/check-competition-logos.mjs` ❌
- `scripts/check-competition-columns.mjs` ❌
- `scripts/check-competition-slugs.mjs` ❌
- `scripts/check-sportmonks-logos.mjs` ❌
- `scripts/audit-sportmonks-data.mjs` ❌
- `scripts/document-sportmonks-api.mjs` ❌

### Scripts to Keep:
- `scripts/sync-sportmonks-fixtures.mjs` ✅ (Core sync)
- `scripts/sync-competition-logos.mjs` ✅ (Reference for available logos)
- `scripts/check-current-fixtures.mjs` ✅ (Useful diagnostic)
- `scripts/fix-competition-mappings.mjs` ✅ (Keep for reference/re-run if needed)

### Legacy Code to Remove:
- `footballdata_id` columns in database ❌
- Old soccersapi integration code ❌
- Any hardcoded fixture/team data from previous APIs ❌

### Features to Implement:
1. Team logo sync from Sports Monks
2. TV stations sync (flag exists, needs testing)
3. Live scores sync (flag exists, not implemented)
4. Match state tracking
5. Venue information

---

## Rate Limiting

**Limit**: 3000 requests/hour
**Current strategy**: 200ms delay between requests
**Max requests per sync**: ~400-600 (depends on date range)
**Sync frequency**: Daily at 2 AM UTC via GitHub Actions

**Rate limit calculation**:
- 200ms per request = 5 requests/second
- 5 req/s × 3600s = 18,000 requests/hour (well under limit)

---

## Environment Variables

```bash
# API Token
SPORTMONKS_TOKEN=xxx

# Feature Flags
REACT_APP_FF_USE_SPORTMONKS=true
REACT_APP_FF_SPORTMONKS_TEST_MODE=false
REACT_APP_FF_SPORTMONKS_ENABLE_SYNC=true
REACT_APP_FF_SPORTMONKS_SYNC_COMPETITIONS=1,2,3,4,5,6,7,8,9,11
REACT_APP_FF_SPORTMONKS_TV_STATIONS=true          # ⚠️ Needs testing
REACT_APP_FF_SPORTMONKS_LIVE_SCORES=true          # ⚠️ Not implemented
```

---

## Support

- **API Docs**: https://docs.sportmonks.com/football
- **Dashboard**: https://www.sportmonks.com/dashboard
- **Support**: support@sportmonks.com

---

## Changelog

### 2025-10-02
- ✅ Fixed competition mappings (all 10 competitions correct)
- ✅ Changed sync method to day-by-day queries
- ✅ Migrated competition logos to Sports Monks CDN
- ✅ Synced 520 fixtures across 10 competitions
- 📝 Created this documentation

### 2025-10-01
- ❌ Initial integration had wrong competition mappings
- ❌ Used Wikipedia/brandfetch for logos
- ❌ Tried `/fixtures/between/` (didn't work)
