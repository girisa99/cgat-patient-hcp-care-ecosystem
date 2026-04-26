import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarSyncRequest {
  action: 'connect' | 'sync' | 'disconnect' | 'list_events' | 'create_event' | 'update_event' | 'delete_event';
  provider: 'google' | 'outlook' | 'apple';
  accessToken?: string;
  refreshToken?: string;
  calendarId?: string;
  event?: {
    id?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    attendees?: string[];
    reminders?: { minutes: number; method: 'email' | 'popup' }[];
    showId?: string; // Link to Production Hub show
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: CalendarSyncRequest = await req.json();

    console.log(`📅 Calendar Sync Request:`, {
      action: request.action,
      provider: request.provider,
      hasAccessToken: !!request.accessToken
    });

    let result;

    switch (request.action) {
      case 'connect':
        result = await getOAuthUrl(request.provider);
        break;

      case 'sync':
        result = await syncCalendar(request);
        break;

      case 'list_events':
        result = await listEvents(request);
        break;

      case 'create_event':
        result = await createEvent(request);
        break;

      case 'update_event':
        result = await updateEvent(request);
        break;

      case 'delete_event':
        result = await deleteEvent(request);
        break;

      case 'disconnect':
        result = await disconnectCalendar(request.provider);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getOAuthUrl(provider: string): Promise<{ authUrl: string; state: string }> {
  const state = crypto.randomUUID();
  const redirectUri = Deno.env.get('CALENDAR_REDIRECT_URI') || 'https://your-app.com/auth/callback';

  let authUrl: string;

  switch (provider) {
    case 'google':
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;
      break;

    case 'outlook':
      const outlookClientId = Deno.env.get('OUTLOOK_CLIENT_ID');
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${outlookClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('Calendars.ReadWrite offline_access')}&` +
        `state=${state}`;
      break;

    case 'apple':
      // Apple Calendar uses CalDAV - requires different auth flow
      authUrl = `https://appleid.apple.com/auth/authorize?` +
        `client_id=${Deno.env.get('APPLE_CLIENT_ID')}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email&` +
        `state=${state}`;
      break;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  return { authUrl, state };
}

async function syncCalendar(request: CalendarSyncRequest): Promise<{
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  conflicts: Array<{ hubEvent: string; externalEvent: string; resolution: string }>;
}> {
  // Two-way sync logic
  const hubEvents = await getHubEvents(request.dateRange);
  const externalEvents = await getExternalEvents(request);
  
  let created = 0, updated = 0, deleted = 0;
  const conflicts: Array<{ hubEvent: string; externalEvent: string; resolution: string }> = [];

  // Sync Hub → External
  for (const hubEvent of hubEvents) {
    const match = externalEvents.find(e => e.hubId === hubEvent.id);
    if (!match) {
      // Create in external calendar
      await createExternalEvent(request, hubEvent);
      created++;
    } else if (new Date(hubEvent.updatedAt) > new Date(match.updatedAt)) {
      // Hub is newer - update external
      await updateExternalEvent(request, hubEvent, match.id);
      updated++;
    } else if (new Date(hubEvent.updatedAt) < new Date(match.updatedAt)) {
      // External is newer - update Hub
      conflicts.push({
        hubEvent: hubEvent.title,
        externalEvent: match.title,
        resolution: 'external_wins'
      });
    }
  }

  // Sync External → Hub
  for (const extEvent of externalEvents) {
    if (!extEvent.hubId) {
      // New external event - import to Hub
      await importToHub(extEvent);
      created++;
    }
  }

  return {
    synced: hubEvents.length + externalEvents.length,
    created,
    updated,
    deleted,
    conflicts
  };
}

async function listEvents(request: CalendarSyncRequest): Promise<{
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    source: 'hub' | 'external';
    synced: boolean;
  }>;
}> {
  const events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    source: 'hub' | 'external';
    synced: boolean;
  }> = [];

  // Fetch from external calendar API
  if (request.provider === 'google' && request.accessToken) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${request.dateRange?.start || new Date().toISOString()}&` +
      `timeMax=${request.dateRange?.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${request.accessToken}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      for (const item of data.items || []) {
        events.push({
          id: item.id,
          title: item.summary || 'Untitled',
          start: item.start?.dateTime || item.start?.date,
          end: item.end?.dateTime || item.end?.date,
          source: 'external',
          synced: !!item.extendedProperties?.private?.hubId
        });
      }
    }
  }

  return { events };
}

async function createEvent(request: CalendarSyncRequest): Promise<{
  eventId: string;
  externalId?: string;
  syncStatus: string;
}> {
  if (!request.event) throw new Error('Event data required');

  const eventId = `event_${Date.now()}`;
  let externalId: string | undefined;

  // Create in external calendar
  if (request.provider === 'google' && request.accessToken) {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: request.event.title,
          description: request.event.description,
          start: { dateTime: request.event.startTime },
          end: { dateTime: request.event.endTime },
          location: request.event.location,
          attendees: request.event.attendees?.map(email => ({ email })),
          extendedProperties: {
            private: { hubId: eventId, showId: request.event.showId }
          }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      externalId = data.id;
    }
  }

  return {
    eventId,
    externalId,
    syncStatus: externalId ? 'synced' : 'local_only'
  };
}

async function updateEvent(request: CalendarSyncRequest): Promise<{
  updated: boolean;
  syncStatus: string;
}> {
  if (!request.event?.id) throw new Error('Event ID required');

  // Update in external calendar
  if (request.provider === 'google' && request.accessToken) {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${request.event.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${request.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: request.event.title,
          description: request.event.description,
          start: { dateTime: request.event.startTime },
          end: { dateTime: request.event.endTime }
        })
      }
    );
  }

  return { updated: true, syncStatus: 'synced' };
}

async function deleteEvent(request: CalendarSyncRequest): Promise<{
  deleted: boolean;
}> {
  if (!request.event?.id) throw new Error('Event ID required');

  if (request.provider === 'google' && request.accessToken) {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${request.event.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${request.accessToken}`
        }
      }
    );
  }

  return { deleted: true };
}

async function disconnectCalendar(provider: string): Promise<{ disconnected: boolean }> {
  // In production, revoke tokens and clear stored credentials
  return { disconnected: true };
}

// Helper functions (would connect to database in production)
async function getHubEvents(dateRange?: { start: string; end: string }): Promise<any[]> {
  return []; // Would query shows/sessions from database
}

async function getExternalEvents(request: CalendarSyncRequest): Promise<any[]> {
  return []; // Would call provider API
}

async function createExternalEvent(request: CalendarSyncRequest, hubEvent: any) {
  // Would create via provider API
}

async function updateExternalEvent(request: CalendarSyncRequest, hubEvent: any, externalId: string) {
  // Would update via provider API
}

async function importToHub(externalEvent: any) {
  // Would create show/session in Hub
}
