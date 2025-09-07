# Football Listings MVP - Project Context

## Project Overview
Building a sports fixtures & broadcaster listing website. MVP: Premier League fixtures + UK broadcasters only.
Goal: Lean, profitable side business showing fans which channel their games are on.

## Current Tech Stack
- Backend: Supabase (Postgres + REST API)
- Frontend: Single HTML file SPA (index.html)
- Hosting: Netlify (auto-deploy from GitHub)
- Data Source: TheSportsDB API

## Key Constraints
- Keep costs low (€30-70/month)
- MVP only: Premier League + UK + Football
- No official logos (use text badges)
- SEO-friendly URLs required

## Current Priorities
1. Complete fixtures import (all 380 PL games)
2. Add broadcast data (manual CSV import initially)
3. Frontend enhancements (matchweek filters, team filters)
4. Wire affiliate buttons (Sky Sports, TNT, Amazon Prime)

## Database Schema
- teams (22 Premier League teams)
- fixtures (partial 2025/26 season)
- providers (Sky, TNT, Amazon, BBC Radio etc.)
- broadcasts_uk (links fixtures to providers)
- affiliate_destinations (tracking links)

## Development Style
- Focus on practical coding help, not full solutions
- Prefer code snippets vs complete file rewrites
- This is MVP/side project - prioritize speed over perfection
- Always consider SEO and affiliate revenue impact

## Automation Setup
- ✅ CHANGELOG.md updates automatically on each git commit
- ✅ Git post-commit hook installed

## Critical System Fixes (2025-09-07)
- ✅ **Infinite redirect loop resolved**: Fixed SPA routing for deep links
- ✅ **App crash protection**: Added error boundaries to prevent site breakage
- ✅ **Data integrity filtering**: Leicester/Southampton excluded from current Premier League
- ✅ **Custom development server**: Created proper SPA fallback routing (dev-server.js)
- ✅ **Architecture planning**: Comprehensive solution documented (ARCHITECTURE_PLAN.md)

## System Status
- **Database**: Contains mixed historical/current data (requires admin access to fix)
- **Frontend**: Now resilient with client-side data filtering and error handling
- **Routing**: Custom SPA server works correctly, no more redirect loops
- **Error Handling**: Graceful degradation instead of complete app breakage

## Next Development Priorities
1. **Season Management**: Implement proper database schema with seasons table
2. **Data Migration**: Clean up team memberships with proper season context
3. **Admin Interface**: Build tools for managing competitions and seasons
4. **API Consistency**: Create proper database views for clean API endpoints

## Recent Changes
- 2025-09-07: **CRITICAL FIXES** - infinite redirect loop, app crashes, data integrity
- 2025-09-06: restore package.json and update version badge to v1.5.1 (1f0abe3c)
- 2025-09-06: mobile responsiveness improvements - responsive design, touch targets, typography (80fc8654)
- 2025-09-06: complete automated versioning system with user-friendly changelog and enhanced version badge (65a9105a)
- 2025-09-06: update Netlify configuration to serve from src/ directory and correct git hook paths (6c5bf0af)
