# Sports Monks API - Integration Findings

**Date:** October 2, 2025
**Status:** ✅ **API VERIFIED & WORKING**
**Subscription:** European Plan - Football - Standard

---

## 🎉 Connection Test Results

### Authentication: ✅ WORKING
- **API Token:** Configured and validated
- **Base URL:** `https://api.sportmonks.com/v3/football`
- **Rate Limit:** 3000 requests/hour
- **Current Usage:** 2996/3000 remaining

### Endpoints Tested

#### 1. Leagues Endpoint ✅
```
GET /leagues
```
- **Found:** 25 leagues in your subscription
- **Premier League ID:** `8`
- **Response includes:** league_id, name, country, seasons

#### 2. Fixtures Endpoint ✅
```
GET /fixtures/date/YYYY-MM-DD
```
- **Test Date:** 2025-10-02
- **Fixtures Found:** 25 matches
- **Sample Data:**
  ```json
  {
    "id": 19568952,
    "sport_id": 1,
    "league_id": 5,
    "season_id": 25582,
    "stage_id": 77478057,
    "round_id": 388957,
    "state_id": 1,
    "venue_id": 5515,
    "name": "Bologna vs SC Freiburg",
    "starting_at": "2025-10-02 16:45:00",
    "starting_at_timestamp": 1759423500,
    "has_odds": true
  }
  ```

#### 3. TV Stations Endpoint ✅ **KEY FEATURE!**
```
GET /tv-stations/fixtures/{fixtureId}
```
- **Test Fixture:** 19568952
- **TV Stations Found:** 59 broadcasters!
- **Sample Broadcasters:**
  - ESPN 3 (channel)
  - Bet365 (streaming)
  - Many UK broadcasters included
- **Response Format:**
  ```json
  {
    "id": 62,
    "name": "ESPN 3",
    "url": "https://www.espn.com",
    "image_path": "https://cdn.sportmonks.com/images/.../62.png",
    "type": "channel",
    "related_id": 37
  }
  ```

#### 4. Livescores Endpoint ✅
```
GET /livescores/inplay
```
- **Live Matches:** 0 (no matches live at test time)
- **Use case:** Real-time score updates during matches

---

## 🗺️ Data Mapping Strategy

### Your Current Database → Sports Monks API

#### Competitions Mapping

| Your DB | Competition Name | Sports Monks League ID | Status |
|---------|-----------------|------------------------|--------|
| 1 | Premier League | 8 | ✅ Confirmed |
| 2 | Champions League | TBD | 🔍 Need to find |
| 3 | FA Cup | TBD | 🔍 Need to find |
| 4 | EFL Cup | TBD | 🔍 Need to find |
| 5 | Europa League | TBD | 🔍 Need to find |
| 6 | Conference League | TBD | 🔍 Need to find |
| ... | Other leagues | TBD | 🔍 Need to find |

**Next Step:** Query all leagues and create full mapping table

#### TV Stations/Providers Mapping

Your providers table currently has:
- ID 1: Sky Sports
- ID 2: TNT Sports
- ID 3: BBC
- ID 4: Amazon Prime
- ID 999: Blackout

**Sports Monks provides 59+ broadcasters per fixture!** We need to:
1. Query all unique TV stations from Sports Monks
2. Filter for UK broadcasters
3. Map to your existing provider IDs
4. Add new providers if needed

#### Teams Mapping

- Your teams table has `id`, `name`, `slug`
- Sports Monks fixtures provide team names in fixture.name
- Need to extract and match teams by name similarity
- Create `api_team_mapping` table for Sports Monks ID ↔ Your ID

---

## 📋 Next Steps - Priority Order

### 1. Complete League Mapping (HIGH PRIORITY)
```bash
# Create script to:
# - Fetch all leagues
# - Find Champions League, FA Cup, etc.
# - Create mapping table in database
```

### 2. Build TV Stations Mapper (HIGH PRIORITY)
```bash
# Create script to:
# - Fetch all unique TV stations from Sports Monks
# - Filter for UK broadcasters (Sky, TNT, BBC, Amazon, etc.)
# - Map to existing provider IDs
# - Store unmapped stations for review
```

### 3. Create Sync Pipeline (CORE FEATURE)
```bash
# Build automated sync:
# 1. Fetch fixtures for next 7 days
# 2. Get TV stations for each fixture
# 3. Map to your database schema
# 4. Update broadcasts table
# 5. Log sync results
```

