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
 * Formats just the time portion of a date
 * @param utcDate - ISO date string in UTC
 * @returns Time in HH:MM format
 */
export function formatTime(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  });
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