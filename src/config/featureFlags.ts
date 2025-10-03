/**
 * Enhanced Feature Flags for API Migration and Data-Dependent Features
 *
 * Hierarchical system:
 * - Master switches control API sources
 * - Child flags control features that depend on specific API data
 * - Automatic rollback capability through environment variables
 */

import React from 'react';

export interface FeatureFlags {
  // API Source Control (Master Switches)
  dataSources: {
    useSoccersAPI: boolean;           // Master switch for SoccersAPI (DEPRECATED)
    soccersAPITestMode: boolean;      // Log only, don't update DB
    enableAPIComparison: boolean;     // Run both APIs in parallel for testing
    useSportMonks: boolean;           // Master switch for Sports Monks API ⭐ NEW
    sportMonksTestMode: boolean;      // Log only, don't update DB ⭐ NEW
  };

  // Features dependent on SoccersAPI data (auto-disabled if API switched off)
  soccersAPIFeatures: {
    showEnhancedBroadcasts: boolean;     // Multiple broadcasters per match
    showStreamingOptions: boolean;       // Streaming vs TV distinction
    showInternationalBroadcasts: boolean; // Non-UK broadcasts
    showBroadcastLogos: boolean;         // Channel logos
    showKickoffCountdown: boolean;       // Enhanced countdown timer
    showOddsIntegration: boolean;        // Betting odds (if available)
    showDetailedStats: boolean;          // Advanced match statistics
    showLineups: boolean;                // Team lineups when available
    showRealTimeUpdates: boolean;        // Live score updates
    showVenueDetails: boolean;           // Stadium info and weather
  };

  // Sports Monks API Features ⭐ NEW
  sportMonksFeatures: {
    enableSync: boolean;                 // Master sync toggle
    syncCompetitions: number[];          // Competition IDs to sync
    showLiveScores: boolean;             // Live match scores
    showLineups: boolean;                // Team lineups
    showMatchStats: boolean;             // Match statistics
    showH2HData: boolean;                // Enhanced H2H data
    showTVStations: boolean;             // Automated TV broadcast info
  };

  // General features (independent of API source)
  generalFeatures: {
    showH2HStats: boolean;
    showH2HPastResults: boolean;
    showMatchScores: boolean;
    showGoalStats: boolean;
  };
}

/**
 * Load feature flags from environment variables for deployment control
 */
const loadFeatureFlags = (): FeatureFlags => {
  const getEnvFlag = (name: string, defaultValue: boolean = false): boolean => {
    const envVar = process.env[`REACT_APP_FF_${name}`];
    return envVar ? envVar.toLowerCase() === 'true' : defaultValue;
  };

  const getEnvArray = (name: string, defaultValue: number[] = []): number[] => {
    const envVar = process.env[`REACT_APP_FF_${name}`];
    if (!envVar) return defaultValue;
    return envVar.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
  };

  const useSoccersAPI = getEnvFlag('USE_SOCCERSAPI', false);
  const useSportMonks = getEnvFlag('USE_SPORTMONKS', false);

  return {
    dataSources: {
      useSoccersAPI,
      soccersAPITestMode: getEnvFlag('SOCCERSAPI_TEST_MODE', false),
      enableAPIComparison: getEnvFlag('ENABLE_API_COMPARISON', false),
      useSportMonks,
      sportMonksTestMode: getEnvFlag('SPORTMONKS_TEST_MODE', false),
    },
    soccersAPIFeatures: {
      // Only enable if parent API is enabled
      showEnhancedBroadcasts: useSoccersAPI && getEnvFlag('ENHANCED_BROADCASTS', false),
      showStreamingOptions: useSoccersAPI && getEnvFlag('STREAMING_OPTIONS', false),
      showInternationalBroadcasts: useSoccersAPI && getEnvFlag('INTERNATIONAL_BROADCASTS', false),
      showBroadcastLogos: useSoccersAPI && getEnvFlag('BROADCAST_LOGOS', false),
      showKickoffCountdown: useSoccersAPI && getEnvFlag('KICKOFF_COUNTDOWN', false),
      showOddsIntegration: useSoccersAPI && getEnvFlag('ODDS_INTEGRATION', false),
      showDetailedStats: useSoccersAPI && getEnvFlag('DETAILED_STATS', false),
      showLineups: useSoccersAPI && getEnvFlag('LINEUPS', false),
      showRealTimeUpdates: useSoccersAPI && getEnvFlag('REALTIME_UPDATES', false),
      showVenueDetails: useSoccersAPI && getEnvFlag('VENUE_DETAILS', false),
    },
    sportMonksFeatures: {
      // Only enable if Sports Monks API is enabled
      enableSync: useSportMonks && getEnvFlag('SPORTMONKS_ENABLE_SYNC', false),
      syncCompetitions: useSportMonks ? getEnvArray('SPORTMONKS_SYNC_COMPETITIONS', []) : [],
      showLiveScores: useSportMonks && getEnvFlag('SPORTMONKS_LIVE_SCORES', false),
      showLineups: useSportMonks && getEnvFlag('SPORTMONKS_LINEUPS', false),
      showMatchStats: useSportMonks && getEnvFlag('SPORTMONKS_MATCH_STATS', false),
      showH2HData: useSportMonks && getEnvFlag('SPORTMONKS_H2H_DATA', false),
      showTVStations: useSportMonks && getEnvFlag('SPORTMONKS_TV_STATIONS', false),
    },
    generalFeatures: {
      // These work regardless of API source
      showH2HStats: getEnvFlag('H2H_STATS', false),
      showH2HPastResults: getEnvFlag('H2H_PAST_RESULTS', false),
      showMatchScores: getEnvFlag('MATCH_SCORES', false),
      showGoalStats: getEnvFlag('GOAL_STATS', false),
    }
  };
};

