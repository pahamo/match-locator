# Archived Diagnostic Scripts - 2025-11-03

This directory contains 33 diagnostic scripts that were archived during the sprint backlog cleanup on November 3, 2025.

## Why These Were Archived

These scripts were one-time fixes or checks for specific issues that have been resolved. They're preserved for historical reference but are no longer needed for active diagnostics.

## Categories of Archived Scripts

### Specific Fixture Debugging (9 scripts)
- `check-fixture-6057.mjs`
- `check-fixture-6057-broadcasts.mjs`
- `check-fixture-6057-final.mjs`
- `check-fixture-6057-full.mjs`
- `check-fixture-6075.mjs`
- `check-fixture-6187.mjs`
- `check-sportmonks-fixture-6057.mjs`
- `check-everton-spurs.mjs`
- `check-arsenal-atletico-api.mjs`

These checked specific fixtures from past matches. The issues they were investigating have been resolved.

### Specific Matchweek Checks (2 scripts)
- `check-mw9-fixtures.mjs`
- `check-mw10-broadcasters.mjs`

These were for debugging specific matchweek issues that are no longer relevant.

### Specific Team Debugging (2 scripts)
- `check-bournemouth-data.mjs`
- `check-arsenal-broadcaster.mjs`

One-time checks for specific team data issues that have been fixed.

### Time-Specific Checks (5 scripts)
- `check-ucl-today.mjs`
- `check-tomorrow-ucl-scores.mjs`
- `check-october-fixtures.mjs`
- `check-saturday-fixtures.mjs`
- `check-current-fixtures.mjs`

These checked fixtures on specific dates or days that have passed.

### One-Time Data Fixes (3 scripts)
- `find-duplicate-teams.mjs`
- `merge-duplicate-teams.mjs`
- `sync-missing-teams-fixtures.mjs`
- `update-missing-team-ids.mjs`

Scripts that performed one-time data migrations or fixes. The work is complete.

### Replaced/Obsolete Checks (12 scripts)
- `check-sync-status.mjs`
- `check-upcoming-pl.mjs`
- `check-upcoming-fixtures.mjs`
- `check-ucl-broadcasters-pattern.mjs`
- `check-ucl-broadcasts-table.mjs`
- `check-ucl-sportmonks.mjs`
- `check-broadcasts-table.mjs`
- `check-broadcasts-schema.mjs`
- `check-fixtures.mjs`
- `test-feature-flags.mjs`
- `test-team-resolver.mjs`

These have been replaced by better tools or are no longer needed due to system improvements.

## If You Need to Use These

If you need to reference one of these scripts:
1. Check the creation date in the file
2. Understand the context of what issue it was solving
3. Adapt it to current needs (don't use as-is)
4. Consider creating a new active diagnostic instead

## Migration to Active Scripts

If you find yourself needing an archived script repeatedly:
1. Generalize it to work for any fixture/team/date
2. Add it to the active diagnostics folder
3. Document it in `scripts/diagnostics/README.md`

---

**Archive Date:** 2025-11-03
**Scripts Count:** 33
**Reason:** Sprint backlog cleanup - removed one-time fix scripts
