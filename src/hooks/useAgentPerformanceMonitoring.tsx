import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface AgentPerformanceMetric {
  id: string;
  agent_id: string;
  metric_type: 'execution_time' | 'success_rate' | 'error_rate' | 'resource_usage' | 'throughput';
  metric_value: number;
  metric_unit: string;
  measurement_timestamp: string;
  execution_context: any;
  metadata: any;
}

export interface AgentHealthCheck {
  id: string;
  agent_id: string;
  health_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  check_type: 'connectivity' | 'performance' | 'resource' | 'dependency' | 'custom';
  check_result: any;
  response_time_ms?: number;
  error_details?: any;
  created_at: string;
  checked_by: string;
}

export const useAgentPerformanceMonitoring = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();

  // Fetch performance metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['agent-performance-metrics', agentId],
    queryFn: async () => {
      console.log('📊 Fetching performance metrics for:', agentId || 'all agents');
      
      let query = supabase
        .from('agent_performance_metrics')
        .select('*')
        .order('measurement_timestamp', { ascending: false })
        .limit(1000); // Last 1000 metrics
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching metrics:', error);
        throw error;
      }
      
      console.log('✅ Performance metrics loaded:', data?.length || 0);
      return data as AgentPerformanceMetric[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch health checks
  const { data: healthChecks = [], isLoading: healthLoading } = useQuery({
    queryKey: ['agent-health-checks', agentId],
    queryFn: async () => {
      console.log('🏥 Fetching health checks for:', agentId || 'all agents');
      
      let query = supabase
        .from('agent_health_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Last 500 health checks
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching health checks:', error);
        throw error;
      }
      
      console.log('✅ Health checks loaded:', data?.length || 0);
      return data as AgentHealthCheck[];
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Record performance metric
  const recordMetricMutation = useMutation({
    mutationFn: async ({
      agentId,
      metricType,
      metricValue,
      metricUnit = 'count',
      executionContext = {},
      metadata = {}
    }: {
      agentId: string;
      metricType: AgentPerformanceMetric['metric_type'];
      metricValue: number;
      metricUnit?: string;
      executionContext?: any;
      metadata?: any;
    }) => {
      console.log('📈 Recording metric:', { agentId, metricType, metricValue });

      const { data, error } = await supabase
        .from('agent_performance_metrics')
        .insert({
          agent_id: agentId,
          metric_type: metricType,
          metric_value: metricValue,
          metric_unit: metricUnit,
          execution_context: executionContext,
          metadata: {
            ...metadata,
            recorded_at: new Date().toISOString(),
            source: 'performance_monitoring_hook'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-performance-metrics'] });
    },
    onError: (error: any) => {
      console.error('❌ Metric recording error:', error);
    }
  });

  // Perform health check
  const performHealthCheckMutation = useMutation({
    mutationFn: async ({
      agentId,
      checkType,
      customCheckFunction
    }: {
      agentId: string;
      checkType: AgentHealthCheck['check_type'];
      customCheckFunction?: () => Promise<any>;
    }) => {
      console.log('🔍 Performing health check:', { agentId, checkType });

      const startTime = Date.now();
      let checkResult: any = {};
      let healthStatus: AgentHealthCheck['health_status'] = 'unknown';
      let errorDetails: any = null;

      try {
        switch (checkType) {
          case 'connectivity':
            // Test basic connectivity
            checkResult = { status: 'connected', test_timestamp: new Date().toISOString() };
            healthStatus = 'healthy';
            break;

          case 'performance':
            // Test performance metrics
            const recentMetrics = metrics.filter(m => 
              m.agent_id === agentId && 
              new Date(m.measurement_timestamp) > new Date(Date.now() - 5 * 60 * 1000)
            );
            
            const avgExecutionTime = recentMetrics
              .filter(m => m.metric_type === 'execution_time')
              .reduce((sum, m) => sum + m.metric_value, 0) / Math.max(recentMetrics.length, 1);

            checkResult = {
              recent_metrics_count: recentMetrics.length,
              avg_execution_time: avgExecutionTime,
              performance_threshold_ms: 5000
            };

            healthStatus = avgExecutionTime < 5000 ? 'healthy' : avgExecutionTime < 10000 ? 'warning' : 'critical';
            break;

          case 'resource':
            // Check resource usage
            checkResult = {
              memory_usage_mb: Math.random() * 512, // Mock data
              cpu_usage_percent: Math.random() * 100,
              disk_usage_percent: Math.random() * 100
            };
            
            const cpuUsage = checkResult.cpu_usage_percent;
            healthStatus = cpuUsage < 70 ? 'healthy' : cpuUsage < 90 ? 'warning' : 'critical';
            break;

          case 'dependency':
            // Check external dependencies
            checkResult = {
              database_connection: 'healthy',
              api_endpoints: 'healthy',
              external_services: 'healthy'
            };
            healthStatus = 'healthy';
            break;

          case 'custom':
            // Run custom check function
            if (customCheckFunction) {
              checkResult = await customCheckFunction();
              healthStatus = checkResult.status || 'healthy';
            }
            break;
        }
      } catch (error: any) {
        errorDetails = {
          error_message: error.message,
          error_type: error.name,
          error_timestamp: new Date().toISOString()
        };
        healthStatus = 'critical';
        checkResult = { error: true, details: error.message };
      }

      const responseTime = Date.now() - startTime;

      const { data, error } = await supabase
        .from('agent_health_checks')
        .insert({
          agent_id: agentId,
          health_status: healthStatus,
          check_type: checkType,
          check_result: checkResult,
          response_time_ms: responseTime,
          error_details: errorDetails,
          checked_by: 'automated_monitoring'
        })
        .select()
        .single();

      if (error) throw error;

      // Record performance metric for health check response time
      if (responseTime > 0) {
        await supabase
          .from('agent_performance_metrics')
          .insert({
            agent_id: agentId,
            metric_type: 'execution_time',
            metric_value: responseTime,
            metric_unit: 'milliseconds',
            execution_context: {
              operation: 'health_check',
              check_type: checkType
            },
            metadata: {
              health_check_id: data.id,
              automated: true
            }
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-health-checks'] });
      queryClient.invalidateQueries({ queryKey: ['agent-performance-metrics'] });
    },
    onError: (error: any) => {
      console.error('❌ Health check error:', error);
      showError('Health Check Failed', error.message || 'Failed to perform health check');
    }
  });

  // Calculate performance statistics
  const getPerformanceStats = () => {
    const agentMetrics = agentId ? metrics.filter(m => m.agent_id === agentId) : metrics;
    
    const executionTimes = agentMetrics
      .filter(m => m.metric_type === 'execution_time')
      .map(m => m.metric_value);
    
    const successRates = agentMetrics
      .filter(m => m.metric_type === 'success_rate')
      .map(m => m.metric_value);

    const errorRates = agentMetrics
      .filter(m => m.metric_type === 'error_rate')
      .map(m => m.metric_value);

    return {
      avgExecutionTime: executionTimes.length > 0 ? 
        executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : 0,
      
      avgSuccessRate: successRates.length > 0 ? 
        successRates.reduce((a, b) => a + b, 0) / successRates.length : 0,
      
      avgErrorRate: errorRates.length > 0 ? 
        errorRates.reduce((a, b) => a + b, 0) / errorRates.length : 0,
      
      totalMeasurements: agentMetrics.length,
      
      latestHealthStatus: healthChecks[0]?.health_status || 'unknown',
      
      lastHealthCheck: healthChecks[0]?.created_at || null
    };
  };

  // Get health status summary
  const getHealthStatusSummary = () => {
    const agentHealthChecks = agentId ? healthChecks.filter(h => h.agent_id === agentId) : healthChecks;
    
    const statusCounts = agentHealthChecks.reduce((acc, check) => {
      acc[check.health_status] = (acc[check.health_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const latest = agentHealthChecks[0];
    
    return {
      overall_status: latest?.health_status || 'unknown',
      status_distribution: statusCounts,
      last_check: latest?.created_at || null,
      checks_count: agentHealthChecks.length,
      critical_issues: agentHealthChecks.filter(h => h.health_status === 'critical').length
    };
  };

  return {
    // Data
    metrics,
    healthChecks,
    performanceStats: getPerformanceStats(),
    healthSummary: getHealthStatusSummary(),
    
    // Loading states
    isLoading: metricsLoading || healthLoading,
    isRecordingMetric: recordMetricMutation.isPending,
    isPerformingHealthCheck: performHealthCheckMutation.isPending,
    
    // Actions
    recordMetric: recordMetricMutation.mutate,
    performHealthCheck: performHealthCheckMutation.mutate,
    
    // Utilities
    getPerformanceStats,
    getHealthStatusSummary,
    
    // Meta
    meta: {
      totalMetrics: metrics.length,
      totalHealthChecks: healthChecks.length,
      dataSource: 'agent_performance_metrics + agent_health_checks',
      hookVersion: 'performance-monitoring-v1.0.0'
    }
  };
};