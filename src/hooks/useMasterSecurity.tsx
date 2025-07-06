
/**
 * MASTER SECURITY HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all security functionality
 * Version: master-security-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useMasterAuth } from './useMasterAuth';

export const useMasterSecurity = () => {
  console.log('🔒 Master Security Hook - Single source of truth');
  
  const { showSuccess, showError } = useMasterToast();
  const { user } = useMasterAuth();
  const queryClient = useQueryClient();

  const { data: securityEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['master-security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['master-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const logSecurityEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { data, error } = await supabase
        .rpc('log_security_event', {
          p_user_id: user?.id,
          p_event_type: eventData.event_type,
          p_severity: eventData.severity,
          p_description: eventData.description,
          p_metadata: eventData.metadata || {}
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-security-events'] });
      showSuccess('Security Event Logged', 'Security event recorded successfully');
    },
    onError: (error: any) => {
      showError('Logging Failed', error.message);
    }
  });

  const securityStats = {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    highEvents: securityEvents.filter(e => e.severity === 'high').length,
    mediumEvents: securityEvents.filter(e => e.severity === 'medium').length,
    lowEvents: securityEvents.filter(e => e.severity === 'low').length,
    recentEvents: securityEvents.slice(0, 10),
  };

  const auditStats = {
    totalLogs: auditLogs.length,
    recentLogs: auditLogs.slice(0, 10),
    actionTypes: auditLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    // Core data
    securityEvents,
    auditLogs,
    securityStats,
    auditStats,
    
    // Loading states
    isLoading: eventsLoading || auditLoading,
    isLoggingEvent: logSecurityEventMutation.isPending,
    
    // Actions
    logSecurityEvent: (data: any) => logSecurityEventMutation.mutate(data),
    
    // Meta
    meta: {
      hookName: 'useMasterSecurity',
      version: 'master-security-v1.0.0',
      singleSourceValidated: true,
      securityConsolidated: true,
      dataSource: 'security_events-audit_logs-tables'
    }
  };
};
