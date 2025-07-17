import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Play, Pause, Square, RotateCcw, Settings, 
  Activity, Clock, CheckCircle, AlertTriangle,
  TrendingUp, Users, Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'deployed' | 'paused';
  connections: string[];
  role: string;
  template: string;
}

interface DeploymentMetrics {
  requestsToday: number;
  responseTime: number;
  successRate: number;
  uptime: number;
  lastDeployed: string;
  version: string;
}

interface AgentDeploymentProps {
  agents: Agent[];
  onDeploy: (agentId: string) => void;
}

export const AgentDeployment: React.FC<AgentDeploymentProps> = ({ agents, onDeploy }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  // Mock metrics for demonstration
  const getMetrics = (agentId: string): DeploymentMetrics => ({
    requestsToday: Math.floor(Math.random() * 1000) + 100,
    responseTime: Math.floor(Math.random() * 500) + 200,
    successRate: Math.floor(Math.random() * 10) + 90,
    uptime: Math.floor(Math.random() * 5) + 95,
    lastDeployed: '2024-01-15 14:30:00',
    version: 'v1.2.0'
  });

  const deploymentSteps = [
    'Validating configuration',
    'Checking system connections',
    'Initializing agent runtime',
    'Testing integrations',
    'Starting monitoring',
    'Deployment complete'
  ];

  const handleDeploy = async (agentId: string) => {
    setIsDeploying(true);
    setSelectedAgent(agentId);
    setDeploymentStep(0);

    // Simulate deployment process
    for (let i = 0; i <= deploymentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentStep(i);
    }

    onDeploy(agentId);
    setIsDeploying(false);
    setSelectedAgent(null);
    setDeploymentStep(0);
  };

  const handlePause = (agentId: string) => {
    toast({
      title: "Agent Paused",
      description: "Agent has been paused and will stop processing new requests.",
    });
  };

  const handleStop = (agentId: string) => {
    toast({
      title: "Agent Stopped",
      description: "Agent has been stopped and moved to draft status.",
    });
  };

  const handleRestart = (agentId: string) => {
    toast({
      title: "Agent Restarting",
      description: "Agent is being restarted with latest configuration.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      default: return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const deployedAgents = agents.filter(agent => agent.status === 'deployed');
  const draftAgents = agents.filter(agent => agent.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agent Deployment</h2>
        <p className="text-muted-foreground">Deploy, monitor, and manage your intelligent agents</p>
      </div>

      {/* Deployment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{deployedAgents.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {deployedAgents.reduce((sum, agent) => sum + getMetrics(agent.id).requestsToday, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Requests Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {deployedAgents.length > 0 
                    ? Math.round(deployedAgents.reduce((sum, agent) => sum + getMetrics(agent.id).successRate, 0) / deployedAgents.length)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {deployedAgents.length > 0 
                    ? Math.round(deployedAgents.reduce((sum, agent) => sum + getMetrics(agent.id).responseTime, 0) / deployedAgents.length)
                    : 0}ms
                </p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deployed">Deployed Agents</TabsTrigger>
          <TabsTrigger value="draft">Draft Agents</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="deployed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deployedAgents.map((agent) => {
              const metrics = getMetrics(agent.id);
              
              return (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(agent.status)}
                            <Badge className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">v{metrics.version}</Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Requests Today</p>
                        <p className="text-2xl font-bold">{metrics.requestsToday.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                        <p className="text-2xl font-bold">{metrics.responseTime}ms</p>
                      </div>
                    </div>
                    
                    {/* Success Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        <p className="text-sm font-bold">{metrics.successRate}%</p>
                      </div>
                      <Progress value={metrics.successRate} className="h-2" />
                    </div>
                    
                    {/* Uptime */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                        <p className="text-sm font-bold">{metrics.uptime}%</p>
                      </div>
                      <Progress value={metrics.uptime} className="h-2" />
                    </div>
                    
                    {/* Last Deployed */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Deployed</p>
                      <p className="text-sm">{metrics.lastDeployed}</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePause(agent.id)}
                        className="gap-1"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestart(agent.id)}
                        className="gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restart
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                      >
                        <Settings className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Connected Systems</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.connections.map((conn, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {conn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Role</p>
                    <p className="text-sm">{agent.role}</p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button 
                      onClick={() => handleDeploy(agent.id)}
                      className="w-full gap-2"
                      disabled={isDeploying && selectedAgent === agent.id}
                    >
                      <Zap className="h-4 w-4" />
                      {isDeploying && selectedAgent === agent.id ? 'Deploying...' : 'Deploy Agent'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system performance and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Gateway</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Message Queue</span>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Degraded</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">External APIs</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest agent deployment events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Healthcare Compliance Agent deployed</span>
                    <span className="text-muted-foreground ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span>Prior Auth Assistant updated</span>
                    <span className="text-muted-foreground ml-auto">12 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Pause className="h-4 w-4 text-yellow-600" />
                    <span>Customer Support AI paused</span>
                    <span className="text-muted-foreground ml-auto">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>New Salesforce connector added</span>
                    <span className="text-muted-foreground ml-auto">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Deployment Progress Modal */}
      {isDeploying && selectedAgent && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Deploying Agent</CardTitle>
            <CardDescription>
              Deploying {agents.find(a => a.id === selectedAgent)?.name}...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((deploymentStep / deploymentSteps.length) * 100)}%</span>
              </div>
              <Progress value={(deploymentStep / deploymentSteps.length) * 100} />
            </div>
            
            <div className="space-y-2">
              {deploymentSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {index < deploymentStep ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : index === deploymentStep ? (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-muted rounded-full" />
                  )}
                  <span className={index <= deploymentStep ? 'text-foreground' : 'text-muted-foreground'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};