import React from 'react';
import { getRelativeTime, getFreshnessIndicator } from '../utils/contentFreshness';

interface FreshnessIndicatorProps {
  /** The date to calculate freshness from */
  date: Date | string;
  /** Show badge emoji indicator */
  showBadge?: boolean;
  /** Show full text or compact version */
  variant?: 'full' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  date,
  showBadge = true,
  variant = 'full',
  className = ''
}) => {
  const indicator = getFreshnessIndicator(date);
  const relativeTime = getRelativeTime(date);

  const colorMap = {
    green: '#10b981',
    yellow: '#f59e0b',
    gray: '#6b7280'
  };

  const bgColorMap = {
    green: '#d1fae5',
    yellow: '#fef3c7',
    gray: '#f3f4f6'
  };

  if (variant === 'compact') {
    return (
      <span
        className={`freshness-indicator-compact ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: colorMap[indicator.color],
          fontWeight: '500'
        }}
        title={`Last updated ${relativeTime}`}
      >
        {showBadge && <span>{indicator.badge}</span>}
        <span>{relativeTime}</span>
      </span>
    );
  }

  return (
    <div
      className={`freshness-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: bgColorMap[indicator.color],
        border: `1px solid ${colorMap[indicator.color]}`,
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: colorMap[indicator.color]
      }}
    >
      {showBadge && (
        <span style={{ fontSize: '16px' }}>{indicator.badge}</span>
      )}
      <span>{indicator.text}</span>
    </div>
  );
};

/**
 * Page Update Timestamp Component
 * Shows when the page data was last refreshed
 */
interface PageUpdateTimestampProps {
  label?: string;
  className?: string;
}

export const PageUpdateTimestamp: React.FC<PageUpdateTimestampProps> = ({
  label = 'Page data refreshed',
  className = ''
}) => {
  const [updateTime] = React.useState(new Date());

  return (
    <div
      className={`page-update-timestamp ${className}`}
      style={{
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: '8px'
      }}
    >
      {label}: {updateTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </div>
  );
};

export default FreshnessIndicator;
