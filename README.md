# Football TV Schedule

> The UK's comprehensive football TV schedule covering Premier League, Champions League, and 9 major European competitions

## 🏆 Project Overview

**Football TV Schedule** is a React TypeScript application that provides UK viewers with a comprehensive football TV schedule across multiple competitions. The platform offers real-time broadcaster information, interactive team matrices, and administrative tools for content management.

**Live Site:** https://matchlocator.com
**Admin Access:** https://matchlocator.com/admin

### Key Features

- **Multi-Competition Coverage:** 9 European leagues including Premier League, Champions League, Bundesliga, La Liga, Serie A, Ligue 1, and more
- **Real-Time TV Schedules:** Up-to-date broadcaster information (Sky Sports, TNT Sports, Amazon Prime, BBC)
- **Interactive Features:** Champions League team vs team matrix, competition filtering, team-specific fixture views
- **Mobile-First Design:** Responsive interface optimized for all devices
- **Admin CMS:** Complete content management system for fixtures and broadcaster assignments
- **SEO Optimized:** Comprehensive SEO implementation for organic traffic growth

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd pl_tv_mvp_spa
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm start
   # Opens http://localhost:3000
   ```

### ⚠️ Environment Variables
**CRITICAL:** Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete environment setup instructions, especially for production vs. local configuration.

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── admin/          # Admin-specific components
│   ├── affiliate/      # Affiliate marketing components
│   └── design-system/  # Design system components
├── pages/              # Route-based page components
│   ├── admin/          # Admin interface pages
│   ├── legal/          # Legal and compliance pages
│   └── competitions/   # Competition-specific pages
├── services/           # Data layer and API services
│   ├── supabase.ts     # Main Supabase client
│   └── supabase-simple.ts # Simplified queries
├── utils/              # Utility functions (SEO, formatting, etc.)
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for client-side routing
- **CSS3** with CSS Grid and Flexbox
- **Responsive design** with mobile-first approach

### Backend & Data
- **Supabase** for database and real-time features
- **PostgreSQL** database with views and functions
- **Row Level Security** for admin access control

### Development & Deployment
- **Create React App** build system
- **TypeScript 5.3** for type safety
- **ESLint** and **Prettier** for code quality
- **npm** package management

## 📚 Documentation

| Document | Purpose | Quick Reference |
|----------|---------|-----------------|
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Technical architecture, patterns, types | Code patterns, component structure |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Environment setup, deployment guide | Environment variables, build process |
| **[DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md)** | Database management, imports | Data imports, team management |
| **[ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)** | Admin interface documentation | Admin features, content management |
| **[MONETIZATION.md](docs/MONETIZATION.md)** | SEO strategy, affiliate marketing | SEO implementation, affiliate setup |
| **[CHANGELOG.md](docs/CHANGELOG.md)** | Version history and updates | Recent changes, release notes |

### 🔍 For New Developers
1. **Start here:** [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical overview
2. **Setup:** [DEPLOYMENT.md](docs/DEPLOYMENT.md) for environment configuration
3. **Data:** [DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md) for database understanding

### 🤖 For AI Agents
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Code patterns and conventions
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - ⚠️ **CRITICAL:** Environment setup requirements
- **[docs/docs-map.md](docs/docs-map.md)** - Documentation structure reference

## 🎯 Current Status: Production Ready ✅

### Latest Major Updates (September 2025)

#### **Champions League Matrix Feature**
- ✅ Interactive team vs team grid showing head-to-head matchups
- ✅ Hover effects and click-to-collapse functionality
- ✅ Sticky column headers for better navigation
- ✅ Animated transitions with team filtering

#### **Affiliate Platform Readiness**
- ✅ FTC-compliant affiliate disclosure pages
- ✅ Editorial guidelines and transparency documentation
- ✅ Professional contact information and business details
- ✅ Affiliate link components with proper tracking

#### **Multi-Competition Platform**
- ✅ **9 European leagues active:** Premier League, Champions League, Bundesliga, La Liga, Serie A, Ligue 1, Primeira Liga, Eredivisie, Championship
- ✅ **Dynamic competition loading:** Database-driven architecture for automatic scalability
- ✅ **Competition-specific pages:** Dedicated dashboards at `/competitions/[slug]`
- ✅ **Enhanced navigation:** Dropdown menu with competition filtering

#### **Admin CMS Improvements**
- ✅ **Broadcaster editing overhaul:** Bulk operations, optimistic updates, no page reloads
- ✅ **Competition management:** Centralized logos, fixture counts, short names display
- ✅ **Real-time feedback:** Loading states, save confirmations, pending changes tracking

#### **SEO & Performance**
- ✅ **Comprehensive SEO implementation:** Meta tags, structured data, sitemaps
- ✅ **Core Web Vitals optimized:** Fast loading times and mobile performance
- ✅ **Security updates:** Zero vulnerabilities, updated dependencies

### Competition Coverage

| Competition | Teams | Features |
|-------------|-------|----------|
| **Premier League** | 20 teams | Matchweeks, full season coverage |
| **Champions League** | 32 teams | Interactive team matrix, group stages |
| **Bundesliga** | 18 teams | German club coverage |
| **La Liga** | 20 teams | Spanish league fixtures |
| **Serie A** | 20 teams | Italian football |
| **Ligue 1** | 18 teams | French league |
| **Plus 3 more** | 50+ teams | Primeira Liga, Eredivisie, Championship |

**Total:** 177+ teams across 9 competitions

## 🔐 Admin Features

### Content Management
- **Fixture Management:** Bulk import, edit, and broadcaster assignment
- **Team Management:** Team information, logos, and short names
- **Competition Management:** Season setup, matchweek configuration
- **Broadcaster Assignment:** Sky Sports, TNT Sports, Amazon Prime, BBC integration

### Analytics & Monitoring
- **Performance Metrics:** Page views, user engagement (admin-only)
- **Content Statistics:** Fixture counts, broadcast coverage (admin-only)
- **SEO Monitoring:** Search performance tracking

### Access Control
- **Role-based access:** Admin-only areas with Supabase RLS
- **Secure authentication:** Protected admin routes

## 🚨 Important Guidelines

### **Public vs Admin Data Visibility**

**❌ Public website must NOT display:**
- Total fixture counts or internal statistics
- Broadcast assignment progress indicators
- Blackout game counts or editorial metrics
- Any data revealing incomplete coverage

**✅ Admin-only information:**
- Competition statistics and completion rates
- Internal workflow and editorial data
- Broadcast assignment progress
- Content management metrics

### **Current Season Information**
- **Season:** 2025-26
- **Teams:** All major European clubs across 9 competitions
- **Broadcast Partners:** Sky Sports, TNT Sports, Amazon Prime Video, BBC

## 🛠️ Development Commands

```bash
# Development
npm start              # Start development server
npm test              # Run test suite
npm run build         # Production build
npm run lint          # Code linting
npm run type-check    # TypeScript checking

