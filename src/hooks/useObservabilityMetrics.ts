import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useObservabilityMetrics = () => {
  // Fetch traces from database
  const { data: traces = [], isLoading: isLoadingTraces } = useQuery({
    queryKey: ['ai-workflow-traces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_workflow_traces')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate metrics from traces
  const metrics = {
    totalTraces: traces.length,
    successRate: traces.length > 0 
      ? (traces.filter(t => t.status === 'success').length / traces.length) * 100 
      : 0,
    avgResponseTime: traces.length > 0 
      ? traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length 
      : 0,
    totalDuration: traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0),
    errorRate: traces.length > 0 
      ? (traces.filter(t => t.status === 'error').length / traces.length) * 100 
      : 0,
  };

  // Fetch Arize metrics
  const { data: arizeMetrics, isLoading: isLoadingArize } = useQuery({
    queryKey: ['arize-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('arize-integration', {
        body: { 
          action: 'get_metrics',
          data: {}
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: true, // Only fetch if Arize is enabled
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch LangWatch analytics
  const { data: langwatchAnalytics, isLoading: isLoadingLangWatch } = useQuery({
    queryKey: ['langwatch-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('langwatch-integration', {
        body: { 
          action: 'get_analytics',
          data: {}
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: true, // Only fetch if LangWatch is enabled
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    traces,
    metrics,
    arizeMetrics,
    langwatchAnalytics,
    isLoading: isLoadingTraces || isLoadingArize || isLoadingLangWatch,
  };
};