/**
 * ================================================
 * Premier League TV Listings - Configuration
 * ================================================
 * Application constants and competition configurations
 */

/** Application version */
export const APP_VERSION = "v1.5.2";

/** Default timezone and locale settings */
export const DEFAULT_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London';
export const LOCALE = 'en-GB';

/** Multi-Competition Configuration */
export const COMPETITIONS = {
  'premier-league': {
    id: 1,
    name: 'Premier League',
    shortName: 'EPL',
    slug: 'premier-league',
    country: 'England',
    countryCode: 'ENG',
    timezone: 'Europe/London',
    locale: 'en-GB',
    totalRounds: 38,
    totalTeams: 20,
    colors: {
      primary: '#38003c',
      secondary: '#00ff87'
    },
    isDefault: true,
    isActive: true
  },
  'bundesliga': {
    id: 2,
    name: 'Bundesliga',
    shortName: 'BL1',
    slug: 'bundesliga', 
    country: 'Germany',
    countryCode: 'GER',
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    totalRounds: 34,
    totalTeams: 18,
    colors: {
      primary: '#d20515',
      secondary: '#ffcc02'
    },
    isDefault: false,
    isActive: true
  },
  'la-liga': {
    id: 3,
    name: 'La Liga',
    shortName: 'LL',
    slug: 'la-liga',
    country: 'Spain', 
    countryCode: 'ESP',
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    totalRounds: 38,
    totalTeams: 20,
    colors: {
      primary: '#ee8707',
      secondary: '#004c99'
    },
    isDefault: false,
    isActive: true
  },
  'serie-a': {
    id: 4,
    name: 'Serie A',
    shortName: 'SA',
    slug: 'serie-a',
    country: 'Italy',
    countryCode: 'ITA',
    timezone: 'Europe/Rome',
    locale: 'it-IT',
    totalRounds: 38,
    totalTeams: 20,
    colors: {
      primary: '#004da0',
      secondary: '#009639'
    },
    isDefault: false,
    isActive: true
  },
  'ligue-1': {
    id: 5,
    name: 'Ligue 1',
    shortName: 'L1',
    slug: 'ligue-1',
    country: 'France',
    countryCode: 'FRA',
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    totalRounds: 34,
    totalTeams: 18,
    colors: {
      primary: '#dae025',
      secondary: '#00387b'
    },
    isDefault: false,
    isActive: true
  }
};

/** Supabase Configuration */
export const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

/** URL and Navigation Settings */
export const URL_CONFIG = {
  baseUrl: 'https://fixtures.app',
  siteName: 'fixtures.app'
};

/** Cache and Performance Settings */
export const CACHE_CONFIG = {
  maxAge: 300000, // 5 minutes
  staleWhileRevalidate: 600000 // 10 minutes
};