# Deployment
npm run build         # Build for production
npm run serve         # Serve production build locally
```

## 🔧 Troubleshooting

### Common Issues
1. **Missing fixtures:** Check environment variables and database connection
2. **Admin access:** Verify Supabase RLS policies and user permissions
3. **Build errors:** Check TypeScript configuration and dependency versions

### Getting Help
- **Technical issues:** Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) troubleshooting section
- **Environment setup:** See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete configuration
- **Data issues:** Refer to [DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md) for database procedures

## 📈 Performance & SEO

- **Google PageSpeed Score:** 90+ (mobile and desktop)
- **Core Web Vitals:** All metrics pass Google thresholds
- **SEO Coverage:** 200+ indexed pages with structured data
- **Mobile Optimization:** Mobile-first responsive design
- **Accessibility:** WCAG 2.1 compliant

## 🔮 Future Roadmap

### Planned Features
- **Additional Competitions:** Championship and lower league coverage
- **International Tournaments:** World Cup, Euros seasonal coverage
- **Women's Football:** WSL and international women's competitions
- **Enhanced Personalization:** User preferences and team following

### Technical Improvements
- **Progressive Web App (PWA):** Offline functionality and app-like experience
- **API Development:** Public API for third-party integrations
- **Performance Optimization:** Advanced caching and service workers

---

**Last Updated:** September 17, 2025
**Version:** 2.1.0
**Contributors:** Patrick Hallett-Morley

*For detailed technical documentation, see the [docs/](docs/) directory. For version history, see [CHANGELOG.md](docs/CHANGELOG.md).*