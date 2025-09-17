# Match Locator Development Documentation

## Project Overview
React + TypeScript application for UK Premier League TV schedule, deployed at https://matchlocator.com

## Database Architecture
**Backend**: Supabase

**Key Tables**:
- `fixtures` - Match data
- `teams` - Team information  
- `broadcasts` - Broadcaster assignments
- `providers` - Sky Sports, TNT Sports, etc.

**Views Used**:
- `fixtures_with_teams` - Fixtures with team data joined

## Development Workflow

### Running the Application
```bash
npm install
npm start
# http://localhost:3000 (or next available port)
```

### Environment Variables
```bash
REACT_APP_SUPABASE_URL=https://[project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[anon-key]
REACT_APP_CANONICAL_BASE=https://matchlocator.com
```

## Key Files
- `src/components/Header.tsx` - Reusable header with navigation
- `src/services/supabase.ts` - Database interactions
- `src/services/supabase-simple.ts` - Admin/home fixtures + save helpers
- `src/pages/AdminPage.tsx` - Broadcast data management
- `src/pages/HomePage.tsx` - Main fixtures display
- `src/pages/FixturesPage.tsx` - Comprehensive fixtures with filtering
- `src/pages/ClubsPage.tsx` - Club grid with team crests
- `src/pages/ClubPage.tsx` - Individual team pages
- `src/pages/MatchPage.tsx` - Match details pages
- `src/types/index.ts` - TypeScript definitions

## Deployment

**Platform**: Netlify
**Live URL**: https://matchlocator.com

**Build Settings**:
```toml
command = "CI= npm run build"
publish = "build/"
redirects = "/* /index.html 200"
```

**Environment Variables**:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_CANONICAL_BASE`

## Development Guidelines

### Best Practices
- Make small, incremental changes
- Test immediately after each change
- Use git commits as checkpoints
- Component isolation reduces breaking changes

### Database Patterns
- Use JOIN queries when possible
- Handle errors gracefully with try/catch
- Implement loading states for better UX
- For admin views, prefer simple queries over complex joins

## Common Issues
- Database view inconsistencies between environments
- Column name mismatches in queries
- API rate limiting with Supabase free tier
- If no fixtures render: check season date window and team FK IDs

## Architecture Notes
- React's component model works well with AI assistance
- TypeScript catches errors before production
- Proper routing eliminates hash-based URL issues
- File separation makes debugging easier

---
*Migration completed September 2025. Original SPA archived.*