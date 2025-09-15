# Match Locator - Development Guide

## Project Overview
React 19 + TypeScript application for UK and European football TV schedules across 9 major leagues.

**Production**: https://matchlocator.com  
**Tech Stack**: React + TypeScript + Supabase + Netlify

## Development Setup

### Prerequisites
- Node.js 20.x LTS (see `.nvmrc`)
- npm (comes with Node.js)
- Git

### Environment Variables
Create `.env` in project root:
```bash
REACT_APP_SUPABASE_URL=https://[project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # For admin functions
REACT_APP_CANONICAL_BASE=https://matchlocator.com
ADMIN_USERNAME=admin  # Optional: defaults to 'admin'
ADMIN_PASSWORD=matchlocator2025  # Optional
```

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm start
# → http://localhost:3000

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

## Architecture

### Database (Supabase)
**Key Tables:**
- `fixtures` - Match data with kickoff times
- `teams` - Team information with crests (177 teams across 9 leagues)
- `broadcasts` - TV broadcaster assignments
- `providers` - Sky Sports, TNT Sports, etc.
- `competitions` - 9 active leagues: Premier League, Champions League, Bundesliga, La Liga, Serie A, Ligue 1, Primeira Liga, Eredivisie, Championship

**Important Views:**
- `fixtures_with_teams` - Fixtures with team data joined

### Authentication Architecture
- **Frontend**: Anonymous key for read operations
- **Admin Functions**: Service role key for write operations via Netlify Functions
- **Production**: Username/password authentication (admin/matchlocator2025)
- **Development**: Authentication bypassed for localhost

### API Architecture
```
Client → Netlify Functions → Supabase (Service Role Key)
  ↓
Frontend Pages (Anonymous Key for reads)
```

## Key Components

### Pages
- `HomePage.tsx` - Main fixtures display with competition filtering
- `AdminPage.tsx` - Broadcaster management interface
- `FixturesPage.tsx` - Comprehensive fixtures with filtering (all 9 leagues)
- `ClubsPage.tsx` - Dynamic team directory organized by competition
- `ClubPage.tsx` - Individual team pages
- `MatchPage.tsx` - Match details
- `AboutPage.tsx` - About page using design system
- `legal/PrivacyPolicy.tsx` - Privacy policy with consistent styling
- `legal/Terms.tsx` - Terms & conditions with consistent styling

### Design System Components
- `ContentCard` - Unified card styling for text-heavy content
- `TextContainer` - Standardized typography and spacing
- `FixtureCard` - Match display cards with responsive design
- `ClubCard` - Team cards with competition variants
- `Badge` - Status indicators and labels

### Services
- `supabase.ts` - Main database queries with dynamic competition support
- `supabase-simple.ts` - Admin and home page helpers
- `netlify/functions/` - Server-side admin operations

### Hooks
- `useCompetitions.ts` - Dynamic competition loading
- `usePublicCompetitions()` - Public-facing competitions only
- `useAdminCompetitions()` - All competitions including hidden ones

### Key Features
- **Competition Visibility**: Admin can show/hide competitions
- **Broadcaster Assignment**: Sky Sports, TNT Sports, or Blackout
- **Blackout Tracking**: Provider ID 999 for "No TV" fixtures
- **SEO Optimization**: Dynamic meta tags and sitemaps
- **Responsive Design**: Mobile-first approach

## Development Workflow

### Making Changes
1. **Small, incremental changes** - Test immediately
2. **Use git commits as checkpoints**
3. **Component isolation** - Reduces breaking changes
4. **Type checking** - Run `npx tsc --noEmit` before committing

### Testing Admin Features
1. Visit `http://localhost:3000/admin`
2. Authentication bypassed in development
3. Test competition visibility toggles
4. Test broadcaster assignments
5. Verify changes persist to database

### Database Development
- Use JOIN queries when possible
- Handle errors gracefully with try/catch
- Implement loading states for better UX
- Test with both visible and hidden competitions

## Deployment

### Platform: Netlify
**Build Settings:**
```toml
command = "CI= npm run build"
publish = "build/"
```

**Environment Variables Required:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Critical for admin functions**
- `REACT_APP_CANONICAL_BASE`

### Pre-Deploy Checklist
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Admin functions tested locally
- [ ] Environment variables set in Netlify
- [ ] Service role key configured

## Troubleshooting

### Common Issues

**Build Failures:**
- Check TypeScript errors with `npx tsc --noEmit`
- Ensure all imports are correct
- Verify environment variables

**Admin 401 Errors:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify
- Check service role key is correct for the project
- Verify Netlify Functions are deployed

**Database Connection Issues:**
- Check Supabase URL and keys match the project
- Verify RLS policies allow necessary operations
- Test with direct Supabase client

**Frontend Display Issues:**
- Check browser developer console for errors
- Verify data structure matches TypeScript interfaces
- Test with sample data first

### Debug Tips
- Use browser DevTools Network tab for API calls
- Check Netlify Functions logs for server errors
- Use `console.log` for data flow debugging
- Test admin functions via curl commands

## Code Quality

### Best Practices
- React function components with TypeScript
- External links must include `rel="noreferrer noopener"`
- Effects with async functions should use `useCallback`
- Keep changes minimal and focused

### Quality Checks
```bash
# Type checking
npx tsc --noEmit

# Build test
npm run build

# Start development
npm start
```

### Git Workflow
- Feature branches for new functionality
- Descriptive commit messages
- Test before pushing
- Use main branch for production

## Performance

### Optimization
- Core Web Vitals optimized
- Responsive images with proper sizing
- Efficient database queries
- Component memoization where needed

### Monitoring
- Check build bundle size
- Monitor API response times  
- Test on mobile devices
- Verify SEO performance

---

## Support

For technical issues:
1. Check this development guide
2. Review error logs in browser/Netlify
3. Verify environment variables
4. Test database connections

**Status**: Production-ready development environment