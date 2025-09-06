# Changelog

## [1.1.0] - 2025-09-06

### ✨ Features
- complete automated versioning system with user-friendly changelog and enhanced version badge (65a9105a)

---


## [1.0.1] - 2025-09-06

### 🐛 Bug Fixes
- update Netlify configuration to serve from src/ directory and correct git hook paths (6c5bf0af)

---


All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-01-09

### ✨ Features
- **Broadcaster Integration**: Full integration with Supabase `broadcasts_uk` table showing Sky Sports, TNT Sports, and other UK broadcasters
- **3pm Saturday Blackout**: Proper blackout indicators for games not available on UK TV (3pm Saturday restrictions)
- **iOS-Inspired Theme**: New "Pixel" theme with glassmorphism effects, backdrop blur, and smooth animations
- **Timezone Correction**: Fixed timezone handling - matches now display correct UK local times

### 🎨 UI Improvements
- **Broadcaster Colors**: TNT Sports (red), Sky Sports (blue), Blackout (black) with brand-appropriate styling
- **Navigation States**: Active page properly highlighted in navigation, inactive pages show as secondary
- **Filter Visibility**: Filters only appear on fixtures page, hidden on home/match/clubs pages for cleaner UI
- **Match Detail Pages**: Comprehensive broadcaster information with channel details, stream types, and verification status
- **Blackout Messaging**: Clear explanation that blackout games are "Not available on UK TV (3pm Saturday blackout)"

### ⚡ Technical Improvements
- Updated all fixture queries to include broadcast data via LEFT JOIN with providers table
- Added `renderBroadcastInfo()` for fixture cards and `renderMatchBroadcastInfo()` for match pages
- Centralized UI state management with `updateNavigationActiveStates()` and `updateFiltersVisibility()`
- Fixed timezone conversion in `import-fixtures.js` to properly handle UK local time → UTC
- Theme system with CSS custom properties and utility classes for consistent styling

### 🐛 Bug Fixes
- **Critical Timezone Fix**: Games were showing 1 hour early due to improper UK time handling
- Navigation buttons incorrectly staying active when on different pages
- Filter controls appearing on all pages instead of just fixtures view
- Blackout styling and messaging was unclear about 3pm game restrictions

### 📊 Database Schema Updates
- Utilizes `broadcasts_uk` table linked to fixtures via `fixture_id`
- Integrates with `providers` table for broadcaster display names
- Supports multiple broadcasters per fixture with channel names and verification status

---

## [2.0.0] - 2025-01-08

### ✨ Features  
- Major frontend modernization with gradients and smooth animations
- Club crests and team branding integration
- Matchweek grouping with improved filtering system
- Responsive design with mobile-first approach

### 🎨 UI Improvements
- Modern glassmorphism design with subtle gradients
- Hover animations and smooth transitions
- Improved contrast and accessibility
- Team crest integration with fallbacks

### ⚡ Technical Improvements
- Single Page Application (SPA) routing with History API
- Lazy loading for better performance
- Design system with CSS custom properties
- Theme switching functionality

---

## [1.0.0] - 2024-12-XX

### ✨ Initial Release
- Basic fixture listing from Supabase
- Premier League team data
- Simple responsive design
- Netlify deployment setup
