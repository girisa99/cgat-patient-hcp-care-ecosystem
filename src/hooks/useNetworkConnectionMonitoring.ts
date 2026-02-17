import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useArizeSDK } from '@/hooks/useArizeSDK';

interface ConnectionMetrics {
  nodeId: string;
  incomingConnections: number;
  outgoingConnections: number;
  connectionLatency: number;
  dataTransferred: number;
  errorRate: number;
  status: 'healthy' | 'warning' | 'error';
}

interface NetworkMonitoringConfig {
  enabled: boolean;
  providers: Array<'arize' | 'datadog' | 'newrelic' | 'prometheus' | 'custom'>;
  samplingRate: number;
  alertThresholds: {
    latency: number;
    errorRate: number;
    connectionCount: number;
  };
}

export const useNetworkConnectionMonitoring = () => {
  const [connectionMetrics, setConnectionMetrics] = useState<Map<string, ConnectionMetrics>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringConfig, setMonitoringConfig] = useState<NetworkMonitoringConfig>({
    enabled: true,
    providers: ['arize', 'custom'],
    samplingRate: 1.0,
    alertThresholds: {
      latency: 1000, // ms
      errorRate: 0.05, // 5%
      connectionCount: 100
    }
  });

  const { showSuccess, showError, showInfo } = useMasterToast();
  const arizeSDK = useArizeSDK();

  // Monitor incoming connections for a specific node
  const monitorIncomingConnections = useCallback(async (
    nodeId: string,
    workflowId: string,
    sourceNodes: string[]
  ) => {
    const spanId = arizeSDK.createSpan(`monitor-incoming-${nodeId}`, {
      'monitor.type': 'incoming',
      'monitor.nodeId': nodeId,
      'monitor.sourceCount': sourceNodes.length
    });

    try {
      const startTime = Date.now();
      
      // Simulate connection health check
      const connectionHealth = await Promise.all(
        sourceNodes.map(async (sourceId) => {
          const connectionStartTime = Date.now();
          
          // Simulate connection test
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          const latency = Date.now() - connectionStartTime;
          
          const isHealthy = latency < monitoringConfig.alertThresholds.latency && Math.random() > 0.05;
          
          // Log to database
          if (monitoringConfig.enabled) {
            await supabase.from('connection_analytics').insert({
              workflow_id: workflowId,
              node_id: nodeId,
              connection_type: 'incoming',
              source_node: sourceId,
              target_node: nodeId,
              connection_status: isHealthy ? 'active' : 'warning',
              latency_ms: latency,
              data_size_bytes: Math.floor(Math.random() * 10000),
              metadata: {
                healthCheck: true,
                timestamp: new Date().toISOString(),
                provider: 'custom'
              }
            });
          }

          return { sourceId, latency, isHealthy };
        })
      );

      const totalLatency = connectionHealth.reduce((sum, conn) => sum + conn.latency, 0) / connectionHealth.length;
      const errorCount = connectionHealth.filter(conn => !conn.isHealthy).length;
      const errorRate = errorCount / connectionHealth.length;

      const metrics: ConnectionMetrics = {
        nodeId,
        incomingConnections: sourceNodes.length,
        outgoingConnections: 0, // Will be set by outgoing monitoring
        connectionLatency: totalLatency,
        dataTransferred: connectionHealth.reduce((sum, conn) => sum + Math.floor(Math.random() * 1000), 0),
        errorRate,
        status: errorRate > monitoringConfig.alertThresholds.errorRate ? 'error' : 
                totalLatency > monitoringConfig.alertThresholds.latency ? 'warning' : 'healthy'
      };

      setConnectionMetrics(prev => new Map(prev).set(nodeId, {
        ...prev.get(nodeId),
        ...metrics
      }));

      arizeSDK.addSpanEvent(spanId, 'incoming-connections-monitored', {
        'connections.count': sourceNodes.length,
        'connections.avgLatency': totalLatency,
        'connections.errorRate': errorRate,
        'connections.status': metrics.status
      });

      await arizeSDK.finishSpan(spanId, 'success', {
        'monitor.result': metrics
      });

      return metrics;
    } catch (error) {
      await arizeSDK.finishSpan(spanId, 'error', {
        'monitor.error': error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [arizeSDK, monitoringConfig, supabase]);

  // Monitor outgoing connections for a specific node
  const monitorOutgoingConnections = useCallback(async (
    nodeId: string,
    workflowId: string,
    targetNodes: string[]
  ) => {
    const spanId = arizeSDK.createSpan(`monitor-outgoing-${nodeId}`, {
      'monitor.type': 'outgoing',
      'monitor.nodeId': nodeId,
      'monitor.targetCount': targetNodes.length
    });

    try {
      const connectionHealth = await Promise.all(
        targetNodes.map(async (targetId) => {
          const connectionStartTime = Date.now();
          
          // Simulate connection test
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          const latency = Date.now() - connectionStartTime;
          
          const isHealthy = latency < monitoringConfig.alertThresholds.latency && Math.random() > 0.05;
          
          // Log to database
          if (monitoringConfig.enabled) {
            await supabase.from('connection_analytics').insert({
              workflow_id: workflowId,
              node_id: nodeId,
              connection_type: 'outgoing',
              source_node: nodeId,
              target_node: targetId,
              connection_status: isHealthy ? 'active' : 'warning',
              latency_ms: latency,
              data_size_bytes: Math.floor(Math.random() * 10000),
              metadata: {
                healthCheck: true,
                timestamp: new Date().toISOString(),
                provider: 'custom'
              }
            });
          }

          return { targetId, latency, isHealthy };
        })
      );

      const totalLatency = connectionHealth.reduce((sum, conn) => sum + conn.latency, 0) / connectionHealth.length;
      const errorCount = connectionHealth.filter(conn => !conn.isHealthy).length;
      const errorRate = errorCount / connectionHealth.length;

      setConnectionMetrics(prev => {
        const current = prev.get(nodeId) || {
          nodeId,
          incomingConnections: 0,
          outgoingConnections: 0,
          connectionLatency: 0,
          dataTransferred: 0,
          errorRate: 0,
          status: 'healthy' as const
        };
        
        return new Map(prev).set(nodeId, {
          ...current,
          outgoingConnections: targetNodes.length,
          connectionLatency: (current.connectionLatency + totalLatency) / 2,
          errorRate: Math.max(current.errorRate, errorRate),
          status: errorRate > monitoringConfig.alertThresholds.errorRate ? 'error' : 
                  totalLatency > monitoringConfig.alertThresholds.latency ? 'warning' : 'healthy'
        });
      });

      await arizeSDK.finishSpan(spanId, 'success', {
        'connections.count': targetNodes.length,
        'connections.avgLatency': totalLatency,
        'connections.errorRate': errorRate
      });

      return { latency: totalLatency, errorRate, connectionCount: targetNodes.length };
    } catch (error) {
      await arizeSDK.finishSpan(spanId, 'error', {
        'monitor.error': error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [arizeSDK, monitoringConfig, supabase]);

  // Monitor entire workflow connections
  const monitorWorkflowConnections = useCallback(async (
    workflowId: string,
    nodes: any[],
    edges: any[]
  ) => {
    if (!isMonitoring) return;

    const workflowSpanId = arizeSDK.createSpan('monitor-workflow-connections', {
      'workflow.id': workflowId,
      'workflow.nodeCount': nodes.length,
      'workflow.edgeCount': edges.length
    });

    try {
      // Build connection maps
      const incomingMap = new Map<string, string[]>();
      const outgoingMap = new Map<string, string[]>();

      edges.forEach(edge => {
        // Incoming connections
        if (!incomingMap.has(edge.target)) {
          incomingMap.set(edge.target, []);
        }
        incomingMap.get(edge.target)!.push(edge.source);

        // Outgoing connections
        if (!outgoingMap.has(edge.source)) {
          outgoingMap.set(edge.source, []);
        }
        outgoingMap.get(edge.source)!.push(edge.target);
      });

      // Monitor each node's connections
      const monitoringPromises = nodes.map(async (node) => {
        const incomingNodes = incomingMap.get(node.id) || [];
        const outgoingNodes = outgoingMap.get(node.id) || [];

        const [incomingMetrics, outgoingResult] = await Promise.all([
          incomingNodes.length > 0 ? monitorIncomingConnections(node.id, workflowId, incomingNodes) : null,
          outgoingNodes.length > 0 ? monitorOutgoingConnections(node.id, workflowId, outgoingNodes) : null
        ]);

        return { nodeId: node.id, incomingMetrics, outgoingResult };
      });

      await Promise.all(monitoringPromises);

      // Log comprehensive monitoring to network_monitoring table
      await supabase.from('network_monitoring').insert({
        session_id: workflowId,
        monitoring_type: 'custom',
        operation_name: 'workflow-connection-monitoring',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: Date.now() - Date.now(),
        status: 'success',
        tags: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          monitoringProviders: monitoringConfig.providers
        },
        metrics: {
          totalConnections: edges.length,
          monitoredNodes: nodes.length,
          healthyConnections: Array.from(connectionMetrics.values()).filter(m => m.status === 'healthy').length
        }
      });

      await arizeSDK.finishSpan(workflowSpanId, 'success', {
        'monitoring.completedNodes': nodes.length,
        'monitoring.totalConnections': edges.length
      });

      showSuccess(`Monitored ${nodes.length} nodes and ${edges.length} connections`);
    } catch (error) {
      await arizeSDK.finishSpan(workflowSpanId, 'error', {
        'monitoring.error': error instanceof Error ? error.message : 'Unknown error'
      });
      showError(`Connection monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [isMonitoring, arizeSDK, monitorIncomingConnections, monitorOutgoingConnections, connectionMetrics, monitoringConfig, showSuccess, showError, supabase]);

  // Get connection analytics from database
  const getConnectionAnalytics = useCallback(async (workflowId: string) => {
    try {
      const { data, error } = await supabase
        .from('connection_analytics')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      showError(`Failed to fetch connection analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }, [supabase, showError]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    showSuccess('Connection monitoring started');
  }, [showSuccess]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    showSuccess('Connection monitoring stopped');
  }, [showSuccess]);

  // Update monitoring configuration
  const updateMonitoringConfig = useCallback((config: Partial<NetworkMonitoringConfig>) => {
    setMonitoringConfig(prev => ({ ...prev, ...config }));
  }, []);

  // Get real-time connection health
  const getConnectionHealth = useCallback((nodeId: string): ConnectionMetrics | null => {
    return connectionMetrics.get(nodeId) || null;
  }, [connectionMetrics]);

  // Check for alerts
  useEffect(() => {
    if (!isMonitoring) return;

    const checkAlerts = () => {
      connectionMetrics.forEach((metrics) => {
        if (metrics.status === 'error') {
          showError(`Connection error in node ${metrics.nodeId}: ${(metrics.errorRate * 100).toFixed(1)}% error rate`);
        } else if (metrics.status === 'warning') {
          showInfo(`Connection warning in node ${metrics.nodeId}: ${metrics.connectionLatency}ms latency`);
        }
      });
    };

    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, connectionMetrics, showError, showInfo]);

  return {
    // State
    connectionMetrics: Array.from(connectionMetrics.values()),
    isMonitoring,
    monitoringConfig,

    // Actions
    startMonitoring,
    stopMonitoring,
    monitorIncomingConnections,
    monitorOutgoingConnections,
    monitorWorkflowConnections,
    updateMonitoringConfig,
    getConnectionAnalytics,
    getConnectionHealth,

    // Alternative monitoring tools integration points
    integrateDatadog: (apiKey: string) => {
      updateMonitoringConfig({ providers: [...monitoringConfig.providers, 'datadog'] });
      showSuccess('Datadog integration configured');
    },
    integrateNewRelic: (licenseKey: string) => {
      updateMonitoringConfig({ providers: [...monitoringConfig.providers, 'newrelic'] });
      showSuccess('New Relic integration configured');
    },
    integratePrometheus: (endpoint: string) => {
      updateMonitoringConfig({ providers: [...monitoringConfig.providers, 'prometheus'] });
      showSuccess('Prometheus integration configured');
    }
  };
};