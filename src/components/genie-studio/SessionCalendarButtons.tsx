/**
 * Calendar Integration Buttons Component
 * Add to Calendar buttons for Google, Outlook, iCal
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
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
}

export const SessionCalendarButtons: React.FC<SessionCalendarButtonsProps> = ({
  title,
  description,
  joinUrl,
  startTime,
  durationMinutes = 60,
  variant = 'default',
  className = '',
}) => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const calendarEvent: CalendarEvent = {
    title,
    description: `${description || ''}\n\nJoin URL: ${joinUrl}`,
    location: joinUrl,
    startTime,
    endTime,
  };

  const googleUrl = generateGoogleCalendarUrl(calendarEvent);
  const outlookUrl = generateOutlookUrl(calendarEvent);

  const handleDownloadIcs = () => {
    downloadIcsFile(calendarEvent, `${title.replace(/[^a-z0-9]/gi, '_')}_invite.ics`);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => window.open(googleUrl, '_blank')}
          title="Add to Google Calendar"
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
          className="h-8 px-2"
          onClick={() => window.open(outlookUrl, '_blank')}
          title="Add to Outlook"
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
          className="h-8 px-2"
          onClick={handleDownloadIcs}
          title="Download .ics file"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Add to calendar:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(googleUrl, '_blank')}
          className="h-7 text-xs"
        >
          Google
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(outlookUrl, '_blank')}
          className="h-7 text-xs"
        >
          Outlook
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadIcs}
          className="h-7 text-xs"
        >
          iCal
          <Download className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4 text-primary" />
        <span>Add to Calendar</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={() => window.open(googleUrl, '_blank')}
          className="flex flex-col items-center gap-1 h-auto py-3"
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
          className="flex flex-col items-center gap-1 h-auto py-3"
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
          onClick={handleDownloadIcs}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <Download className="h-6 w-6 text-primary" />
          <span className="text-xs">iCal</span>
        </Button>
      </div>
    </div>
  );
};

export default SessionCalendarButtons;