// Feature flags configuration - loaded from environment
export const FEATURE_FLAGS: FeatureFlags = loadFeatureFlags();

/**
 * Check if a feature is enabled with hierarchical support
 */
export const isFeatureEnabled = (featurePath: string): boolean => {
  const parts = featurePath.split('.');

  if (parts.length === 1) {
    // Legacy single-level feature check
    const [category] = parts;
    return (FEATURE_FLAGS as any)[category] || false;
  }

  if (parts.length === 2) {
    const [category, feature] = parts;
    const categoryFlags = (FEATURE_FLAGS as any)[category];

    if (!categoryFlags) return false;

    // For SoccersAPI features, also check if the API is enabled
    if (category === 'soccersAPIFeatures') {
      return FEATURE_FLAGS.dataSources.useSoccersAPI && categoryFlags[feature];
    }

    // For Sports Monks features, also check if the API is enabled
    if (category === 'sportMonksFeatures') {
      return FEATURE_FLAGS.dataSources.useSportMonks && categoryFlags[feature];
    }

    return categoryFlags[feature] || false;
  }

  return false;
};

/**
 * Legacy support: Check if old-style feature is enabled
 */
export const isLegacyFeatureEnabled = (feature: string): boolean => {
  // Map old features to new structure
  const legacyMappings: Record<string, string> = {
    'showH2HStats': 'generalFeatures.showH2HStats',
    'showH2HPastResults': 'generalFeatures.showH2HPastResults',
    'showMatchScores': 'generalFeatures.showMatchScores',
    'showGoalStats': 'generalFeatures.showGoalStats',
  };

  return isFeatureEnabled(legacyMappings[feature] || feature);
};

/**
 * Enhanced wrapper component for feature-flagged content
 */
interface SmartFeatureFlagProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SmartFeatureFlag: React.FC<SmartFeatureFlagProps> = ({
  feature,
  children,
  fallback = null
}) => {
  if (isFeatureEnabled(feature)) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
};

/**
 * Legacy FeatureFlag component - maintained for backward compatibility
 */
interface FeatureFlagProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ feature, children, fallback = null }) => {
  if (isLegacyFeatureEnabled(feature)) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
};

/**
 * Get current API source for debugging
 */
export const getCurrentAPISource = (): 'football-data' | 'soccersapi' | 'sportmonks' => {
  if (FEATURE_FLAGS.dataSources.useSportMonks) return 'sportmonks';
  if (FEATURE_FLAGS.dataSources.useSoccersAPI) return 'soccersapi';
  return 'football-data';
};

/**
 * Check if we're in test mode (logging but not modifying data)
 */
export const isTestMode = (): boolean => {
  return FEATURE_FLAGS.dataSources.soccersAPITestMode || FEATURE_FLAGS.dataSources.sportMonksTestMode;
};

/**
 * Check if API comparison mode is enabled
 */
export const isComparisonMode = (): boolean => {
  return FEATURE_FLAGS.dataSources.enableAPIComparison;
};

/**
 * Sports Monks Helper Functions
 */

/**
 * Check if Sports Monks sync is enabled
 */
export const isSportMonksSyncEnabled = (): boolean => {
  return FEATURE_FLAGS.dataSources.useSportMonks && FEATURE_FLAGS.sportMonksFeatures.enableSync;
};

/**
 * Get list of competition IDs enabled for Sports Monks sync
 */
export const getSportMonksEnabledCompetitions = (): number[] => {
  if (!isSportMonksSyncEnabled()) return [];
  return FEATURE_FLAGS.sportMonksFeatures.syncCompetitions;
};

/**
 * Check if a specific competition is enabled for Sports Monks sync
 */
export const isCompetitionEnabledForSync = (competitionId: number): boolean => {
  const enabledCompetitions = getSportMonksEnabledCompetitions();
  return enabledCompetitions.length === 0 || enabledCompetitions.includes(competitionId);
};

/**
 * Check if Sports Monks TV stations feature is enabled
 */
export const isSportMonksTVEnabled = (): boolean => {
  return isFeatureEnabled('sportMonksFeatures.showTVStations');
};

/**
 * Check if Sports Monks live scores feature is enabled
 */
export const isSportMonksLiveScoresEnabled = (): boolean => {
  return isFeatureEnabled('sportMonksFeatures.showLiveScores');
};