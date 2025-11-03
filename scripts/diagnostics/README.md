# Diagnostic Scripts

Active diagnostic and testing scripts for investigating data issues, debugging problems, and verifying API responses. These are **not** used in production - they're development tools.

**Last Updated:** 2025-11-03
**Scripts Archived:** 33 one-time fix scripts moved to `archive-2025-11-03/`

## Purpose

These scripts help with:
- 🔍 Investigating data issues (check-*.mjs)
- 🧪 Testing API responses (test-*.mjs)
- ✅ Verifying database state
- 🐛 Debugging broadcaster/fixture sync problems

## Usage Pattern

Most scripts follow this pattern:
```bash
node scripts/diagnostics/[script-name].mjs
```

They typically:
1. Connect to Supabase
2. Query specific data
3. Print results to console
4. Exit (no modifications - read-only)

---

## Active Scripts Inventory

### 📺 Broadcaster Data Analysis

**`analyze-missing-broadcasts.mjs`** ⭐ PRIMARY TOOL
- Analyzes fixtures missing broadcaster data
- Compares SportMonks API data vs database
- Identifies patterns in missing broadcasts
- Use when: Investigating why fixtures lack broadcaster info

**`compare-broadcaster-dates.mjs`**
- Compares broadcaster data across different date ranges
- Identifies temporal patterns in broadcast coverage
- Use when: Checking if broadcaster data is complete for a time period

**`test-broadcaster-filtering.mjs`**
- Tests broadcaster filtering logic
- Verifies country filters work correctly
- Use when: Debugging why certain broadcasters are being filtered out

**`check-broadcast-countries.mjs`**
- Lists all unique country IDs in broadcasts table
- Helps identify which countries are being saved
- Use when: Verifying country filter coverage

---

### 🏟️ Fixture Data Verification

**`check-fixture-dates.mjs`** ⭐ PRIMARY TOOL
- Checks fixture date ranges and completeness
- Verifies fixtures exist for expected time periods
- Use when: Confirming sync script coverage

**`test-missing-broadcast-fixture.mjs`**
- Tests a specific fixture missing broadcaster data
- Fetches from SportMonks API and compares with database
- Use when: Deep-diving into a single fixture issue

**`test-nov-pl-fixture.mjs`**
- Tests November Premier League fixture broadcaster data
- Current month verification tool
- Use when: Checking recent PL fixtures

**`check-all-ucl-scores.mjs`**
- Verifies Champions League fixture scores
- Checks for missing or incorrect score data
- Use when: UCL data quality checks

---

### 👥 Team Data Verification

**`check-all-pl-teams.mjs`**
- Lists all Premier League teams in database
- Verifies team metadata (crests, slugs, etc.)
- Use when: Confirming PL team data is complete

**`check-multi-competition-teams.mjs`**
- Identifies teams participating in multiple competitions
- Verifies cross-competition team data
- Use when: Debugging multi-competition team issues

**`check-team-mapping.mjs`**
- Verifies team ID mappings between systems
- Checks SportMonks team ID assignments
- Use when: Debugging team resolution issues

**`check-team-metadata.mjs`**
- Checks team metadata completeness (crests, colors, etc.)
- Use when: Verifying team display data

**`check-teams-schema.mjs`**
- Inspects teams table schema and structure
- Use when: Verifying database schema changes

**`verify-all-teams.mjs`**
- Comprehensive team data verification
- Checks all team fields for completeness
- Use when: Full team data audit

**`find-sportmonks-team-ids.mjs`**
- Helps find SportMonks IDs for teams
- Queries SportMonks API by team name
- Use when: Adding new teams to system

**`check-sportmonks-ids.mjs`**
- Verifies SportMonks ID assignments
- Checks for missing or incorrect IDs
- Use when: Debugging SportMonks API integration

**`check-fixture-team-ids.mjs`**
- Verifies team IDs in fixtures table
- Checks for orphaned or incorrect team references
- Use when: Debugging fixture-team relationships

---

### ⚙️ Competition & API Configuration

**`check-api-mapping.mjs`**
- Verifies API competition mapping configuration
- Checks our competition IDs vs SportMonks competition IDs
- Use when: Debugging competition sync issues

