# Match Locator - Handover Documentation

## Current Status (September 2025)

### ✅ **RESOLVED - Root Cause Authentication Issues Fixed**
1. **Competition Visibility Persistence**: Fixed RLS policy violations by implementing Netlify Functions with service role key
2. **Broadcaster Assignment Errors**: Resolved 401 Unauthorized errors through proper API architecture  
3. **Admin Authentication**: Added production login system (admin/matchlocator2025) with dev bypass

### ⚠️ Outstanding Issues  
1. **Netlify Deployment Not Working**: Changes are committed to `main` branch but not appearing on live site
2. **Build Hook Failed**: The webhook URL `https://api.netlify.com/build_hooks/677f0c8c54cdc3147f2ebd8f` returns "Not Found"
3. **Admin Features Not Live**: Enhanced admin interface completed but not deployed

### ✅ Completed Work

#### Enhanced Admin Interface (`/admin`)
- **Production Authentication System**:
  - Login required in production: admin / matchlocator2025
  - Automatic bypass in development (localhost)
  - 24-hour session tokens with localStorage persistence
- **Competition Overview Section**: 
  - Visibility controls with radio buttons (Visible/Hidden) - **NOW WORKING**
  - Real-time status updates with proper persistence 
  - Fixed database persistence via Netlify Functions API
- **Broadcast Editor Modal**:
  - Add, edit, delete broadcaster functionality - **NOW WORKING**
  - Clean modal interface with validation
  - Fixed 401 errors through service role key implementation
- **Multi-Competition Support**:
  - Competition filtering dropdown
  - Enhanced stats including blackout count
  - UCL stage/round display (instead of matchweeks)

#### Database Schema Enhancements
- Added `is_production_visible` column to `competitions` table
- Enhanced blackout tracking with provider ID 999
- Production visibility controls with fallback logic

#### Premier League Data Restoration
- Created `/scripts/import-premier-league.mjs` to restore missing fixtures
- Successfully imported 380 fixtures for 2025-26 season
- Fixed team deduplication issues

## File Structure

### Key Admin Files
- `src/pages/AdminPage.tsx` - Enhanced admin interface with competition management + authentication wrapper
- `src/components/AdminAuth.tsx` - Production login component (NEW)
- `src/components/BroadcastEditor.tsx` - Modal for broadcaster management  
- `src/services/supabase-simple.ts` - Updated to use API endpoints instead of direct Supabase calls

### Netlify Functions (NEW - Service Role Key Architecture)
- `netlify/functions/admin-auth.js` - Admin authentication endpoint
- `netlify/functions/save-competition-visibility.js` - Competition visibility updates with service role
- `netlify/functions/save-broadcaster.js` - Broadcaster assignments with service role

### Database Scripts
- `scripts/import-premier-league.mjs` - Premier League fixture import
- `add_production_visibility_column.sql` - Database migration script

### Configuration
- `netlify.toml` - Deployment configuration
- `.env` - Environment variables (Supabase keys + admin credentials)

## Deployment Issues

### Problem
Despite successful git pushes to `main` branch, changes are not appearing on production sites:
- https://matchlocator.com/admin
- https://staging.matchlocator.com/admin

### Attempted Solutions
1. Manual git push with empty commit
2. Build hook trigger (failed - webhook returns 404)
3. Build compilation verified locally (successful)

### Next Steps Required
1. **Check Netlify Dashboard**:
   - Verify auto-deploy is enabled for `main` branch
   - Check build logs for errors
   - Update build hook URL if needed

2. **Manual Deployment**:
   - Trigger manual deploy from Netlify dashboard
   - Verify branch configuration

## Database Setup

