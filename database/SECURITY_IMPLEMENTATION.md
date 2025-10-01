# 🔐 Supabase Security Implementation Guide

## Overview

This document explains the security fixes applied to resolve 34 critical security issues identified in the Supabase security scan.

---

## 📋 Issues Fixed

### 1. SECURITY DEFINER Views (3 views)
**Problem:** Views without explicit `SECURITY INVOKER` can cause privilege escalation attacks.

**Solution:** All views recreated with `WITH (security_invoker = true)` option.

**Views Fixed:**
- `fixtures_with_team_names_v` - Homepage fixture listings
- `fixtures_min_v` - Match page headers
- `broadcasts_with_provider_v` - Broadcast information
- `current_league_tables` - League standings

**Impact:** Views now run with the caller's privileges instead of the creator's privileges, preventing unauthorized access.

---

### 2. Missing Row Level Security (31 tables)

#### **App Tables (5 tables)**
Core application tables that need public read access:

| Table | Purpose | Policy |
|-------|---------|--------|
| `teams` | Team information | Public read, service_role write |
| `fixtures` | Match fixtures | Public read, service_role write |
| `competitions` | League/cup data | Public read, service_role write |
| `broadcasts` | TV broadcast info | Public read, service_role write |
| `providers` | Broadcaster details | Public read, service_role write |

**Policy Design:**
```sql
-- Example: teams table
CREATE POLICY "Public read access for teams"
  ON public.teams
  FOR SELECT
  USING (true);  -- Allow all reads
-- No INSERT/UPDATE/DELETE policies = Denied by default
```

#### **Directus Tables (27 tables)**
CMS tables reserved for future use:

**Strategy:** Enable RLS with no policies (deny all access)

**Tables:**
- `directus_activity`, `directus_collections`, `directus_dashboards`
- `directus_fields`, `directus_files`, `directus_flows`
- `directus_folders`, `directus_migrations`, `directus_notifications`
- `directus_operations`, `directus_panels`, `directus_permissions`
- `directus_presets`, `directus_relations`, `directus_revisions`
- `directus_roles`, `directus_sessions`, `directus_settings`
- `directus_shares`, `directus_translations`, `directus_users`
- `directus_versions`, `directus_webhooks`, `directus_extensions`
- `directus_comments`, `directus_operations_log`, `directus_activity_log`

**Result:** Tables exist but are completely inaccessible via public interface.

---

## 🚀 Deployment Instructions

### Step 1: Backup (IMPORTANT!)
Before running any security changes:

1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup
3. Wait for backup to complete

### Step 2: Run Security Fixes

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-security-fixes.sql`
3. Paste into SQL Editor
4. Click "Run" button
5. Review output for any errors

**Expected Output:**
```
Section 1 Complete: All views now use SECURITY INVOKER
Section 2 Complete: RLS enabled on 5 core app tables
Section 3 Complete: Public read policies created for 5 app tables
Section 4 Complete: RLS enabled on all Directus tables
Section 5 Complete: Run verification queries
🎉 All Security Fixes Complete!
```

### Step 3: Run Verification Queries

The script includes verification queries. Check:

✅ Views use SECURITY INVOKER
✅ RLS enabled on all tables
✅ Policies exist for app tables
✅ No policies exist for Directus tables

---

## 🧪 Testing Procedures

### Test 1: Public Website Functionality

**Homepage:**
```
✅ Visit https://matchlocator.com
✅ Verify fixtures display correctly
✅ Check team names and badges load
✅ Verify broadcast information shows
```

**H2H Pages:**
```
✅ Visit https://matchlocator.com/h2h/liverpool-vs-arsenal
✅ Verify team data loads
✅ Check fixtures display
✅ Verify statistics show correctly
```

**Match Pages:**
```
✅ Visit any match page
✅ Verify fixture details load
✅ Check broadcast information
✅ Verify team information displays
```

### Test 2: Admin Panel

**Admin Access:**
```
❓ Visit https://matchlocator.com/admin
❓ Try to add/edit fixture data
❓ Try to update broadcast information
```

**Expected Behavior:**
- ✅ Admin login should work (uses app auth, not Supabase)
- ❌ Admin writes may FAIL due to RLS (expected)
- ✅ Public reads should still work

**If Admin Writes Fail:** See "Admin Write Access" section below

---

## 🔧 Admin Write Access

### Current Situation

Your admin panel uses **username/password authentication** (not Supabase Auth).

With RLS enabled, **admin writes will be blocked** because:
1. No write policies exist for public users
2. Admin isn't using Supabase authenticated users
3. Service role key is required to bypass RLS

### Solution Options

#### **Option A: Service Role Key (RECOMMENDED)**

Use Supabase service_role key for admin operations. Service role bypasses all RLS.

**Implementation:**

1. **Get Service Role Key:**
   - Supabase Dashboard → Settings → API
   - Copy `service_role` key (NOT `anon` key)
   - **IMPORTANT:** Keep secret, never expose in frontend

2. **Create Admin Supabase Client:**

```typescript
// src/services/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service_role - bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for public operations
export const supabase = createClient(
  supabaseUrl,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);
```

3. **Update Environment Variables:**

```bash
# .env
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

4. **Use Admin Client for Writes:**

```typescript
// Before (will fail with RLS):
import { supabase } from './supabase';
await supabase.from('fixtures').insert({ ... });

// After (bypasses RLS):
import { supabaseAdmin } from './supabaseAdmin';
await supabaseAdmin.from('fixtures').insert({ ... });
```

