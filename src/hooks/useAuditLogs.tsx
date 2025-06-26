
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useAuditLogStats = () => {
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
    staleTime: 60000, // 1 minute
  });
};
