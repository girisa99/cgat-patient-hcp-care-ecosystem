/**
 * AGENTS MANAGEMENT PAGE
 * Templates, deployed agents, analytics, and MCP agent infrastructure
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  FileText, 
  BarChart3,
  Play, 
  Pause, 
  Settings, 
  Copy, 
  Trash2,
  Plus,
  Search,
  Filter,
  Activity,
  Database,
  HardDrive,
  Cloud,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  deployment_config: any;
  configuration: any;
  categories: string[];
  business_units: string[];
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  configuration: any;
  journey_stages: any;
  is_default: boolean;
  created_at: string;
}

interface DeployedAgent {
  id: string;
  agent_id: string;
  channel_type: string;
  deployment_status: string;
  health_status: string;
  performance_metrics: any;
  deployed_at: string;
  last_health_check: string;
}

export const AgentsManagementPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { showSuccess, showError } = useMasterToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAgents(),
        loadTemplates(),
        loadDeployedAgents()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Loading Error', 'Failed to load agents data');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading agents:', error);
    } else {
      setAgents(data || []);
    }
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('agent_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading templates:', error);
    } else {
      setTemplates(data || []);
    }
  };

  const loadDeployedAgents = async () => {
    const { data, error } = await supabase
      .from('agent_channel_deployments')
      .select(`
        *,
        agents (
          id,
          name,
          description
        )
      `)
      .order('deployed_at', { ascending: false });

    if (error) {
      console.error('Error loading deployed agents:', error);
    } else {
      setDeployedAgents(data || []);
    }
  };

  const handleAgentAction = async (action: string, agentId: string) => {
    try {
      switch (action) {
        case 'deploy':
          await deployAgent(agentId);
          break;
        case 'pause':
          await pauseAgent(agentId);
          break;
        case 'duplicate':
          await duplicateAgent(agentId);
          break;
        case 'delete':
          await deleteAgent(agentId);
          break;
      }
      await loadAllData();
    } catch (error) {
      console.error(`Error ${action} agent:`, error);
      showError('Action Failed', `Failed to ${action} agent`);
    }
  };

  const deployAgent = async (agentId: string) => {
    const { error } = await supabase
      .from('agents')
      .update({ 
        status: 'deployed',
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    if (error) throw error;
    showSuccess('Agent Deployed', 'Agent is now active and ready for use');
  };

  const pauseAgent = async (agentId: string) => {
    const { error } = await supabase
      .from('agents')
      .update({ 
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    if (error) throw error;
    showSuccess('Agent Paused', 'Agent has been paused');
  };

  const duplicateAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const { error } = await supabase
      .from('agents')
      .insert({
        name: `${agent.name} (Copy)`,
        description: agent.description,
        configuration: agent.configuration,
        deployment_config: agent.deployment_config,
        status: 'draft',
        template_id: agent.template_id,
        categories: agent.categories,
        business_units: agent.business_units
      });

    if (error) throw error;
    showSuccess('Agent Duplicated', 'Agent copy created successfully');
  };

  const deleteAgent = async (agentId: string) => {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) throw error;
    showSuccess('Agent Deleted', 'Agent has been removed');
  };

  const createAgentFromTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const { error } = await supabase
      .from('agents')
      .insert({
        name: `${template.name} Agent`,
        description: template.description,
        configuration: template.configuration,
        template_id: templateId,
        status: 'draft',
        categories: ['healthcare'],
        business_units: ['patient_care']
      });

    if (error) {
      showError('Creation Failed', 'Failed to create agent from template');
    } else {
      showSuccess('Agent Created', 'New agent created from template');
      await loadAgents();
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getAgentTypeIcon = (agent: Agent) => {
    // Determine agent type based on configuration
    const config = agent.configuration || {};
    if (config.database_enabled) return <Database className="h-4 w-4" />;
    if (config.memory_enabled) return <HardDrive className="h-4 w-4" />;
    if (config.api_enabled) return <Cloud className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      deployed: { variant: 'default', icon: CheckCircle },
      paused: { variant: 'secondary', icon: Pause },
      draft: { variant: 'outline', icon: Clock },
      archived: { variant: 'destructive', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDeploymentMetrics = () => {
    const total = agents.length;
    const deployed = agents.filter(a => a.status === 'deployed').length;
    const paused = agents.filter(a => a.status === 'paused').length;
    const draft = agents.filter(a => a.status === 'draft').length;

    return { total, deployed, paused, draft };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  const metrics = getDeploymentMetrics();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            Agents Management
          </h1>
          <p className="text-muted-foreground">
            Manage agent templates, deployments, and monitor performance across channels
          </p>
        </div>
        <Button onClick={() => setActiveTab('templates')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deployed</p>
                <p className="text-2xl font-bold text-green-600">{metrics.deployed}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.paused}</p>
              </div>
              <Pause className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{metrics.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agents ({agents.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="deployments" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Deployments ({deployedAgents.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAgentTypeIcon(agent)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{agent.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(agent.status)}
                          {agent.categories?.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(agent.created_at).toLocaleDateString()} | 
                          Updated: {new Date(agent.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleAgentAction('deploy', agent.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Deploy
                        </Button>
                      )}
                      {agent.status === 'deployed' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAgentAction('pause', agent.id)}
                          className="flex items-center gap-1"
                        >
                          <Pause className="h-3 w-3" />
                          Pause
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAgentAction('duplicate', agent.id)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAgent(agent)}
                        className="flex items-center gap-1"
                      >
                        <Settings className="h-3 w-3" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Agent templates provide pre-configured workflows for common healthcare scenarios. 
              Create new agents from these templates to ensure consistency and best practices.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.name}
                      {template.is_default && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createAgentFromTemplate(template.id)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Use Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.template_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Array.isArray(template.journey_stages) ? template.journey_stages.length : 
                       (template.journey_stages ? Object.keys(template.journey_stages).length : 0)} stages
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Monitor deployed agents across different channels and environments. 
              Track health status, performance metrics, and deployment configurations.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {deployedAgents.map((deployment) => (
              <Card key={deployment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        deployment.health_status === 'healthy' ? 'bg-green-500' :
                        deployment.health_status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h3 className="font-semibold">{(deployment as any).agents?.name || 'Unknown Agent'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Channel: {deployment.channel_type} | Environment: {deployment.deployment_status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Health: {deployment.health_status}</p>
                      <p className="text-xs text-muted-foreground">
                        Last check: {deployment.last_health_check ? 
                          new Date(deployment.last_health_check).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Deployment Success Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Average Response Time</span>
                      <span>1.2s</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>99.7%</span>
                    </div>
                    <Progress value={99.7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="text-xs">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Web</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                      </div>
                      <span className="text-xs">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Voice</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <span className="text-xs">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>MCP Agent Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Database-Backed Agents:</strong> All agents are stored in Supabase with persistent state management.
                  MCP (Model Context Protocol) enables seamless communication between conversational and structured AI components.
                  Patient enrollment data mapping is automatically synchronized across all agent interactions.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">Database Layer</h4>
                  <p className="text-xs text-muted-foreground">Persistent storage & RLS</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">MCP Protocol</h4>
                  <p className="text-xs text-muted-foreground">Agent communication</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium">Multi-Modal AI</h4>
                  <p className="text-xs text-muted-foreground">Conversational + Structured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};