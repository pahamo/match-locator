# Deployment & Environment Guide

> Complete guide for development environment setup, build processes, and production deployment

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Development Workflow](#development-workflow)
4. [Build & Deployment](#build--deployment)
5. [Troubleshooting](#troubleshooting)
6. [Production Monitoring](#production-monitoring)

---

## Quick Start

### Prerequisites

**Required Software:**
- **Node.js 18+ LTS** (check `.nvmrc` for exact version)
- **npm** (comes with Node.js)
- **Git** for version control
- **Supabase account** for database access

**Recommended Tools:**
- Visual Studio Code with TypeScript extension
- React Developer Tools browser extension
- Supabase CLI (optional, for advanced database operations)

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd pl_tv_mvp_spa

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# 4. Start development server
npm start
# → Opens http://localhost:3000

# 5. Verify setup
npm run type-check    # TypeScript verification
npm run build        # Test production build
```

---

## Environment Variables

### 🚨 CRITICAL: Production vs Development

**❌ NEVER debug production issues using local .env files!**

- **Production variables**: Configured in **Netlify Dashboard** only
- **Local variables**: In your local `.env` file (git-ignored)
- **Template**: Use `.env.example` as reference

### Production Environment (Netlify)

**Location:** https://app.netlify.com → Site Settings → Environment Variables

**Why Netlify?** Environment variables are injected at build time and runtime, separate from your local development environment.

### Local Development Environment

**Setup:**
```bash
# Copy template and customize
cp .env.example .env
# Edit .env with your local Supabase project credentials
```

**Security:** `.env` is git-ignored and should never be committed.

### Required Variables

#### Frontend Variables (Public - REACT_APP_*)

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://[your-project].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...    # Public anonymous key

# Site Configuration
REACT_APP_CANONICAL_BASE=https://matchlocator.com

# Optional Admin Configuration
ADMIN_USERNAME=admin                        # Admin login username
ADMIN_PASSWORD=your-secure-password         # Admin login password
```

#### Backend/Script Variables (Private)

```bash
# Supabase Service Access
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...           # Service role key (SECRET!)

# External API Keys
FOOTBALL_DATA_TOKEN=your-api-token         # Football-Data.org API key

# Database Configuration
COMP_ID_DB=1                               # Premier League ID in database
COMP_ID_API=2021                          # Premier League ID in external API
SEASON=2025                               # Current season year
```

### Environment Setup Checklist

#### ✅ Local Development Setup
- [ ] Copied `.env.example` to `.env`
- [ ] Added Supabase URL and anon key
- [ ] Added service role key for scripts
- [ ] Added external API keys if needed
- [ ] Tested `npm start` without errors
- [ ] Verified `.env` is not committed to git

#### ✅ Production Setup (Netlify)
- [ ] All variables added to Netlify dashboard
- [ ] Variable names match exactly (case-sensitive)
- [ ] Values are correct (no extra spaces/quotes)
- [ ] Redeployed after variable changes
- [ ] Tested production build works

---

## Development Workflow

### Daily Development

```bash
# Start development server
npm start                    # Starts on http://localhost:3000

# Development checks
npm run type-check          # TypeScript verification
npm run lint               # Code quality checks
npm test                   # Run test suite (if available)

# Production readiness
npm run build              # Test production build
npm run serve              # Serve production build locally
```

### Code Quality Commands

```bash
# TypeScript checking
npx tsc --noEmit           # Full TypeScript check
npm run type-check         # Same as above (if configured)

# Linting and formatting
npm run lint               # ESLint checking
npm run lint:fix           # Auto-fix linting issues
npm run format             # Prettier formatting (if configured)
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/your-feature-name
# Make changes
npm run type-check         # Verify TypeScript
npm run build             # Test production build
git add .
git commit -m "feat: descriptive commit message"

# Pre-deployment checks
npm run build             # Final production build test
git push origin feature/your-feature-name
# Create pull request for review
```

### Development Best Practices

1. **Test Early, Test Often**
   - Run `npm start` after each change
   - Check browser console for errors
   - Test both desktop and mobile views

2. **TypeScript Compliance**
   - Fix TypeScript errors immediately
   - Use proper type definitions
   - Avoid `any` types

3. **Component Isolation**
   - Test components individually
   - Use Storybook or similar for component development
   - Make small, incremental changes

4. **Database Integration**
   - Test with realistic data volumes
   - Handle loading and error states
   - Use proper database views for complex queries

---

## Build & Deployment

### Build Process

**Local Build Testing:**
```bash
# Clean build
rm -rf build/
npm run build

# Verify build output
ls -la build/
npm run serve        # Test built version locally
```

**Build Configuration:**
- **Tool:** Create React App (CRA)
- **Output:** Static files in `build/` directory
- **Optimization:** Automatic minification, code splitting, asset optimization
- **TypeScript:** Compiled to JavaScript with type checking

### Deployment Pipeline

**Platform:** Netlify with continuous deployment

**Automatic Deployment:**
1. **Trigger:** Push to `main` branch
2. **Build:** Netlify runs `npm run build`
3. **Deploy:** Atomic deployment to production
4. **Rollback:** Previous version available for instant rollback

**Manual Deployment:**
```bash
# Option 1: Push to main branch
git push origin main

# Option 2: Netlify CLI (if installed)
netlify deploy --prod --dir=build

# Option 3: Drag and drop to Netlify dashboard
npm run build
# Upload build/ folder to Netlify dashboard
```

### Build Configuration (Netlify)

**Build Settings:**
```toml
# netlify.toml (if using)
[build]
  command = "CI= npm run build"
  publish = "build/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables:** Set in Netlify Dashboard
**Build Time:** ~2-3 minutes for full build
**Deploy Time:** ~30 seconds for static assets

### Production URLs

- **Live Site:** https://matchlocator.com
- **Admin Access:** https://matchlocator.com/admin
- **Netlify Dashboard:** https://app.netlify.com

---

## Troubleshooting

### Common Environment Issues

#### ❌ "No API key found" Error

**Symptoms:** API calls failing, empty data on pages
**Diagnosis:**
```bash
# Check if variables are loaded (in browser console)
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);
```

**Solutions:**
1. **Local Development:**
   ```bash
   # Check .env file exists and has values
   ls -la .env
   cat .env | grep REACT_APP
   # Restart development server
   npm start
   ```

2. **Production:**
   - Check Netlify environment variables are set correctly
   - Variable names must match exactly (case-sensitive)
   - Redeploy after changing variables
   - Check build logs for variable-related errors

#### ❌ Build Failures

**TypeScript Errors:**
```bash
# Check TypeScript compilation
npm run type-check
# Fix errors before deployment
```

**Missing Dependencies:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variable Issues:**
- Ensure all `REACT_APP_*` variables are set in Netlify
- Check for typos in variable names
- Verify no extra spaces or quotes in values

#### ❌ Local Development Issues

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
# Or use different port
PORT=3001 npm start
```

**Database Connection Issues:**
```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
console.log('Supabase client created successfully');
"
```

**Permission Issues (macOS/Linux):**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
# Or use nvm for Node.js version management
```

### Performance Issues

#### Slow Build Times
1. **Clear npm cache:** `npm cache clean --force`
2. **Update dependencies:** `npm update`
3. **Check disk space:** Ensure sufficient storage
4. **Use faster hardware:** SSD recommended for Node.js builds

#### Slow Page Loading
1. **Check network requests** in browser dev tools
2. **Verify database queries** are optimized
3. **Use React DevTools Profiler** to identify bottlenecks
4. **Check Supabase connection pooling** settings

### Database Issues

#### Missing Fixtures/Data
```bash
# Check database views exist
# In Supabase SQL Editor:
SELECT * FROM fixtures_with_teams LIMIT 5;
SELECT * FROM simple_fixtures_view LIMIT 5;

# Check RLS policies
SELECT * FROM auth.policies;
```

#### Timezone Issues
- All dates should be stored as UTC in database
- Use `formatDynamicDate()` utility for display
- Check `kickoff_utc` vs `utc_kickoff` property names

### Debug Techniques

#### Browser Development
```javascript
// In browser console
// Check environment variables
console.log(process.env);

// Test API calls
fetch('/api/test-endpoint').then(r => r.json()).then(console.log);

// Check React component state
// Use React DevTools extension
```

#### Network Debugging
```javascript
// Add to component for debugging
useEffect(() => {
  console.log('API call started');
  fetchData()
    .then(data => console.log('API response:', data))
    .catch(err => console.error('API error:', err));
}, []);
```

#### Build Debugging
```bash
# Verbose build output
CI= npm run build --verbose

# Check build bundle size
npm run build
du -sh build/static/js/*
du -sh build/static/css/*
```

---

## Production Monitoring

### Health Checks

**Daily Monitoring:**
- [ ] Site loads correctly: https://matchlocator.com
- [ ] Admin access works: https://matchlocator.com/admin
- [ ] Fixtures display current data
- [ ] No console errors in browser
- [ ] Page load times under 3 seconds

**Weekly Monitoring:**
- [ ] Check Netlify build logs for warnings
- [ ] Review Supabase database performance
- [ ] Monitor error rates and user feedback
- [ ] Check SEO performance and rankings

### Performance Metrics

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Tools for Monitoring:**
- Google PageSpeed Insights
- Lighthouse (built into Chrome DevTools)
- Netlify Analytics
- Supabase Dashboard metrics

### Deployment Best Practices

#### Pre-deployment Checklist
- [ ] All tests pass locally
- [ ] TypeScript compilation successful
- [ ] Production build works locally
- [ ] Environment variables configured
- [ ] Database migrations applied (if any)
- [ ] No console errors or warnings

#### Post-deployment Verification
- [ ] Site loads correctly
- [ ] All major features functional
- [ ] Admin access works
- [ ] No broken links or 404 errors
- [ ] Mobile and desktop views working
- [ ] Performance metrics within targets

#### Rollback Procedure
1. **Immediate:** Use Netlify dashboard to rollback to previous deployment
2. **Git-based:** Revert commits and redeploy
3. **Emergency:** Contact Netlify support for assistance

---

## Quick Reference

### Essential Commands
```bash
# Development
npm start                    # Start dev server
npm run type-check          # TypeScript check
npm run build              # Production build

# Debugging
npm start --verbose        # Verbose dev server
node -e "console.log(process.env)" # Check env vars
lsof -ti:3000             # Check port 3000 usage
```

### Key Files & Locations
```
.env                       # Local environment variables (git-ignored)
.env.example              # Environment template (committed)
package.json              # Dependencies and scripts
tsconfig.json             # TypeScript configuration
build/                    # Production build output (generated)
public/                   # Static assets
src/                      # Source code
netlify.toml              # Netlify configuration (optional)
```

### Emergency Contacts
- **Technical Issues:** Check GitHub issues or create new issue
- **Hosting Issues:** Netlify support dashboard
- **Database Issues:** Supabase support dashboard
- **Domain Issues:** DNS provider support

---

**Last Updated:** September 17, 2025
**Related Documentation:** [ARCHITECTURE.md](ARCHITECTURE.md), [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md)