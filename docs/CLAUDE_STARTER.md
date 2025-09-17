# Match Locator (matchlocator.com) - Context for Claude

> Quick context file for Claude Code sessions on the Football TV Schedule project

## 🎯 Project Overview

I'm working on **Match Locator**, a comprehensive football TV schedule platform that helps UK viewers find where to watch matches across multiple competitions.

**Live Site:** https://matchlocator.com
**Admin Interface:** https://matchlocator.com/admin

## 📚 Essential Documentation

**Check latest docs at:**
- **Primary:** Local `/docs` folder in this repository
- **Backup:** https://github.com/pahamo/football-listings/tree/main/docs

### Quick Start for Claude Sessions
1. **[README.md](README.md)** - Project overview and quick start
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical patterns and code structure
3. **[STATUS.md](STATUS.md)** - Current project state and weekly focus
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Environment setup and troubleshooting

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Create React App
- CSS3 with responsive design
- React Router for routing

**Backend:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time database features
- Netlify Functions for admin operations

**Deployment:**
- Netlify hosting
- Automatic deployments from main branch
- Environment variables in Netlify dashboard

## 🎯 Current Focus

**[Add your session goal here]**

Examples:
- "Implementing new affiliate link tracking system"
- "Fixing timezone display issues in fixture cards"
- "Adding new competition (La Liga) to the platform"
- "Optimizing database queries for better performance"
- "Updating admin interface for better UX"

## 🏗️ Key Project Areas

### Core Features
- **Multi-Competition Coverage**: 9 European leagues (Premier League, Champions League, etc.)
- **TV Schedule Display**: Real-time broadcaster information (Sky Sports, TNT Sports, Amazon Prime)
- **Admin CMS**: Complete content management for fixtures and broadcasters
- **Interactive Features**: Champions League team vs team matrix
- **SEO Optimized**: Comprehensive organic search optimization

### Recent Major Updates
- ✅ Documentation consolidation (16+ files → 7 core files)
- ✅ Champions League interactive matrix implementation
- ✅ Affiliate platform readiness (FTC-compliant)
- ✅ Admin interface improvements with centralized logos
- ✅ Multi-competition expansion (9 leagues active)

## 🔧 Development Quick Reference

### Essential Commands
```bash
npm start                    # Development server
npm run build               # Production build
npm run type-check         # TypeScript verification
```

### Key Directories
```
src/
├── components/             # Reusable React components
├── pages/                 # Route-based page components
├── services/              # Supabase API integration
├── utils/                # Utilities (SEO, formatting, etc.)
└── types/                # TypeScript definitions

docs/                      # Documentation (consolidated)
scripts/                   # Data import and utility scripts
```

### Important Environment Variables
```bash
# Frontend (required)
REACT_APP_SUPABASE_URL=https://[project].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...

# Backend/Scripts (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

## 🚨 Critical Guidelines

### Data Visibility Rules
**❌ NEVER display on public pages:**
- Total fixture counts or internal statistics
- Broadcast assignment progress indicators
- Admin-only metrics or editorial workflow data

**✅ Admin-only information:**
- Competition statistics and completion rates
- Internal workflow and editorial data
- Data import/sync status

### TypeScript Property Guidelines
**✅ Always use correct property names:**
```typescript
fixture.kickoff_utc        // ✅ Correct (not utc_kickoff)
fixture.home_team          // ✅ For SimpleFixture
fixture.home.name          // ✅ For full Fixture objects
```

### Authentication Patterns
```typescript
// ❌ Wrong: Direct admin operations with anonymous key
await supabase.from('competitions').update({...});

// ✅ Right: Admin operations via Netlify Functions
await fetch('/.netlify/functions/admin-operation', {...});
```

## 📋 Common Tasks & Patterns

### Adding New Features
1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for patterns
2. Use existing component structure in `/src/components/`
3. Follow TypeScript interfaces in `/src/types/`
4. Test with both `npm start` and `npm run build`

### Database Operations
1. Public data: Use anonymous Supabase key
2. Admin operations: Use Netlify Functions with service role
3. Check [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) for procedures

### SEO & Content
1. Use utilities in `/src/utils/seo.ts`
2. Follow patterns in [MONETIZATION.md](MONETIZATION.md)
3. Ensure mobile-first responsive design

## 🔍 Troubleshooting Quick Fixes

### Common Issues
- **Missing fixtures**: Check environment variables and database connection
- **TypeScript errors**: Run `npm run type-check` and fix property names
- **Admin 401 errors**: Ensure using Netlify Functions for admin operations
- **Build failures**: Check for missing dependencies or TypeScript errors

### Debug Commands
```bash
# Check environment
env | grep REACT_APP

# TypeScript check
npm run type-check

# Test production build
npm run build

# Check database connection
node -e "console.log(process.env.REACT_APP_SUPABASE_URL)"
```

## 💡 Session Starter Checklist

Before starting work:
- [ ] Read current **[STATUS.md](STATUS.md)** for this week's focus
- [ ] Check **[CHANGELOG.md](CHANGELOG.md)** for recent changes
- [ ] Verify development server runs: `npm start`
- [ ] Confirm TypeScript compiles: `npm run type-check`

For admin work:
- [ ] Check **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** for admin patterns
- [ ] Verify admin access works at `/admin`
- [ ] Review data visibility guidelines

For database work:
- [ ] Check **[DATA_MANAGEMENT.md](DATA_MANAGEMENT.md)** for procedures
- [ ] Verify environment variables are set
- [ ] Test database connection

## 📞 Emergency Reference

**If something breaks:**
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Verify environment variables in Netlify dashboard
3. Check Git history for recent changes
4. Review browser console for errors
5. Test with clean `npm install` and restart

**Key URLs:**
- **Production**: https://matchlocator.com
- **Admin**: https://matchlocator.com/admin
- **Netlify Dashboard**: [Check Netlify for deployments]
- **Supabase Dashboard**: [Check Supabase for database]

---

**Last Updated:** September 17, 2025
**Current Version:** 2.1.0
**Next Update:** Update this file with your session focus!