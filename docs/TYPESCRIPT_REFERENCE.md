# TypeScript Reference Guide

This document provides a comprehensive reference for all TypeScript types and interfaces used in the project to ensure consistency and prevent property name mismatches.

## Core Data Types

### Team Interface
```typescript
interface Team {
  id: number;
  name: string;
  slug: string;
  crest: string | null;
}
```

**Usage Notes:**
- No `competition` property - all teams are treated as Premier League teams
- Use `name` for display, `slug` for routing
- `crest` can be null, handle with fallback

### SimpleFixture Interface (HomePage)
```typescript
interface SimpleFixture {
  id: number;
  kickoff_utc: string;          // ⚠️ Use kickoff_utc (NOT utc_kickoff)
  home_team: string;
  away_team: string;
  home_crest?: string;
  away_crest?: string;
  broadcaster?: string;
  matchweek?: number;
  providerId?: number;
  isBlackout?: boolean;
  competition_id?: number;
  stage?: string;
  round?: string;
}
```

**Key Properties:**
- `kickoff_utc` - ISO string for match kickoff time
- Team names as strings (`home_team`, `away_team`)
- Optional broadcaster info

### Fixture Interface (FixturesPage)
```typescript
interface Fixture {
  id: number;
  sport: string;
  competition: string;
  matchweek: number | null;
  kickoff_utc: string;          // ⚠️ Use kickoff_utc (NOT utc_kickoff)
  venue: string | null;
  home: Team;                   // Team object (not string)
  away: Team;                   // Team object (not string)
  providers_uk: Provider[];
  blackout: BlackoutInfo;
  status: string;
}
```

**Key Differences from SimpleFixture:**
- `home`/`away` are Team objects (not strings)
- Has `providers_uk` array instead of single `broadcaster`
- Has structured `blackout` object

### Provider Interface
```typescript
interface Provider {
  id: string;
  name: string;
  type: string;
  href?: string;
  status: string;
}
```

### BlackoutInfo Interface
```typescript
interface BlackoutInfo {
  is_blackout: boolean;
  reason?: string | null;
}
```

### SimpleCompetition Interface
```typescript
interface SimpleCompetition {
  id: number;
  name: string;
  slug: string;
  short_name?: string;
  is_production_visible?: boolean;
}
```

## Match Status Types (Live Highlighting)

### MatchStatus Interface
```typescript
interface MatchStatus {
  status: 'live' | 'upNext' | 'upcoming' | 'finished';
  timeUntil?: string;
  isToday?: boolean;
}
```

**Status Definitions:**
- `live`: Match kicked off and within ~120 minutes
- `upNext`: Match today and within next 4 hours
- `upcoming`: All other future matches
- `finished`: Match ended (>120 minutes ago)

## Common Property Naming Patterns

### ⚠️ Critical Property Names
| Context | Correct Property | ❌ Wrong Property |
|---------|------------------|-------------------|
| SimpleFixture | `kickoff_utc` | `utc_kickoff` |
| Fixture | `kickoff_utc` | `utc_kickoff` |
| SimpleFixture | `home_team` (string) | `home` |
| Fixture | `home` (Team object) | `home_team` |
| SimpleFixture | `away_team` (string) | `away` |
| Fixture | `away` (Team object) | `away_team` |

### Team Access Patterns
```typescript
// SimpleFixture (HomePage)
const homeTeamName = fixture.home_team;
const awayTeamName = fixture.away_team;
const homeCrest = fixture.home_crest;

// Fixture (FixturesPage) 
const homeTeamName = fixture.home.name;
const awayTeamName = fixture.away.name;
const homeCrest = fixture.home.crest;
```

### Match Status Usage
```typescript
// Always use kickoff_utc for both types
const matchStatus = getMatchStatus(fixture.kickoff_utc);
const statusStyles = getMatchStatusStyles(matchStatus);
```

## API Parameters

### FixturesApiParams Interface
```typescript
interface FixturesApiParams {
  teamSlug?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  competitionId?: number;
}
```

## Component Props Patterns

### Common Filter Types
```typescript
type FilterTeam = '' | string;
type FilterMatchweek = '' | string;
type FilterCompetition = '' | string;
type FilterLocation = '' | 'tv' | 'streaming' | 'blackout' | 'tbd';
```

## Best Practices

### 1. Always Check Type Definitions First
```bash
# Check existing types before creating new properties
grep -r "interface.*Fixture" src/types/
```

### 2. Use Type Guards for Safety
```typescript
function isSimpleFixture(fixture: any): fixture is SimpleFixture {
  return typeof fixture.home_team === 'string';
}

function isFullFixture(fixture: any): fixture is Fixture {
  return typeof fixture.home === 'object';
}
```

### 3. Consistent Date Handling
```typescript
// Always use kickoff_utc for both SimpleFixture and Fixture
const kickoffDate = new Date(fixture.kickoff_utc);
const displayTime = kickoffDate.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/London'
});
```

### 4. Team Name Display
```typescript
// HomePage (SimpleFixture)
const teamName = getDisplayTeamName(fixture.home_team, shouldUseShortNames());

// FixturesPage (Fixture)
const teamName = getDisplayTeamName(fixture.home.name, shouldUseShortNames());
```

## Migration Notes

When adding new features:

1. **Always reference this document** before accessing object properties
2. **Check both SimpleFixture and Fixture types** if working across pages
3. **Use consistent property names** as documented above
4. **Test TypeScript compilation** with `npm run build` before pushing

## Type Import Statements
```typescript
// Main types
import type { Fixture, Team, Provider, BlackoutInfo } from '../types';

// Simple types for homepage
import type { SimpleFixture, SimpleCompetition } from '../services/supabase-simple';

// Match status types
import { getMatchStatus, getMatchStatusStyles, type MatchStatus } from '../utils/matchStatus';
```

This reference should prevent future TypeScript compilation errors and ensure consistent property usage across the codebase.