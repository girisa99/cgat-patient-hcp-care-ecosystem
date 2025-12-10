/**
 * UNIFIED AGENT ADMIN DASHBOARD
 * Central admin for managing all agent types, deployments, channels, branding
 */
import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { AgentRegistration, EXTENDED_USE_CASE_TEMPLATES } from '@/services/agentUseCaseRegistry';
import { useToast } from '@/hooks/use-toast';

const CHANNEL_OPTIONS = [
  { id: 'web-chat', name: 'Web Chat', icon: MessageSquare },
  { id: 'voice-call', name: 'Voice Call', icon: Phone },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
  { id: 'voice-assistant', name: 'Voice Assistant', icon: Zap },
];

export const UnifiedAgentAdminDashboard: React.FC = () => {
  const { toast } = useToast();
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSnippetDialog, setShowSnippetDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRegistration | null>(null);
  const [snippetFormat, setSnippetFormat] = useState<'javascript' | 'react' | 'python' | 'curl'>('javascript');
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    description: '',
    useCaseId: '',
    brandName: '',
    channels: [] as string[],
  });

  const metrics = getAggregateMetrics();

  const handleCreateAgent = async () => {
    if (!newAgentForm.name || !newAgentForm.useCaseId) {
      toast({ variant: 'destructive', title: 'Missing required fields' });
      return;
    }

    await registerAgent({
      name: newAgentForm.name,
      description: newAgentForm.description,
      useCaseId: newAgentForm.useCaseId,
      branding: { brand_name: newAgentForm.brandName || newAgentForm.name },
      channels: newAgentForm.channels,
    });

    setShowCreateDialog(false);
    setNewAgentForm({ name: '', description: '', useCaseId: '', brandName: '', channels: [] });
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
                  <Select
                    value={newAgentForm.useCaseId}
                    onValueChange={(v) => setNewAgentForm(f => ({ ...f, useCaseId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCaseTemplates.map(uc => (
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
                <Button
                  className="w-full"
                  onClick={handleCreateAgent}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Creating...' : 'Create Agent'}
                </Button>
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

      {/* Agents List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Agents ({agents?.length || 0})</TabsTrigger>
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
  isDeploying: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  compact,
  onToggleStatus,
  onShowSnippet,
  onDeploy,
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
              <CardDescription>{agent.description || agent.use_case.name}</CardDescription>
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
