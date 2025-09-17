# Data Management Guide

> Complete guide for database management, data imports, team management, and data integrity procedures

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Data Import Procedures](#data-import-procedures)
3. [Team Data Management](#team-data-management)
4. [Authentication & Permissions](#authentication--permissions)
5. [Data Integrity & Validation](#data-integrity--validation)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting](#troubleshooting)

---

## Database Overview

### Database Architecture

**Platform:** Supabase (PostgreSQL)
**Location:** Cloud-hosted with automatic backups
**Access:** Row Level Security (RLS) enabled for production safety

### Core Tables

```sql
-- Primary data tables
fixtures              -- Match/game data with kickoff times
teams                -- Team information and metadata
competitions         -- League/tournament definitions
broadcasts          -- TV broadcaster assignments
providers           -- Sky Sports, TNT Sports, etc.

-- Support tables
seasons             -- Season date ranges
matchweeks         -- Premier League gameweek definitions
blackouts          -- Games without UK broadcast coverage
```

### Database Views

**Performance-Optimized Views:**
```sql
fixtures_with_teams       -- Fixtures with full team objects (admin)
simple_fixtures_view      -- Denormalized fixtures for homepage performance
team_fixtures_view        -- Team-specific fixture queries
competition_stats_view    -- Competition statistics (admin only)
```

**Benefits:**
- **Performance**: Pre-joined data reduces query complexity
- **Consistency**: Standardized data access patterns
- **Security**: Views can enforce RLS policies
- **Maintenance**: Changes to underlying tables don't break queries

### Data Relationships

```
competitions (1) → (many) teams
teams (1) → (many) fixtures (as home/away)
fixtures (1) → (many) broadcasts
broadcasts (many) → (1) providers
seasons (1) → (many) fixtures
matchweeks (1) → (many) fixtures
```

---

## Data Import Procedures

### Import Script Architecture

**Primary Script:** `scripts/import-fa-cup.js`
**Features:**
- Competition-agnostic import system
- Handles teams and fixtures from Football-Data.org API
- Built-in error handling and validation
- Dry-run mode for testing
- Rate limiting for API compliance

### Environment Setup

**Required Environment Variables:**
```bash
# Database Access
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Service role (not anon key)

# External API
FOOTBALL_DATA_API_KEY=your_api_token   # Football-Data.org token

# Configuration
COMP_ID_DB=1                          # Internal competition ID
COMP_ID_API=2021                     # External API competition ID
SEASON=2025                          # Current season
```

### Import Commands

#### Premier League Import
```bash
# Full import (teams + fixtures)
node scripts/import-fa-cup.js \
  --type=LEAGUE \
  --comp-id=2021 \
  --internal-id=1 \
  --name="Premier League" \
  --slug=premier-league \
  --short-name=EPL \
  --skip-competition

# Teams only
node scripts/import-fa-cup.js \
  --type=LEAGUE \
  --comp-id=2021 \
  --internal-id=1 \
  --teams-only \
  --skip-competition

# Fixtures only
node scripts/import-fa-cup.js \
  --type=LEAGUE \
  --comp-id=2021 \
  --internal-id=1 \
  --fixtures-only \
  --skip-competition
```

#### Champions League Import
```bash
# Champions League (different mapping for cup format)
node scripts/import-fa-cup.js \
  --type=CUP \
  --comp-id=2001 \
  --internal-id=2 \
  --name="Champions League" \
  --slug=champions-league \
  --short-name=UCL \
  --skip-competition
```

#### Championship Import
```bash
# English Championship
node scripts/import-fa-cup.js \
  --type=LEAGUE \
  --comp-id=2016 \
  --internal-id=7 \
  --name=Championship \
  --slug=championship \
  --short-name=ELC \
  --skip-competition
```

### Import Verification

**Verification Script:** `scripts/verify-competition.js`

```bash
# Verify Premier League data
npm run verify-competition -- --internal-id=1

# Manual verification
node scripts/verify-competition.js --internal-id=2
```

**Verification Checks:**
- Table row counts (teams, fixtures, broadcasts)
- Sample data validation
- Foreign key integrity
- Date range verification
- Competition configuration validation

### Import Best Practices

#### Pre-Import Checklist
- [ ] Environment variables configured correctly
- [ ] API access token valid and has required permissions
- [ ] Database connection tested
- [ ] Sufficient API rate limit remaining
- [ ] Backup recent database state

#### Post-Import Verification
- [ ] Row counts match expected values
- [ ] Sample fixtures display correctly in UI
- [ ] Team names and crests loading properly
- [ ] Dates are in correct timezone (UTC in database)
- [ ] No duplicate fixtures or teams created

#### Data Import Schedule
- **Weekly**: Update fixture broadcaster assignments
- **Monthly**: Import new fixtures for upcoming months
- **Seasonally**: Import new team rosters and competition structure
- **As needed**: Emergency updates for schedule changes

---

## Team Data Management

### Team Data Enhancement

**Enhancement Script:** `scripts/backfill_teams_from_fd.mjs`

**Purpose:** Enriches existing team data with additional information from Football-Data.org API while preserving existing data integrity.

### Enhanced Data Fields

**Fields Updated (only when NULL):**
```typescript
short_name    ← Football-Data.org shortName
club_colors   ← Football-Data.org clubColors
website       ← Football-Data.org website
venue         ← Football-Data.org venue
home_venue    ← Football-Data.org venue (if null)
city          ← Parsed from Football-Data.org address
```

**Data Safety:** Script only fills NULL fields, never overwrites existing data.

### Team Enhancement Commands

#### Basic Usage
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

#### CLI Options
```bash
--fd=<code>        # Football-Data.org competition code (PL, CL, BL1, etc.)
--comp-id=<number> # Database competition ID to filter teams
--dry-run          # Preview mode - no database changes
```

### Team Data Features

#### Smart Team Matching
- **Name Normalization**: Handles variations in team names
- **Manual Mapping**: Explicit mapping for edge cases
- **Duplicate Prevention**: Avoids creating duplicate team records

#### Rate Limiting
- **API Compliance**: 150-250ms delays between requests
- **Respectful Usage**: Stays within Football-Data.org limits
- **Error Handling**: Graceful degradation on API failures

#### Data Validation
- **Field Format Validation**: URLs, colors, venue names
- **Foreign Key Integrity**: Competition assignments
- **Null Handling**: Proper handling of missing data

### Competition Support

**Currently Supported:**
- **Premier League** (PL) - Competition ID 1
- **Champions League** (CL) - Competition ID 2
- **Bundesliga** (BL1) - Competition ID 3
- **La Liga** (PD) - Competition ID 4
- **Serie A** (SA) - Competition ID 5
- **Ligue 1** (FL1) - Competition ID 6

**Adding New Competitions:**
1. Add competition to database with unique ID
2. Configure API mapping in import script
3. Test with dry-run mode
4. Run full import and verification

---

## Authentication & Permissions

### Database Security Model

**Row Level Security (RLS):** Enabled on all sensitive tables
**Access Levels:**
- **Anonymous**: Read-only access to public data
- **Admin**: Full CRUD access through service role
- **Service Role**: Unrestricted access for admin operations

### Authentication Architecture

#### Public Data Access (Anonymous Key)
```typescript
// Client-side queries for public data
const { data } = await supabase
  .from('fixtures_with_teams')
  .select('*')
  .eq('is_visible', true);
// ✅ Works: Public data with anonymous key
```

#### Admin Operations (Service Role)
```typescript
// Server-side operations via Netlify Functions
const response = await fetch('/.netlify/functions/save-broadcaster', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fixtureId, broadcasterId })
});
// ✅ Works: Admin operations through service role
```

### Admin API Endpoints

**Netlify Functions for Admin Operations:**
```bash
/.netlify/functions/save-broadcaster        # Update fixture broadcaster
/.netlify/functions/save-competition-visibility  # Toggle competition visibility
/.netlify/functions/bulk-update-broadcasts  # Batch broadcaster updates
/.netlify/functions/admin-stats            # Generate admin statistics
```

### Permission Troubleshooting

#### Common Permission Errors

**❌ 401 Unauthorized**
```typescript
// WRONG: Direct admin updates with anonymous key
const { error } = await supabase
  .from('broadcasts')
  .update({ broadcaster_id: 1 })
  .eq('fixture_id', fixtureId);
```

**✅ Correct Admin Updates**
```typescript
// RIGHT: Admin updates via Netlify Functions
const response = await fetch('/.netlify/functions/save-broadcaster', {
  method: 'POST',
  body: JSON.stringify({ fixtureId, broadcasterId })
});
```

#### Authentication Debug Steps
1. **Verify Environment Variables**: Check Supabase URL and keys
2. **Test Database Connection**: Verify anonymous key works for reads
3. **Check RLS Policies**: Ensure policies allow intended operations
4. **Validate Service Role**: Confirm service role has necessary permissions
5. **Test API Endpoints**: Verify Netlify Functions deploy correctly

---

## Data Integrity & Validation

### Data Quality Checks

#### Automated Validations
```sql
-- Check for orphaned fixtures (missing teams)
SELECT f.* FROM fixtures f
LEFT JOIN teams h ON f.home_team_id = h.id
LEFT JOIN teams a ON f.away_team_id = a.id
WHERE h.id IS NULL OR a.id IS NULL;

-- Check for future fixtures without kickoff times
SELECT * FROM fixtures
WHERE kickoff_utc IS NULL
AND kickoff_utc > NOW();

-- Verify competition assignments
SELECT t.name, t.competition_id, c.name as comp_name
FROM teams t
LEFT JOIN competitions c ON t.competition_id = c.id
WHERE c.id IS NULL;
```

#### Data Consistency Rules
1. **Fixture Integrity**: All fixtures must have valid home and away teams
2. **Time Consistency**: All kickoff times stored as UTC
3. **Competition Assignment**: Teams must belong to valid competitions
4. **Broadcaster Validation**: Broadcaster assignments must reference valid providers
5. **Season Boundaries**: Fixtures must fall within defined season dates

### Regular Maintenance Tasks

#### Daily Tasks
- [ ] Monitor for new fixtures added automatically
- [ ] Check for broadcaster assignment updates
- [ ] Verify no orphaned records created
- [ ] Monitor database performance metrics

#### Weekly Tasks
- [ ] Run data integrity checks
- [ ] Update broadcaster assignments for upcoming fixtures
- [ ] Verify team information accuracy
- [ ] Check for duplicate fixtures

#### Monthly Tasks
- [ ] Import new fixtures for upcoming months
- [ ] Update team rosters if significant changes
- [ ] Review and optimize database queries
- [ ] Update API rate limit usage

#### Seasonal Tasks
- [ ] Import new season structure
- [ ] Update competition dates and matchweeks
- [ ] Archive previous season data
- [ ] Update team competition assignments

---

## Backup & Recovery

### Automated Backups

**Supabase Automatic Backups:**
- **Daily backups**: Retained for 7 days
- **Weekly backups**: Retained for 4 weeks
- **Monthly backups**: Retained for 3 months
- **Point-in-time recovery**: Available for last 7 days

### Manual Backup Procedures

#### Full Database Backup
```bash
# Using Supabase CLI
supabase db dump --local > backup_$(date +%Y%m%d).sql

# Using pg_dump (if direct access)
pg_dump "postgresql://[connection-string]" > backup.sql
```

#### Table-Specific Backups
```sql
-- Export specific table data
COPY fixtures TO '/tmp/fixtures_backup.csv' CSV HEADER;
COPY teams TO '/tmp/teams_backup.csv' CSV HEADER;
COPY competitions TO '/tmp/competitions_backup.csv' CSV HEADER;
```

### Recovery Procedures

#### Point-in-Time Recovery
1. **Access Supabase Dashboard**
2. **Navigate to Database → Backups**
3. **Select recovery point** (within last 7 days)
4. **Confirm recovery operation**
5. **Verify data integrity** after recovery

#### Selective Data Recovery
```sql
-- Restore specific records from backup
INSERT INTO fixtures SELECT * FROM backup_fixtures
WHERE kickoff_utc BETWEEN '2025-01-01' AND '2025-01-31';

-- Restore team data
INSERT INTO teams SELECT * FROM backup_teams
WHERE competition_id = 1
ON CONFLICT (id) DO NOTHING;
```

### Disaster Recovery Plan

#### Emergency Procedures
1. **Assess Impact**: Determine scope of data loss or corruption
2. **Stop Writes**: Prevent further data corruption
3. **Identify Recovery Point**: Latest known good state
4. **Execute Recovery**: Use appropriate backup/recovery method
5. **Verify Integrity**: Run full data validation checks
6. **Resume Operations**: Gradually restore normal operations

#### Recovery Time Objectives
- **Point-in-time recovery**: 15-30 minutes
- **Full database restore**: 1-2 hours
- **Selective table recovery**: 30-60 minutes
- **Manual data reconstruction**: 2-8 hours (depending on scope)

---

## Troubleshooting

### Common Data Issues

#### Missing Fixtures
**Symptoms:** Homepage or fixtures page shows no matches
**Diagnosis:**
```sql
-- Check fixture count
SELECT COUNT(*) FROM fixtures;

-- Check date range
SELECT MIN(kickoff_utc), MAX(kickoff_utc) FROM fixtures;

-- Check specific competition
SELECT COUNT(*) FROM fixtures WHERE competition_id = 1;
```

**Solutions:**
1. Verify import script completed successfully
2. Check season date ranges in queries
3. Validate competition IDs and visibility settings
4. Re-run import for missing date ranges

#### Incorrect Team Names
**Symptoms:** Wrong team names displaying in UI
**Diagnosis:**
```sql
-- Check for team name duplicates
SELECT name, COUNT(*) FROM teams GROUP BY name HAVING COUNT(*) > 1;

-- Check team-fixture relationships
SELECT f.id, h.name as home, a.name as away
FROM fixtures f
JOIN teams h ON f.home_team_id = h.id
JOIN teams a ON f.away_team_id = a.id
LIMIT 10;
```

**Solutions:**
1. Re-run team import with correct API mapping
2. Update team name mappings in import script
3. Manually correct team names in database
4. Verify team ID assignments are correct

#### Timezone Issues
**Symptoms:** Kickoff times show incorrect hours
**Diagnosis:**
```sql
-- Check sample kickoff times
SELECT id, kickoff_utc,
  kickoff_utc AT TIME ZONE 'UTC' as utc_time,
  kickoff_utc AT TIME ZONE 'Europe/London' as uk_time
FROM fixtures
WHERE kickoff_utc IS NOT NULL
LIMIT 5;
```

**Solutions:**
1. Ensure all times stored as UTC in database
2. Use `formatDynamicDate()` utility for display
3. Check import script timezone handling
4. Verify API data is being parsed correctly

### Performance Issues

#### Slow Query Performance
**Diagnosis:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Solutions:**
1. Add database indexes on frequently queried columns
2. Use database views for complex joins
3. Implement query pagination for large datasets
4. Optimize JOIN operations and WHERE clauses

#### Memory Issues
**Symptoms:** Out of memory errors during imports
**Solutions:**
1. Process imports in smaller batches
2. Add rate limiting to reduce concurrent operations
3. Optimize import script memory usage
4. Consider upgrading database plan if needed

### Import Script Issues

#### API Rate Limiting
**Symptoms:** Import fails with 429 Too Many Requests
**Solutions:**
1. Increase delay between API calls
2. Implement exponential backoff
3. Use smaller batch sizes
4. Verify API key has sufficient quota

#### Data Validation Errors
**Symptoms:** Import completes but data appears incorrect
**Diagnosis:**
1. Run verification script after import
2. Check sample records manually
3. Validate API response format matches expectations
4. Compare record counts before/after import

**Solutions:**
1. Update data validation rules in import script
2. Add more comprehensive error handling
3. Implement rollback mechanism for failed imports
4. Add dry-run mode testing before live imports

---

## Quick Reference

### Essential Commands
```bash
# Data Import
node scripts/import-fa-cup.js --help          # Show all import options
npm run verify-competition -- --internal-id=1 # Verify Premier League

# Team Management
npm run teams:backfill:dry                    # Preview team updates
npm run teams:backfill                        # Update team data

# Database Access
psql "postgresql://[connection-string]"       # Direct database access
supabase db reset --local                     # Reset local database
```

### Key Files & Scripts
```
scripts/
├── import-fa-cup.js              # Main import script
├── verify-competition.js         # Data verification
├── backfill_teams_from_fd.mjs   # Team data enhancement
└── update-schema-fa-cup.sql     # Database schema updates

database/
├── fixtures                      # Match/game data
├── teams                        # Team information
├── competitions                 # League definitions
├── broadcasts                   # TV assignments
└── providers                    # Broadcaster info
```

### Emergency Contacts
- **Database Issues**: Supabase support dashboard
- **API Issues**: Football-Data.org support
- **Import Failures**: Check GitHub issues or create new issue
- **Data Corruption**: Follow disaster recovery procedures

---

**Last Updated:** September 17, 2025
**Related Documentation:** [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md), [ADMIN_GUIDE.md](ADMIN_GUIDE.md)