/**
 * Calendar Integration Utilities
 * Generate calendar links and .ics files for sessions
 * Genie Studio branded meeting invites
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  organizer?: string;
  attendees?: string[];
  meetingUrl?: string;
  topics?: string;
  hostName?: string;
  guestNames?: string[];
}

/**
 * Format date for calendar URLs (ISO format without separators)
 */
const formatCalendarDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Build a rich description with meeting details for calendar invites
 */
const buildRichDescription = (event: CalendarEvent): string => {
  const lines: string[] = [];
  
  // Add meeting URL prominently
  if (event.meetingUrl) {
    lines.push('🎬 JOIN MEETING:');
    lines.push(event.meetingUrl);
    lines.push('');
  }
  
  // Add description if provided
  if (event.description) {
    lines.push(event.description);
    lines.push('');
  }
  
  // Add topics
  if (event.topics) {
    lines.push('📋 TOPICS:');
    lines.push(event.topics);
    lines.push('');
  }
  
  // Add host info
  if (event.hostName) {
    lines.push(`🎙️ Host: ${event.hostName}`);
  }
  
  // Add guest info
  if (event.guestNames && event.guestNames.length > 0) {
    lines.push(`👥 Guests: ${event.guestNames.join(', ')}`);
  }
  
  // Add branding
  lines.push('');
  lines.push('─────────────────────');
  lines.push('📺 Powered by Genie Studio');
  lines.push('🌐 genieaiexperimentationhub.tech');
  
  return lines.join('\n');
};

/**
 * Get a display-friendly meeting URL with branding
 */
export const getGenieMeetingDisplayUrl = (url: string): string => {
  if (url.includes('genieaiexperimentationhub.tech')) {
    // Extract meeting code for cleaner display
    const match = url.match(/\/meeting\/([a-z0-9-]+)/i);
    if (match) {
      return `Genie Studio: ${match[1]}`;
    }
  }
  return url;
};

/**
 * Generate Google Calendar URL with full details
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const richDescription = buildRichDescription(event);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatCalendarDate(event.startTime)}/${formatCalendarDate(event.endTime)}`,
    details: richDescription,
    location: event.meetingUrl || event.location || '',
  });

  // Add attendees if available
  if (event.attendees && event.attendees.length > 0) {
    params.set('add', event.attendees.join(','));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Web URL with full details
 */
export const generateOutlookUrl = (event: CalendarEvent): string => {
  const richDescription = buildRichDescription(event);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: richDescription,
    location: event.meetingUrl || event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Generate Yahoo Calendar URL with full details
 */
export const generateYahooCalendarUrl = (event: CalendarEvent): string => {
  const duration = Math.floor((event.endTime.getTime() - event.startTime.getTime()) / (60 * 1000));
  const hours = Math.floor(duration / 60).toString().padStart(2, '0');
  const minutes = (duration % 60).toString().padStart(2, '0');
  const richDescription = buildRichDescription(event);

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatCalendarDate(event.startTime),
    dur: `${hours}${minutes}`,
    desc: richDescription,
    in_loc: event.meetingUrl || event.location || '',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

/**
 * Generate iCal (.ics) file content with full meeting details
 */
export const generateIcsContent = (event: CalendarEvent, uid?: string): string => {
  const escapeIcs = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };

  const richDescription = buildRichDescription(event);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Genie Studio//genieaiexperimentationhub.tech//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Genie Studio',
    'BEGIN:VEVENT',
    `UID:${uid || crypto.randomUUID()}@genie-studio`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(event.startTime)}`,
    `DTEND:${formatCalendarDate(event.endTime)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(richDescription)}`,
  ];

  // Add meeting URL as location
  if (event.meetingUrl) {
    lines.push(`LOCATION:${escapeIcs(event.meetingUrl)}`);
    // Also add as URL property for better client support
    lines.push(`URL:${escapeIcs(event.meetingUrl)}`);
  } else if (event.location) {
    lines.push(`LOCATION:${escapeIcs(event.location)}`);
  }

  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${escapeIcs(event.hostName || 'Host')}:mailto:${escapeIcs(event.organizer)}`);
  }

  // Add attendees
  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach((email, index) => {
      const name = event.guestNames?.[index] || email.split('@')[0];
      lines.push(`ATTENDEE;CN=${escapeIcs(name)};RSVP=TRUE:mailto:${escapeIcs(email)}`);
    });
  }

  // Add reminders
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Genie Studio - Session starts in 24 hours',
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Genie Studio - Session starts in 1 hour',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Genie Studio - Session starts in 30 minutes',
    'TRIGGER:-PT30M',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Genie Studio - Session starts in 15 minutes',
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
