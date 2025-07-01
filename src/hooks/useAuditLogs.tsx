
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useAuditLogsData } from './auditLogs/useAuditLogsData';

/**
 * Consolidated Audit Logs Hook - Using Universal Template
 */
export const useAuditLogs = () => {
  const config = {
    tableName: 'audit_logs' as const,
    moduleName: 'AuditLogs',
    requiredFields: ['action'],
    customValidation: (data: any) => {
      return !!(data.action);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { data: auditLogs, isLoading, error, refetch } = useAuditLogsData();

  // Audit logs statistics
  const getAuditStats = () => {
    const logs = auditLogs || [];
    
    const actionBreakdown = logs.reduce((acc: any, log: any) => {
      const action = log.action || 'Unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    const todayLogs = logs.filter((log: any) => {
      const logDate = new Date(log.created_at).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    }).length;

    return {
      total: logs.length,
      today: todayLogs,
      actionBreakdown
    };
  };

  return {
    // Core data
    auditLogs: auditLogs || [],
    isLoading,
    error,
    refetch,
    
    // Enhanced functionality
    getAuditStats,
    
    // Template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      logCount: auditLogs?.length || 0,
      dataSource: 'audit_logs table',
      consolidationStatus: 'CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};
