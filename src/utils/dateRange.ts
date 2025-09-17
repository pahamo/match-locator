/**
 * Utility functions for handling timezone-aware date ranges
 * Handles UK timezone (BST/GMT) conversion to UTC for database queries
 */

// Get the current date in UK timezone
export const getUKDate = (): Date => {
  const now = new Date();
  // Convert to UK timezone string, then parse back to get UK date
  const ukDateString = now.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Parse DD/MM/YYYY format
  const [day, month, year] = ukDateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

// Get UTC range for a specific UK date
export const getUTCRangeForUKDate = (ukDate: Date): { start: string; end: string } => {
  // Create start of day in UK timezone
  const startOfDayUK = new Date(ukDate);
  startOfDayUK.setHours(0, 0, 0, 0);

  // Create end of day in UK timezone
  const endOfDayUK = new Date(ukDate);
  endOfDayUK.setHours(23, 59, 59, 999);

  // Convert to UTC by accounting for UK timezone offset
  const now = new Date();
  const ukOffsetMinutes = getUKTimezoneOffset(now);

  const startUTC = new Date(startOfDayUK.getTime() - (ukOffsetMinutes * 60 * 1000));
  const endUTC = new Date(endOfDayUK.getTime() - (ukOffsetMinutes * 60 * 1000));

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString()
  };
};

// Get UK timezone offset in minutes (negative for GMT+0, positive for BST+1)
const getUKTimezoneOffset = (date: Date): number => {
  // Create two dates - one in local time, one in UK time
  const utc = new Date(date.toISOString());
  const ukTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/London' }));

  // Calculate offset in minutes
  return (utc.getTime() - ukTime.getTime()) / (1000 * 60);
};

// Get today's fixtures UTC range
export const getTodayUTCRange = (): { start: string; end: string } => {
  const ukToday = getUKDate();
  return getUTCRangeForUKDate(ukToday);
};

// Get tomorrow's fixtures UTC range
export const getTomorrowUTCRange = (): { start: string; end: string } => {
  const ukToday = getUKDate();
  const ukTomorrow = new Date(ukToday);
  ukTomorrow.setDate(ukTomorrow.getDate() + 1);
  return getUTCRangeForUKDate(ukTomorrow);
};

// Format date for display
export const formatDisplayDate = (date: Date): string => {
  const today = getUKDate();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateString = date.toDateString();
  const todayString = today.toDateString();
  const tomorrowString = tomorrow.toDateString();

  if (dateString === todayString) {
    return 'Today';
  } else if (dateString === tomorrowString) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
};

// Get formatted date string for SEO
export const getFormattedDateForSEO = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Check if it's currently "today" in UK timezone
export const isToday = (date: Date): boolean => {
  const ukToday = getUKDate();
  return date.toDateString() === ukToday.toDateString();
};

// Check if it's currently "tomorrow" in UK timezone
export const isTomorrow = (date: Date): boolean => {
  const ukToday = getUKDate();
  const ukTomorrow = new Date(ukToday);
  ukTomorrow.setDate(ukTomorrow.getDate() + 1);
  return date.toDateString() === ukTomorrow.toDateString();
};

// Get time until midnight (for auto-refresh scheduling)
export const getTimeUntilMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight
  return midnight.getTime() - now.getTime();
};