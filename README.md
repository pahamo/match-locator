# Match Locator - UK Football TV Schedule

## Overview
React + TypeScript application providing UK Premier League and Champions League TV schedules. 

**Live Site**: https://matchlocator.com

## Quick Start

### Development
```bash
npm install
npm start
# Opens at http://localhost:3000
```

### Environment Variables
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin functions
REACT_APP_CANONICAL_BASE=https://matchlocator.com
```

### Build & Deploy
```bash
npm run build    # Production build
```

Deployed on Netlify with automatic builds from main branch.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Authentication**: Custom admin system

## Key Features
- ✅ Premier League & Champions League fixtures
- ✅ TV broadcaster assignments with admin interface
- ✅ Competition visibility controls
- ✅ SEO optimized with sitemaps
- ✅ Responsive design with team pages
- ✅ Production authentication for admin

## Project Structure
```
src/
├── components/     # Reusable React components
├── pages/         # Route components (Home, Admin, Match, Club)
├── services/      # Supabase API integration
├── utils/         # SEO, team names, utilities
└── types/         # TypeScript definitions

netlify/
└── functions/     # Server-side admin API endpoints
```

## Documentation

### Essential Docs (in /docs)
- **[Development Guide](docs/development.md)** - Setup, architecture, guidelines
- **[Admin Features](docs/admin-features.md)** - Admin interface documentation
- **[SEO Guide](docs/seo.md)** - SEO implementation and monitoring
- **[Agent Handoff](docs/agents.md)** - AI coding agent reference

### Technical Reference
- **[Authentication Fix](docs/authentication-fix.md)** - Recent technical architecture changes
- **[Migration Guide](docs/migration.md)** - Project overview and key patterns

## Admin Access
Visit `/admin` on production - requires login credentials.

## Support
For technical issues or deployment questions, see the documentation in `/docs/`.

---

**Status**: ✅ Production Ready - Live at https://matchlocator.com