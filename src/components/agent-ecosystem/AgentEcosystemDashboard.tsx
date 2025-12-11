import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Network, 
  Shield, 
  BarChart3, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Bot,
  GitBranch,
  Workflow
} from 'lucide-react';

// Import our new hooks
import { useAgentLifecycle, AgentLifecycleStatus } from '@/hooks/useAgentLifecycle';
import { useAgentDeploymentBridge } from '@/hooks/useAgentDeploymentBridge';
import { useAgentPerformanceMonitoring } from '@/hooks/useAgentPerformanceMonitoring';
import { useAgents } from '@/hooks/useAgents';

interface AgentEcosystemDashboardProps {
  agentId?: string;
}

export const AgentEcosystemDashboard: React.FC<AgentEcosystemDashboardProps> = ({ agentId }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Hooks for all agent ecosystem data
  const { agents } = useAgents();
  const { lifecycleState, lifecycleHistory, transition, canTransition } = useAgentLifecycle(agentId);
  const { deployments, compatibleNodes } = useAgentDeploymentBridge(agentId);
  const { performanceSummary, healthChecks, performHealthCheck } = useAgentPerformanceMonitoring(agentId);

  const currentAgent = agentId ? agents.find(a => a.id === agentId) : null;
  const displayAgents = agentId ? [currentAgent].filter(Boolean) : agents;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'deployed':
      case 'production':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'testing':
      case 'staging':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'failed':
      case 'retired':
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'deployed':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'failed':
      case 'unhealthy':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Derive health summary from healthChecks
  const lastHealthCheck = healthChecks[0];
  const healthStatus = lastHealthCheck?.health_status || 'unknown';

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === 'deployed').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployments.length}</div>
            <p className="text-xs text-muted-foreground">
              {deployments.filter(d => d.deployment_status === 'deployed').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus)}`}>
                {getStatusIcon(healthStatus)}
                {healthStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {healthChecks.length} checks performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceSummary.avgResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceSummary.recentMetrics.length} measurements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.agent_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.status === 'deployed' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                    {agentId === agent.id && lifecycleState && (
                      <Badge variant="outline">
                        v{lifecycleState.version}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Workflow Deployments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.slice(0, 5).map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Node: {deployment.workflow_node_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(deployment.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(deployment.deployment_status)}>
                    {deployment.deployment_status}
                  </Badge>
                </div>
              ))}
              {deployments.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No deployments found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLifecycleTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Agent Lifecycle Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agentId && lifecycleState ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Current State: {lifecycleState.status}</div>
                  <div className="text-sm text-muted-foreground">Version: {lifecycleState.version}</div>
                </div>
                <Badge className={getStatusColor(lifecycleState.status)}>
                  {lifecycleState.status}
                </Badge>
              </div>

              {/* Lifecycle Actions */}
              <div className="flex gap-2 flex-wrap">
                {(['testing', 'deploying', 'deployed', 'active', 'retired'] as AgentLifecycleStatus[]).map((targetStatus) => {
                  const canDoTransition = canTransition(lifecycleState.status, targetStatus);
                  return (
                    <Button
                      key={targetStatus}
                      variant={canDoTransition ? 'default' : 'secondary'}
                      size="sm"
                      disabled={!canDoTransition}
                      onClick={() => transition({
                        newStatus: targetStatus,
                        reason: `Transition to ${targetStatus}`
                      })}
                    >
                      Transition to {targetStatus}
                    </Button>
                  );
                })}
              </div>

              {/* Lifecycle History */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Lifecycle History</h4>
                <div className="space-y-2">
                  {lifecycleHistory.slice(0, 5).map((state) => (
                    <div key={state.id} className="flex items-center justify-between py-2 px-3 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{state.status}</Badge>
                        <span className="text-sm">v{state.version}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(state.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select an agent to view lifecycle management
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceSummary.successRate || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceSummary.errorRate || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {performanceSummary.lastHealthCheck 
                ? new Date(performanceSummary.lastHealthCheck.created_at).toLocaleString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {agentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              {(['connectivity', 'performance', 'resource', 'dependency'] as const).map((checkType) => (
                <Button
                  key={checkType}
                  variant="outline"
                  size="sm"
                  onClick={() => performHealthCheck(checkType)}
                >
                  Check {checkType}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Health Checks</div>
              <div className="flex gap-2 flex-wrap">
                {healthChecks.slice(0, 5).map((check) => (
                  <Badge key={check.id} className={getStatusColor(check.health_status)}>
                    {check.check_type}: {check.health_status}
                  </Badge>
                ))}
                {healthChecks.length === 0 && (
                  <span className="text-sm text-muted-foreground">No health checks yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Ecosystem Dashboard</h1>
          <p className="text-muted-foreground">
            {agentId ? `Managing ${currentAgent?.name}` : 'Complete agent lifecycle and deployment management'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Quick Deploy
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-6">
          {renderLifecycleTab()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Security monitoring and permissions management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