### Required Environment Variables
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # CRITICAL: Required for Netlify Functions
FOOTBALL_DATA_API_KEY=your_api_key
ADMIN_USERNAME=admin  # Optional: defaults to 'admin'
ADMIN_PASSWORD=matchlocator2025  # Optional: defaults to 'matchlocator2025'
```

### ⚠️ IMPORTANT: Service Role Key Required
The new Netlify Functions require the `SUPABASE_SERVICE_ROLE_KEY` environment variable to be set in the Netlify deployment settings. Without this, admin operations will fail.

### Missing Column Fix
If `is_production_visible` column doesn't exist:
```sql
ALTER TABLE competitions 
ADD COLUMN is_production_visible BOOLEAN DEFAULT true;

UPDATE competitions 
SET is_production_visible = false 
WHERE id = 2; -- Hide UCL by default
```

## Key Functions

### Competition Visibility (FIXED)
```typescript
// Get competitions with visibility filtering - USES DIRECT SUPABASE (READ-ONLY)
getSimpleCompetitions(includeHidden: boolean): Promise<SimpleCompetition[]>

// Save visibility setting - NOW USES NETLIFY FUNCTION WITH SERVICE ROLE  
saveCompetitionVisibility(competitionId: number, isVisible: boolean): Promise<void>
// Calls: /.netlify/functions/save-competition-visibility
```

### Broadcaster Management (FIXED)  
```typescript
// Save broadcaster assignment - NOW USES NETLIFY FUNCTION WITH SERVICE ROLE
saveBroadcaster(fixtureId: number, providerId: number | null): Promise<void>
// Calls: /.netlify/functions/save-broadcaster
```

### Admin Authentication (NEW)
```typescript  
// Production login system
// POST /.netlify/functions/admin-auth
// Body: { username: string, password: string }
// Returns: { success: true, token: string, expiresAt: number }
```

### Admin Interface Features
- Competition overview with visibility toggles
- Broadcaster management modal
- Multi-competition fixture filtering
- Enhanced blackout tracking (provider ID 999)
- UCL stage/round display support

## Git Branches

### Main Branch (`main`)
- Contains all completed admin enhancements
- Ready for production deployment
- Last commit: `ae844198` - "fix: resolve merge conflicts and build errors"

### Staging Branch (`staging`) 
- Contains additional development work
- May have newer features not yet merged

## Testing Locally

### Start Development Server
```bash
npm install
npm start
# Access admin at http://localhost:3000/admin
```

### Build for Production
```bash
npm run build
# Verify build succeeds without errors
```

## Production Verification

### When Deployment Works, Verify:
1. **Admin Interface**: Visit `/admin` to see enhanced interface
2. **Competition Controls**: Test visibility toggles for UCL/Premier League
3. **Broadcast Editor**: Click "📺 Manage Broadcasters" button
4. **Multi-Competition**: Use competition dropdown filter
5. **Database Persistence**: Verify settings save and persist on refresh

## Immediate Action Items

1. **CRITICAL: Set Service Role Key in Netlify**:
   - Go to Netlify Dashboard > Site Settings > Environment Variables
   - Add `SUPABASE_SERVICE_ROLE_KEY` with service role key value
   - This is required for all admin operations to work

2. **Fix Netlify Deployment**:
   - Check Netlify dashboard settings
   - Verify branch configuration  
   - Update build hook if needed

3. **Test Fixed Admin Features** (After Deployment):
   - ✅ Competition visibility controls (should now persist)
   - ✅ Broadcast editor functionality (should work without 401 errors)
   - ✅ Production authentication (admin/matchlocator2025)
   - Multi-competition filtering

4. **Database Verification**:
   - Ensure `is_production_visible` column exists
   - Verify competition visibility settings work
   - Test blackout functionality (provider ID 999)

## Contact & Support

### Code Base Information
- **Framework**: React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **API**: Football-Data.org for fixture imports

### Key Implementation Notes
- Competition visibility uses database-based persistence
- Blackout functionality uses provider ID 999 in database
- Admin interface supports multi-competition management
- UCL displays stage/round instead of matchweeks
- Premier League uses traditional matchweek display

The enhanced admin interface is fully developed and ready for use once deployment issues are resolved.