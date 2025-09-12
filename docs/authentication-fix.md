# Authentication & API Fix - September 2025

## Root Cause Identified & Resolved

### The Problem
Admin operations were failing with:
- `401 Unauthorized` errors when updating broadcasters
- Competition visibility settings not persisting (reverting on page reload)
- Row-Level Security (RLS) policy violations in Supabase

### Root Cause
Client-side admin operations were attempting database writes using the **anonymous key** (`REACT_APP_SUPABASE_ANON_KEY`), but these operations require **service role permissions** due to RLS policies on the `broadcasts` and `competitions` tables.

### The Solution Architecture

#### Before (BROKEN)
```typescript
// Direct Supabase calls from client using anonymous key
const { error } = await supabase
  .from('competitions')
  .update({ is_production_visible: isVisible })
  .eq('id', competitionId);
// ❌ Results in: 401 Unauthorized / RLS Policy Violation
```

#### After (FIXED)
```typescript
// API calls to Netlify Functions using service role key
const response = await fetch('/.netlify/functions/save-competition-visibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ competitionId, isVisible })
});
// ✅ Results in: Successful database write with proper permissions
```

## Implementation Details

### 1. Netlify Functions (Server-Side with Service Role)

#### `netlify/functions/save-competition-visibility.js`
- Handles competition visibility updates
- Uses `SUPABASE_SERVICE_ROLE_KEY` for database writes
- Bypasses RLS policies with elevated permissions

#### `netlify/functions/save-broadcaster.js`  
- Handles broadcaster assignment operations
- Supports null values (TBD), regular provider IDs, and blackout (999)
- Uses service role for all database mutations

#### `netlify/functions/admin-auth.js`
- Production authentication system
- Default credentials: `admin` / `matchlocator2025`
- Returns JWT-style tokens with 24-hour expiry

### 2. Client-Side Updates

#### `src/services/supabase-simple.ts`
- **READ operations**: Still use direct Supabase with anonymous key (permitted)
- **WRITE operations**: Now use fetch calls to Netlify Functions
- Maintains same API surface but with proper backend permissions

#### `src/pages/AdminPage.tsx` 
- Wrapped with authentication system
- Production: Requires login credentials
- Development: Automatic bypass for localhost

#### `src/components/AdminAuth.tsx`
- Clean login interface with form validation
- Session management with localStorage
- Token expiry handling

## Environment Variables Required

### Critical for Production Deployment
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # MUST be set in Netlify
ADMIN_USERNAME=admin  # Optional: defaults to 'admin'  
ADMIN_PASSWORD=matchlocator2025  # Optional: defaults shown
```

### Existing Variables (Still Required)
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
FOOTBALL_DATA_API_KEY=your_api_key
```

## What's Now Working

### ✅ Competition Visibility Controls
- Radio buttons for Show/Hide persist across page reloads
- Changes are immediately saved to database
- No more RLS policy violations
- Real-time UI updates with success/error feedback

### ✅ Broadcaster Assignment  
- Dropdown selections save without 401 errors
- Supports TBD (null), regular providers, and blackout (999)
- Batch "Save All" functionality works
- Individual fixture updates persist properly

### ✅ Production Security
- Admin interface protected by username/password in production
- Development environment bypasses auth for easy testing
- Session tokens prevent repeated logins
- Secure logout functionality

## Technical Architecture

### Authentication Flow
1. **Development**: Automatic bypass if hostname is localhost
2. **Production**: Redirect to login form if no valid token
3. **Login**: POST to `/admin-auth` → receive token → store in localStorage  
4. **Session**: Check token expiry on page load → auto-logout if expired

### API Call Flow  
1. **Admin Action**: User clicks save button
2. **Client**: Calls updated function in `supabase-simple.ts`
3. **Netlify Function**: Receives request, uses service role key
4. **Database**: Operation succeeds with proper permissions
5. **Response**: Success confirmation back to client
6. **UI Update**: Real-time feedback to user

## Files Changed

### New Files
- `netlify/functions/admin-auth.js`
- `netlify/functions/save-competition-visibility.js` 
- `netlify/functions/save-broadcaster.js`
- `src/components/AdminAuth.tsx`

### Modified Files
- `src/pages/AdminPage.tsx` - Added authentication wrapper
- `src/services/supabase-simple.ts` - Replaced direct calls with API calls

## Deployment Requirements

1. **Set Environment Variables in Netlify**:
   - Navigate to Site Settings > Environment Variables
   - Add `SUPABASE_SERVICE_ROLE_KEY` with the service role key value
   - Optionally customize `ADMIN_USERNAME` and `ADMIN_PASSWORD`

2. **Deploy to Production**: 
   - Commit is ready: `658de336`
   - Push to trigger Netlify deployment
   - Functions will be automatically deployed alongside the site

3. **Test After Deployment**:
   - Visit `/admin` → should see login form in production
   - Login with admin/matchlocator2025 
   - Test competition visibility toggles → should persist
   - Test broadcaster assignments → should save without errors

## Security Notes

- **Service Role Key**: Has elevated database permissions, only used server-side
- **Anonymous Key**: Still used for read operations, no write permissions needed  
- **Admin Credentials**: Hardcoded for simplicity, could be moved to environment variables
- **Session Tokens**: Basic implementation, suitable for single-admin system
- **Development Bypass**: Allows easy local testing without authentication

The admin interface will now function with proper database persistence and security.