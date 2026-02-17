/**
 * Agent Performance Monitoring Hook
 * Tracks metrics, health checks, and performance analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface AgentPerformanceMetric {
  id: string;
  agent_id: string;
  metric_type: string;
  metric_value: number;
  metric_unit: string;
  measurement_timestamp: string;
  execution_context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AgentHealthCheck {
  id: string;
  agent_id: string;
  check_type: string;
  health_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  check_result: Record<string, any>;
  response_time_ms?: number;
  error_details?: Record<string, any>;
  checked_by?: string;
  created_at: string;
}

export interface PerformanceSummary {
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  uptime: number;
  lastHealthCheck?: AgentHealthCheck;
  recentMetrics: AgentPerformanceMetric[];
}

export const useAgentPerformanceMonitoring = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Fetch performance metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['agent-metrics', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .order('measurement_timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AgentPerformanceMetric[];
    },
    enabled: !!agentId,
    refetchInterval: isMonitoring ? 10000 : false
  });

  // Fetch health checks
  const { data: healthChecks = [], isLoading: healthLoading } = useQuery({
    queryKey: ['agent-health-checks', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from('agent_health_checks')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AgentHealthCheck[];
    },
    enabled: !!agentId,
    refetchInterval: isMonitoring ? 30000 : false
  });

  // Calculate performance summary
  const performanceSummary: PerformanceSummary = {
    avgResponseTime: calculateAverage(metrics.filter(m => m.metric_type === 'response_time').map(m => m.metric_value)),
    successRate: calculateSuccessRate(metrics),
    errorRate: calculateErrorRate(metrics),
    throughput: calculateThroughput(metrics),
    uptime: calculateUptime(healthChecks),
    lastHealthCheck: healthChecks[0],
    recentMetrics: metrics.slice(0, 10)
  };

  // Record metric
  const recordMetricMutation = useMutation({
    mutationFn: async ({
      metricType,
      value,
      unit = 'count',
      context
    }: {
      metricType: string;
      value: number;
      unit?: string;
      context?: Record<string, any>;
    }) => {
      if (!agentId) throw new Error('Agent ID required');

      const { data, error } = await supabase
        .from('agent_performance_metrics')
        .insert({
          agent_id: agentId,
          metric_type: metricType,
          metric_value: value,
          metric_unit: unit,
          execution_context: context,
          metadata: { recordedAt: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-metrics', agentId] });
    },
    onError: (error: any) => {
      console.error('Failed to record metric:', error.message);
    }
  });

  // Perform health check
  const performHealthCheckMutation = useMutation({
    mutationFn: async (checkType: string = 'comprehensive') => {
      if (!agentId) throw new Error('Agent ID required');

      const startTime = Date.now();
      
      // Simulate health check
      const checkResult = await performActualHealthCheck(agentId, checkType);
      
      const responseTime = Date.now() - startTime;

      const { data, error } = await supabase
        .from('agent_health_checks')
        .insert({
          agent_id: agentId,
          check_type: checkType,
          health_status: checkResult.status,
          check_result: checkResult.details,
          response_time_ms: responseTime,
          error_details: checkResult.errors
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-health-checks', agentId] });
      if (data.health_status === 'healthy') {
        showSuccess('Health Check', 'Agent is healthy');
      } else {
        showError('Health Issue', `Agent status: ${data.health_status}`);
      }
    },
    onError: (error: any) => {
      showError('Health Check Failed', error.message);
    }
  });

  // Start/stop continuous monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  // Real-time metrics subscription
  useEffect(() => {
    if (!agentId || !isMonitoring) return;

    const channel = supabase
      .channel(`agent-metrics-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_performance_metrics',
          filter: `agent_id=eq.${agentId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agent-metrics', agentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, isMonitoring, queryClient]);

  // Alert thresholds
  const checkAlerts = useCallback(() => {
    const alerts: string[] = [];
    
    if (performanceSummary.avgResponseTime > 5000) {
      alerts.push('High response time detected');
    }
    if (performanceSummary.errorRate > 10) {
      alerts.push('Error rate above threshold');
    }
    if (performanceSummary.uptime < 95) {
      alerts.push('Uptime below SLA');
    }
    
    return alerts;
  }, [performanceSummary]);

  return {
    metrics,
    healthChecks,
    performanceSummary,
    isLoading: metricsLoading || healthLoading,
    isMonitoring,
    toggleMonitoring,
    recordMetric: recordMetricMutation.mutate,
    performHealthCheck: performHealthCheckMutation.mutate,
    checkAlerts,
    isRecordingMetric: recordMetricMutation.isPending,
    isCheckingHealth: performHealthCheckMutation.isPending
  };
};

// Helper functions
function calculateAverage(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function calculateSuccessRate(metrics: AgentPerformanceMetric[]): number {
  const successMetrics = metrics.filter(m => m.metric_type === 'success');
  const totalMetrics = metrics.filter(m => m.metric_type === 'execution');
  if (!totalMetrics.length) return 100;
  return Math.round((successMetrics.length / totalMetrics.length) * 100);
}

function calculateErrorRate(metrics: AgentPerformanceMetric[]): number {
  const errorMetrics = metrics.filter(m => m.metric_type === 'error');
  const totalMetrics = metrics.filter(m => m.metric_type === 'execution');
  if (!totalMetrics.length) return 0;
  return Math.round((errorMetrics.length / totalMetrics.length) * 100);
}

function calculateThroughput(metrics: AgentPerformanceMetric[]): number {
  const executions = metrics.filter(m => m.metric_type === 'execution');
  if (!executions.length) return 0;
  
  const timeRange = executions.length > 1 
    ? new Date(executions[0].measurement_timestamp).getTime() - 
      new Date(executions[executions.length - 1].measurement_timestamp).getTime()
    : 3600000; // Default to 1 hour
  
  const hours = Math.max(timeRange / 3600000, 1);
  return Math.round(executions.length / hours);
}

function calculateUptime(healthChecks: AgentHealthCheck[]): number {
  if (!healthChecks.length) return 100;
  
  const healthyChecks = healthChecks.filter(h => h.health_status === 'healthy');
  return Math.round((healthyChecks.length / healthChecks.length) * 100);
}

async function performActualHealthCheck(agentId: string, checkType: string) {
  // Check agent exists and is configured
  const { data: agent } = await supabase
    .from('agents')
    .select('id, status, configuration')
    .eq('id', agentId)
    .single();

  if (!agent) {
    return {
      status: 'unhealthy' as const,
      details: { reason: 'Agent not found' },
      errors: { code: 'AGENT_NOT_FOUND' }
    };
  }

  // Check recent activity
  const { data: recentComms } = await supabase
    .from('agent_communications')
    .select('id')
    .eq('from_agent_id', agentId)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    .limit(1);

  const isActive = (recentComms?.length || 0) > 0;

  // Determine health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (agent.status === 'paused' || agent.status === 'retired') {
    status = 'unhealthy';
  } else if (!isActive && agent.status === 'deployed') {
    status = 'degraded';
  }

  return {
    status,
    details: {
      agentStatus: agent.status,
      hasConfiguration: !!agent.configuration,
      recentActivity: isActive,
      checkType
    },
    errors: status === 'unhealthy' ? { reason: `Agent status: ${agent.status}` } : null
  };
}