### 4. Add Feature Flags
```javascript
// Feature flags for gradual rollout:
ENABLE_SPORTMONKS_SYNC: false → true
ENABLE_LIVE_SCORES: false → true
ENABLE_LINEUPS: false → true
```

### 5. Build Admin Interface
- Connection test button
- Manual sync trigger
- View sync logs
- API usage stats
- Provider mapping review

---

## 🔑 Key API Discoveries

### Match Status (state_id)
```
1 = Not Started (NS)
2 = Live/In Progress
3 = Finished (FT)
5 = Cancelled
6 = Postponed
7 = Abandoned
```

### Fixture Data Structure
- **Unique ID:** `fixture.id` (use for mapping)
- **Match Name:** `fixture.name` (e.g., "Bologna vs SC Freiburg")
- **Date/Time:** `fixture.starting_at` (UTC timestamp)
- **League:** `fixture.league_id`
- **Round:** `fixture.round_id`
- **Venue:** `fixture.venue_id`

### TV Stations Data Structure
- **Unique ID:** `tv_station.id`
- **Name:** `tv_station.name` (e.g., "Sky Sports Premier League")
- **Type:** `tv_station.type` (channel, streaming, radio)
- **URL:** `tv_station.url` (broadcaster website)
- **Image:** `tv_station.image_path` (logo URL)

---

## 🚀 Implementation Plan

### Phase 1: Mapping (This Week)
- [x] Test API connection
- [x] Find Premier League ID (8)
- [ ] Find all competition IDs
- [ ] Create league mapping table
- [ ] Map TV stations to providers
- [ ] Test data sync (dry run)

### Phase 2: Sync Pipeline (Next Week)
- [ ] Build fixtures sync script
- [ ] Build TV stations sync script
- [ ] Add feature flags
- [ ] Create admin controls
- [ ] Test with Premier League only

### Phase 3: Rollout (Week 3)
- [ ] Enable for all 9 competitions
- [ ] Monitor API usage (stay under 3000/hour)
- [ ] Verify broadcast accuracy
- [ ] Set up automated daily sync

### Phase 4: New Features (Ongoing)
- [ ] Live scores ticker
- [ ] Lineups display
- [ ] Match statistics
- [ ] H2H enrichment

---

## 📊 Expected Impact

### Time Savings
- **Before:** 2-3 hours/week manual TV listing entry
- **After:** 10 minutes/week monitoring sync
- **Annual Savings:** ~150 hours

### Data Quality
- **Before:** Manual entry, potential errors
- **After:** Automated, consistent, 59+ broadcasters per match

### New Capabilities
- Real-time live scores
- Team lineups
- Match statistics
- Historical H2H data
- Automatic fixture updates

---

## 🔧 Technical Notes

### Rate Limiting
- **Limit:** 3000 requests/hour
- **Current:** Built-in rate limiter with 200ms delay
- **Monitoring:** Track usage in admin panel
- **Safety:** Cache responses for 5 minutes

### Caching Strategy
- Fixtures: 5 minutes
- TV Stations: 5 minutes
- Livescores: 30 seconds (real-time)
- Leagues: 1 hour (rarely changes)

### Error Handling
- API down → Fall back to manual entry
- Rate limit hit → Wait and retry
- Invalid data → Log and skip
- Mapping miss → Alert admin

---

## 📚 Useful API Patterns

### Get Fixtures with TV Stations
```javascript
// Step 1: Get fixtures
const fixtures = await GET('/fixtures/date/2025-10-02');

// Step 2: For each fixture, get TV stations
for (const fixture of fixtures) {
  const tvStations = await GET(`/tv-stations/fixtures/${fixture.id}`);
  // Map and save
}
```

### Get Live Scores
```javascript
// Poll every 30 seconds during live matches
const liveMatches = await GET('/livescores/inplay');
// Update database with latest scores
```

### Get Team Lineups
```javascript
// 1 hour before kickoff
const lineups = await GET(`/lineups/fixtures/${fixtureId}`);
// Display on match page
```

---

## ✅ Success Criteria

- [ ] All 9 competitions mapped to Sports Monks league IDs
- [ ] UK TV broadcasters mapped to provider table
- [ ] Automated sync running daily at 2am
- [ ] TV broadcast data 95%+ accurate
- [ ] API usage stays under 2500/hour (buffer)
- [ ] Zero downtime migration (feature flags)
- [ ] Manual entry still available as backup

---

**Status:** Phase 1 - Mapping in progress
**Next:** Create league mapping script and TV stations mapper
