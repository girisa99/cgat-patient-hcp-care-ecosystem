/**
 * Timezone Utilities for Production Hub
 * Supports world timezone display and sync
 */

// Common timezones for quick selection
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbr: 'ET', offset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', abbr: 'CT', offset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbr: 'MT', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbr: 'PT', offset: -8 },
  { value: 'America/Anchorage', label: 'Alaska (AKT)', abbr: 'AKT', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', abbr: 'HST', offset: -10 },
  { value: 'UTC', label: 'UTC', abbr: 'UTC', offset: 0 },
  { value: 'Europe/London', label: 'London (GMT/BST)', abbr: 'GMT', offset: 0 },
  { value: 'Europe/Paris', label: 'Central Europe (CET)', abbr: 'CET', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', abbr: 'CET', offset: 1 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', abbr: 'GST', offset: 4 },
  { value: 'Asia/Kolkata', label: 'India (IST)', abbr: 'IST', offset: 5.5 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', abbr: 'SGT', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', abbr: 'JST', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', abbr: 'AEST', offset: 10 },
];

/**
 * Format date with timezone and AM/PM
 */
export function formatDateWithTimezone(
  date: Date | string, 
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
  options?: { includeDate?: boolean; includeTimezone?: boolean }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  };
  
  if (options?.includeDate) {
    Object.assign(timeOptions, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (options?.includeTimezone) {
    timeOptions.timeZoneName = 'short';
  }
  
  return new Intl.DateTimeFormat('en-US', timeOptions).format(d);
}

/**
 * Get the user's local timezone
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert time between timezones
 */
export function convertTimezone(
  date: Date | string,
  fromTimezone: string,
  toTimezone: string
): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Get the time in the source timezone
  const sourceTime = d.toLocaleString('en-US', { timeZone: fromTimezone });
  const sourceDate = new Date(sourceTime);
  
  // Get the time in the target timezone
  const targetTime = d.toLocaleString('en-US', { timeZone: toTimezone });
  const targetDate = new Date(targetTime);
  
  // Calculate offset
  const offset = targetDate.getTime() - sourceDate.getTime();
  
  return new Date(d.getTime() + offset);
}

/**
 * Format time in multiple timezones for display
 */
export function formatMultiTimezone(
  date: Date | string,
  timezones: string[] = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
): { timezone: string; time: string; label: string }[] {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return timezones.map(tz => {
    const tzInfo = COMMON_TIMEZONES.find(t => t.value === tz);
    return {
      timezone: tz,
      time: formatDateWithTimezone(d, tz, { includeTimezone: true }),
      label: tzInfo?.abbr || tz.split('/').pop() || tz,
    };
  });
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const tzInfo = COMMON_TIMEZONES.find(t => t.value === timezone);
  if (tzInfo) return tzInfo.abbr;
  
  // Fallback: extract from timezone name
  const parts = timezone.split('/');
  return parts[parts.length - 1] || timezone;
}

/**
 * Generate a short URL for mobile (simulated - in real app use a URL shortener service)
 */
export function generateShortUrl(fullUrl: string): string {
  // In production, this would call a URL shortener API
  // For now, we'll return a simulated short URL format
  const hash = Math.random().toString(36).substring(2, 8);
  return `https://meet.app/${hash}`;
}
