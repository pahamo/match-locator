# Team Data Backfill Script

## Overview

The `backfill_teams_from_fd.mjs` script enriches team data in the database by fetching detailed information from the Football-Data.org API. It intelligently matches teams and fills only NULL fields, never overwriting existing data.

## Features

- **Smart Matching**: Uses name normalization and manual mapping for accurate team matching
- **Safe Updates**: Only fills NULL fields, preserves existing data
- **Rate Limiting**: Respects API limits with 150-250ms delays between updates
- **Dry Run Mode**: Preview changes without making database modifications
- **Multiple Competitions**: Supports Premier League, Champions League, Bundesliga, and more
- **Comprehensive Logging**: Detailed output with progress tracking and error handling

## Data Fields Updated

The script updates the following fields when they are NULL:

- `short_name` ← Football-Data.org `shortName`
- `club_colors` ← Football-Data.org `clubColors`
- `website` ← Football-Data.org `website`
- `venue` ← Football-Data.org `venue`
- `home_venue` ← Football-Data.org `venue` (if home_venue is NULL)
- `city` ← Parsed from Football-Data.org `address` (last segment)

## Usage

### Basic Commands

```bash
# Dry run for Premier League (preview only)
npm run teams:backfill:dry

# Live update for Premier League
npm run teams:backfill

# Dry run for Champions League
node scripts/backfill_teams_from_fd.mjs --fd=CL --comp-id=2 --dry-run

# Live update for Bundesliga
node scripts/backfill_teams_from_fd.mjs --fd=BL1 --comp-id=3
```

### CLI Options

- `--fd=<code>`: Football-Data.org competition code (default: PL)
- `--comp-id=<number>`: Database competition ID to filter teams (default: 1)
- `--dry-run`: Preview mode - no database changes

### Supported Competition Codes

| Code | Competition |
|------|-------------|
| PL   | Premier League |
| CL   | Champions League |
| BL1  | Bundesliga |
| PD   | La Liga |
| SA   | Serie A |
| FL1  | Ligue 1 |

## Environment Requirements

Ensure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key_with_write_access
FOOTBALL_DATA_TOKEN=your_football_data_api_token
```

## Team Matching Logic

The script matches database teams to Football-Data.org teams using this priority order:

1. **Manual Mapping**: Predefined mappings for edge cases
2. **Normalized Name Matching**: Removes "FC/AFC/Football Club", normalizes punctuation
3. **Short Name Matching**: If database has short_name, matches against FD shortName

### Manual Mappings

The script includes manual mappings for teams with naming inconsistencies:

```javascript
const MANUAL_MAPPING = {
  'brighton-hove-albion': 'Brighton & Hove Albion FC',
  'wolverhampton-wanderers': 'Wolverhampton Wanderers FC',
  'nottingham-forest': 'Nottingham Forest FC',
  'manchester-city': 'Manchester City FC',
  'manchester-united': 'Manchester United FC',
  'tottenham-hotspur': 'Tottenham Hotspur FC'
};
```

## Dry Run Output

In dry run mode, the script:

- Shows all teams that would be updated with specific changes
- Creates `/tmp/team_backfill_preview.csv` with detailed change preview
- Lists unmatched teams for manual mapping consideration
- Makes no database changes

## Error Handling

- **Environment Validation**: Exits cleanly if required variables are missing
- **API Errors**: Continues processing on individual team failures
- **Rate Limiting**: Automatic delays to respect API quotas
- **Database Errors**: Logs failures but continues with remaining teams

## Example Output

```
🚀 Team Data Backfill Script
============================

📋 Configuration:
   Football-Data Competition: PL
   Database Competition ID: 1
   Mode: DRY RUN

📊 Fetching teams from database (competition_id=1)...
   Found 20 teams in database

🌐 Fetching teams from Football-Data.org (PL)...
   Found 20 teams from Football-Data.org

🔄 Matching teams and preparing updates...
   Teams to update: 15
   Unmatched teams: 2

📋 DRY RUN - Preview of changes:

Teams to be updated:
====================
1. Arsenal (arsenal)
   - short_name: null → "Arsenal"
   - club_colors: null → "#EF0107 / #FFFFFF"
   - website: null → "https://www.arsenal.com"

📄 Preview saved to: /tmp/team_backfill_preview.csv

❓ Unmatched teams (consider adding to manual mapping):
   Some Team Name (some-team-slug)

✅ Dry run complete - no database changes made
```

## Best Practices

1. **Always run dry-run first** to preview changes
2. **Review unmatched teams** and add manual mappings if needed
3. **Monitor rate limits** - script includes built-in delays
4. **Check logs** for any errors or skipped teams
5. **Run incrementally** for large datasets

## Extending the Script

To add support for new competitions:

1. Find the competition code from Football-Data.org documentation
2. Determine your database `competition_id`
3. Add manual mappings for any team naming inconsistencies
4. Run with `--fd=<code> --comp-id=<id> --dry-run` first

## Troubleshooting

**"Missing environment variables"**
- Ensure `.env` file exists in project root
- Verify all required variables are set

**"API error: 403 Forbidden"**
- Check your Football-Data.org API token
- Verify token has access to the requested competition

**"No teams found"**
- Verify the competition code is valid
- Check the competition_id matches your database

**Teams not matching**
- Add entries to MANUAL_MAPPING object
- Check team names in both database and Football-Data.org response