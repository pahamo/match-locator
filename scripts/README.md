# Team Import Scripts

Import scripts for multi-competition football team data from TheSportsDB API.

## 🏟️ Supported Competitions

- **Premier League** (England) - TheSportsDB ID: 4328
- **Bundesliga** (Germany) - TheSportsDB ID: 4331  
- **La Liga** (Spain) - TheSportsDB ID: 4335
- **Serie A** (Italy) - TheSportsDB ID: 4332
- **Ligue 1** (France) - TheSportsDB ID: 4334

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- Internet connection for API access
- Supabase database with migration completed

### Run Team Import

```bash
cd scripts/
node import-teams.js
```

### Alternative execution

```bash
cd scripts/
npm run import-teams
```

## 📊 Output Files

The script generates two files:

### 1. `teams-import-data.json`
Raw team data in JSON format for review:
```json
{
  "generatedAt": "2025-09-07T...",
  "totalTeams": 98,
  "competitions": ["premier-league", "bundesliga", ...],
  "teams": [...]
}
```

### 2. `teams-import.sql`
Ready-to-execute SQL script:
```sql
-- Insert teams with duplicate handling
INSERT INTO teams (...) VALUES (...) 
ON CONFLICT (slug) DO UPDATE SET ...;

-- Insert team aliases
INSERT INTO team_aliases (...) VALUES (...);
```

## 🔍 Duplicate Handling

The script automatically detects teams that might appear in multiple competitions by:

1. **Normalizing team names** (removing common prefixes like "FC", "AC")
2. **Grouping similar names** (case-insensitive matching)
3. **Logging duplicates** for manual review
4. **Keeping first occurrence** in the final output

Example duplicate detection:
```
Duplicate group: "real madrid"
  - Real Madrid (3: La Liga)
  - Real Madrid CF (6: Champions League) # Would be detected if UEFA included
```

## 📝 Database Schema

Teams are imported with the following fields:

```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  crest_url VARCHAR(500),
  competition_id INTEGER REFERENCES competitions(id),
  country_code VARCHAR(3),
  thesportsdb_id INTEGER UNIQUE,
  external_ref VARCHAR(50),
  venue VARCHAR(200),
  website VARCHAR(500),
  founded_year INTEGER
);
```

## 🛠️ Customization

### Adding New Competitions

Edit `COMPETITION_CONFIG` in `import-teams.js`:

```javascript
const COMPETITION_CONFIG = {
  'new-league': {
    id: 6,
    name: 'New League',
    theSportsDbId: 1234, // Find at TheSportsDB
    country: 'Country',
    countryCode: 'CTY'
  }
};
```

### Rate Limiting

Free TheSportsDB API allows 30 requests per minute:

```javascript
const THESPORTSDB_CONFIG = {
  rateLimit: 30,
  requestDelay: 2000 // 2 seconds between requests
};
```

## 🔧 Troubleshooting

### Common Issues

**1. Network Errors**
- Check internet connection
- Verify TheSportsDB API is accessible
- Try running script again (API may be temporarily down)

**2. No Teams Found**
```
⚠️  No teams found for [Competition]
```
- Verify TheSportsDB ID is correct
- Check if competition exists in TheSportsDB
- Competition might not have team data available

**3. SQL Import Errors**
- Ensure database migration was completed first
- Check `competitions` table exists with correct IDs
- Verify table permissions (RLS policies)

### Debugging

Add debug logging:
```javascript
// In main() function, add:
console.log('Debug: Raw API response:', response);
```

### Manual Verification

After import, verify in Supabase:
```sql
-- Check total teams imported
SELECT competition_id, COUNT(*) as team_count 
FROM teams 
GROUP BY competition_id;

-- Check team aliases
SELECT t.name, ta.alias_name 
FROM teams t 
JOIN team_aliases ta ON t.slug = ta.team_slug 
LIMIT 10;

-- Verify competition assignments
SELECT c.name, COUNT(t.id) as teams
FROM competitions c
LEFT JOIN teams t ON c.id = t.competition_id
GROUP BY c.name
ORDER BY c.display_order;
```

## 📈 Expected Results

Typical team counts per competition:
- **Premier League**: 20 teams
- **Bundesliga**: 18 teams  
- **La Liga**: 20 teams
- **Serie A**: 20 teams
- **Ligue 1**: 18 teams
- **Total**: ~96-100 teams

## 🚀 Next Steps

After successful team import:

1. **Import Fixtures**: Create fixture import script
2. **Import Broadcast Data**: Add broadcaster information  
3. **Update Frontend**: Add competition filtering to UI
4. **Test API Endpoints**: Verify new competition filtering works

## ⚠️ Important Notes

- **Rate Limiting**: Script includes 2-second delays between API calls
- **Duplicate Prevention**: SQL uses `ON CONFLICT` to handle duplicates safely
- **Backup Recommended**: Consider backing up existing teams table first
- **API Dependency**: Requires active internet connection to TheSportsDB
- **Free Tier Limits**: TheSportsDB free tier has request limits

## 📞 Support

If you encounter issues:
1. Check the generated `teams-import-data.json` for data accuracy
2. Review console output for specific error messages  
3. Verify database schema matches expected structure
4. Test with a single competition first by modifying config