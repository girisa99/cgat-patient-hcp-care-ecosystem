/**
 * Calendar Integration Utilities
 * Generate calendar links and .ics files for sessions
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  organizer?: string;
  attendees?: string[];
}

/**
 * Format date for calendar URLs (ISO format without separators)
 */
const formatCalendarDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatCalendarDate(event.startTime)}/${formatCalendarDate(event.endTime)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Web URL
 */
export const generateOutlookUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: event.description || '',
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate Yahoo Calendar URL
 */
export const generateYahooCalendarUrl = (event: CalendarEvent): string => {
  const duration = Math.floor((event.endTime.getTime() - event.startTime.getTime()) / (60 * 1000));
  const hours = Math.floor(duration / 60).toString().padStart(2, '0');
  const minutes = (duration % 60).toString().padStart(2, '0');

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatCalendarDate(event.startTime),
    dur: `${hours}${minutes}`,
    desc: event.description || '',
    in_loc: event.location || '',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Generate iCal (.ics) file content
 */
export const generateIcsContent = (event: CalendarEvent, uid?: string): string => {
  const escapeIcs = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Genie Studio//Session//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || crypto.randomUUID()}@genie-studio`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(event.startTime)}`,
    `DTEND:${formatCalendarDate(event.endTime)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeIcs(event.location)}`);
  }

  if (event.organizer) {
    lines.push(`ORGANIZER:${escapeIcs(event.organizer)}`);
  }

  // Add reminders
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session starts in 24 hours',
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session starts in 1 hour',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session starts in 30 minutes',
    'TRIGGER:-PT30M',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Session starts in 15 minutes',
    'TRIGGER:-PT15M',
    'END:VALARM'
  );

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
};

/**
 * Download ICS file
 */
export const downloadIcsFile = (event: CalendarEvent, filename?: string): void => {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate all calendar links for an event
 */
export const generateAllCalendarLinks = (event: CalendarEvent) => {
  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    downloadIcs: () => downloadIcsFile(event),
  };
};
