
import { useQuery } from '@tanstack/react-query';

interface UsageEntry {
  keyName: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
}

interface Metrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
}

interface Alert {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const useApiKeyMonitor = () => {
  const {
    data: monitoringData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['api-key-monitoring'],
    queryFn: async () => {
      console.log('📊 Fetching API key monitoring data...');
      
      // Mock data for demonstration
      const usage: UsageEntry[] = [
        {
          keyName: 'Production API Key',
          endpoint: '/api/v1/patients',
          method: 'GET',
          status: 200,
          responseTime: 145,
          timestamp: new Date().toISOString()
        }
      ];

      const metrics: Metrics = {
        totalRequests: 1250,
        successRate: 98.2,
        avgResponseTime: 165
      };

      const alerts: Alert[] = [];

      return { usage, metrics, alerts };
    },
    staleTime: 30000
  });

  return {
    usage: monitoringData?.usage || [],
    metrics: monitoringData?.metrics || { totalRequests: 0, successRate: 0, avgResponseTime: 0 },
    alerts: monitoringData?.alerts || [],
    isLoading,
    error
  };
};
