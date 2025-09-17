/**
 * Feature flags to control visibility of components that require complete data
 */

import React from 'react';

export interface FeatureFlags {
  showH2HStats: boolean;
  showH2HPastResults: boolean;
  showMatchScores: boolean;
  showGoalStats: boolean;
}

// Feature flags configuration
export const FEATURE_FLAGS: FeatureFlags = {
  // Hide H2H statistics until we have reliable historical data
  showH2HStats: false,

  // Hide past results section until scores are properly populated
  showH2HPastResults: false,

  // Hide match scores until they're properly synced
  showMatchScores: false,

  // Hide goal statistics until data is complete
  showGoalStats: false
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Wrapper component for feature-flagged content
 */
interface FeatureFlagProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ feature, children, fallback = null }) => {
  if (isFeatureEnabled(feature)) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
};