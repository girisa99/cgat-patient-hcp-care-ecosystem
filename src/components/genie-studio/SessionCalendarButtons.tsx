/**
 * Calendar Integration Buttons Component
 * Add to Calendar buttons for Google, Outlook, iCal
 * Genie Studio branded calendar invites with full meeting details
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ExternalLink, Sparkles } from 'lucide-react';
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateYahooCalendarUrl,
  downloadIcsFile,
  type CalendarEvent,
} from '@/utils/calendarUtils';

interface SessionCalendarButtonsProps {
  title: string;
  description?: string;
  joinUrl: string;
  startTime: Date;
  durationMinutes?: number;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  hostName?: string;
  guestNames?: string[];
  topics?: string;
  hostEmail?: string;
  guestEmails?: string[];
}

export const SessionCalendarButtons: React.FC<SessionCalendarButtonsProps> = ({
  title,
  description,
  joinUrl,
  startTime,
  durationMinutes = 60,
  variant = 'default',
  className = '',
  hostName = 'Host',
  guestNames = [],
  topics,
  hostEmail,
  guestEmails = [],
}) => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  // Build rich calendar event with all Genie Studio details
  const calendarEvent: CalendarEvent = {
    title: `🎬 ${title} - Genie Studio`,
    description,
    location: joinUrl,
    startTime,
    endTime,
    meetingUrl: joinUrl,
    topics,
    hostName,
    guestNames,
    organizer: hostEmail,
    attendees: guestEmails.filter(Boolean),
  };

  const googleUrl = generateGoogleCalendarUrl(calendarEvent);
  const outlookUrl = generateOutlookUrl(calendarEvent);
  const yahooUrl = generateYahooCalendarUrl(calendarEvent);

  const handleDownloadIcs = () => {
    downloadIcsFile(calendarEvent, `${title.replace(/[^a-z0-9]/gi, '_')}_invite.ics`);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
          onClick={() => window.open(googleUrl, '_blank')}
          title="Add to Google Calendar (includes meeting URL)"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png"
            alt="Google Calendar"
            className="h-4 w-4"
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
          onClick={() => window.open(outlookUrl, '_blank')}
          title="Add to Outlook (includes meeting URL)"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
            alt="Outlook"
            className="h-4 w-4"
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
          onClick={() => window.open(yahooUrl, '_blank')}
          title="Add to Yahoo Calendar"
        >
          🗓️
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
          onClick={handleDownloadIcs}
          title="Download .ics file (Apple/Other)"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Save to calendar:
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(googleUrl, '_blank')}
          className="h-7 text-xs bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          📅 Google
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(outlookUrl, '_blank')}
          className="h-7 text-xs bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          📧 Outlook
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(yahooUrl, '_blank')}
          className="h-7 text-xs bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          🗓️ Yahoo
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadIcs}
          className="h-7 text-xs bg-primary/5 border-primary/20 hover:bg-primary/10"
        >
          <Download className="h-3 w-3 mr-1" />
          .ics
        </Button>
      </div>
    );
  }

  // Default variant - Genie Studio branded
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
          Add to Calendar
        </span>
        <span className="text-xs text-muted-foreground">(includes meeting link)</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          onClick={() => window.open(googleUrl, '_blank')}
          className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:bg-primary/10"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png"
            alt="Google Calendar"
            className="h-6 w-6"
          />
          <span className="text-xs">Google</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(outlookUrl, '_blank')}
          className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
            alt="Outlook"
            className="h-6 w-6"
          />
          <span className="text-xs">Outlook</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(yahooUrl, '_blank')}
          className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/10"
        >
          <span className="text-2xl">🗓️</span>
          <span className="text-xs">Yahoo</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadIcs}
          className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/10"
        >
          <Download className="h-6 w-6 text-pink-500" />
          <span className="text-xs">.ics</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        ✨ Calendar invite includes meeting URL, topics & host details
      </p>
    </div>
  );
};

export default SessionCalendarButtons;
