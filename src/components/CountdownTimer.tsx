import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO string
  onExpired?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onExpired,
  className = '',
  style
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const [hasExpired, setHasExpired] = useState(false);

  const calculateTimeRemaining = (target: string): TimeRemaining => {
    const now = new Date().getTime();
    const targetTime = new Date(target).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, total: difference };
  };

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(remaining);

      if (remaining.total <= 0 && !hasExpired) {
        setHasExpired(true);
        onExpired?.();
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate, hasExpired, onExpired]);

  if (hasExpired || timeRemaining.total <= 0) {
    return (
      <span className={className} style={style}>
        <span style={{
          color: 'var(--color-live, #ef4444)',
          fontWeight: '600',
          fontSize: '12px'
        }}>
          KICKOFF
        </span>
      </span>
    );
  }

  const formatTime = (time: TimeRemaining) => {
    if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  const getUrgencyColor = (time: TimeRemaining) => {
    if (time.total <= 5 * 60 * 1000) { // 5 minutes
      return 'var(--color-live, #ef4444)';
    } else if (time.total <= 30 * 60 * 1000) { // 30 minutes
      return 'var(--color-warning, #f59e0b)';
    } else {
      return 'var(--color-text-secondary, #6b7280)';
    }
  };

  return (
    <span
      className={className}
      style={{
        color: getUrgencyColor(timeRemaining),
        fontWeight: '600',
        fontSize: '12px',
        ...style
      }}
    >
      {formatTime(timeRemaining)}
    </span>
  );
};

export default CountdownTimer;