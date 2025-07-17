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
      connections: ['api-gateway', 'sms'],
      role: 'compliance',
      template: 'healthcare-compliance'
    },
    {
      id: '2',
      name: 'Patient Engagement Bot',
      description: 'Handles patient queries and appointment scheduling',
      status: 'deployed',
      connections: ['whatsapp', 'voice'],
      role: 'engagement',
      template: 'patient-care'
    },
    {
      id: '3',
      name: 'Treatment Protocol Assistant',
      description: 'Assists with treatment protocol recommendations',
      status: 'draft',
      connections: ['api-gateway'],
      role: 'clinical-support',
      template: 'treatment-assistant'
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  const handleCreateAgent = () => {
    setActiveTab('canvas');
  };

  const handleDeployAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: 'deployed' as const }
        : agent
    ));
    toast({
      title: "Agent Deployed Successfully",
      description: "Your agent is now live and processing requests.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Healthcare Agentic API Ecosystem</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive platform for Cell, Gene, Advanced & Personalized treatments with AI orchestration
            </p>
          </div>
          <Button onClick={handleCreateAgent}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Agent
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Active Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Network className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Connected Channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">247</p>
                  <p className="text-xs text-muted-foreground">Conversations Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Rocket className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">99.2%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Settings className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="canvas">
              <Bot className="h-4 w-4 mr-2" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="connectors">
              <Network className="h-4 w-4 mr-2" />
              Connectors
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Plus className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="deployment">
              <Rocket className="h-4 w-4 mr-2" />
              Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics & Performance</CardTitle>
                <CardDescription>Real-time insights into your agentic ecosystem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Agent Performance</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Cell Therapy Agent:</span>
                          <span className="text-green-600">98.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gene Therapy Agent:</span>
                          <span className="text-green-600">97.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Personalized Med:</span>
                          <span className="text-green-600">99.1%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Channel Usage</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>WhatsApp:</span>
                          <span>45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SMS:</span>
                          <span>30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Voice:</span>
                          <span>15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alexa:</span>
                          <span>10%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Token Usage</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Today:</span>
                          <span>125K tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Week:</span>
                          <span>750K tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Limit:</span>
                          <span>2M tokens</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* My Agents */}
            <Card>
              <CardHeader>
                <CardTitle>My Agents</CardTitle>
                <CardDescription>Manage and monitor your deployed agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Bot className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={agent.status === 'deployed' ? 'default' : agent.status === 'draft' ? 'secondary' : 'outline'}
                            >
                              {agent.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {agent.connections.length} connections
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {agent.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleDeployAgent(agent.id)}
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canvas" className="space-y-4">
            <AgentCanvas />
          </TabsContent>

          <TabsContent value="connectors" className="space-y-4">
            <SystemConnectors />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <AgentTemplates />
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4">
            <AgentDeployment agents={agents} onDeploy={handleDeployAgent} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AgenticEcosystem;