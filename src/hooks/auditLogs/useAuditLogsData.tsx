
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Focused hook for audit logs data fetching
 */
export const useAuditLogsData = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      console.log('🔍 Fetching audit logs data via template...');
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) {
        console.error('❌ Error fetching audit logs:', error);
        throw error;
      }

      console.log('✅ Audit logs data fetched:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches audit logs data',
      dataSource: 'audit_logs table',
      requiresAuth: true
    }
  });
};
