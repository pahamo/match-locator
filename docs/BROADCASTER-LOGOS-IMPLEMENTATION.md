# Broadcaster Logos Implementation

## Overview

This feature adds broadcaster logo support from the SportMonks API. Instead of just showing text badges like "Sky Sports", we now display the actual broadcaster logos alongside the text.

---

## Database Changes

### 1. Add Columns to `broadcasts` Table

**File:** `docs/migrations/add-broadcaster-logos.sql`

```sql
ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS image_path TEXT;

ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS url TEXT;
```

**Fields:**
- `image_path`: URL to broadcaster logo (e.g., `https://cdn.sportmonks.com/images/core/tvstations/10/42.png`)
- `url`: Broadcaster website URL

### 2. Update `fixtures_with_teams` View (V3)

**File:** `docs/migrations/create-fixtures-with-teams-view-v3.sql`

**New Fields:**
- `broadcaster_image_path`: Logo URL from broadcasts table
- `broadcaster_url`: Website URL from broadcasts table

**Query Logic:** Uses same priority ordering as broadcaster name (TNT Sports > Discovery+ > Others)

---

## Sync Script Changes

**File:** `scripts/production/sync-sportmonks-fixtures.mjs`

**Changes:**
```javascript
const broadcastData = {
  fixture_id: fixtureDbId,
  channel_name: station.tvstation.name,
  broadcaster_type: station.tvstation.type,
  sportmonks_tv_station_id: station.tvstation_id,
  image_path: station.tvstation.image_path || null,  // ⭐ NEW
  url: station.tvstation.url || null,                // ⭐ NEW
  // ...
};
```

**What It Does:** Saves logo URL and website from SportMonks API response

---

## TypeScript Types

**File:** `src/types/index.ts`

**Updated Interfaces:**
```typescript
export interface Fixture {
  broadcaster?: string;
  broadcaster_id?: number;
  broadcaster_image_path?: string;  // ⭐ NEW
  broadcaster_url?: string;         // ⭐ NEW
  // ...
}

export interface SimpleFixture {
  broadcaster?: string;
  providerId?: number;
  broadcaster_image_path?: string;  // ⭐ NEW
  broadcaster_url?: string;         // ⭐ NEW
  // ...
}
```

---

## Service Layer Changes

### `src/services/supabase.ts`

**Updated:**
- `FixtureRow` interface with new fields
- `mapFixtureRow()` to include logo fields
- All SELECT queries to fetch `broadcaster_image_path, broadcaster_url`

### `src/services/supabase-simple.ts`

**Updated:**
- All SELECT queries to include logo fields

---

## UI Components (To Be Implemented)

### `src/design-system/components/FixtureCard.tsx`

**Current:** `📺 Sky Sports` (text badge)

**After Update:**
```tsx
<img
  src={fixture.broadcaster_image_path}
  alt={fixture.broadcaster}
  style={{ height: '20px', marginRight: '8px' }}
/>
Sky Sports
```

**Features:**
- Fallback to text badge if logo fails to load
- Lazy loading for performance
- Alt text for accessibility

### `src/pages/admin/AdminMatchesPage.tsx`

**Current:** Badge with text only

**After Update:** Badge with logo + text

---

## Implementation Steps

### ✅ Step 1: Backend (COMPLETE)
- [x] Create database migration
- [x] Update sync script
- [x] Update TypeScript types
- [x] Update service layer

### 🔲 Step 2: Apply Migrations (USER ACTION REQUIRED)

**Run in Supabase SQL Editor:**

1. **Add columns to broadcasts table:**
   ```sql
   -- Run: docs/migrations/add-broadcaster-logos.sql
   ```

2. **Update view to v3:**
   ```sql
   -- Run: docs/migrations/create-fixtures-with-teams-view-v3.sql
   ```

3. **Verify:**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'broadcasts' AND column_name IN ('image_path', 'url');

   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'fixtures_with_teams'
   AND column_name IN ('broadcaster_image_path', 'broadcaster_url');
   ```

### 🔲 Step 3: Re-sync Fixtures

**Run sync script to populate logos:**
```bash
node scripts/production/sync-sportmonks-fixtures.mjs
```

**What It Does:** Fetches fixtures from SportMonks with TV station data, including logos

### 🔲 Step 4: Update UI Components

**Files to Update:**
- `src/design-system/components/FixtureCard.tsx` - Display logos in fixture cards
- `src/pages/admin/AdminMatchesPage.tsx` - Display logos in admin table

### 🔲 Step 5: Test & Deploy

**Test:**
1. Check fixtures have logos in database
2. Verify logos display correctly
3. Test fallback for missing logos
4. Check mobile responsiveness

**Deploy:**
```bash
npm run build
netlify deploy --prod --dir=build
```

---

## API Response Example

```json
{
  "tvstation": {
    "id": 42,
    "name": "Sky Sports",
    "url": "https://www.skysports.com/",
    "image_path": "https://cdn.sportmonks.com/images/core/tvstations/10/42.png",
    "type": "tv"
  }
}
```

---

## Benefits

1. **Visual Appeal:** Logos are more recognizable than text
2. **Professional Look:** Matches what users see on other sports sites
3. **Branding:** Proper broadcaster branding
4. **Accessibility:** Alt text with broadcaster name
5. **Performance:** Logos are CDN-hosted (fast loading)

---

## Rollback Plan

If issues occur:

1. **Revert to V2 view:**
   ```sql
   -- Run: docs/migrations/create-fixtures-with-teams-view-v2.sql
   ```

2. **UI will gracefully degrade** to text-only badges (logos are optional fields)

---

## Notes

- Logos are optional - if `image_path` is NULL, UI shows text badge
- All logos hosted on SportMonks CDN (https://cdn.sportmonks.com)
- Logos are typically 50x50px PNG files
- View maintains same broadcaster priority logic as before

---

*Last Updated: 2025-11-06*
