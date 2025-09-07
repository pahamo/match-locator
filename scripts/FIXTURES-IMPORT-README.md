# Fixture Import System

Comprehensive fixture import script for multi-competition football data with support for different season formats.

## 🏆 Supported Competitions

- **Premier League** (England) - 38 rounds, 20 teams
- **Bundesliga** (Germany) - 34 rounds, 18 teams  
- **La Liga** (Spain) - 38 rounds, 20 teams
- **Serie A** (Italy) - 38 rounds, 20 teams
- **Ligue 1** (France) - 34 rounds, 18 teams

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Completed database migration (`database-migration.sql`)
- Teams imported (`teams-manual-import.sql`)
- Team mapping file (`teams-manual-data.json`)

### Run Fixture Import

```bash
cd scripts/
node import-fixtures.js
```

## 📊 Features

### 🌐 Multi-Source Data
- **Primary**: TheSportsDB API integration
- **Fallback**: Sample fixture generation for testing
- **Rate Limiting**: 2-second delays between API calls

### ⚽ League Format Support
- **Round-Robin**: All domestic leagues (double round-robin)
- **Timezone Handling**: Automatic UTC conversion
- **Matchweek Calculation**: Based on season start dates
- **Season Dates**: 2024-25 season configuration

### 🔗 Team Resolution
- **Smart Matching**: Team names resolved to database IDs
- **Competition Validation**: Teams matched within correct league
- **Error Reporting**: Detailed logs for unresolved teams

### 📝 SQL Generation
- **CTE Approach**: Complex team name → ID resolution
- **UPSERT Support**: `ON CONFLICT` handling for re-imports
- **Performance Optimized**: Bulk insert with proper indexing

## 📁 Output Files

### 1. `fixtures-import-data.json`
Complete fixture data for review:
```json
{
  "generatedAt": "2025-09-07T...",
  "totalFixtures": 48,
  "fixturesByCompetition": {
    "Premier League": 10,
    "Bundesliga": 9
  },
  "fixtures": [...]
}
```

### 2. `fixtures-import.sql`
Ready-to-execute SQL script:
```sql
WITH fixture_data AS (
  SELECT * FROM (VALUES
    ('sample_1_1', '2024-08-17T13:00:00.000Z', 1, 'Sample Stadium 1', 'scheduled', 1, 'Arsenal', 'Aston Villa'),
    ...
  ) AS fd(external_ref, utc_kickoff, matchday, venue, status, competition_id, home_team_name, away_team_name)
),
team_resolution AS (
  SELECT 
    fd.external_ref,
    fd.utc_kickoff::timestamp as utc_kickoff,
    ht.id as home_team_id,
    at.id as away_team_id
  FROM fixture_data fd
  JOIN teams ht ON ht.name = fd.home_team_name AND ht.competition_id = fd.competition_id
  JOIN teams at ON at.name = fd.away_team_name AND at.competition_id = fd.competition_id
)
INSERT INTO fixtures (...) SELECT ... FROM team_resolution;
```

## ⚙️ Configuration

### Season Dates (2024-25)
```javascript
const SEASON_DATES = {
  'premier-league': {
    startDate: '2024-08-17',
    endDate: '2025-05-25'
  },
  'bundesliga': {
    startDate: '2024-08-24', 
    endDate: '2025-05-24'
  }
  // ... other leagues
};
```

### Competition Settings
```javascript
const COMPETITION_CONFIG = {
  'premier-league': {
    id: 1,
    name: 'Premier League',
    theSportsDbId: 4328,
    format: 'round-robin',
    totalRounds: 38,
    totalTeams: 20,
    timezone: 'Europe/London'
  }
  // ... other leagues
};
```

### API Configuration
```javascript
const THESPORTSDB_CONFIG = {
  baseUrl: 'https://www.thesportsdb.com/api/v1/json/123',
  rateLimit: 30, // requests per minute (free tier)
  requestDelay: 2000, // milliseconds between requests
  endpoints: {
    fixtures: '/eventsseason.php?id=',
    nextFixtures: '/eventsnextleague.php?id=',
    lastResults: '/eventspastleague.php?id='
  }
};
```

## 🔧 Advanced Usage

### Custom Season
```javascript
// Modify COMPETITION_CONFIG for different season
'premier-league': {
  // ...
  season: '2025-2026', // Change season
  theSportsDbId: 4328   // Verify API ID for new season
}
```

### Add New Competition
```javascript
'new-league': {
  id: 6,
  name: 'New League',
  theSportsDbId: 1234,
  country: 'Country',
  countryCode: 'CTY',
  season: '2024-2025',
  format: 'round-robin',
  totalRounds: 30,
  totalTeams: 16,
  timezone: 'Europe/City'
}
```

