/**
 * Debug component to show which API is providing data
 * Temporary indicator for testing purposes
 */

import React from 'react';
import { FEATURE_FLAGS } from '../../config/featureFlags';

interface ApiSourceIndicatorProps {
  className?: string;
  size?: 'small' | 'normal';
}

export const ApiSourceIndicator: React.FC<ApiSourceIndicatorProps> = ({
  className = '',
  size = 'small'
}) => {
  const isUsingSoccersAPI = FEATURE_FLAGS.dataSources.useSoccersAPI;
  const isTestMode = FEATURE_FLAGS.dataSources.soccersAPITestMode;

  if (!isUsingSoccersAPI) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 ${className}`}>
        <span>📊</span>
        <span className="font-medium">Football-Data</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700 ${className}`}>
      <span>🆕</span>
      <span className="font-medium">SoccersAPI</span>
      {isTestMode && (
        <span className="text-orange-600 ml-1">(Test)</span>
      )}
    </div>
  );
};

export default ApiSourceIndicator;