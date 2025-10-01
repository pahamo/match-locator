/**
 * Content Freshness Utilities
 *
 * Provides functions to calculate and display content freshness indicators
 * to help Google understand content is current and actively maintained.
 */

export interface FreshnessIndicator {
  text: string;
  color: 'green' | 'yellow' | 'gray';
  badge: '🟢' | '🟡' | '⚪';
  isFresh: boolean;
}

/**
 * Calculate time difference and return human-readable relative time
 */
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(diffMs / 604800000);
  const months = Math.floor(diffMs / 2592000000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Get freshness indicator based on how recent the data is
 */
export const getFreshnessIndicator = (date: Date | string): FreshnessIndicator => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffHours = (now.getTime() - then.getTime()) / 3600000;

  if (diffHours < 24) {
    return {
      text: 'Updated today',
      color: 'green',
      badge: '🟢',
      isFresh: true
    };
  } else if (diffHours < 168) { // 7 days
    return {
      text: `Updated ${getRelativeTime(then)}`,
      color: 'yellow',
      badge: '🟡',
      isFresh: true
    };
  } else {
    return {
      text: `Last updated ${getRelativeTime(then)}`,
      color: 'gray',
      badge: '⚪',
      isFresh: false
    };
  }
};

/**
 * Get the most recent fixture date from an array of fixtures
 * Used to determine when fixture data was last updated
 */
export const getMostRecentFixtureUpdate = (fixtures: Array<{ kickoff_utc: string }>): Date | null => {
  if (!fixtures || fixtures.length === 0) return null;

  // Sort by kickoff time and get the most recent one that's in the future or recently past
  const now = new Date();
  const recentFixtures = fixtures
    .map(f => new Date(f.kickoff_utc))
    .sort((a, b) => b.getTime() - a.getTime());

  return recentFixtures[0] || null;
};

/**
 * Format a date for display in "Last updated" text
 */
export const formatLastUpdated = (date: Date | string): string => {
  const then = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();

  const isToday = then.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === then.toDateString();

  if (isToday) {
    return `Today at ${then.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday at ${then.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return then.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Get ISO string for dateModified in structured data
 * Uses current time as the page was just rendered with fresh data
 */
export const getDateModified = (): string => {
  return new Date().toISOString();
};

/**
 * Calculate data freshness score (0-100)
 * Used for internal metrics and monitoring
 */
export const calculateFreshnessScore = (date: Date | string): number => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffHours = (now.getTime() - then.getTime()) / 3600000;

  if (diffHours < 1) return 100;
  if (diffHours < 6) return 90;
  if (diffHours < 24) return 80;
  if (diffHours < 72) return 60;
  if (diffHours < 168) return 40;
  if (diffHours < 720) return 20;
  return 10;
};
