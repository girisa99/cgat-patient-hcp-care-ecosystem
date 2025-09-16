/**
 * ENROLLMENT REALTIME HOOK
 * Manages real-time database updates for enrollment processes
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentRealtimeState {
  isConnected: boolean;
  lastUpdate: string;
  activeEnrollments: number;
  sessionData: Record<string, any>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

interface RealtimeUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  old: Record<string, any> | null;
  new: Record<string, any> | null;
  timestamp: string;
}

export const useEnrollmentRealtime = (sessionId?: string) => {
  const [state, setState] = useState<EnrollmentRealtimeState>({
    isConnected: false,
    lastUpdate: new Date().toISOString(),
    activeEnrollments: 0,
    sessionData: {},
    connectionStatus: 'disconnected'
  });

  const [channel, setChannel] = useState<any>(null);
  const { toast } = useToast();

  // Connect to real-time channel
  const connect = useCallback((targetSessionId?: string) => {
    if (channel) {
      supabase.removeChannel(channel);
    }

    const sessionChannel = targetSessionId || sessionId || 'global_enrollment';
    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    const newChannel = supabase
      .channel(`enrollment_${sessionChannel}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_conversations'
      }, (payload) => {
        handleRealtimeUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          table: 'agent_conversations',
          old: payload.old,
          new: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enrollment_instances'
      }, (payload) => {
        handleRealtimeUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          table: 'enrollment_instances',
          old: payload.old,
          new: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState();
        setState(prev => ({
          ...prev,
          isConnected: true,
          activeEnrollments: Object.keys(presenceState).length,
          connectionStatus: 'connected',
          lastUpdate: new Date().toISOString()
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('📥 New enrollment session joined:', key, newPresences);
        setState(prev => ({
          ...prev,
          activeEnrollments: prev.activeEnrollments + 1,
          lastUpdate: new Date().toISOString()
        }));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('📤 Enrollment session left:', key, leftPresences);
        setState(prev => ({
          ...prev,
          activeEnrollments: Math.max(0, prev.activeEnrollments - 1),
          lastUpdate: new Date().toISOString()
        }));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setState(prev => ({ ...prev, connectionStatus: 'connected', isConnected: true }));
          console.log('✅ Enrollment realtime connected:', sessionChannel);
        } else if (status === 'CHANNEL_ERROR') {
          setState(prev => ({ ...prev, connectionStatus: 'error', isConnected: false }));
          console.error('❌ Enrollment realtime error:', sessionChannel);
        }
      });

    setChannel(newChannel);
  }, [sessionId, channel]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((update: RealtimeUpdate) => {
    console.log('🔄 Real-time enrollment update:', update);

    setState(prev => ({
      ...prev,
      lastUpdate: update.timestamp,
      sessionData: {
        ...prev.sessionData,
        [update.table]: {
          ...prev.sessionData[update.table],
          lastUpdate: update.timestamp,
          eventType: update.eventType,
          data: update.new || update.old
        }
      }
    }));

    // Show toast notification for important updates
    if (update.eventType === 'INSERT' && update.table === 'enrollment_instances') {
      toast({
        title: "New Enrollment Started",
        description: "A new enrollment instance has been created"
      });
    } else if (update.eventType === 'UPDATE' && update.new?.status === 'completed') {
      toast({
        title: "Enrollment Completed",
        description: "An enrollment has been successfully completed"
      });
    }
  }, [toast]);

  // Disconnect from real-time channel
  const disconnect = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected'
    }));
  }, [channel]);

  // Track presence for this enrollment session
  const trackPresence = useCallback(async (enrollmentData: Record<string, any>) => {
    if (!channel) return;

    const presenceData = {
      session_id: sessionId || 'anonymous',
      enrollment_type: enrollmentData.moduleType || 'unknown',
      status: enrollmentData.status || 'active',
      timestamp: new Date().toISOString(),
      ...enrollmentData
    };

    try {
      await channel.track(presenceData);
      console.log('📍 Tracking enrollment presence:', presenceData);
    } catch (error) {
      console.error('Failed to track presence:', error);
    }
  }, [channel, sessionId]);

  // Untrack presence
  const untrackPresence = useCallback(async () => {
    if (!channel) return;

    try {
      await channel.untrack();
      console.log('📍 Stopped tracking enrollment presence');
    } catch (error) {
      console.error('Failed to untrack presence:', error);
    }
  }, [channel]);

  // Update enrollment data in real-time
  const updateEnrollmentData = useCallback(async (
    instanceId: string,
    sectionId: string,
    data: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from('enrollment_instances')
        .update({
          form_data: data,
          current_section: sectionId,
          updated_at: new Date().toISOString()
        })
        .eq('instance_id', instanceId);

      if (error) throw error;

      console.log('✅ Real-time enrollment data updated:', { instanceId, sectionId });
      
      // This will trigger the real-time listener automatically
      return true;
    } catch (error) {
      console.error('❌ Failed to update enrollment data:', error);
      return false;
    }
  }, []);

  // Create conversation entry with real-time sync
  const createConversationEntry = useCallback(async (
    conversationData: Record<string, any>
  ) => {
    try {
      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          session_id: conversationData.sessionId,
          agent_id: conversationData.agentId,
          conversation_data: conversationData.data,
          healthcare_context: conversationData.healthcareContext || {},
          metadata: conversationData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Real-time conversation entry created:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to create conversation entry:', error);
      return null;
    }
  }, []);

  // Auto-connect on mount if sessionId provided
  useEffect(() => {
    if (sessionId) {
      connect(sessionId);
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  return {
    // State
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    activeEnrollments: state.activeEnrollments,
    sessionData: state.sessionData,
    connectionStatus: state.connectionStatus,
    
    // Actions
    connect,
    disconnect,
    trackPresence,
    untrackPresence,
    updateEnrollmentData,
    createConversationEntry,
    
    // Computed
    isHealthy: state.isConnected && state.connectionStatus === 'connected',
    hasActiveEnrollments: state.activeEnrollments > 0,
    lastUpdateTime: new Date(state.lastUpdate).getTime()
  };
};