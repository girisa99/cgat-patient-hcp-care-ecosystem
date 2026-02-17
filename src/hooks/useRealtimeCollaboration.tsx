import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAgentBuilder } from '@/components/agent-builder/AgentBuilderProvider';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CollaboratorPresence {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  cursor_position?: { x: number; y: number };
  active_component?: string;
  last_activity: string;
}

interface WorkflowChange {
  type: 'node_added' | 'node_removed' | 'node_updated' | 'connection_added' | 'connection_removed' | 'chat_message' | 'property_changed';
  data: any;
  user_id: string;
  timestamp: string;
}

export const useRealtimeCollaboration = (sessionId: string) => {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { user } = useAgentBuilder();

  const broadcastWorkflowChange = useCallback((change: Omit<WorkflowChange, 'user_id' | 'timestamp'>) => {
    if (channel && user) {
      channel.send({
        type: 'broadcast',
        event: 'workflow_change',
        payload: {
          ...change,
          user_id: user.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [channel, user]);

  const updatePresence = useCallback((data: Partial<CollaboratorPresence>) => {
    if (channel && user) {
      channel.track({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email || 'Anonymous',
        avatar_url: user.user_metadata?.avatar_url,
        last_activity: new Date().toISOString(),
        ...data
      });
    }
  }, [channel, user]);

  useEffect(() => {
    if (!sessionId || !user) return;

    const roomChannel = supabase.channel(`agent_session_${sessionId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Handle presence sync
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const presences = roomChannel.presenceState<CollaboratorPresence>();
        const collaboratorsList = Object.values(presences).flat();
        setCollaborators(collaboratorsList.filter(c => c.user_id !== user.id));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New collaborator joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Collaborator left:', leftPresences);
      })
      .on('broadcast', { event: 'workflow_change' }, ({ payload }) => {
        console.log('Workflow change received:', payload);
        // Handle workflow changes from other users
        window.dispatchEvent(new CustomEvent('workflow_change', { detail: payload }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setChannel(roomChannel);
          
          // Set initial presence
          await roomChannel.track({
            user_id: user.id,
            user_name: user.user_metadata?.name || user.email || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            last_activity: new Date().toISOString()
          });
        }
      });

    return () => {
      roomChannel.unsubscribe();
      setIsConnected(false);
      setChannel(null);
    };
  }, [sessionId, user]);

  return {
    collaborators,
    isConnected,
    broadcastWorkflowChange,
    updatePresence
  };
};