**`check-competition-mappings.mjs`**
- Lists all competition mappings
- Verifies active/inactive status
- Use when: Confirming which competitions are syncing

**`check-europa-league.mjs`**
- Verifies Europa League data
- Checks fixtures, teams, broadcasters for UEL
- Use when: Europa League-specific issues

---

## Documentation Files

**`FIX-SUMMARY.md`**
- Summary of past data fixes and resolutions
- Historical record of what was broken and how it was fixed

**`INVESTIGATION-SUMMARY.md`**
- Current investigation notes and findings
- Active debugging documentation

**`ROOT-CAUSE-ANALYSIS.md`**
- Deep-dive root cause analysis of major issues
- Lessons learned from significant bugs

---

## When to Use

### During Development
Run these scripts to:
- Verify data after running sync scripts
- Check if a specific fixture has correct data
- Debug why a broadcaster isn't showing up

### After Sync Issues
If production sync fails:
1. Check GitHub Actions logs for errors
2. Run `analyze-missing-broadcasts.mjs` for broadcaster issues
3. Run `check-fixture-dates.mjs` for date/range issues
4. Run relevant team script for team-specific issues
5. Fix the production script based on findings
6. Re-run sync and verify with diagnostic script

### Creating New Diagnostics
When you create a new diagnostic script:
1. Prefix with `check-` or `test-`
2. Make it read-only (no database modifications)
3. Add helpful console output with context
4. Document its purpose at the top of the file
5. Add it to this README in the appropriate section

---

## Example Usage

```bash
# PRIMARY TOOLS - Use these first

# Investigate missing broadcaster data
node scripts/diagnostics/analyze-missing-broadcasts.mjs

# Check fixture date coverage
node scripts/diagnostics/check-fixture-dates.mjs

# Verify Premier League teams
node scripts/diagnostics/check-all-pl-teams.mjs

# SPECIFIC ISSUE DEBUGGING

# Test a specific fixture
node scripts/diagnostics/test-missing-broadcast-fixture.mjs

# Compare broadcast data by date
node scripts/diagnostics/compare-broadcaster-dates.mjs

# Check team metadata
node scripts/diagnostics/check-team-metadata.mjs
```

---

## Maintenance

### Script Lifecycle

1. **Active** (current folder): Used for ongoing diagnostics
2. **Archived** (`archive-YYYY-MM-DD/`): One-time fixes, obsolete checks
3. **Deleted**: Truly obsolete scripts with no historical value

### When to Archive

Archive a script if:
- ✅ It checks a specific issue that's been fixed
- ✅ It references specific fixture IDs from >1 month ago
- ✅ It's a one-time migration or data fix script
- ✅ It's been replaced by a better tool

Keep a script active if:
- ✅ It's a general-purpose diagnostic tool
- ✅ It's referenced in documentation or runbooks
- ✅ It's useful for recurring issues
- ✅ It validates critical data integrity

### Recent Archive

**`archive-2025-11-03/`** - 33 scripts archived:
- All `check-fixture-XXXX` scripts (specific fixture debugging)
- Specific match checks (Arsenal vs Atletico, Everton vs Spurs, etc.)
- Specific matchweek checks (MW9, MW10)
- One-time data migration/fix scripts
- Obsolete broadcaster check scripts
- Time-specific checks (today, tomorrow, October, etc.)

---

## Notes

- ✅ Safe to run anytime (all scripts are read-only)
- ✅ Can be archived if obsolete (see maintenance section)
- ✅ Not used in GitHub Actions workflows
- ⚠️ Some may reference data that changes (use judgment on errors)
- ⚠️ Always check script date - old scripts may need updates

---

## Getting Help

If you need to:
- **Debug broadcaster data**: Start with `analyze-missing-broadcasts.mjs`
- **Check fixture coverage**: Use `check-fixture-dates.mjs`
- **Verify team data**: Use `check-all-pl-teams.mjs` or `verify-all-teams.mjs`
- **Test API integration**: Use `check-api-mapping.mjs` and `check-competition-mappings.mjs`
- **Deep-dive specific issue**: See investigation docs (`.md` files)
