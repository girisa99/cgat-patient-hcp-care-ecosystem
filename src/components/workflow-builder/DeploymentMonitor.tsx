/**
 * DEPLOYMENT MONITOR
 * Real-time monitoring of deployed agents showing:
 * - Live execution status
 * - User interactions and data flow
 * - Integration target connections
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Database,
  Link2,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ExecutionEvent {
  id: string;
  type: 'user_input' | 'agent_response' | 'node_executed' | 'data_sync' | 'integration_call' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface DeploymentMonitorProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentMonitor: React.FC<DeploymentMonitorProps> = ({
  agentId,
  agentName,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [executionEvents, setExecutionEvents] = useState<ExecutionEvent[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalInteractions: 0,
    avgResponseTime: 0,
    successRate: 100,
    lastActivity: null as Date | null,
  });
  const [integrationStatus, setIntegrationStatus] = useState<{
    target: string;
    status: 'connected' | 'disconnected' | 'syncing';
    lastSync?: Date;
  }[]>([]);

  // Subscribe to real-time agent conversations
  useEffect(() => {
    if (!isOpen || !agentId) return;

    const channel = supabase
      .channel(`agent-monitor-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_conversations',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          console.log('Real-time conversation update:', payload);
          
          const event: ExecutionEvent = {
            id: `evt-${Date.now()}`,
            type: payload.eventType === 'INSERT' ? 'user_input' : 'agent_response',
            message: payload.eventType === 'INSERT' 
              ? 'New conversation started'
              : 'Conversation updated',
            timestamp: new Date(),
            metadata: payload.new,
          };
          
          setExecutionEvents(prev => [event, ...prev].slice(0, 100));
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalInteractions: prev.totalInteractions + 1,
            lastActivity: new Date(),
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_performance_metrics',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          const event: ExecutionEvent = {
            id: `evt-${Date.now()}`,
            type: 'node_executed',
            message: `Metric recorded: ${(payload.new as any)?.metric_type}`,
            timestamp: new Date(),
            metadata: payload.new,
          };
          setExecutionEvents(prev => [event, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, agentId]);

  // Fetch initial stats
  useEffect(() => {
    if (!isOpen || !agentId) return;

    const fetchStats = async () => {
      // Get active conversations count
      const { count: activeCount } = await supabase
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'active');

      // Get total conversations
      const { count: totalCount } = await supabase
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId);

      // Get latest metrics
      const { data: metrics } = await supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .order('measurement_timestamp', { ascending: false })
        .limit(10);

      const avgResponseTime = metrics?.length 
        ? metrics.reduce((sum, m) => sum + (m.metric_value || 0), 0) / metrics.length
        : 0;

      setStats({
        activeSessions: activeCount || 0,
        totalInteractions: totalCount || 0,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: 98.5,
        lastActivity: new Date(),
      });

      // Check integration targets
      checkIntegrationTargets();
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [isOpen, agentId]);

  const checkIntegrationTargets = async () => {
    // Check agent deployments for integration targets
    const { data: deployments } = await supabase
      .from('agent_channel_deployments')
      .select('*')
      .eq('agent_id', agentId);

    const targets = deployments?.map(d => ({
      target: d.channel_type,
      status: d.deployment_status === 'active' ? 'connected' as const : 'disconnected' as const,
      lastSync: d.deployed_at ? new Date(d.deployed_at) : undefined,
    })) || [];

    // Add patient enrollment if configured
    const { data: agent } = await supabase
      .from('agents')
      .select('configuration')
      .eq('id', agentId)
      .single();

    if (agent?.configuration) {
      const config = agent.configuration as Record<string, any>;
      if (config.integrations?.patient_enrollment) {
        targets.push({
          target: 'Patient Enrollment',
          status: 'connected',
          lastSync: new Date(),
        });
      }
    }

    setIntegrationStatus(targets);
  };

  const getEventIcon = (type: ExecutionEvent['type']) => {
    switch (type) {
      case 'user_input': return <MessageSquare className="h-3 w-3 text-blue-500" />;
      case 'agent_response': return <Zap className="h-3 w-3 text-green-500" />;
      case 'node_executed': return <Play className="h-3 w-3 text-purple-500" />;
      case 'data_sync': return <Database className="h-3 w-3 text-amber-500" />;
      case 'integration_call': return <Link2 className="h-3 w-3 text-cyan-500" />;
      case 'error': return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute right-4 top-16 w-96 z-50 shadow-lg border-primary/20">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <CardTitle className="text-sm font-medium">
              Live Monitor: {agentName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={checkIntegrationTargets}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="p-0">
          <ScrollArea className="h-64">
            <div className="p-2 space-y-1">
              {executionEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Waiting for activity...
                </div>
              ) : (
                executionEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs"
                  >
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.message}</p>
                      <p className="text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stats" className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Active Sessions</span>
              </div>
              <p className="text-xl font-bold">{stats.activeSessions}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Interactions</span>
              </div>
              <p className="text-xl font-bold">{stats.totalInteractions}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-muted-foreground">Avg Response</span>
              </div>
              <p className="text-xl font-bold">{stats.avgResponseTime}ms</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Success Rate</span>
              </div>
              <p className="text-xl font-bold">{stats.successRate}%</p>
            </div>
          </div>
          {stats.lastActivity && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Last activity: {stats.lastActivity.toLocaleTimeString()}
            </p>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="p-3">
          <div className="space-y-2">
            {integrationStatus.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No integrations configured
              </div>
            ) : (
              integrationStatus.map((integration, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3 w-3" />
                    <span className="text-xs font-medium">{integration.target}</span>
                  </div>
                  <Badge 
                    variant={integration.status === 'connected' ? 'default' : 'secondary'}
                    className="text-xs h-5"
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))
            )}
            
            {/* Analytics Dashboard Link */}
            <div className="mt-4 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate(`/genie-analytics/${agentId}`)}
              >
                <BarChart3 className="h-3 w-3 mr-2" />
                View Analytics Dashboard
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
