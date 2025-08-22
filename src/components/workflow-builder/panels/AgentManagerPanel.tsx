import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bot, Server, MessageCircle, Phone, Mail, Plus, Settings, 
  Play, Pause, Trash2, Edit, Eye, Shield, Zap
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface AgentManagerPanelProps {
  onAgentCreate?: (agent: any) => void;
  onAgentUpdate?: (agent: any) => void;
}

export const AgentManagerPanel: React.FC<AgentManagerPanelProps> = ({
  onAgentCreate,
  onAgentUpdate
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [activeTab, setActiveTab] = useState('core');

  const coreAgents = [
    {
      id: 'case-manager',
      name: 'Case Manager Agent',
      type: 'Core',
      status: 'active',
      model: 'GPT-4',
      capabilities: ['Case Assessment', 'Documentation', 'Routing'],
      description: 'Manages patient cases and coordinates care workflows'
    },
    {
      id: 'intake-agent',
      name: 'Intake Specialist',
      type: 'Core', 
      status: 'active',
      model: 'Claude-3',
      capabilities: ['Form Processing', 'Validation', 'Scheduling'],
      description: 'Handles initial patient intake and verification'
    },
    {
      id: 'triage-agent',
      name: 'Triage Assistant',
      type: 'Core',
      status: 'inactive',
      model: 'GPT-4o-mini',
      capabilities: ['Priority Assessment', 'Urgency Classification'],
      description: 'Evaluates case priority and urgency levels'
    }
  ];

  const infrastructureAgents = [
    {
      id: 'data-processor',
      name: 'Data Processing Agent',
      type: 'Infrastructure',
      status: 'active',
      model: 'Local Model',
      capabilities: ['ETL', 'Validation', 'Transformation'],
      description: 'Processes and validates incoming data streams'
    },
    {
      id: 'security-monitor',
      name: 'Security Monitor',
      type: 'Infrastructure',
      status: 'active',
      model: 'Custom',
      capabilities: ['HIPAA Compliance', 'Access Control', 'Audit'],
      description: 'Monitors security and compliance requirements'
    }
  ];

  const communicationAgents = [
    {
      id: 'notification-agent',
      name: 'Notification Manager',
      type: 'Communication',
      status: 'active',
      model: 'Multi-Model',
      capabilities: ['Email', 'SMS', 'Push Notifications'],
      description: 'Manages all outbound communications'
    },
    {
      id: 'chat-agent',
      name: 'Chat Support Agent',
      type: 'Communication',
      status: 'active',
      model: 'GPT-4',
      capabilities: ['Real-time Chat', 'Support', 'Escalation'],
      description: 'Provides real-time chat support to users'
    }
  ];

  const handleAgentAction = (agent: any, action: string) => {
    switch (action) {
      case 'start':
        showSuccess(`${agent.name} started`);
        break;
      case 'stop':
        showSuccess(`${agent.name} stopped`);
        break;
      case 'edit':
        onAgentUpdate?.(agent);
        break;
      case 'delete':
        showSuccess(`${agent.name} deleted`);
        break;
      default:
        break;
    }
  };

  const renderAgentList = (agents: any[], category: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{category} Agents</h4>
        <Button size="sm" onClick={() => onAgentCreate?.({ type: category })}>
          <Plus className="h-3 w-3 mr-1" />
          Add {category}
        </Button>
      </div>
      
      {agents.map((agent) => (
        <Card key={agent.id} className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  agent.status === 'active' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-900'
                }`}>
                  <Bot className={`h-4 w-4 ${
                    agent.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {agent.status}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => handleAgentAction(agent, 'edit')}>
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {agent.capabilities.map((cap: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Model: {agent.model}</span>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAgentAction(agent, agent.status === 'active' ? 'stop' : 'start')}
                >
                  {agent.status === 'active' ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAgentAction(agent, 'edit')}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAgentAction(agent, 'delete')}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Agent Management</span>
          <Badge variant="secondary" className="text-xs">Healthcare AI</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Configure, deploy, and manage AI agents for healthcare workflows.
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pb-2 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="core" className="text-xs px-2 h-7">
                <Shield className="h-3 w-3 mr-1" />
                Core
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="text-xs px-2 h-7">
                <Server className="h-3 w-3 mr-1" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger value="communication" className="text-xs px-2 h-7">
                <MessageCircle className="h-3 w-3 mr-1" />
                Communication
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="pb-4">
                <TabsContent value="core" className="mt-0 space-y-4">
                  {renderAgentList(coreAgents, 'Core')}
                </TabsContent>

                <TabsContent value="infrastructure" className="mt-0 space-y-4">
                  {renderAgentList(infrastructureAgents, 'Infrastructure')}
                </TabsContent>

                <TabsContent value="communication" className="mt-0 space-y-4">
                  {renderAgentList(communicationAgents, 'Communication')}
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};