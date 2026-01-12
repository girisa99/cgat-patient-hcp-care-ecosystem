/**
 * Meeting URL Generator Utilities
 * Auto-generate meeting URLs or connect to external platforms
 */

import { v4 as uuidv4 } from 'uuid';

export type MeetingPlatform = 'auto' | 'google_meet' | 'zoom' | 'teams' | 'custom';

export interface MeetingUrlConfig {
  platform: MeetingPlatform;
  customUrl?: string;
  googleMeetCode?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  teamsMeetingUrl?: string;
}

export interface GeneratedMeetingUrl {
  url: string;
  shortUrl: string;
  platform: MeetingPlatform;
  activateAt?: Date;
  expiresAt?: Date;
}

/**
 * Generate an auto meeting URL using genieaiexperimentationhub.tech domain
 */
export function generateAutoMeetingUrl(showId?: string): string {
  const meetingCode = crypto.randomUUID().split('-').slice(0, 3).join('-');
  // Use genieaiexperimentationhub.tech for production meeting URLs
  return `https://genieaiexperimentationhub.tech/meeting/${meetingCode}`;
}

/**
 * Generate a short URL for mobile devices
 */
export function generateShortMeetingUrl(fullUrl: string): string {
  const hash = Math.random().toString(36).substring(2, 8);
  return `https://mtg.io/${hash}`;
}

/**
 * Format Google Meet URL
 */
export function formatGoogleMeetUrl(meetCode?: string): string {
  if (meetCode) {
    // Clean up the code format
    const cleanCode = meetCode.replace(/[^a-z0-9-]/gi, '');
    return `https://meet.google.com/${cleanCode}`;
  }
  // Generate a Google Calendar link that creates a new meeting
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&add=video`;
}

/**
 * Format Zoom meeting URL
 */
export function formatZoomUrl(meetingId?: string, passcode?: string): string {
  if (meetingId) {
    const cleanId = meetingId.replace(/\D/g, '');
    let url = `https://zoom.us/j/${cleanId}`;
    if (passcode) {
      url += `?pwd=${passcode}`;
    }
    return url;
  }
  return 'https://zoom.us/start/webmeeting';
}

/**
 * Format Microsoft Teams meeting URL
 */
export function formatTeamsUrl(meetingUrl?: string): string {
  if (meetingUrl && meetingUrl.includes('teams.microsoft.com')) {
    return meetingUrl;
  }
  // Link to start a new Teams meeting
  return 'https://teams.microsoft.com/l/meetup-join/';
}

/**
 * Generate meeting URL based on platform selection
 */
export function generateMeetingUrl(
  showId: string,
  config: MeetingUrlConfig
): GeneratedMeetingUrl {
  let url: string;
  
  switch (config.platform) {
    case 'google_meet':
      url = formatGoogleMeetUrl(config.googleMeetCode);
      break;
    case 'zoom':
      url = formatZoomUrl(config.zoomMeetingId, config.zoomPasscode);
      break;
    case 'teams':
      url = formatTeamsUrl(config.teamsMeetingUrl);
      break;
    case 'custom':
      url = config.customUrl || generateAutoMeetingUrl(showId);
      break;
    case 'auto':
    default:
      url = generateAutoMeetingUrl(showId);
      break;
  }
  
  return {
    url,
    shortUrl: generateShortMeetingUrl(url),
    platform: config.platform,
  };
}

/**
 * Platform display info
 */
export const MEETING_PLATFORMS = [
  { 
    id: 'auto' as MeetingPlatform, 
    label: 'Auto-Generate (Browser)', 
    description: 'Generate a built-in meeting URL',
    icon: '🌐'
  },
  { 
    id: 'google_meet' as MeetingPlatform, 
    label: 'Google Meet', 
    description: 'Connect with Google Calendar',
    icon: '📹'
  },
  { 
    id: 'zoom' as MeetingPlatform, 
    label: 'Zoom', 
    description: 'Add Zoom meeting ID',
    icon: '🎥'
  },
  { 
    id: 'teams' as MeetingPlatform, 
    label: 'Microsoft Teams', 
    description: 'Paste Teams meeting URL',
    icon: '👥'
  },
  { 
    id: 'custom' as MeetingPlatform, 
    label: 'Custom URL', 
    description: 'Enter any meeting URL',
    icon: '🔗'
  },
];

/**
 * Check if meeting should be activated (30 min before)
 */
export function shouldActivateMeeting(scheduledDate: Date | string): boolean {
  const scheduled = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
  const now = new Date();
  const thirtyMinBefore = new Date(scheduled.getTime() - 30 * 60 * 1000);
  return now >= thirtyMinBefore;
}

/**
 * Get time until meeting activation
 */
export function getTimeUntilActivation(scheduledDate: Date | string): number {
  const scheduled = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
  const now = new Date();
  const thirtyMinBefore = new Date(scheduled.getTime() - 30 * 60 * 1000);
  return Math.max(0, thirtyMinBefore.getTime() - now.getTime());
}
