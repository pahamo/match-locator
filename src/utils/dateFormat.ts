/**
 * Dynamic date formatting utilities
 * Shows "Today", "Tomorrow", etc. instead of full dates when appropriate
 */

export interface DateFormatOptions {
  showTime?: boolean;
  showYear?: boolean;
  timezone?: string;
}

/**
 * Formats a date with dynamic relative terms (Today, Tomorrow, etc.)
 * @param utcDate - ISO date string in UTC
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDynamicDate(
  utcDate: string,
  options: DateFormatOptions = {}
): string {
  const {
    showTime = true,
    showYear = false,
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } = options;

  const date = new Date(utcDate);
  const now = new Date();

  // Get dates in the specified timezone for comparison
  const dateInTz = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

  // Reset time to compare just dates
  const dateOnly = new Date(dateInTz.getFullYear(), dateInTz.getMonth(), dateInTz.getDate());
  const todayOnly = new Date(nowInTz.getFullYear(), nowInTz.getMonth(), nowInTz.getDate());

  const diffInDays = Math.round((dateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));

  let dateText: string;

  // Determine relative date text
  if (diffInDays === 0) {
    dateText = 'Today';
  } else if (diffInDays === 1) {
    dateText = 'Tomorrow';
  } else if (diffInDays === -1) {
    dateText = 'Yesterday';
  } else if (diffInDays > 1 && diffInDays <= 6) {
    // Show day of week for next week
    dateText = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      timeZone: timezone
    });
  } else if (diffInDays < -1 && diffInDays >= -6) {
    // Show "Last [Day]" for previous week
    const dayName = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      timeZone: timezone
    });
    dateText = `Last ${dayName}`;
  } else {
    // Show full date for dates further away
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: timezone
    };

    if (showYear || date.getFullYear() !== now.getFullYear()) {
      formatOptions.year = 'numeric';
    }

    dateText = date.toLocaleDateString('en-GB', formatOptions);
  }

  // Add time if requested
  if (showTime) {
    const timeText = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
    return `${dateText} at ${timeText}`;
  }

  return dateText;
}

/**
 * Formats a date for compact display (used in cards)
 * @param utcDate - ISO date string in UTC
 * @returns Compact formatted date
 */
export function formatCompactDate(utcDate: string): string {
  return formatDynamicDate(utcDate, { showTime: true, showYear: false });
}

/**
 * Formats just the time portion of a date in user's local timezone
 * @param utcDate - ISO date string in UTC
 * @param timezone - Optional timezone (defaults to user's local timezone)
 * @returns Time in HH:MM format
 */
export function formatTime(utcDate: string, timezone?: string): string {
  const date = new Date(utcDate);
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: userTimezone
  });
}

/**
 * Formats time with timezone abbreviation for clarity
 * @param utcDate - ISO date string in UTC
 * @param timezone - Optional timezone (defaults to user's local timezone)
 * @returns Time with timezone (e.g., "3:00 PM PST")
 */
export function formatTimeWithTimezone(utcDate: string, timezone?: string): string {
  const date = new Date(utcDate);
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimezone,
    timeZoneName: 'short'
  });

  return timeString;
}

/**
 * Gets the user's timezone for display purposes
 * @returns User's timezone in readable format
 */
export function getUserTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert to more readable format
  const parts = timezone.split('/');
  if (parts.length === 2) {
    return parts[1].replace(/_/g, ' ');
  }
  return timezone;
}

/**
 * Checks if a date is in a different day in user's timezone vs UTC
 * @param utcDate - ISO date string in UTC
 * @returns Object with UTC and local dates
 */
export function getDateInfo(utcDate: string) {
  const date = new Date(utcDate);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const utcDateOnly = date.toISOString().split('T')[0];
  const localDateOnly = date.toLocaleDateString('en-CA', { timeZone: userTimezone }); // ISO format

  return {
    utcDate: utcDateOnly,
    localDate: localDateOnly,
    isDifferentDay: utcDateOnly !== localDateOnly,
    timezone: userTimezone
  };
}

/**
 * Formats a date for detailed display (used in match pages)
 * @param utcDate - ISO date string in UTC
 * @returns Detailed formatted date
 */
export function formatDetailedDate(utcDate: string): string {
  return formatDynamicDate(utcDate, { showTime: true, showYear: true });
}

/**
 * Gets just the date part (no time)
 * @param utcDate - ISO date string in UTC
 * @returns Date-only string
 */
export function formatDateOnly(utcDate: string): string {
  return formatDynamicDate(utcDate, { showTime: false, showYear: false });
}