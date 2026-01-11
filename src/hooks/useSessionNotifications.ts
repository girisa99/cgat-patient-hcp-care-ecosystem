/**
 * Hook for managing session update notifications
 * Tracks session changes and notifies participants when updates are made
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SessionUpdateType = 
  | 'script_updated' 
  | 'title_changed' 
  | 'schedule_changed' 
  | 'attachment_updated' 
  | 'description_changed';

interface NotifySessionUpdateParams {
  sessionId: string;
  updateType: SessionUpdateType;
  previousValue?: any;
  newValue?: any;
  notifyParticipants?: boolean;
  customMessage?: string;
}

interface SessionActivity {
  id: string;
  session_id: string;
  user_id: string | null;
  activity_type: string;
  activity_title: string;
  activity_description: string | null;
  previous_value: any;
  new_value: any;
  metadata: any;
  created_at: string;
}

interface UseSessionNotificationsReturn {
  isNotifying: boolean;
  activities: SessionActivity[];
  fetchActivities: (sessionId: string) => Promise<void>;
  notifySessionUpdate: (params: NotifySessionUpdateParams) => Promise<boolean>;
  updateSessionWithNotification: (
    sessionId: string, 
    updates: Record<string, any>,
    updateType: SessionUpdateType,
    notifyParticipants?: boolean
  ) => Promise<boolean>;
}

export const useSessionNotifications = (): UseSessionNotificationsReturn => {
  const [isNotifying, setIsNotifying] = useState(false);
  const [activities, setActivities] = useState<SessionActivity[]>([]);

  const fetchActivities = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('genie_session_activity')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, []);

  const notifySessionUpdate = useCallback(async (params: NotifySessionUpdateParams): Promise<boolean> => {
    setIsNotifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('session-update-notify', {
        body: {
          session_id: params.sessionId,
          update_type: params.updateType,
          previous_value: params.previousValue,
          new_value: params.newValue,
          notify_participants: params.notifyParticipants ?? true,
          custom_message: params.customMessage,
        },
      });

      if (error) {
        console.error('Notification error:', error);
        toast.error('Failed to send update notification');
        return false;
      }

      if (data?.notifications_sent > 0) {
        toast.success(`Update notification sent to ${data.notifications_sent} participant(s)`);
      }

      return true;
    } catch (err) {
      console.error('Session notification failed:', err);
      toast.error('Failed to notify participants');
      return false;
    } finally {
      setIsNotifying(false);
    }
  }, []);

  const updateSessionWithNotification = useCallback(async (
    sessionId: string,
    updates: Record<string, any>,
    updateType: SessionUpdateType,
    notifyParticipants: boolean = true
  ): Promise<boolean> => {
    setIsNotifying(true);

    try {
      // First get current session values
      const { data: currentSession, error: fetchError } = await supabase
        .from('genie_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        toast.error('Failed to fetch session');
        return false;
      }

      // Build previous values for tracking
      const previousValues: Record<string, any> = {};
      for (const key of Object.keys(updates)) {
        previousValues[key] = currentSession[key];
      }

      // Update session
      const { error: updateError } = await supabase
        .from('genie_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
        toast.error('Failed to update session');
        return false;
      }

      // Send notification
      if (notifyParticipants) {
        await notifySessionUpdate({
          sessionId,
          updateType,
          previousValue: previousValues,
          newValue: updates,
          notifyParticipants: true,
        });
      }

      toast.success('Session updated successfully');
      return true;
    } catch (err) {
      console.error('Update with notification failed:', err);
      toast.error('Failed to update session');
      return false;
    } finally {
      setIsNotifying(false);
    }
  }, [notifySessionUpdate]);

  return {
    isNotifying,
    activities,
    fetchActivities,
    notifySessionUpdate,
    updateSessionWithNotification,
  };
};
