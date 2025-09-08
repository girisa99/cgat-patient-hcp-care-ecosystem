import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseAgentSessionRealtimeProps {
  sessionId?: string;
  onSessionUpdate?: (session: any) => void;
}

export const useAgentSessionRealtime = ({ 
  sessionId, 
  onSessionUpdate 
}: UseAgentSessionRealtimeProps) => {
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('agent-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Agent session updated:', payload);
          
          // Only show toast if it's not the current user's update
          // (to avoid showing toast when user saves their own changes)
          if (payload.new && onSessionUpdate) {
            onSessionUpdate(payload.new);
            
            // Optional: Show subtle notification for external updates
            if (payload.new.updated_at !== payload.old?.updated_at) {
              console.log('Configuration updated in real-time');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, onSessionUpdate]);
};