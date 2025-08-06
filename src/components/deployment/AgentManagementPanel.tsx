import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Settings,
  MoreVertical,
  Power,
  PowerOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'inactive' | 'deployed';
  agent_type?: string;
  use_case?: string;
  created_at: string;
}

interface AgentManagementPanelProps {
  agents: any[];
  onRefresh?: () => void;
}

export const AgentManagementPanel: React.FC<AgentManagementPanelProps> = ({
  agents = [],
  onRefresh
}) => {
  const { createAgent, updateAgent, deleteAgent } = useAgents();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDraftGeneratorOpen, setIsDraftGeneratorOpen] = useState(false);
  const [draftCount, setDraftCount] = useState(5);
  const [draftTemplate, setDraftTemplate] = useState('');

  // Form state for new agent
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    agent_type: 'single',
    use_case: 'customer_service'
  });

  // Transform agents to match expected interface
  const transformedAgents: Agent[] = agents.map(agent => ({
    id: agent.id || '',
    name: agent.name || '',
    description: agent.description || '',
    status: (agent.status as 'draft' | 'active' | 'inactive' | 'deployed') || 'draft',
    agent_type: agent.agent_type || '',
    use_case: agent.use_case || '',
    created_at: agent.created_at || new Date().toISOString()
  }));

  const handleCreateAgent = async () => {
    if (!newAgent.name.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAgent({
        ...newAgent,
        status: 'draft',
        configuration: {},
        deployment_config: {}
      });
      
      setIsCreateDialogOpen(false);
      setNewAgent({ name: '', description: '', agent_type: 'single', use_case: 'customer_service' });
      onRefresh?.();
      
      toast({
        title: "Agent Created",
        description: `${newAgent.name} has been created successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive"
      });
    }
  };

  const handleGenerateDraftAgents = async () => {
    const templates = [
      { name: 'Customer Support Bot', use_case: 'customer_service', description: 'Handles general customer inquiries and support tickets' },
      { name: 'Sales Assistant', use_case: 'lead_generation', description: 'Assists with lead qualification and sales inquiries' },
      { name: 'Technical Support', use_case: 'technical_support', description: 'Provides technical assistance and troubleshooting' },
      { name: 'Appointment Scheduler', use_case: 'scheduling', description: 'Manages appointments and calendar bookings' },
      { name: 'FAQ Helper', use_case: 'information', description: 'Answers frequently asked questions' }
    ];

    try {
      const promises = Array.from({ length: draftCount }, (_, i) => {
        const template = templates[i % templates.length];
        return createAgent({
          name: `${template.name} ${Math.floor(Math.random() * 1000)}`,
          description: template.description,
          agent_type: 'single',
          use_case: template.use_case,
          status: 'draft',
          configuration: {},
          deployment_config: {}
        });
      });

      await Promise.all(promises);
      setIsDraftGeneratorOpen(false);
      onRefresh?.();
      
      toast({
        title: "Draft Agents Generated",
        description: `Successfully created ${draftCount} draft agents`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate draft agents",
        variant: "destructive"
      });
    }
  };

  const handleToggleAgentStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateAgent(agent.id, { status: newStatus });
      onRefresh?.();
      
      toast({
        title: `Agent ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `${agent.name} is now ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to delete ${agent.name}?`)) return;
    
    try {
      await deleteAgent(agent.id);
      onRefresh?.();
      
      toast({
        title: "Agent Deleted",
        description: `${agent.name} has been permanently deleted`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  };

  const handleCloneAgent = async (agent: Agent) => {
    try {
      await createAgent({
        name: `${agent.name} (Copy)`,
        description: agent.description,
        agent_type: agent.agent_type || 'single',
        use_case: agent.use_case || 'customer_service',
        status: 'draft',
        configuration: {},
        deployment_config: {}
      });
      
      onRefresh?.();
      
      toast({
        title: "Agent Cloned",
        description: `Created a copy of ${agent.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone agent",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Power className="h-3 w-3" />;
      case 'inactive': return <PowerOff className="h-3 w-3" />;
      case 'deployed': return <Play className="h-3 w-3" />;
      case 'draft': return <Settings className="h-3 w-3" />;
      default: return <Bot className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Agent Management</h3>
          <p className="text-sm text-muted-foreground">
            Create, activate, and manage your deployment agents
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDraftGeneratorOpen} onOpenChange={setIsDraftGeneratorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Generate Drafts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Draft Agents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Number of agents to generate</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={draftCount}
                    onChange={(e) => setDraftCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDraftGeneratorOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateDraftAgents}>
                    Generate {draftCount} Agents
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Agent Name</label>
                  <Input
                    placeholder="Enter agent name..."
                    value={newAgent.name}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the agent's purpose..."
                    value={newAgent.description}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Agent Type</label>
                  <Select value={newAgent.agent_type} onValueChange={(value) => setNewAgent(prev => ({ ...prev, agent_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Agent</SelectItem>
                      <SelectItem value="multi">Multi-Agent</SelectItem>
                      <SelectItem value="specialized">Specialized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Use Case</label>
                  <Select value={newAgent.use_case} onValueChange={(value) => setNewAgent(prev => ({ ...prev, use_case: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="technical_support">Technical Support</SelectItem>
                      <SelectItem value="scheduling">Scheduling</SelectItem>
                      <SelectItem value="information">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAgent}>
                    Create Agent
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transformedAgents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`${getStatusColor(agent.status)} text-xs gap-1`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleAgentStatus(agent)}>
                        {agent.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCloneAgent(agent)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteAgent(agent)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agent.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                )}
                <div className="flex gap-2">
                  {agent.use_case && (
                    <Badge variant="outline" className="text-xs">
                      {agent.use_case.replace('_', ' ')}
                    </Badge>
                  )}
                  {agent.agent_type && (
                    <Badge variant="outline" className="text-xs">
                      {agent.agent_type}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transformedAgents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first agent or generate draft agents to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};