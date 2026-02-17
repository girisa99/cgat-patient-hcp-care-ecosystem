import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Search, 
  Rocket,
  Settings,
  Activity,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useAgents } from '@/hooks/useAgents';
import { DraggableAgentCard } from './DraggableAgentCard';

const EnhancedDeploymentReadyView = () => {
  const { userSessions, isLoading: sessionsLoading } = useAgentSession();
  const { agents, isLoading: agentsLoading } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sessions' | 'agents' | 'ready_to_deploy'>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'dev' | 'test' | 'uat' | 'prod'>('dev');

  // Combine sessions and agents for deployment view
  const deploymentReadySessions = (userSessions || []).filter((session: any) => {
    const hasBasicInfo = session.basic_info?.name && session.basic_info?.purpose;
    const hasActions = session.actions && Object.keys(session.actions).length > 0;
    const hasConfiguration = session.connectors || session.knowledge || session.rag;
    
    return (session.status === 'ready_to_deploy' || session.status === 'deployed') && 
           hasBasicInfo && (hasActions || hasConfiguration);
  });

  const deploymentReadyAgents = (agents || []).filter((agent: any) => {
    return agent.status === 'active' || agent.status === 'draft';
  });

  // Filter items based on search and status
  const filteredSessions = deploymentReadySessions.filter((session: any) => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.description && session.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && (selectedFilter === 'all' || selectedFilter === 'sessions');
  });

  const filteredAgents = deploymentReadyAgents.filter((agent: any) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && (selectedFilter === 'all' || selectedFilter === 'agents');
  });

  const isLoading = sessionsLoading || agentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading deployment-ready items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Flow Visualization */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Agent Deployment Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <Bot className="h-4 w-4" />
              Agent Creation
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <Settings className="h-4 w-4" />
              Treatment Centers
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
              <Rocket className="h-4 w-4" />
              Deployment Ready
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
              <Activity className="h-4 w-4" />
              Channel & Voice Setup
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
              <CheckCircle className="h-4 w-4" />
              Active Deployment
            </div>
          </div>
        </CardContent>
      </Card>

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
            placeholder="Search deployment-ready items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="sessions">Agent Sessions ({deploymentReadySessions.length})</SelectItem>
            <SelectItem value="agents">Deployed Agents ({deploymentReadyAgents.length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{deploymentReadySessions.length}</p>
                <p className="text-sm text-muted-foreground">Ready Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{deploymentReadyAgents.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredSessions.length + filteredAgents.length}</p>
                <p className="text-sm text-muted-foreground">Total Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
      {(selectedFilter === 'all' || selectedFilter === 'sessions') && filteredSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agent Sessions Ready for Deployment ({filteredSessions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSessions.map((session: any) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{session.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Session
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {session.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={session.status === 'ready_to_deploy' ? 'default' : 'secondary'}>
                      {session.status?.replace('_', ' ')}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Rocket className="h-3 w-3 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Agents Section */}
      {(selectedFilter === 'all' || selectedFilter === 'agents') && filteredAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Deployed Agents ({filteredAgents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent: any) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{agent.name}</span>
                    <Badge variant="default" className="text-xs">
                      Agent
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {agent.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSessions.length === 0 && filteredAgents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No deployment-ready items found</h3>
            <p className="text-muted-foreground mb-4">
              Create agents in the Agent Ecosystem and configure them through Treatment Centers to see them here.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline">
                <Bot className="h-4 w-4 mr-2" />
                Go to Agent Ecosystem
              </Button>
              <Button>
                <Rocket className="h-4 w-4 mr-2" />
                View Tutorial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDeploymentReadyView;