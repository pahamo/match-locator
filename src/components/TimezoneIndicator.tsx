/**
 * Timezone Indicator Component
 * Shows users what timezone times are displayed in
 */

import React from 'react';
import { getUserTimezone } from '../utils/dateFormat';

interface TimezoneIndicatorProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

export const TimezoneIndicator: React.FC<TimezoneIndicatorProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const timezone = getUserTimezone();

  const getTimezoneDisplay = () => {
    switch (variant) {
      case 'full':
        return `All times shown in your local timezone (${timezone})`;
      case 'compact':
        return `Times in ${timezone}`;
      case 'icon':
        return '🌍';
      default:
        return `Times in ${timezone}`;
    }
  };

  const baseStyles = "text-xs text-gray-500 flex items-center gap-1";
  const variantStyles = {
    full: "text-sm",
    compact: "",
    icon: "text-base"
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {variant !== 'icon' && <span>🌍</span>}
      <span>{getTimezoneDisplay()}</span>
    </div>
  );
};

/**
 * Hook to get current timezone info
 */
export const useTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const displayName = getUserTimezone();

  return {
    timezone,
    displayName,
    isUTC: timezone === 'UTC',
    isLondon: timezone === 'Europe/London',
    offset: new Date().getTimezoneOffset() / -60 // Hours from UTC
  };
};