### Sample Fixture Generation
If API fails, script generates sample fixtures:
- **10 fixtures per competition** (or teams/2, whichever is smaller)
- **Weekly schedule** starting from season start date  
- **3pm kickoffs** (15:00 local time)
- **Sequential matchdays** for testing

## 🐛 Troubleshooting

### Common Issues

**1. No Team Mapping Found**
```
❌ No team mapping found. Run team import first
```
**Solution**: Run `node import-teams-manual.js` first

**2. Date Conversion Errors**
```
⚠️ Date conversion error: Invalid time value - Input: 2024-08-17 14:00:00
```
**Cause**: TheSportsDB API date format issues  
**Result**: Falls back to sample fixture generation

**3. Team Resolution Failures**
```
⚠️ Could not resolve teams: Real Madrid vs Barcelona (La Liga)
```
**Solution**: Check team names match exactly in teams table

**4. No Fixtures from API**
```
⚠️ No fixtures found for Premier League
```
**Causes**: 
- Wrong TheSportsDB league ID
- Season not available in API
- API temporarily down

### Debug Mode

Add debug logging:
```javascript
// In fetchFixturesForCompetition function
console.log('API Response:', JSON.stringify(response, null, 2));
```

## 📈 Expected Results

### Typical Fixture Counts per Competition:
- **Premier League**: ~380 fixtures (38 rounds × 10 games per round)
- **Bundesliga**: ~306 fixtures (34 rounds × 9 games per round)  
- **La Liga**: ~380 fixtures (38 rounds × 10 games per round)
- **Serie A**: ~380 fixtures (38 rounds × 10 games per round)
- **Ligue 1**: ~306 fixtures (34 rounds × 9 games per round)

**Total Expected**: ~1,750+ fixtures across all competitions

### Sample Data Generated:
- **48 fixtures** (10 per major league, 9 per smaller league)
- **Weekly schedule** for testing
- **All competitions represented**

## 🔄 Database Import

### Execute Import
```sql
-- Connect to Supabase
psql -h your-host -U your-user -d your-db

-- Execute fixture import  
\i fixtures-import.sql

-- Verify import
SELECT 
  c.name as competition,
  COUNT(f.id) as fixture_count,
  MIN(f.utc_kickoff) as earliest_fixture,
  MAX(f.utc_kickoff) as latest_fixture
FROM competitions c
LEFT JOIN fixtures f ON c.id = f.competition_id
GROUP BY c.name, c.display_order
ORDER BY c.display_order;
```

### Expected Results
```
     competition     | fixture_count | earliest_fixture    | latest_fixture
--------------------+---------------+--------------------+-------------------
 Premier League     |            10 | 2024-08-17 13:00:00| 2024-10-19 13:00:00
 Bundesliga         |             9 | 2024-08-24 13:00:00| 2024-10-19 13:00:00
 La Liga            |            10 | 2024-08-18 13:00:00| 2024-10-20 13:00:00
 Serie A            |            10 | 2024-08-18 13:00:00| 2024-10-20 13:00:00
 Ligue 1            |             9 | 2024-08-17 13:00:00| 2024-10-12 13:00:00
```

## 🚀 Next Steps

### After Successful Import:

1. **Update Frontend**: Add competition filtering to fixture endpoints
2. **Test API Endpoints**: 
   ```
   GET /fixtures_with_team_names_v?competition_id=eq.1  // Premier League
   GET /fixtures_with_team_names_v?competition_id=eq.2  // Bundesliga
   ```
3. **Import Real Fixtures**: Replace sample data with real API data when available
4. **Add Broadcast Data**: Import broadcaster information per fixture
5. **Schedule Updates**: Set up regular fixture updates for live scores

### Future Enhancements:

- **Live Score Updates**: Real-time fixture status updates
- **Cup Competitions**: Support for knockout tournament formats  
- **Historical Data**: Import past seasons
- **Multiple Seasons**: Support for overlapping seasons
- **Fixture Conflicts**: Detection and resolution of scheduling conflicts

## ⚠️ Important Notes

- **API Dependency**: Requires internet connection to TheSportsDB
- **Rate Limits**: Free tier limited to 30 requests/minute
- **Date Formats**: Current API has date parsing issues (fallback implemented)
- **Team Names**: Must match exactly between teams and fixtures tables
- **Sample Data**: Generated fixtures are for testing only
- **Timezone Accuracy**: All times converted to UTC for consistency

## 📞 Support

Common troubleshooting steps:
1. Verify team import completed successfully
2. Check `teams-manual-data.json` exists and has correct format  
3. Review console output for specific error messages
4. Test with single competition first
5. Verify database schema matches expected structure