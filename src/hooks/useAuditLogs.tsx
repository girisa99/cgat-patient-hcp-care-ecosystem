
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

  // Enhanced real-time subscription for audit logs, active_issues, and issue_fixes
  useEffect(() => {
    console.log('🔄 Setting up enhanced real-time subscription for audit logs...');
    
    // Subscribe to audit_logs table changes
    const auditChannel = supabase
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

    // Subscribe to active_issues table changes (verification system activities)
    const issuesChannel = supabase
      .channel('active_issues_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_issues'
        },
        (payload) => {
          console.log('📡 Real-time active issues event received:', payload);
          
          // Invalidate audit logs as active_issues changes are now logged
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
          queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Active issues real-time subscription status:', status);
      });

    // Subscribe to issue_fixes table changes (verification system activities)
    const fixesChannel = supabase
      .channel('issue_fixes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_fixes'
        },
        (payload) => {
          console.log('📡 Real-time issue fixes event received:', payload);
          
          // Invalidate audit logs as issue_fixes changes are now logged
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
          queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Issue fixes real-time subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up enhanced audit logs real-time subscriptions');
      supabase.removeChannel(auditChannel);
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(fixesChannel);
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
    refetchInterval: 15000, // Refetch every 15 seconds for real-time feel (more frequent)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on mount
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useAuditLogStats = () => {
  const queryClient = useQueryClient();

  // Enhanced real-time subscription for stats updates
  useEffect(() => {
    console.log('📊 Setting up enhanced real-time subscription for audit log stats...');
    
    const channels = [
      // Audit logs
      supabase
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
        .subscribe(),
      
      // Active issues
      supabase
        .channel('active_issues_stats_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'active_issues'
          },
          () => {
            console.log('📊 Active issues changed, updating stats...');
            queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
          }
        )
        .subscribe(),
      
      // Issue fixes
      supabase
        .channel('issue_fixes_stats_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'issue_fixes'
          },
          () => {
            console.log('📊 Issue fixes changed, updating stats...');
            queryClient.invalidateQueries({ queryKey: ['audit-log-stats'] });
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
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
    staleTime: 15000, // 15 seconds (reduced for more real-time updates)
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
