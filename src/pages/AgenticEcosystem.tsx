import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentCanvas } from '@/components/agentic/AgentCanvas';
import { AgentTemplates } from '@/components/agentic/AgentTemplates';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { AgentDeployment } from '@/components/agentic/AgentDeployment';
import { Bot, Network, Settings, Rocket, Plus } from 'lucide-react';
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

const AgenticEcosystem = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Healthcare Compliance Agent',
      description: 'Monitors FDA compliance and manages adverse events',
      status: 'deployed',
      connections: ['OpenFDA', 'Veeva', 'ICD-11'],
      role: 'Compliance Officer',
      template: 'Regulatory Monitoring'
    },
    {
      id: '2',
      name: 'Prior Authorization Assistant',
      description: 'Automates prior authorization workflows',
      status: 'deployed',
      connections: ['Insurance APIs', 'Epic', 'Benefit Verification'],
      role: 'Care Manager',
      template: 'Insurance Processing'
    }
  ]);

  const [activeTab, setActiveTab] = useState('canvas');

  const handleCreateAgent = () => {
    toast({
      title: "Agent Creation Started",
      description: "Use the canvas to design your new agent with drag-and-drop functionality.",
    });
    setActiveTab('canvas');
  };

  const handleDeployAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'deployed' as const }
        : agent
    ));
    toast({
      title: "Agent Deployed",
      description: "Your agent is now live and processing requests.",
    });
  };

  return (
    <AppLayout title="Agentic API Ecosystem">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agentic API Ecosystem</h1>
            <p className="text-muted-foreground mt-2">
              Create, configure, and deploy intelligent agents with comprehensive system integrations
            </p>
          </div>
          <Button onClick={handleCreateAgent} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Agent
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{agents.length}</p>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-muted-foreground">System Connectors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Agent Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Rocket className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{agents.filter(a => a.status === 'deployed').length}</p>
                  <p className="text-sm text-muted-foreground">Deployed Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="canvas">Agent Canvas</TabsTrigger>
            <TabsTrigger value="connectors">System Connectors</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="agents">My Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="canvas" className="space-y-6">
            <AgentCanvas />
          </TabsContent>

          <TabsContent value="connectors" className="space-y-6">
            <SystemConnectors />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <AgentTemplates />
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <AgentDeployment agents={agents} onDeploy={handleDeployAgent} />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.status === 'deployed' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="text-sm">{agent.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Template</p>
                        <p className="text-sm">{agent.template}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Connections</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.connections.map((conn, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {conn}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeployAgent(agent.id)}
                          disabled={agent.status === 'deployed'}
                        >
                          {agent.status === 'deployed' ? 'Deployed' : 'Deploy'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AgenticEcosystem;