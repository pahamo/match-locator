# Data Import Scripts

This directory contains scripts for importing football data from external APIs into our Supabase database.

## Script Categories

### Core Import Scripts
- `importers/` - Main data import scripts for different competitions
- `utils/` - Shared utilities and helper functions
- `config/` - Competition configurations and mappings

### Maintenance Scripts
- `maintenance/` - Database maintenance and cleanup scripts
- `verification/` - Data verification and validation scripts

### Automation
- `generate_sitemaps.mjs` - SEO sitemap generation

## Usage

### Environment Setup
Ensure your `.env` file contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FOOTBALL_DATA_API_KEY=your_football_data_api_key
```

### Importing Competition Data
```bash
# Premier League (fixtures + teams)
npm run import:premier-league

# Champions League (when available)
npm run import:champions-league

# Backfill team metadata
npm run teams:backfill

# Generate sitemaps
npm run generate:sitemaps
```

## Supported Competitions

### Current (Free Tier)
- **Premier League** (PL) - Competition ID: 1
- **Champions League** (CL) - Competition ID: 2

### Future Expansion (Paid Tier)
- **Bundesliga** (BL1)
- **La Liga** (PD)
- **Serie A** (SA)
- **Ligue 1** (FL1)
- **Europa League** (EL)

## Architecture

The import system is designed to be:
- **Modular** - Each competition has its own importer
- **Configurable** - Easy to add new competitions
- **Fault-tolerant** - Handles API errors and rate limits
- **Idempotent** - Safe to run multiple times