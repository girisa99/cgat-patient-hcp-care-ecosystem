/**
 * useCalendarSync - Hook for integrating with external calendar providers
 * Wraps the calendar-sync edge function for Google, Outlook, and Apple calendars.
 *
 * Supports: connect, sync, list_events, create_event, update_event, delete_event, disconnect
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CalendarProvider = 'google' | 'outlook' | 'apple';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  reminders?: { minutes: number; method: 'email' | 'popup' }[];
  showId?: string;
}

interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  conflicts: Array<{ eventId: string; type: string; details: string }>;
}

interface ExternalCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: string;
  synced: boolean;
}

export function useCalendarSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedProvider, setConnectedProvider] = useState<CalendarProvider | null>(null);

  const invoke = useCallback(async (body: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await supabase.functions.invoke('calendar-sync', { body });
      if (apiError) throw apiError;
      if (!data?.success) throw new Error(data?.error || 'Calendar sync failed');
      return data;
    } catch (err: any) {
      const msg = err.message || 'Calendar operation failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectToCalendar = useCallback(async (provider: CalendarProvider): Promise<{ authUrl: string; state: string }> => {
    const data = await invoke({ action: 'connect', provider });
    setConnectedProvider(provider);
    return { authUrl: data.authUrl, state: data.state };
  }, [invoke]);

  const listCalendarEvents = useCallback(async (
    provider: CalendarProvider,
    accessToken: string,
    dateRange?: { start: string; end: string }
  ): Promise<ExternalCalendarEvent[]> => {
    const data = await invoke({ action: 'list_events', provider, accessToken, dateRange });
    return data.events || [];
  }, [invoke]);

  const createCalendarEvent = useCallback(async (
    provider: CalendarProvider,
    accessToken: string,
    event: CalendarEvent
  ): Promise<{ eventId: string; externalId?: string; syncStatus: string }> => {
    const data = await invoke({ action: 'create_event', provider, accessToken, event });
    toast.success('Event created in calendar');
    return { eventId: data.eventId, externalId: data.externalId, syncStatus: data.syncStatus };
  }, [invoke]);

  const updateCalendarEvent = useCallback(async (
    provider: CalendarProvider,
    accessToken: string,
    event: CalendarEvent
  ): Promise<{ updated: boolean; syncStatus: string }> => {
    const data = await invoke({ action: 'update_event', provider, accessToken, event });
    toast.success('Calendar event updated');
    return { updated: data.updated, syncStatus: data.syncStatus };
  }, [invoke]);

  const deleteCalendarEvent = useCallback(async (
    provider: CalendarProvider,
    accessToken: string,
    eventId: string
  ): Promise<{ deleted: boolean }> => {
    const data = await invoke({ action: 'delete_event', provider, accessToken, event: { id: eventId, title: '' } });
    toast.success('Calendar event deleted');
    return { deleted: data.deleted };
  }, [invoke]);

  const syncCalendars = useCallback(async (
    provider: CalendarProvider,
    accessToken: string,
    dateRange?: { start: string; end: string }
  ): Promise<SyncResult> => {
    const data = await invoke({ action: 'sync', provider, accessToken, dateRange });
    const { synced, created, updated, deleted, conflicts } = data;
    toast.success(`Calendar synced: ${synced} events (${created} new, ${updated} updated)`);
    return { synced, created, updated, deleted, conflicts: conflicts || [] };
  }, [invoke]);

  const disconnectCalendar = useCallback(async (provider: CalendarProvider): Promise<void> => {
    await invoke({ action: 'disconnect', provider });
    setConnectedProvider(null);
    toast.info('Calendar disconnected');
  }, [invoke]);

  return {
    connectToCalendar,
    listCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    syncCalendars,
    disconnectCalendar,
    connectedProvider,
    isLoading,
    error,
  };
}