**Security Considerations:**
- ✅ Service role key must be in backend/serverless functions only
- ✅ Never expose service_role key in frontend code
- ✅ Add proper admin authentication checks before using admin client
- ✅ Use regular client for all public reads

#### **Option B: Authenticated User Policies**

Migrate admin to use Supabase Authentication.

**Pros:** More secure, follows Supabase best practices
**Cons:** Requires refactoring admin authentication system

**Implementation:**
1. Create Supabase user for admin
2. Update RLS policies to allow authenticated writes
3. Refactor admin login to use Supabase auth

**Example Policy:**
```sql
CREATE POLICY "Authenticated users can write fixtures"
  ON public.fixtures
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

#### **Option C: Temporary Elevated Policies** (Not Recommended)

Create policies that allow writes based on specific conditions.

**Not recommended** because it's harder to secure and maintain.

---

## 🔍 How RLS Works

### Key Concepts

**Row Level Security (RLS):**
- Security feature that restricts which rows users can access
- Applied at the database level (can't be bypassed from client)
- Independent of application-level authentication

**Policies:**
- Rules that determine row access
- Separate policies for SELECT, INSERT, UPDATE, DELETE
- Can use SQL expressions for complex rules

**USING vs WITH CHECK:**
- `USING`: Determines which existing rows are visible
- `WITH CHECK`: Validates new/updated rows

### Example: Teams Table

```sql
-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Allow everyone to SELECT (read) teams
CREATE POLICY "Public read access for teams"
  ON public.teams
  FOR SELECT
  USING (true);  -- true = allow all

-- No INSERT/UPDATE/DELETE policies = denied by default

-- Service role bypasses all RLS automatically
```

**Result:**
- ✅ Public users: Can read all teams
- ❌ Public users: Cannot insert/update/delete
- ✅ Service role: Can do anything (bypasses RLS)

---

## 🛠️ Troubleshooting

### Issue: "Row-level security policy for table prevents access"

**Cause:** RLS is enabled but no policy grants access

**Fix:**
1. Check if reading or writing
2. For reads: Ensure public read policy exists
3. For writes: Use service_role key

### Issue: "Permission denied for table X"

**Cause:** RLS policy doesn't exist or doesn't match conditions

**Fix:**
1. Run verification queries from script
2. Check policy exists for table
3. Verify policy conditions match use case

### Issue: Admin writes fail

**Cause:** RLS blocks writes from public client

**Fix:** Implement Option A (service_role key)

### Issue: Views return no data

**Cause:** Views created before RLS, may not respect policies

**Fix:**
1. Drop and recreate views (script does this)
2. Ensure views use `SECURITY INVOKER`

---

## 📊 Verification

### Check RLS Status

```sql
-- See which tables have RLS enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Policies

```sql
-- See all policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Public Read Access

```sql
-- As anon user, should succeed:
SELECT * FROM teams LIMIT 5;
SELECT * FROM fixtures LIMIT 5;
SELECT * FROM competitions LIMIT 5;
```

### Test Write Restrictions

```sql
-- As anon user, should fail:
INSERT INTO teams (name, slug) VALUES ('Test Team', 'test-team');
-- Error: new row violates row-level security policy
```

---

## 🔄 Rollback Instructions

If you need to undo the security changes:

1. Run `rollback-security-fixes.sql`
2. This will:
   - Disable RLS on all tables
   - Drop all policies
   - Recreate views without SECURITY INVOKER

**WARNING:** Only rollback if absolutely necessary. This removes all security protections!

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Service Role Documentation](https://supabase.com/docs/guides/auth/service-role-api)

---

## 🎯 Future Maintenance

### Adding New Tables

When adding new tables to the database:

1. **Enable RLS:**
```sql
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
```

2. **Create appropriate policies:**
```sql
-- Example: Public read policy
CREATE POLICY "Public read access for new_table"
  ON public.new_table
  FOR SELECT
  USING (true);
```

3. **Test access:**
   - Test with anon key (public access)
   - Test with service_role key (admin access)

### Modifying Policies

To update existing policies:

1. **Drop old policy:**
```sql
DROP POLICY "policy_name" ON table_name;
```

2. **Create new policy:**
```sql
CREATE POLICY "new_policy_name" ON table_name ...;
```

### Adding Directus Integration

When ready to use Directus:

1. Install and configure Directus
2. Create Directus-specific policies:
```sql
-- Example: Allow Directus service account
CREATE POLICY "Directus access"
  ON public.directus_users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'directus_admin');
```

---

## ✅ Checklist

Before marking security work complete:

- [ ] Ran `supabase-security-fixes.sql` successfully
- [ ] Verified all views use SECURITY INVOKER
- [ ] Verified RLS enabled on 31 tables
- [ ] Verified 8 app tables have public read policies
- [ ] Verified 27 Directus tables have no policies (deny all)
- [ ] Tested website homepage loads fixtures
- [ ] Tested H2H pages display correctly
- [ ] Tested admin panel access
- [ ] Implemented admin write solution (if needed)
- [ ] Documented any custom changes made

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Database → Logs
2. Review error messages in browser console
3. Run verification queries to diagnose
4. Check this documentation for troubleshooting steps
5. Consult Supabase community or documentation

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Author:** Match Locator Development Team
