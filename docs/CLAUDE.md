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