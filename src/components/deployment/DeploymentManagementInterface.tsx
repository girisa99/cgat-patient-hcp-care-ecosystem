import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Search, 
  Filter, 
  Download, 
  Code, 
  Rocket,
  Plus,
  Settings,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { DeploymentChannels, defaultChannels, DeploymentChannel } from './DeploymentChannels';
import { DraggableAgentCard } from './DraggableAgentCard';
import { useAgentSession } from '@/hooks/useAgentSession';
import { AgentSession } from '@/types/agent-session';

interface DeploymentAssignment {
  agentId: string;
  channelId: string;
  assignedAt: string;
  config?: Record<string, any>;
}

export const DeploymentManagementInterface: React.FC = () => {
  const { userSessions, isLoading } = useAgentSession();
  
  // State management
  const [channels, setChannels] = useState<DeploymentChannel[]>(defaultChannels);
  const [deploymentAssignments, setDeploymentAssignments] = useState<DeploymentAssignment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deployed' | 'ready' | 'draft'>('all');

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter agents based on search and status
  const filteredAgents = (userSessions || []).filter((agent: AgentSession) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'deployed' && agent.status === 'deployed') ||
      (selectedFilter === 'ready' && agent.status === 'ready_to_deploy') ||
      (selectedFilter === 'draft' && agent.status === 'draft');

    return matchesSearch && matchesFilter;
  });

  // Get deployment info for an agent
  const getAgentDeployment = (agentId: string) => {
    return deploymentAssignments.find(assignment => assignment.agentId === agentId);
  };

  // Get channel name for deployment
  const getChannelName = (channelId: string) => {
    return channels.find(channel => channel.id === channelId)?.name || 'Unknown';
  };

  // Generate mock metrics for deployed agents
  const getMockMetrics = (agentId: string) => ({
    responseTime: Math.floor(Math.random() * 500) + 200,
    successRate: Math.floor(Math.random() * 10) + 90,
    requestsToday: Math.floor(Math.random() * 1000) + 50
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const agentId = active.id as string;
    const channelId = over.id as string;
    
    // Check if the channel exists
    const targetChannel = channels.find(channel => channel.id === channelId);
    if (!targetChannel) return;

    // Check channel capacity
    if (targetChannel.maxAgents && targetChannel.assignedAgents.length >= targetChannel.maxAgents) {
      toast({
        title: "Channel at Capacity",
        description: `${targetChannel.name} has reached its maximum capacity of ${targetChannel.maxAgents} agents.`,
        variant: "destructive"
      });
      return;
    }

    // Remove existing assignment if any
    const existingAssignment = deploymentAssignments.find(assignment => assignment.agentId === agentId);
    if (existingAssignment) {
      // Update channel assignments
      setChannels(prev => prev.map(channel => {
        if (channel.id === existingAssignment.channelId) {
          return {
            ...channel,
            assignedAgents: channel.assignedAgents.filter(id => id !== agentId)
          };
        }
        if (channel.id === channelId) {
          return {
            ...channel,
            assignedAgents: [...channel.assignedAgents, agentId]
          };
        }
        return channel;
      }));

      // Update assignment
      setDeploymentAssignments(prev => prev.map(assignment => 
        assignment.agentId === agentId 
          ? { ...assignment, channelId, assignedAt: new Date().toISOString() }
          : assignment
      ));
    } else {
      // Create new assignment
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, assignedAgents: [...channel.assignedAgents, agentId] }
          : channel
      ));

      setDeploymentAssignments(prev => [...prev, {
        agentId,
        channelId,
        assignedAt: new Date().toISOString()
      }]);
    }

    const agent = userSessions?.find((a: AgentSession) => a.id === agentId);
    const channel = channels.find(c => c.id === channelId);

    toast({
      title: "Agent Assigned",
      description: `${agent?.name} has been assigned to ${channel?.name} channel.`
    });
  };

  // Generate deployment scripts
  const generateDeploymentScript = () => {
    const deploymentConfig = {
      channels: channels.filter(channel => channel.assignedAgents.length > 0),
      assignments: deploymentAssignments,
      timestamp: new Date().toISOString()
    };

    // Mock script generation
    const script = `
// Auto-generated deployment script
// Generated at: ${deploymentConfig.timestamp}

const deploymentConfig = ${JSON.stringify(deploymentConfig, null, 2)};

// Channel configurations
${channels.filter(c => c.assignedAgents.length > 0).map(channel => `
// ${channel.name} Channel Setup
export const ${channel.id.replace('-', '_')}Config = {
  channelId: '${channel.id}',
  name: '${channel.name}',
  features: ${JSON.stringify(channel.features)},
  assignedAgents: ${JSON.stringify(channel.assignedAgents)}
};`).join('\n')}

// Deployment function
export const deployAgents = async () => {
  console.log('Starting deployment...');
  // Implementation here
};
    `.trim();

    // Create and download the script
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-config-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Script Generated",
      description: "Deployment configuration script has been downloaded."
    });
  };

  const stats = {
    totalAgents: userSessions?.length || 0,
    deployedAgents: deploymentAssignments.length,
    activeChannels: channels.filter(c => c.isActive && c.assignedAgents.length > 0).length,
    totalRequests: deploymentAssignments.reduce((sum, assignment) => 
      sum + getMockMetrics(assignment.agentId).requestsToday, 0
    )
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Deployment Management</h2>
            <p className="text-muted-foreground">
              Drag agents to channels for omni-channel deployment
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateDeploymentScript} className="gap-2">
              <Code className="h-4 w-4" />
              Generate Script
            </Button>
            <Button className="gap-2">
              <Rocket className="h-4 w-4" />
              Deploy All
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalAgents}</p>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.deployedAgents}</p>
                  <p className="text-sm text-muted-foreground">Deployed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeChannels}</p>
                  <p className="text-sm text-muted-foreground">Active Channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                  <p className="text-sm text-muted-foreground">Requests Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="channels">Channel Assignment</TabsTrigger>
            <TabsTrigger value="agents">Agent Library</TabsTrigger>
            <TabsTrigger value="deployments">Active Deployments</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6">
            <DeploymentChannels 
              channels={channels}
              onAddChannel={() => {
                toast({
                  title: "Add Channel",
                  description: "Channel creation interface coming soon!"
                });
              }}
              onConfigureChannel={(channelId) => {
                toast({
                  title: "Configure Channel",
                  description: `Configuring ${getChannelName(channelId)} channel...`
                });
              }}
            />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'deployed', 'ready', 'draft'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Agent Library */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent: AgentSession) => {
                const deployment = getAgentDeployment(agent.id);
                return (
                  <DraggableAgentCard
                    key={agent.id}
                    agent={agent}
                    isDeployed={!!deployment}
                    deploymentChannel={deployment ? getChannelName(deployment.channelId) : undefined}
                    metrics={deployment ? getMockMetrics(agent.id) : undefined}
                    onConfigure={() => {
                      toast({
                        title: "Configure Agent",
                        description: `Opening configuration for ${agent.name}...`
                      });
                    }}
                    onToggleStatus={() => {
                      toast({
                        title: deployment ? "Pause Agent" : "Deploy Agent",
                        description: `${deployment ? 'Pausing' : 'Deploying'} ${agent.name}...`
                      });
                    }}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deploymentAssignments.map((assignment) => {
                const agent = userSessions?.find((a: AgentSession) => a.id === assignment.agentId);
                const channel = channels.find(c => c.id === assignment.channelId);
                const metrics = getMockMetrics(assignment.agentId);

                if (!agent || !channel) return null;

                return (
                  <Card key={`${assignment.agentId}-${assignment.channelId}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${channel.color}-100 text-${channel.color}-600`}>
                            {channel.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <Badge variant="outline">{channel.name}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Response</p>
                          <p className="text-lg font-semibold">{metrics.responseTime}ms</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="text-lg font-semibold">{metrics.successRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Requests</p>
                          <p className="text-lg font-semibold">{metrics.requestsToday}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        Deployed on {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="rotate-3 scale-105">
              <DraggableAgentCard
                agent={userSessions?.find((a: AgentSession) => a.id === activeId) || {} as AgentSession}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};