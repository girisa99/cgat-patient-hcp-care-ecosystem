
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AuditLogFilters {
  user_id?: string;
  table_name?: string;
  action_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

interface AuditLogData {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AuditLogResponse {
  success: boolean;
  data: AuditLogData[];
  metadata: {
    total_logs: number;
    today_logs: number;
    filtered_count: number;
  };
}

export const useAuditLogs = (filters?: AuditLogFilters) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for audit logs
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for audit logs...');
    
    const channel = supabase
      .channel('audit_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('📡 Real-time audit log event received:', payload);
          
          // Invalidate and refetch audit logs when changes occur
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
          queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Audit logs real-time subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up audit logs real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async (): Promise<AuditLogResponse> => {
      console.log('🔍 Fetching audit logs with filters:', filters);
      
      const { data, error } = await supabase.functions.invoke('audit-logs', {
        body: {
          action: 'get_logs',
          filters: filters || { limit: 100 }
        }
      });

      if (error) {
        console.error('❌ Error fetching audit logs:', error);
        throw error;
      }

      console.log('✅ Audit logs fetched successfully:', data);
      return data;
    },
    staleTime: 0, // Always consider data stale to allow fresh fetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on mount
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useAuditLogStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for stats updates
  useEffect(() => {
    console.log('📊 Setting up real-time subscription for audit log stats...');
    
    const channel = supabase
      .channel('audit_stats_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          console.log('📊 Audit log changed, updating stats...');
          queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: async () => {
      console.log('📊 Fetching audit log statistics');
      
      const { data, error } = await supabase.functions.invoke('audit-logs', {
        body: {
          action: 'get_logs',
          filters: { limit: 1 } // Just get metadata
        }
      });

      if (error) {
        console.error('❌ Error fetching audit log stats:', error);
        throw error;
      }

      return data.metadata;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};
