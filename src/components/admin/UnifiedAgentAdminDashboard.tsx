/**
 * UNIFIED AGENT ADMIN DASHBOARD
 * Central admin for managing all agent types, deployments, channels, branding
 * Includes: Agent Registry, Conversation Engines, Channel Deployments, Real-time Status
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  Code,
  Activity,
  Users,
  MessageSquare,
  Zap,
  Globe,
  Phone,
  Mail,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Link2,
  Server,
  Cpu,
  Shield,
  FileText,
  Workflow,
  Trash2,
  MoreVertical,
  Edit,
  PlusCircle,
  Layers,
  Network,
} from 'lucide-react';
import { getArchitectureInfo } from '@/components/workflow-builder/MultiAgentNodeRegistry';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useAgentConversationEngines } from '@/hooks/useAgentConversationEngines';
import { useUnifiedChannelDeployments } from '@/hooks/useUnifiedChannelDeployments';
import { AgentRegistration, EXTENDED_USE_CASE_TEMPLATES } from '@/services/agentUseCaseRegistry';
import { useToast } from '@/hooks/use-toast';

const CHANNEL_OPTIONS = [
  { id: 'web-chat', name: 'Web Chat', icon: MessageSquare },
  { id: 'voice-call', name: 'Voice Call', icon: Phone },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
  { id: 'voice-assistant', name: 'Voice Assistant', icon: Zap },
  { id: 'sms', name: 'SMS', icon: MessageSquare },
  { id: 'api', name: 'API', icon: Code },
];

const ENGINE_TEMPLATES = [
  { id: 'npi-verification', name: 'NPI Verification', icon: Shield },
  { id: 'credentialing', name: 'Credentialing', icon: FileText },
  { id: 'enrollment-conversation', name: 'Enrollment Conversation', icon: Users },
  { id: 'order-status', name: 'Order Status', icon: MessageSquare },
  { id: 'treatment-onboarding', name: 'Treatment Onboarding', icon: Activity },
  { id: 'manufacturing-onboarding', name: 'Manufacturing Onboarding', icon: Cpu },
];

export const UnifiedAgentAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    agents,
    useCaseTemplates,
    isLoading,
    registerAgent,
    updateAgent,
    deployToChannels,
    toggleStatus,
    generateSnippet,
    refetch,
    getAggregateMetrics,
    isRegistering,
    isDeploying,
  } = useAgentRegistry();

  // Conversation Engines Hook
  const {
    engines,
    agentsWithEngines,
    createEngine,
    linkEngine,
    createNPIAgent,
    createEnrollmentAgent,
    realTimeStatus,
    isCreatingEngine,
    isLinkingEngine,
    engineTemplates,
    refetchEngines,
    refetchAgents,
  } = useAgentConversationEngines();

  // Channel Deployments Hook
  const {
    deploymentsWithDetails,
    activeDeploymentsCount,
    healthyDeploymentsCount,
    totalDeployments,
    deploy,
    activate,
    pause,
    remove,
    runHealthCheck,
    isDeploying: isDeployingChannel,
    refetchAll: refetchDeployments,
  } = useUnifiedChannelDeployments();


  const [activeTab, setActiveTab] = useState('agents');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSnippetDialog, setShowSnippetDialog] = useState(false);
  const [showCreateEngineDialog, setShowCreateEngineDialog] = useState(false);
  const [showCreateUseCaseDialog, setShowCreateUseCaseDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRegistration | null>(null);
  const [snippetFormat, setSnippetFormat] = useState<'javascript' | 'react' | 'python' | 'curl'>('javascript');
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    description: '',
    useCaseId: '',
    brandName: '',
    channels: [] as string[],
  });
  const [newUseCaseForm, setNewUseCaseForm] = useState({
    name: '',
    description: '',
    category: 'custom',
  });
  const [selectedEngineTemplate, setSelectedEngineTemplate] = useState('');
  const [selectedScreenMode, setSelectedScreenMode] = useState<'single' | 'split' | 'form-specific'>('single');
  const [customUseCases, setCustomUseCases] = useState<Array<{ id: string; name: string; category: string; description: string }>>([]);
  const [showEditEngineDialog, setShowEditEngineDialog] = useState(false);
  const [selectedEngineForEdit, setSelectedEngineForEdit] = useState<any>(null);
  const [editEngineForm, setEditEngineForm] = useState({ name: '', engine_type: '' });

  const metrics = getAggregateMetrics();

  // Combined use cases (templates + custom)
  const allUseCases = [...useCaseTemplates, ...customUseCases];

  const handleCreateUseCase = () => {
    if (!newUseCaseForm.name) {
      toast({ variant: 'destructive', title: 'Use case name is required' });
      return;
    }
    const newUseCase = {
      id: `custom-${Date.now()}`,
      name: newUseCaseForm.name,
      description: newUseCaseForm.description,
      category: newUseCaseForm.category,
    };
    setCustomUseCases(prev => [...prev, newUseCase]);
    setNewAgentForm(f => ({ ...f, useCaseId: newUseCase.id }));
    setShowCreateUseCaseDialog(false);
    setNewUseCaseForm({ name: '', description: '', category: 'custom' });
    toast({ title: 'Use case created', description: `"${newUseCase.name}" added` });
  };

  const handleDeleteAgent = async (agentId: string) => {
    // For now, toggle to inactive/deleted status
    await toggleStatus(agentId, false);
    toast({ title: 'Agent disabled' });
  };

  const handleToggleEngineStatus = async (engineId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('conversation_engines')
        .update({ is_active: isActive })
        .eq('id', engineId);
      if (error) throw error;
      refetchEngines();
      toast({ title: isActive ? 'Engine activated' : 'Engine deactivated' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to update engine status' });
    }
  };

  const handleDeleteEngine = async (engineId: string) => {
    try {
      const { error } = await supabase
        .from('conversation_engines')
        .delete()
        .eq('id', engineId);
      if (error) throw error;
      refetchEngines();
      toast({ title: 'Engine deleted' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to delete engine' });
    }
  };

  const handleUpdateEngine = async () => {
    if (!selectedEngineForEdit) return;
    try {
      const { error } = await supabase
        .from('conversation_engines')
        .update({ 
          name: editEngineForm.name || selectedEngineForEdit.name,
          engine_type: editEngineForm.engine_type || selectedEngineForEdit.engine_type
        })
        .eq('id', selectedEngineForEdit.id);
      if (error) throw error;
      refetchEngines();
      setShowEditEngineDialog(false);
      setSelectedEngineForEdit(null);
      toast({ title: 'Engine updated' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to update engine' });
    }
  };


  // Unified handler for both Quick Create and Build in Canvas
  // Both create the agent first, then navigate to canvas
  const handleCreateAgent = async (navigateToCanvas: boolean = false) => {
    if (!newAgentForm.name || !newAgentForm.useCaseId) {
      toast({ variant: 'destructive', title: 'Missing required fields' });
      return;
    }

    try {
      const result = await registerAgent({
        name: newAgentForm.name,
        description: newAgentForm.description,
        useCaseId: newAgentForm.useCaseId,
        branding: { brand_name: newAgentForm.brandName || newAgentForm.name },
        channels: newAgentForm.channels,
      });

      const selectedUseCase = useCaseTemplates.find(uc => uc.id === newAgentForm.useCaseId);
      
      setShowCreateDialog(false);
      const formData = { ...newAgentForm };
      setNewAgentForm({ name: '', description: '', useCaseId: '', brandName: '', channels: [] });

      if (navigateToCanvas) {
        // Navigate to canvas with agent context (agent already created in DB)
        navigate('/agents/canvas', {
          state: { 
            agentId: (result as any)?.agentId || null,
            prefillPrompt: `Build workflow for ${selectedUseCase?.name || formData.useCaseId} agent "${formData.name}".`,
            agentContext: {
              id: (result as any)?.agentId,
              name: formData.name,
              description: formData.description,
              useCaseId: formData.useCaseId,
              useCase: selectedUseCase,
              brandName: formData.brandName,
              channels: formData.channels,
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleBuildInCanvas = () => {
    handleCreateAgent(true);
  };

  const handleQuickCreate = () => {
    handleCreateAgent(false);
  };

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deployed': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'deployed': return 'secondary';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Administration</h1>
          <p className="text-muted-foreground">Manage all conversational agents and deployments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/architecture')}>
            <Layers className="h-4 w-4 mr-2" />
            Architecture
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Select a use case and configure your agent
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Use Case *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newAgentForm.useCaseId}
                      onValueChange={(v) => {
                        if (v === 'create-new') {
                          setShowCreateUseCaseDialog(true);
                        } else {
                          setNewAgentForm(f => ({ ...f, useCaseId: v }));
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create-new" className="text-primary font-medium">
                          <div className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Create New Use Case
                          </div>
                        </SelectItem>
                        <Separator className="my-1" />
                        {allUseCases.map(uc => (
                          <SelectItem key={uc.id} value={uc.id}>
                            <div className="flex flex-col">
                              <span>{uc.name}</span>
                              <span className="text-xs text-muted-foreground">{uc.category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Agent Name *</Label>
                  <Input
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Order Status Bot"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newAgentForm.description}
                    onChange={(e) => setNewAgentForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={newAgentForm.brandName}
                    onChange={(e) => setNewAgentForm(f => ({ ...f, brandName: e.target.value }))}
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <Label>Deploy to Channels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CHANNEL_OPTIONS.map(ch => (
                      <Button
                        key={ch.id}
                        variant={newAgentForm.channels.includes(ch.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewAgentForm(f => ({
                          ...f,
                          channels: f.channels.includes(ch.id)
                            ? f.channels.filter(c => c !== ch.id)
                            : [...f.channels, ch.id]
                        }))}
                      >
                        <ch.icon className="h-4 w-4 mr-1" />
                        {ch.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleQuickCreate}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Creating...' : 'Quick Create'}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBuildInCanvas}
                    disabled={!newAgentForm.name || !newAgentForm.useCaseId}
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Build in Canvas
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  "Quick Create" saves agent directly. "Build in Canvas" opens visual workflow builder.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{metrics.totalAgents}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeAgents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{metrics.totalConversations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.avgSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Agents, Engines, Deployments, Mappings, Live Status, Infrastructure */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="agents" className="flex items-center gap-1.5 px-3">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="engines" className="flex items-center gap-1.5 px-3">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Engines</span>
          </TabsTrigger>
          <TabsTrigger value="deployments" className="flex items-center gap-1.5 px-3">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Deployments</span>
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center gap-1.5 px-3">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mappings</span>
          </TabsTrigger>
        </TabsList>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="space-y-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({agents?.length || 0})</TabsTrigger>
              <TabsTrigger value="active">Active ({metrics.activeAgents})</TabsTrigger>
              <TabsTrigger value="by-usecase">By Use Case</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {(agents || []).map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggleStatus={() => toggleStatus(agent.id, agent.status !== 'active')}
                  onShowSnippet={() => {
                    setSelectedAgent(agent);
                    setShowSnippetDialog(true);
                  }}
                  onDeploy={(channels) => deployToChannels(agent.id, channels)}
                  onDelete={() => handleDeleteAgent(agent.id)}
                  onBuildInCanvas={() => {
                    console.log('🚀 onBuildInCanvas triggered for agent:', agent.name);
                    navigate('/agents/canvas', {
                      state: { 
                        prefillPrompt: `Edit agent "${agent.name}" for ${agent.use_case?.name || 'custom'} use case.`,
                        agentContext: { name: agent.name, useCaseId: agent.use_case_id }
                      }
                    });
                    console.log('✅ Navigation called to /agents');
                  }}
                  isDeploying={isDeploying}
                />
              ))}
              {(!agents || agents.length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No agents registered yet</p>
                    <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Agent
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {(agents || []).filter(a => a.status === 'active').map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggleStatus={() => toggleStatus(agent.id, false)}
                  onShowSnippet={() => {
                    setSelectedAgent(agent);
                    setShowSnippetDialog(true);
                  }}
                  onDeploy={(channels) => deployToChannels(agent.id, channels)}
                  onDelete={() => handleDeleteAgent(agent.id)}
                  onBuildInCanvas={() => {
                    navigate('/agents/canvas', {
                      state: { 
                        prefillPrompt: `Edit agent "${agent.name}" for ${agent.use_case?.name || 'custom'} use case.`,
                        agentContext: { name: agent.name, useCaseId: agent.use_case_id }
                      }
                    });
                  }}
                  isDeploying={isDeploying}
                />
              ))}
            </TabsContent>

            <TabsContent value="by-usecase" className="space-y-6">
              {useCaseTemplates.map(uc => {
                const ucAgents = (agents || []).filter(a => a.use_case_id === uc.id);
                return (
                  <div key={uc.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">{uc.name}</h3>
                      <Badge variant="outline">{ucAgents.length}</Badge>
                    </div>
                    {ucAgents.length > 0 ? (
                      <div className="space-y-2">
                        {ucAgents.map(agent => (
                          <AgentCard
                            key={agent.id}
                            agent={agent}
                            compact
                            onToggleStatus={() => toggleStatus(agent.id, agent.status !== 'active')}
                            onShowSnippet={() => {
                              setSelectedAgent(agent);
                              setShowSnippetDialog(true);
                            }}
                            onDeploy={(channels) => deployToChannels(agent.id, channels)}
                            onDelete={() => handleDeleteAgent(agent.id)}
                            onBuildInCanvas={() => {
                              navigate('/agents/canvas', {
                                state: { 
                                  prefillPrompt: `Edit agent "${agent.name}" for ${agent.use_case?.name || 'custom'} use case.`,
                                  agentContext: { name: agent.name, useCaseId: agent.use_case_id }
                                }
                              });
                            }}
                            isDeploying={isDeploying}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No agents for this use case</p>
                    )}
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ENGINES TAB */}
        <TabsContent value="engines" className="space-y-4">
          {/* Engine Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Engines</p>
                    <p className="text-2xl font-bold">{engines?.length || 0}</p>
                  </div>
                  <Server className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {engines?.filter(e => e.is_active).length || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MCP Engines</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {engines?.filter(e => e.engine_type === 'mcp').length || 0}
                    </p>
                  </div>
                  <Cpu className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hybrid</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {engines?.filter(e => e.engine_type === 'hybrid').length || 0}
                    </p>
                  </div>
                  <Network className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Conversation Engines</h3>
              <p className="text-sm text-muted-foreground">Manage conversation engines for different use cases</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => createNPIAgent({})}>
                <Shield className="h-4 w-4 mr-2" />
                NPI Registry Agent
              </Button>
              <Button variant="outline" onClick={() => createEnrollmentAgent({ screenMode: selectedScreenMode })}>
                <Users className="h-4 w-4 mr-2" />
                Enrollment Agent
              </Button>
              <Dialog open={showCreateEngineDialog} onOpenChange={setShowCreateEngineDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Engine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Conversation Engine</DialogTitle>
                    <DialogDescription>Select a template to create a new engine</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Engine Template</Label>
                      <Select value={selectedEngineTemplate} onValueChange={setSelectedEngineTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENGINE_TEMPLATES.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              <div className="flex items-center gap-2">
                                <t.icon className="h-4 w-4" />
                                {t.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Screen Mode (for Enrollment)</Label>
                      <Select value={selectedScreenMode} onValueChange={(v: any) => setSelectedScreenMode(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="single">Single Panel</SelectItem>
                          <SelectItem value="split">Split Screen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!selectedEngineTemplate || isCreatingEngine}
                      onClick={async () => {
                        await createEngine({ template: selectedEngineTemplate as any });
                        setShowCreateEngineDialog(false);
                        setSelectedEngineTemplate('');
                      }}
                    >
                      {isCreatingEngine ? 'Creating...' : 'Create Engine'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid gap-4">
            {(engines || []).map(engine => (
              <Card key={engine.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{engine.name}</p>
                        <p className="text-sm text-muted-foreground">{engine.engine_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={engine.is_active ? 'default' : 'outline'}>
                        {engine.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{engine.capabilities?.length || 0} capabilities</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedEngineForEdit(engine);
                            setShowEditEngineDialog(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Engine
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleEngineStatus(engine.id, !engine.is_active)}>
                            {engine.is_active ? (
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEngine(engine.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Engine
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!engines || engines.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No conversation engines yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* DEPLOYMENTS TAB */}
        <TabsContent value="deployments" className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deployments</p>
                    <p className="text-2xl font-bold">{totalDeployments}</p>
                  </div>
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeDeploymentsCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Healthy</p>
                    <p className="text-2xl font-bold text-blue-600">{healthyDeploymentsCount}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {(deploymentsWithDetails || []).map(({ deployment, agent, primary_engine }) => (
              <Card key={deployment.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {deployment.channel_type === 'voice-call' ? <Phone className="h-5 w-5 text-primary" /> :
                         deployment.channel_type === 'email' ? <Mail className="h-5 w-5 text-primary" /> :
                         <MessageSquare className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{agent?.name || 'Unknown Agent'}</p>
                        <p className="text-sm text-muted-foreground">{deployment.channel_type} • {deployment.channel_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={deployment.deployment_status === 'active' ? 'default' : 'outline'}>
                        {deployment.deployment_status}
                      </Badge>
                      <Badge variant={deployment.health_status === 'healthy' ? 'default' : 'destructive'}>
                        {deployment.health_status}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => runHealthCheck(deployment.id)}>
                        <Activity className="h-4 w-4" />
                      </Button>
                      {deployment.deployment_status === 'active' ? (
                        <Button size="sm" variant="ghost" onClick={() => pause(deployment.id)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => activate(deployment.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!deploymentsWithDetails || deploymentsWithDetails.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No channel deployments yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* MAPPINGS TAB */}
        <TabsContent value="mappings" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Agent-Engine Mappings</h3>
              <p className="text-sm text-muted-foreground">View how agents are linked to conversation engines</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {(agentsWithEngines || []).map(agentWithEngine => (
              <Card key={agentWithEngine.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {agentWithEngine.name}
                    </CardTitle>
                    <Badge variant={agentWithEngine.real_time_status.is_running ? 'default' : 'outline'}>
                      {agentWithEngine.real_time_status.is_running ? 'Running' : 'Idle'}
                    </Badge>
                  </div>
                  <CardDescription>{agentWithEngine.use_case}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Linked Engines:</p>
                    <div className="flex flex-wrap gap-2">
                      {agentWithEngine.linked_engines.map(link => (
                        <Badge key={link.engine.id} variant="outline" className="flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          {link.engine.name} ({link.role})
                        </Badge>
                      ))}
                      {agentWithEngine.linked_engines.length === 0 && (
                        <span className="text-sm text-muted-foreground">No engines linked</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!agentsWithEngines || agentsWithEngines.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No agent-engine mappings yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Snippet Dialog */}
      <Dialog open={showSnippetDialog} onOpenChange={setShowSnippetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integration Code - {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              Copy the code snippet to integrate this agent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['javascript', 'react', 'python', 'curl'] as const).map(format => (
                <Button
                  key={format}
                  variant={snippetFormat === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSnippetFormat(format)}
                >
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </Button>
              ))}
            </div>
            {selectedAgent && (
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-80">
                  <code>{generateSnippet(selectedAgent, snippetFormat)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopySnippet(generateSnippet(selectedAgent, snippetFormat))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Use Case Dialog */}
      <Dialog open={showCreateUseCaseDialog} onOpenChange={setShowCreateUseCaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Use Case</DialogTitle>
            <DialogDescription>
              Define a custom use case for your agents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Use Case Name *</Label>
              <Input
                value={newUseCaseForm.name}
                onChange={(e) => setNewUseCaseForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Insurance Verification"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newUseCaseForm.description}
                onChange={(e) => setNewUseCaseForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this use case"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newUseCaseForm.category}
                onValueChange={(v) => setNewUseCaseForm(f => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="enrollment">Enrollment</SelectItem>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreateUseCase}>
              <Plus className="h-4 w-4 mr-2" />
              Create Use Case
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Engine Dialog */}
      <Dialog open={showEditEngineDialog} onOpenChange={(open) => {
        setShowEditEngineDialog(open);
        if (!open) setSelectedEngineForEdit(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Conversation Engine</DialogTitle>
            <DialogDescription>
              Update engine configuration
            </DialogDescription>
          </DialogHeader>
          {selectedEngineForEdit && (
            <div className="space-y-4">
              <div>
                <Label>Engine Name</Label>
                <Input
                  defaultValue={selectedEngineForEdit.name}
                  onChange={(e) => setEditEngineForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Engine name"
                />
              </div>
              <div>
                <Label>Engine Type</Label>
                <Select
                  defaultValue={selectedEngineForEdit.engine_type}
                  onValueChange={(v) => setEditEngineForm(f => ({ ...f, engine_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llm">LLM (Large Language Model)</SelectItem>
                    <SelectItem value="mcp">MCP (Model Context Protocol)</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="sml">SML (Small Language Model)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditEngineDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleUpdateEngine}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Agent Card Component
interface AgentCardProps {
  agent: AgentRegistration;
  compact?: boolean;
  onToggleStatus: () => void;
  onShowSnippet: () => void;
  onDeploy: (channels: { channelType: string }[]) => void;
  onDelete: () => void;
  onBuildInCanvas: () => void;
  isDeploying: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  compact,
  onToggleStatus,
  onShowSnippet,
  onDeploy,
  onDelete,
  onBuildInCanvas,
  isDeploying,
}) => {
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deployed': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.branding.brand_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(agent.status)}
            <Badge variant="outline">{agent.channels.length} channels</Badge>
            <Button size="sm" variant="ghost" onClick={onShowSnippet}>
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {agent.name}
                {getStatusIcon(agent.status)}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {agent.description || agent.use_case.name}
                {/* Agent Architecture Badge - read from configuration */}
                {((agent as any).agent_type || (agent as any).configuration?.agent_type) && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs"
                    style={{ 
                      borderColor: getArchitectureInfo((agent as any).agent_type || (agent as any).configuration?.agent_type || 'single').color,
                      color: getArchitectureInfo((agent as any).agent_type || (agent as any).configuration?.agent_type || 'single').color 
                    }}
                  >
                    {((agent as any).agent_type || (agent as any).configuration?.agent_type) === 'a2a' && <Network className="h-3 w-3 mr-1" />}
                    {((agent as any).agent_type || (agent as any).configuration?.agent_type) === 'multi-agent' && <Users className="h-3 w-3 mr-1" />}
                    {getArchitectureInfo((agent as any).agent_type || (agent as any).configuration?.agent_type || 'single').label}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={agent.status === 'active' ? 'outline' : 'default'}
              onClick={onToggleStatus}
            >
              {agent.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={onShowSnippet}>
              <Code className="h-4 w-4 mr-1" />
              Snippet
            </Button>
            <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Globe className="h-4 w-4 mr-1" />
                  Deploy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy to Channels</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map(ch => (
                      <Button
                        key={ch.id}
                        variant={selectedChannels.includes(ch.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedChannels(prev =>
                          prev.includes(ch.id) ? prev.filter(c => c !== ch.id) : [...prev, ch.id]
                        )}
                      >
                        <ch.icon className="h-4 w-4 mr-1" />
                        {ch.name}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    disabled={selectedChannels.length === 0 || isDeploying}
                    onClick={() => {
                      onDeploy(selectedChannels.map(c => ({ channelType: c })));
                      setShowDeployDialog(false);
                      setSelectedChannels([]);
                    }}
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                <DropdownMenuItem 
                  onSelect={() => {
                    console.log('🎯 Edit in Canvas clicked');
                    onBuildInCanvas();
                  }}
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Edit in Canvas
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onShowSnippet()}>
                  <Code className="h-4 w-4 mr-2" />
                  View Code Snippet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onToggleStatus()}>
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Disable Agent
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Enable Agent
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDelete()} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Brand</p>
            <p className="font-medium">{agent.branding.brand_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Use Case</p>
            <p className="font-medium">{agent.use_case.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Channels</p>
            <div className="flex gap-1 flex-wrap">
              {agent.channels.length > 0 ? agent.channels.map(ch => (
                <Badge key={ch.channel_id} variant="outline" className="text-xs">
                  {ch.channel_type}
                </Badge>
              )) : <span className="text-muted-foreground">None</span>}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Rate Limit</p>
            <p className="font-medium">{agent.rate_limits.requests_per_minute}/min</p>
          </div>
        </div>
        {agent.metrics.total_conversations > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Conversations</p>
              <p className="font-medium">{agent.metrics.total_conversations}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Sessions</p>
              <p className="font-medium">{agent.metrics.active_sessions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Response</p>
              <p className="font-medium">{agent.metrics.avg_response_time_ms}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="font-medium">{agent.metrics.success_rate}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedAgentAdminDashboard;
