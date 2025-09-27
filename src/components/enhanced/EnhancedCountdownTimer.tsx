/**
 * Enhanced Countdown Timer
 *
 * Advanced countdown with features like:
 * - Timezone-aware countdown
 * - Multiple display formats
 * - Real-time updates
 * - Integration with live data
 */

import React, { useState, useEffect } from 'react';
import { SmartFeatureFlag } from '../../config/featureFlags';
import { formatTime, getUserTimezone } from '../../utils/dateFormat';

interface EnhancedCountdownTimerProps {
  kickoffTime: string;
  isLive?: boolean;
  className?: string;
}

const EnhancedCountdownTimer: React.FC<EnhancedCountdownTimerProps> = ({
  kickoffTime,
  isLive = false,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const kickoff = new Date(kickoffTime);
      const difference = kickoff.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }

      setCurrentTime(now);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [kickoffTime]);

  const formatCountdown = () => {
    if (isLive) {
      return 'LIVE NOW';
    }

    if (timeLeft.total <= 0) {
      return 'Match Started';
    }

    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.seconds}s`;
    }
  };

  const getStatusColor = () => {
    if (isLive) return 'var(--color-error)';
    if (timeLeft.total <= 0) return 'var(--color-text-secondary)';
    if (timeLeft.days === 0 && timeLeft.hours < 2) return 'var(--color-warning)';
    return 'var(--color-text)';
  };

  const getStatusBackground = () => {
    if (isLive) return 'var(--color-error-light)';
    if (timeLeft.total <= 0) return 'var(--color-surface)';
    if (timeLeft.days === 0 && timeLeft.hours < 2) return 'var(--color-warning-light)';
    return 'var(--color-surface)';
  };

  return (
    <SmartFeatureFlag feature="soccersAPIFeatures.showKickoffCountdown">
      <div className={`enhanced-countdown-timer ${className}`} style={{
        padding: '12px 16px',
        backgroundColor: getStatusBackground(),
        border: `1px solid ${getStatusColor()}`,
        borderRadius: 'var(--border-radius-md)',
        textAlign: 'center'
      }}>
        {/* Main countdown display */}
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: getStatusColor(),
          marginBottom: '4px'
        }}>
          {formatCountdown()}
        </div>

        {/* Kickoff time in user's timezone */}
        <div style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '8px'
        }}>
          Kicks off at {formatTime(kickoffTime)}
        </div>

        {/* Enhanced features with real-time updates */}
        <SmartFeatureFlag feature="soccersAPIFeatures.showRealTimeUpdates">
          <div style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '8px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌍 {getUserTimezone()}</span>
              <span>Updated: {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</span>
            </div>
          </div>
        </SmartFeatureFlag>

        {/* Live indicator for ongoing matches */}
        {isLive && (
          <div style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--color-error)',
              borderRadius: '50%',
              animation: 'countdown-pulse 2s infinite'
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-error)'
            }}>
              LIVE NOW
            </span>
          </div>
        )}

        {/* Urgency indicator for upcoming matches */}
        {!isLive && timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 1 && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--color-warning-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            ⚡ Starting Soon
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes countdown-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `
      }} />
    </SmartFeatureFlag>
  );
};

export default EnhancedCountdownTimer;