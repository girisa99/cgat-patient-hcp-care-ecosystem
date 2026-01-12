/**
 * Meeting URL Generator Utilities
 * Auto-generate meeting URLs that route to Genie Vibe Recording Studio
 * 
 * Meeting URL Flow:
 * 1. Generate URL: https://genieaiexperimentationhub.tech/meeting/{code}
 * 2. User clicks URL → routes to /meeting/{code} page
 * 3. MeetingRoom page loads show details and redirects to Genie Vibe
 * 4. Device detection handled by Genie Vibe (web, mobile, desktop)
 */

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
  meetingCode: string;
  activateAt?: Date;
  expiresAt?: Date;
}

/**
 * Get the base URL for meeting links
 * Always uses genieaiexperimentationhub.tech for consistent meeting URLs
 * Note: Can add .com domain before go-live
 */
export function getMeetingBaseUrl(): string {
  return 'https://genieaiexperimentationhub.tech';
}

/**
 * Generate a unique meeting code
 */
export function generateMeetingCode(): string {
  return crypto.randomUUID().split('-').slice(0, 3).join('-');
}

/**
 * Generate an auto meeting URL that routes to Genie Vibe Recording Studio
 * This URL works across all scheduling contexts: Arc, Production Hub, Calendar, etc.
 */
export function generateAutoMeetingUrl(showId?: string): string {
  const meetingCode = showId ? `${showId.split('-')[0]}-${generateMeetingCode()}` : generateMeetingCode();
  const baseUrl = getMeetingBaseUrl();
  return `${baseUrl}/meeting/${meetingCode}`;
}

/**
 * Extract meeting code from a meeting URL
 */
export function extractMeetingCode(url: string): string | null {
  const match = url.match(/\/meeting\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Generate a short URL for mobile devices (placeholder - could integrate with URL shortener)
 */
export function generateShortMeetingUrl(fullUrl: string): string {
  const code = extractMeetingCode(fullUrl);
  // For now, return a shorter version; could integrate with real shortener service
  return code ? `${getMeetingBaseUrl()}/m/${code.slice(0, 8)}` : fullUrl;
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
 * For 'auto' platform, generates a Genie Vibe recording studio URL
 */
export function generateMeetingUrl(
  showId: string,
  config: MeetingUrlConfig
): GeneratedMeetingUrl {
  let url: string;
  let meetingCode = '';
  
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
      meetingCode = generateMeetingCode();
      url = `${getMeetingBaseUrl()}/meeting/${meetingCode}`;
      break;
  }
  
  // Extract code if available
  if (!meetingCode) {
    meetingCode = extractMeetingCode(url) || '';
  }
  
  return {
    url,
    shortUrl: generateShortMeetingUrl(url),
    platform: config.platform,
    meetingCode,
  };
}

/**
 * Platform display info - Genie Studio branded
 */
export const MEETING_PLATFORMS = [
  { 
    id: 'auto' as MeetingPlatform, 
    label: 'Genie Vibe Recording', 
    description: 'Auto-generate Genie Vibe studio URL',
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
