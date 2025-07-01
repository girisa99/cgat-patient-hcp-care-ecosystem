
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsumptionLog {
  id: string;
  api_integration_id: string;
  endpoint_path: string;
  method: string;
  consumer_id?: string;
  request_timestamp: string;
  response_status?: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  request_size_bytes?: number;
  response_size_bytes?: number;
  error_details?: any;
}

interface ConsumptionStats {
  totalRequests: number;
  todayRequests: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}

export const useApiConsumption = () => {
  const { toast } = useToast();

  // Fetch consumption logs
  const { data: consumptionLogs = [], isLoading } = useQuery({
    queryKey: ['api-consumption-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_consumption_logs')
        .select('*')
        .order('request_timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching consumption logs:', error);
        throw error;
      }

      return data as ConsumptionLog[];
    },
  });

  // Calculate consumption statistics
  const getConsumptionStats = (): ConsumptionStats => {
    if (!consumptionLogs.length) {
      return {
        totalRequests: 0,
        todayRequests: 0,
        successRate: 0,
        errorRate: 0,
        avgResponseTime: 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayLogs = consumptionLogs.filter(log => 
      new Date(log.request_timestamp) >= today
    );

    const successfulRequests = consumptionLogs.filter(log => 
      log.response_status && log.response_status >= 200 && log.response_status < 300
    );

    const errorRequests = consumptionLogs.filter(log => 
      log.response_status && log.response_status >= 400
    );

    const logsWithResponseTime = consumptionLogs.filter(log => log.response_time_ms);
    const avgResponseTime = logsWithResponseTime.length > 0 
      ? Math.round(logsWithResponseTime.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logsWithResponseTime.length)
      : 0;

    return {
      totalRequests: consumptionLogs.length,
      todayRequests: todayLogs.length,
      successRate: consumptionLogs.length > 0 ? Math.round((successfulRequests.length / consumptionLogs.length) * 100) : 0,
      errorRate: consumptionLogs.length > 0 ? Math.round((errorRequests.length / consumptionLogs.length) * 100) : 0,
      avgResponseTime
    };
  };

  // Search logs
  const searchLogs = (logs: ConsumptionLog[], query: string): ConsumptionLog[] => {
    if (!query.trim()) return logs;
    
    const searchTerm = query.toLowerCase();
    return logs.filter(log => 
      log.endpoint_path.toLowerCase().includes(searchTerm) ||
      log.method.toLowerCase().includes(searchTerm) ||
      (log.user_agent && log.user_agent.toLowerCase().includes(searchTerm))
    );
  };

  // Filter logs by status
  const filterByStatus = (logs: ConsumptionLog[], statusFilter: string): ConsumptionLog[] => {
    if (statusFilter === 'all') return logs;
    
    return logs.filter(log => {
      if (!log.response_status) return false;
      
      switch (statusFilter) {
        case 'success':
          return log.response_status >= 200 && log.response_status < 300;
        case 'client-error':
          return log.response_status >= 400 && log.response_status < 500;
        case 'server-error':
          return log.response_status >= 500;
        default:
          return true;
      }
    });
  };

  // Export logs
  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Method', 'Endpoint', 'Status', 'Response Time (ms)', 'IP Address'],
        ...consumptionLogs.map(log => [
          new Date(log.request_timestamp).toISOString(),
          log.method,
          log.endpoint_path,
          log.response_status?.toString() || '',
          log.response_time_ms?.toString() || '',
          log.ip_address || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api-consumption-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Consumption logs have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export consumption logs.",
        variant: "destructive",
      });
    }
  };

  return {
    consumptionLogs,
    isLoading,
    getConsumptionStats,
    searchLogs,
    filterByStatus,
    exportLogs
  };
};
