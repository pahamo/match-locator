import React from 'react';
import { getMatchStatus } from '../utils/matchStatus';

interface LiveBadgeProps {
  kickoffTime: string; // ISO string
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'compact';
}

const LiveBadge: React.FC<LiveBadgeProps> = ({
  kickoffTime,
  className = '',
  style,
  variant = 'default'
}) => {
  const status = getMatchStatus(kickoffTime);

  if (status.status !== 'live') {
    return null;
  }

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: variant === 'compact' ? '2px 6px' : '4px 8px',
    backgroundColor: 'var(--color-live, #ef4444)',
    color: 'white',
    fontSize: variant === 'compact' ? '10px' : '11px',
    fontWeight: '700',
    borderRadius: 'var(--border-radius-sm, 4px)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    animation: 'pulse 2s infinite',
    ...style
  };

  const dotStyles: React.CSSProperties = {
    width: variant === 'compact' ? '4px' : '5px',
    height: variant === 'compact' ? '4px' : '5px',
    backgroundColor: 'white',
    borderRadius: '50%',
    animation: 'blink 1s infinite'
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.4; }
        }
      `}</style>
      <span className={className} style={badgeStyles}>
        <span style={dotStyles}></span>
        LIVE
      </span>
    </>
  );
};

export default LiveBadge;