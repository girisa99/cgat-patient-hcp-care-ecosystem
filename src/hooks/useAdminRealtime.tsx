
/**
 * ADMIN REALTIME HOOK - FIXED INTERFACES
 * Uses proper AdminRealtimeState interface
 */
import { useState, useEffect } from 'react';
import { AdminRealtimeState } from '@/types/formState';
import { supabase } from '@/integrations/supabase/client';

export const useAdminRealtime = () => {
  const [state, setState] = useState<AdminRealtimeState>({
    isConnected: false,
    lastUpdate: new Date().toISOString(),
    activeUsers: 0,
    systemHealth: 100
  });

  useEffect(() => {
    const channel = supabase.channel('admin-realtime');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setState(prev => ({
          ...prev,
          isConnected: true,
          activeUsers: Object.keys(newState).length,
          lastUpdate: new Date().toISOString()
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    ...state,
    setState
  };
};
