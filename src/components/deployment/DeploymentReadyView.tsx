import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Search, 
  Rocket,
  Settings,
  Activity,
  Zap
} from 'lucide-react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { DraggableAgentCard } from './DraggableAgentCard';

const DeploymentReadyView = () => {
  const { userSessions, isLoading } = useAgentSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deployed' | 'ready' | 'ready_to_deploy'>('ready_to_deploy');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'dev' | 'test' | 'uat' | 'prod'>('dev');

  // Filter agents for deployment - include configured sessions ready for deployment
  const deploymentReadyAgents = (userSessions || []).filter((session: any) => {
    const hasBasicInfo = session.basic_info?.name && session.basic_info?.purpose;
    const hasActions = session.actions && Object.keys(session.actions).length > 0;
    const hasConfiguration = session.connectors || session.knowledge || session.rag;
    
    return (session.status === 'ready_to_deploy' || session.status === 'deployed') && 
           hasBasicInfo && (hasActions || hasConfiguration);
  });

  // Filter agents based on search and status for deployment view
  const filteredAgents = deploymentReadyAgents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'deployed' && agent.status === 'deployed') ||
      (selectedFilter === 'ready' && agent.status === 'ready_to_deploy') ||
      (selectedFilter === 'ready_to_deploy' && agent.status === 'ready_to_deploy');

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading deployment-ready agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Environment Selection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Target Environment:</label>
          <div className="flex gap-1">
            {(['dev', 'test', 'uat', 'prod'] as const).map((env) => (
              <Button
                key={env}
                variant={selectedEnvironment === env ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedEnvironment(env)}
                className="capitalize"
              >
                {env.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search deployment-ready agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'deployed', 'ready', 'ready_to_deploy'] as const).map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className="capitalize"
            >
              {filter.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{deploymentReadyAgents.length}</p>
                <p className="text-sm text-muted-foreground">Ready Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{deploymentReadyAgents.filter(a => a.status === 'deployed').length}</p>
                <p className="text-sm text-muted-foreground">Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{selectedEnvironment.toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">Environment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent: any) => (
            <DraggableAgentCard
              key={agent.id}
              agent={agent}
              isDeployed={agent.status === 'deployed'}
              onConfigure={() => {
                // Configure agent logic
              }}
              onToggleStatus={() => {
                // Deploy/pause agent logic
              }}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No deployment-ready agents</h3>
                <p className="text-muted-foreground mb-4">
                  Agents must be configured and activated before they appear here for deployment
                </p>
                <Button>
                  <Rocket className="h-4 w-4 mr-2" />
                  Go to Agent Ecosystem
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentReadyView;