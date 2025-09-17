# Admin Interface Guide

> Complete guide for the Football TV Schedule admin interface, content management features, and development guidelines

## 📋 Table of Contents

1. [Admin Overview](#admin-overview)
2. [Access & Authentication](#access--authentication)
3. [Data Visibility Guidelines](#data-visibility-guidelines)
4. [Admin Features](#admin-features)
5. [Content Management](#content-management)
6. [Developer Guidelines](#developer-guidelines)
7. [Troubleshooting](#troubleshooting)

---

## Admin Overview

### Admin Interface Purpose

The admin interface provides comprehensive management tools for:
- **Competition Visibility**: Control which competitions appear on public site
- **Broadcaster Assignment**: Manage TV broadcaster assignments for fixtures
- **Fixture Management**: Edit, update, and manage fixture information
- **Team Management**: Update team information and metadata
- **Statistics Monitoring**: View internal metrics and data completeness

### Access Information

**Admin URL:** https://matchlocator.com/admin
**Authentication:** Username/password authentication required
**Permissions:** Full CRUD access to all competition and fixture data

### Admin Navigation

```
/admin                    # Main admin dashboard
/admin/competitions      # Competition management
/admin/fixtures         # Fixture management and broadcaster assignment
/admin/teams            # Team information management
/admin/stats            # Internal statistics and metrics
```

---

## Access & Authentication

### Admin Login

**Default Credentials:**
- **Username:** `admin` (configurable via `ADMIN_USERNAME`)
- **Password:** `matchlocator2025` (configurable via `ADMIN_PASSWORD`)

**Environment Configuration:**
```bash
# Optional admin credentials (defaults shown)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Security Model

**Authentication Architecture:**
1. **Public Pages**: Anonymous Supabase key for read-only access
2. **Admin Operations**: Service role key via Netlify Functions
3. **Session Management**: Browser-based session storage
4. **API Security**: Server-side validation for all admin operations

**Access Control:**
- **Row Level Security (RLS)**: Enabled on all admin tables
- **Service Role Operations**: Admin writes use elevated permissions
- **API Validation**: Server-side validation for all admin requests

### Login Process

1. **Access admin URL**: Navigate to `/admin`
2. **Enter credentials**: Username and password
3. **Session creation**: Authenticated session stored locally
4. **Admin access**: Full admin interface available
5. **Session expiry**: Manual logout or browser session end

---

## Data Visibility Guidelines

### 🚨 CRITICAL: Public vs Admin Data

**The most important rule for admin development:**

### ❌ NEVER Display on Public Pages

**Prohibited Statistics:**
- Total fixture counts (`{stats.totalFixtures}`)
- Confirmed broadcast counts (`{stats.confirmedBroadcasts}`)
- Blackout game counts (`{stats.blackouts}`)
- Pending broadcast counts (`{stats.pendingBroadcasts}`)
- Data completeness percentages
- Editorial workflow progress
- Import/sync status information

**Why This Matters:**
- Reveals incomplete data coverage to users
- Exposes internal editorial processes
- Shows gaps in fixture/broadcaster information
- Undermines user confidence in completeness

### ✅ Admin-Only Information

**Restricted to Admin Interface:**
- Competition dashboard statistics
- Broadcast assignment progress indicators
- Data import and synchronization status
- Editorial workflow metrics
- Content management progress
- Database integrity reports

### Implementation Guidelines

**Code Examples:**

```typescript
// ❌ WRONG: Exposing admin stats on public pages
const PublicCompetitionPage = () => {
  const stats = getCompetitionStats(); // Contains admin-only data
  return (
    <div>
      <h1>Premier League</h1>
      <p>Total fixtures: {stats.totalFixtures}</p> {/* NEVER DO THIS */}
    </div>
  );
};

// ✅ RIGHT: Admin stats only in admin interface
const AdminCompetitionPage = () => {
  const stats = getCompetitionStats();
  return (
    <AdminLayout>
      <h1>Premier League Management</h1>
      <div className="admin-stats">
        <p>Total fixtures: {stats.totalFixtures}</p> {/* OK in admin */}
        <p>Confirmed broadcasts: {stats.confirmedBroadcasts}</p>
      </div>
    </AdminLayout>
  );
};
```

**Data Access Patterns:**
- **Public queries**: Filter to visible/confirmed data only
- **Admin queries**: Include all data with internal statistics
- **API endpoints**: Separate public and admin-only routes
- **Component logic**: Check user role before displaying admin data

---

## Admin Features

### 1. Competition Management

**Location:** `/admin/competitions`
**Purpose:** Control competition visibility and configuration

#### Competition Visibility Controls

**Features:**
- **Toggle Visibility**: Show/hide competitions on public site
- **Real-time Updates**: Changes apply immediately
- **Visual Feedback**: Success/error messages for all operations
- **Bulk Operations**: Manage multiple competitions efficiently

**Interface:**
```typescript
// Competition visibility toggle
const handleCompetitionVisibilityChange = async (
  competitionId: number,
  isVisible: boolean
) => {
  await saveCompetitionVisibility(competitionId, isVisible);
  // Visual feedback and state update
};
```

**Implementation:**
- **Database Persistence**: Changes saved to `competitions.is_visible`
- **API Endpoint**: `/.netlify/functions/save-competition-visibility`
- **State Management**: Real-time UI updates with optimistic rendering
- **Error Handling**: Graceful degradation with user feedback

#### Competition Statistics

**Admin-Only Dashboard:**
- Fixture counts per competition
- Broadcaster assignment progress
- Data completeness metrics
- Recent update timestamps

### 2. Fixture Management

**Location:** `/admin/fixtures`
**Purpose:** Manage fixture broadcaster assignments and details

#### Broadcaster Assignment

**Bulk Operations:**
- **Select Multiple Fixtures**: Checkbox selection for batch operations
- **Assign Broadcaster**: Apply broadcaster to multiple fixtures
- **Save All Changes**: Single save operation for multiple assignments
- **Progress Tracking**: Real-time feedback during bulk operations

**Single Fixture Operations:**
- **Quick Edit**: Inline broadcaster assignment
- **Detailed View**: Full fixture information with edit capabilities
- **Status Updates**: Mark fixtures as confirmed/pending
- **Notes Management**: Add internal notes for editorial workflow

#### Broadcaster Editor Modal

**Features:**
```typescript
interface BroadcastEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (broadcasters: Array<{ id: number; name: string }>) => void;
  fixture: Fixture;
  currentBroadcasters: Broadcaster[];
}
```

**Functionality:**
- **Multi-broadcaster Support**: Assign multiple broadcasters per fixture
- **Provider Integration**: Sky Sports, TNT Sports, Amazon Prime, BBC
- **Validation**: Ensure valid broadcaster assignments
- **Conflict Detection**: Warning for unusual broadcaster combinations

### 3. Team Management

**Location:** `/admin/teams`
**Purpose:** Manage team information and metadata

#### Team Information Updates

**Editable Fields:**
- **Team Names**: Full name and short name variations
- **Club Information**: Website, venue, city details
- **Visual Assets**: Team crests and club colors
- **Competition Assignment**: Move teams between competitions

**Bulk Updates:**
- **Import Team Data**: Batch import from external APIs
- **Update Team Crests**: Bulk update team logos
- **Competition Migration**: Move teams between competitions
- **Data Enrichment**: Fill missing team information

### 4. Statistics Dashboard

**Location:** `/admin/stats`
**Purpose:** Monitor platform performance and data quality

#### Performance Metrics

**Data Quality Indicators:**
- **Fixture Coverage**: Percentage of fixtures with broadcaster assignments
- **Team Data Completeness**: Teams with complete information
- **Competition Status**: Active/inactive competition monitoring
- **Error Rates**: Import and sync error tracking

**User Engagement Metrics:**
- **Page Performance**: Load times and user interaction data
- **Popular Content**: Most-viewed fixtures and competitions
- **Search Patterns**: User behavior and content discovery
- **Mobile Usage**: Device and platform statistics

---

## Content Management

### Editorial Workflow

#### Content Creation Process

1. **Data Import**: Import fixtures from external APIs
2. **Team Assignment**: Verify team information and assignments
3. **Broadcaster Research**: Research and assign TV broadcasters
4. **Quality Review**: Verify accuracy of all assignments
5. **Publication**: Make fixtures visible on public site

#### Content Review Cycle

**Daily Tasks:**
- Review new fixtures imported automatically
- Update broadcaster assignments for upcoming matches
- Monitor user-reported issues or errors
- Verify data accuracy for high-profile matches

**Weekly Tasks:**
- Bulk update broadcaster assignments
- Review and correct any data inconsistencies
- Update team information and logos
- Export performance and usage reports

#### Quality Assurance

**Data Validation Rules:**
- All fixtures must have valid home and away teams
- Broadcaster assignments must reference valid providers
- Kickoff times must be in correct timezone (UTC in database)
- Competition assignments must be logically consistent

**Review Checklist:**
- [ ] Fixture details accurate (teams, date, time)
- [ ] Broadcaster assignments correct and confirmed
- [ ] Team information complete and up-to-date
- [ ] No duplicate fixtures or conflicting data
- [ ] All changes reflected correctly on public site

### Content Publishing

#### Publication Controls

**Visibility Management:**
- **Competition Level**: Show/hide entire competitions
- **Fixture Level**: Individual fixture visibility controls
- **Broadcaster Level**: Control which broadcaster assignments show
- **Batch Operations**: Bulk publish/unpublish operations

**Publishing Workflow:**
1. **Content Creation**: Add/import new fixtures and data
2. **Editorial Review**: Verify accuracy and completeness
3. **Quality Check**: Run automated validation checks
4. **Publication**: Make content visible to public users
5. **Monitoring**: Track performance and user feedback

---

## Developer Guidelines

### Development Environment

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Create React App
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify with automatic deployment
- **Authentication**: Custom admin system with service role access

**Node.js Setup:**
- **Recommended**: Node.js 20.x LTS (check `.nvmrc`)
- **Package Manager**: npm
- **Avoid**: Node.js 22 (extra deprecation warnings)

### Quick Start Commands

```bash
# Install dependencies
npm ci                                    # Faster than npm install

# Development
npm start                                # Dev server at http://localhost:3000
npm run build                           # Production build to build/

# Quality Checks
./node_modules/.bin/tsc --noEmit        # TypeScript checking
npm run lint                            # ESLint validation
```

### Code Quality Standards

#### Pre-Commit Checklist

- [ ] **TypeScript Check**: `tsc --noEmit` passes without errors
- [ ] **Production Build**: `npm run build` completes successfully
- [ ] **No ESLint Warnings**: Especially `react-hooks/exhaustive-deps`
- [ ] **Security**: All external links have `rel="noreferrer noopener"`
- [ ] **Admin Data**: No admin-only statistics exposed on public pages

#### React Patterns

**Component Structure:**
```typescript
// Use functional components with TypeScript interfaces
interface AdminComponentProps {
  data: DataType;
  onUpdate: (id: number, changes: UpdateData) => void;
}

const AdminComponent: React.FC<AdminComponentProps> = ({ data, onUpdate }) => {
  // Component implementation
};
```

**Effect Dependencies:**
```typescript
// Use useCallback for stable dependencies
const handleAsyncOperation = useCallback(async () => {
  // Async operation
}, [dependency1, dependency2]);

useEffect(() => {
  handleAsyncOperation();
}, [handleAsyncOperation]);
```

### Architecture Guidelines

#### Service Layer Pattern

**Supabase Access:**
```typescript
// Public data access (read-only)
import { supabase } from '../services/supabase';

// Admin operations (via Netlify Functions)
const response = await fetch('/.netlify/functions/admin-operation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data })
});
```

#### Component Organization

```
src/
├── components/
│   ├── admin/               # Admin-specific components
│   │   ├── AdminLayout.tsx  # Common admin page structure
│   │   ├── BroadcastEditor.tsx # Broadcaster assignment modal
│   │   └── CompetitionStats.tsx # Admin statistics display
│   ├── design-system/       # Shared design components
│   └── ...
├── pages/
│   ├── admin/               # Admin pages
│   │   ├── AdminPage.tsx    # Main admin dashboard
│   │   ├── AdminFixturesPage.tsx # Fixture management
│   │   └── AdminCompetitionsPage.tsx # Competition management
│   └── ...
```

### Development Best Practices

#### Admin Feature Development

1. **Security First**: Always use service role for admin operations
2. **Data Separation**: Keep admin-only data strictly in admin interface
3. **Progressive Enhancement**: Admin features should degrade gracefully
4. **Real-time Feedback**: Provide immediate visual feedback for all operations
5. **Error Handling**: Comprehensive error handling with user-friendly messages

#### Code Review Focus Areas

**Admin-Specific Checks:**
- [ ] No admin statistics exposed on public pages
- [ ] Proper authentication for admin operations
- [ ] Service role usage for database writes
- [ ] Data validation for all admin inputs
- [ ] Graceful error handling and user feedback

**Performance Considerations:**
- [ ] Efficient queries for admin dashboards
- [ ] Pagination for large datasets
- [ ] Optimistic updates for better UX
- [ ] Proper loading states for async operations

---

## Troubleshooting

### Common Admin Issues

#### Authentication Problems

**Symptoms:** Cannot access admin interface or operations fail
**Diagnosis:**
```typescript
// Check authentication status
console.log('Admin authenticated:', isAdminAuthenticated);

// Verify environment variables
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

**Solutions:**
1. Verify admin credentials are correct
2. Check environment variables in Netlify dashboard
3. Ensure service role key is properly configured
4. Clear browser cache and retry login

#### Permission Errors

**Symptoms:** 401 Unauthorized or RLS policy violations
**Common Causes:**
- Using anonymous key for admin operations
- Missing service role permissions
- Incorrect RLS policy configuration

**Solutions:**
```typescript
// ❌ Wrong: Direct admin operation with anonymous key
const { error } = await supabase
  .from('competitions')
  .update({ is_visible: true })
  .eq('id', competitionId);

// ✅ Right: Admin operation via Netlify Function
const response = await fetch('/.netlify/functions/save-competition-visibility', {
  method: 'POST',
  body: JSON.stringify({ competitionId, isVisible: true })
});
```

#### Data Visibility Issues

**Symptoms:** Admin statistics appearing on public pages
**Detection:**
```bash
# Search for admin-only data usage in public components
grep -r "totalFixtures\|confirmedBroadcasts\|blackouts" src/pages/
grep -r "getCompetitionStats" src/pages/

# Check for admin data in public components
grep -r "admin.*stats\|internal.*metrics" src/components/
```

**Prevention:**
1. Use separate data services for public vs admin
2. Implement proper component-level access checks
3. Review all public components for admin data leakage
4. Add automated tests for data visibility rules

### Performance Issues

#### Slow Admin Dashboard

**Diagnosis:**
- Check database query performance
- Monitor network requests in browser dev tools
- Profile React components with React DevTools

**Solutions:**
1. Optimize database queries with proper indexes
2. Implement pagination for large datasets
3. Use React.memo for expensive admin components
4. Cache frequently accessed admin data

#### Build/Deploy Issues

**Common Problems:**
- TypeScript compilation errors
- Missing environment variables
- Netlify function deployment failures

**Debug Steps:**
```bash
# Local build testing
npm run build                    # Test production build
npm run type-check              # Verify TypeScript

# Environment variable checking
env | grep REACT_APP            # Check frontend variables
env | grep SUPABASE             # Check backend variables
```

---

## Quick Reference

### Essential Admin URLs
```
https://matchlocator.com/admin                 # Main admin dashboard
https://matchlocator.com/admin/competitions   # Competition management
https://matchlocator.com/admin/fixtures       # Fixture management
https://matchlocator.com/admin/teams          # Team management
```

### Key Admin Commands
```bash
# Development
npm start                        # Start admin development
npm run build                   # Test admin build
npm run type-check             # Verify admin TypeScript

# Database Access
node scripts/verify-competition.js --internal-id=1  # Verify data
npm run teams:backfill:dry                          # Preview team updates
```

### Admin API Endpoints
```
/.netlify/functions/save-broadcaster             # Update fixture broadcaster
/.netlify/functions/save-competition-visibility  # Toggle competition visibility
/.netlify/functions/bulk-update-broadcasts      # Batch broadcaster updates
/.netlify/functions/admin-stats                 # Generate admin statistics
```

### Critical Data Rules
- ❌ **NEVER** show `totalFixtures`, `confirmedBroadcasts`, `blackouts` on public pages
- ✅ **ALWAYS** use service role for admin database operations
- ✅ **ALWAYS** provide user feedback for admin operations
- ✅ **ALWAYS** validate admin inputs before database operations

---

**Last Updated:** September 17, 2025
**Related Documentation:** [ARCHITECTURE.md](ARCHITECTURE.md), [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md), [DEPLOYMENT.md](DEPLOYMENT.md)