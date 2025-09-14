export interface MatchStatus {
  status: 'live' | 'upNext' | 'upcoming' | 'finished';
  timeUntil?: string;
  isToday?: boolean;
}

export function getMatchStatus(kickoffUtc: string): MatchStatus {
  const now = new Date();
  const kickoff = new Date(kickoffUtc);
  const timeDiff = kickoff.getTime() - now.getTime();
  
  // Check if match is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const matchDay = new Date(kickoff);
  matchDay.setHours(0, 0, 0, 0);
  const isToday = matchDay.getTime() === today.getTime();
  
  // Match is live (kicked off and within ~120 minutes)
  if (timeDiff <= 0 && Math.abs(timeDiff) <= 120 * 60 * 1000) {
    return { status: 'live', isToday };
  }
  
  // Match has finished (more than 120 minutes ago)
  if (timeDiff <= -120 * 60 * 1000) {
    return { status: 'finished', isToday };
  }
  
  // Match is today and within next 4 hours
  if (isToday && timeDiff > 0 && timeDiff <= 4 * 60 * 60 * 1000) {
    const hoursUntil = Math.floor(timeDiff / (60 * 60 * 1000));
    const minutesUntil = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hoursUntil === 0) {
      return { 
        status: 'upNext', 
        timeUntil: `${minutesUntil}m`,
        isToday: true
      };
    } else {
      return { 
        status: 'upNext', 
        timeUntil: `${hoursUntil}h ${minutesUntil}m`,
        isToday: true
      };
    }
  }
  
  // Everything else is upcoming
  return { status: 'upcoming', isToday };
}

// Get CSS styles for match status
export function getMatchStatusStyles(status: MatchStatus) {
  switch (status.status) {
    case 'live':
      return {
        card: {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          animation: 'pulse-red 2s ease-in-out infinite'
        },
        badge: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }
      };
    
    case 'upNext':
      return {
        card: {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: '2px solid rgba(59, 130, 246, 0.8)',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        },
        badge: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '12px',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }
      };
    
    default:
      return {
        card: {},
        badge: null
      };
  }
}