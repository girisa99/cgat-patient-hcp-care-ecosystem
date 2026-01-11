/**
 * Genie Session Hook
 * Manages session creation, participant management, and invites
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SessionParticipant {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist' | 'attendee';
  email_reminder_24h?: boolean;
  email_reminder_1h?: boolean;
  email_reminder_30m?: boolean;
  email_reminder_15m?: boolean;
  sms_reminder_30m?: boolean;
  sms_reminder_15m?: boolean;
}

export interface CreateSessionParams {
  title: string;
  description?: string;
  session_type: string;
  session_mode: 'browser' | 'zoom' | 'google_meet' | 'teams';
  production_stage?: string;
  scheduled_at: Date;
  duration_minutes?: number;
  timezone?: string;
  script_id?: string;
  agenda?: string;
  host_name: string;
  host_email?: string;
  external_meeting_url?: string;
  participants: SessionParticipant[];
}

export interface SessionData {
  id: string;
  title: string;
  description?: string;
  session_type: string;
  session_mode: string;
  production_stage: string;
  scheduled_at: string;
  duration_minutes: number;
  session_token: string;
  host_token: string;
  join_url?: string;
  external_meeting_url?: string;
  waiting_room_enabled: boolean;
  session_active_at: string;
  status: string;
  host_name?: string;
  host_email?: string;
  agenda?: string;
  script_id?: string;
}

export interface CalendarLinks {
  google: string;
  outlook: string;
  ics_content: string;
}

export const useGenieSession = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [createdSession, setCreatedSession] = useState<SessionData | null>(null);
  const [calendarLinks, setCalendarLinks] = useState<CalendarLinks | null>(null);

  const createSession = useCallback(async (params: CreateSessionParams) => {
    setIsCreating(true);
    try {
      console.log('Creating session:', params.title);

      const { data, error } = await supabase.functions.invoke('create-session', {
        body: {
          ...params,
          scheduled_at: params.scheduled_at.toISOString(),
        },
      });

      if (error) {
        console.error('Session creation error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create session');
      }

      setCreatedSession(data.session);
      setCalendarLinks(data.calendar_links);

      toast.success('Session created successfully!');
      return {
        session: data.session,
        participants: data.participants,
        calendarLinks: data.calendar_links,
      };
    } catch (error: any) {
      console.error('Create session error:', error);
      toast.error(error.message || 'Failed to create session');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const sendInvites = useCallback(async (sessionId: string, participantIds?: string[]) => {
    setIsSendingInvites(true);
    try {
      console.log('Sending invites for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('send-session-invites', {
        body: {
          session_id: sessionId,
          participants: participantIds,
        },
      });

      if (error) {
        console.error('Send invites error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invites');
      }

      toast.success(`Sent ${data.total_sent} invite(s)!`);
      return data.results;
    } catch (error: any) {
      console.error('Send invites error:', error);
      toast.error(error.message || 'Failed to send invites');
      throw error;
    } finally {
      setIsSendingInvites(false);
    }
  }, []);

  const createAndSendInvites = useCallback(async (params: CreateSessionParams) => {
    const result = await createSession(params);
    if (result?.session?.id) {
      await sendInvites(result.session.id);
    }
    return result;
  }, [createSession, sendInvites]);

  const getSessionByToken = useCallback(async (token: string, isHost = false) => {
    try {
      const tokenField = isHost ? 'host_token' : 'session_token';
      const { data, error } = await supabase
        .from('genie_sessions')
        .select('*')
        .eq(tokenField, token)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Get session error:', error);
      return null;
    }
  }, []);

  const getParticipantByToken = useCallback(async (sessionToken: string, participantToken: string) => {
    try {
      // First get the session
      const { data: session, error: sessionError } = await supabase
        .from('genie_sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      // Then get the participant
      const { data: participant, error: participantError } = await supabase
        .from('genie_session_participants')
        .select('*')
        .eq('session_id', session.id)
        .eq('participant_token', participantToken)
        .single();

      if (participantError) {
        throw participantError;
      }

      return participant;
    } catch (error: any) {
      console.error('Get participant error:', error);
      return null;
    }
  }, []);

  const updateParticipantStatus = useCallback(async (participantId: string, status: 'waiting' | 'joined' | 'left') => {
    try {
      const updates: any = { join_status: status };
      if (status === 'joined') {
        updates.joined_at = new Date().toISOString();
      } else if (status === 'left') {
        updates.left_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('genie_session_participants')
        .update(updates)
        .eq('id', participantId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Update participant status error:', error);
    }
  }, []);

  const startSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('genie_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Session started!');
    } catch (error: any) {
      console.error('Start session error:', error);
      toast.error('Failed to start session');
    }
  }, []);

  const endSession = useCallback(async (sessionId: string, recordingUrl?: string) => {
    try {
      const { error } = await supabase
        .from('genie_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          recording_url: recordingUrl,
        })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Session ended!');
    } catch (error: any) {
      console.error('End session error:', error);
      toast.error('Failed to end session');
    }
  }, []);

  const admitParticipant = useCallback(async (participantId: string) => {
    await updateParticipantStatus(participantId, 'joined');
    toast.success('Participant admitted');
  }, [updateParticipantStatus]);

  return {
    isCreating,
    isSendingInvites,
    createdSession,
    calendarLinks,
    createSession,
    sendInvites,
    createAndSendInvites,
    getSessionByToken,
    getParticipantByToken,
    updateParticipantStatus,
    startSession,
    endSession,
    admitParticipant,
  };
};

export default useGenieSession;
