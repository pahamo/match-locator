# Admin Interface Features

## Overview

The enhanced admin interface provides comprehensive management of competitions, broadcasters, and fixture assignments for the Match Locator platform.

## 🚨 CRITICAL: Data Visibility Guidelines

### Public Website Restrictions
**NEVER display these statistics on public pages:**
- Total fixture counts (`{stats.totalFixtures}`)
- Confirmed broadcast counts (`{stats.confirmedBroadcasts}`)
- Blackout game counts (`{stats.blackouts}`)
- Pending broadcast counts (`{stats.pendingBroadcasts}`)
- Any metrics revealing data completeness or editorial progress

### Admin-Only Statistics
**These should ONLY appear in admin interface:**
- Competition dashboard statistics
- Broadcast assignment progress
- Data import/sync status
- Editorial workflow metrics

### Current Implementation Issues
⚠️ **CompetitionPage.tsx** currently displays statistics publicly that should be admin-only:
```typescript
// REMOVE FROM PUBLIC PAGES:
const stats = getCompetitionStats();
// Statistics display in Competition Stats section (lines 164-198)
```

## Features Implemented

### 1. Competition Overview Section

**File**: `src/pages/AdminPage.tsx` (lines 364-430)

```typescript
// Competition visibility controls with database persistence
const handleCompetitionVisibilityChange = async (competitionId: number, isVisible: boolean) => {
  await saveCompetitionVisibility(competitionId, isVisible);
  // Updates local state and shows success message
}
```

**Features**:
- Radio button controls for Visible/Hidden per competition
- Real-time status display with color coding
- Database persistence via `saveCompetitionVisibility()`
- Visual feedback with success/error messages

### 2. Broadcast Editor Modal

**File**: `src/components/BroadcastEditor.tsx`

```typescript
interface BroadcastEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (broadcasters: Array<{ id: number; name: string }>) => void;
}
```

**Features**:
- Add new broadcasters with validation
- Edit existing broadcaster names inline
- Delete broadcasters (with confirmation)
- Modal interface with proper keyboard navigation
- Integrates with existing `SIMPLE_BROADCASTERS` array

### 3. Multi-Competition Support

**File**: `src/services/supabase-simple.ts`

```typescript
// Enhanced fixtures loading with competition filtering
export async function getSimpleFixtures(competitionId: number = 1): Promise<SimpleFixture[]>

// Competition management with visibility controls
export async function getSimpleCompetitions(includeHidden: boolean = false): Promise<SimpleCompetition[]>
```

**Features**:
- Competition dropdown filter in admin interface
- Separate fixture loading per competition
- Admin can view both visible and hidden competitions
- Enhanced stats cards showing totals per competition

### 4. Enhanced Fixture Management

**Features**:
- **Blackout Tracking**: Uses provider ID 999 for database-based blackout status
- **UCL Stage/Round Display**: Shows "Group Stage - Matchday 1" instead of matchweeks
- **Enhanced Stats**: Total, Confirmed, TBD, and Blackout counts
- **Improved Filtering**: Separate blackout filter option

```typescript
// Enhanced fixture type with additional fields
interface SimpleFixture {
  id: number;
  kickoff_utc: string;
  home_team: string;
  away_team: string;
  providerId?: number;
  isBlackout?: boolean;
  competition_id?: number;
  stage?: string; // For UCL
  round?: string; // For UCL
  matchweek?: number; // For Premier League
}
```

## Database Schema Changes

### Required Column Addition

```sql
-- Add production visibility column if it doesn't exist
ALTER TABLE competitions 
ADD COLUMN is_production_visible BOOLEAN DEFAULT true;

-- Set default visibility (Premier League visible, UCL hidden)
UPDATE competitions SET is_production_visible = true WHERE id = 1;  -- Premier League
UPDATE competitions SET is_production_visible = false WHERE id = 2; -- UCL
```

### Blackout Provider Setup

```sql
-- Ensure blackout provider exists
INSERT INTO providers (id, display_name, name, type) 
VALUES (999, '🚫 Blackout (No TV)', 'Blackout', 'blackout') 
ON CONFLICT (id) DO NOTHING;
```

## API Functions

### Competition Visibility

```typescript
// Save competition visibility setting
export async function saveCompetitionVisibility(
  competitionId: number, 
  isVisible: boolean
): Promise<void>

// Load competitions with optional hidden inclusion
export async function getSimpleCompetitions(
  includeHidden: boolean = false
): Promise<SimpleCompetition[]>
```

### Enhanced Broadcaster Management

```typescript
// Updated to support blackout provider (999)
export async function saveBroadcaster(
  fixtureId: number, 
  providerId: number | null
): Promise<void>

// Blackout logic: providerId === 999 sets blackout status
```

## User Interface Flow

### 1. Competition Management
1. Admin visits `/admin`
2. Sees "Competition Overview" section at top
3. Can toggle visibility for each competition
4. Changes persist immediately to database
5. Success/error messages provide feedback

### 2. Broadcaster Management
1. Click "📺 Manage Broadcasters" button
2. Modal opens with current broadcasters listed
3. Can add new broadcaster by typing name and clicking "Add"
4. Can edit existing names by clicking "Edit"
5. Can delete broadcasters (except core ones) with confirmation
6. Changes are local to the session (for demo purposes)

### 3. Fixture Assignment
1. Select competition from dropdown filter
2. View fixtures with enhanced info (stage/round for UCL, matchweek for EPL)
3. Use broadcast status filters (All, Confirmed, TBD, Blackout)
4. Assign broadcasters via dropdown including "🚫 Blackout (No UK TV)"
5. Save individual changes or batch "Save All"

## File Dependencies

### Core Admin Files
- `src/pages/AdminPage.tsx` - Main admin interface
- `src/components/BroadcastEditor.tsx` - Broadcaster management modal
- `src/services/supabase-simple.ts` - API functions for admin features

### Supporting Files
- `src/types.ts` - TypeScript interfaces
- `src/services/supabase.ts` - Enhanced with production visibility filtering
- `netlify.toml` - Deployment configuration with admin route protection

## Deployment Notes

### Build Requirements
- All TypeScript errors resolved
- ESLint warnings cleaned up (unused imports removed)
- Build compiles successfully with `npm run build`

### Environment Variables Required
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### Database Migrations Required
1. Add `is_production_visible` column to `competitions` table
2. Ensure provider ID 999 exists for blackout functionality
3. Verify `fixtures_with_teams` view includes all required columns

## Testing Checklist

### Competition Visibility
- [ ] Toggle Premier League visibility (should affect main site)
- [ ] Toggle UCL visibility (should show/hide UCL fixtures)
- [ ] Verify settings persist after page refresh
- [ ] Check success/error messages appear

### Broadcast Editor
- [ ] Open modal with "📺 Manage Broadcasters" button
- [ ] Add new broadcaster successfully
- [ ] Edit existing broadcaster name
- [ ] Delete custom broadcaster (should confirm first)
- [ ] Core broadcasters cannot be deleted

### Multi-Competition Features
- [ ] Competition dropdown shows all competitions with visibility status
- [ ] Fixture count updates when switching competitions
- [ ] UCL shows stage/round instead of matchweek
- [ ] Blackout filter works correctly
- [ ] Batch "Save All" processes multiple changes

### Database Persistence
- [ ] Competition visibility changes save to database
- [ ] Blackout assignments use provider ID 999
- [ ] Production site respects visibility settings
- [ ] Admin interface loads both visible and hidden competitions

This enhanced admin interface provides comprehensive management capabilities while maintaining the simple, clean design of the original application.