/**
 * AGENT ENGINE STATUS DASHBOARD
 * Shows real-time agent status with linked conversation engines
 * Displays NPI Registry, Enrollment, and other agents with their engine mappings
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Brain,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Cpu,
  Database,
  Shield,
  FileCheck,
  Plus,
  Link as LinkIcon,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAgentConversationEngines } from '@/hooks/useAgentConversationEngines';
import { AgentWithEngines, ConversationEngine, ENGINE_TEMPLATES } from '@/services/agentConversationEngineService';
import { formatDistanceToNow } from 'date-fns';

// Engine type icons and colors
const ENGINE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  llm: { icon: <Brain className="h-4 w-4" />, color: 'bg-purple-500/20 text-purple-600', label: 'LLM' },
  sml: { icon: <Cpu className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-600', label: 'Small Model' },
  mcp: { icon: <Database className="h-4 w-4" />, color: 'bg-green-500/20 text-green-600', label: 'MCP' },
  hybrid: { icon: <Zap className="h-4 w-4" />, color: 'bg-amber-500/20 text-amber-600', label: 'Hybrid' },
};

// Role badges
const ROLE_BADGES: Record<string, { color: string; label: string }> = {
  primary: { color: 'bg-primary/20 text-primary', label: 'Primary' },
  fallback: { color: 'bg-muted text-muted-foreground', label: 'Fallback' },
  specialized: { color: 'bg-blue-500/20 text-blue-600', label: 'Specialized' },
  comparative: { color: 'bg-purple-500/20 text-purple-600', label: 'Comparative' },
};

interface AgentCardProps {
  agent: AgentWithEngines;
  onLinkEngine: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onLinkEngine }) => {
  const isRunning = agent.real_time_status.is_running;
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isRunning ? 'bg-green-500/20' : 'bg-muted'}`}>
              <Bot className={`h-5 w-5 ${isRunning ? 'text-green-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {agent.name}
                {isRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                ID: {agent.id.slice(0, 8)}... | {agent.use_case || 'General'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Real-time Status */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span>Active Conversations</span>
          </div>
          <Badge variant="outline">{agent.real_time_status.active_conversations}</Badge>
        </div>

        {/* Last Activity */}
        {agent.real_time_status.last_activity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last activity {formatDistanceToNow(new Date(agent.real_time_status.last_activity))} ago</span>
          </div>
        )}

        {/* Linked Engines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Linked Engines</span>
            <Button variant="ghost" size="sm" onClick={() => onLinkEngine(agent.id)}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          {agent.linked_engines.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No engines linked</p>
          ) : (
            <div className="space-y-1">
              {agent.linked_engines.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${ENGINE_TYPE_CONFIG[link.engine.engine_type]?.color || 'bg-muted'}`}>
                      {ENGINE_TYPE_CONFIG[link.engine.engine_type]?.icon}
                    </div>
                    <div>
                      <span className="text-xs font-medium">{link.engine.name}</span>
                      <p className="text-[10px] text-muted-foreground">{link.engine.provider}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={ROLE_BADGES[link.role]?.color || ''}>
                    {ROLE_BADGES[link.role]?.label || link.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        {agent.enabled_features && agent.enabled_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.enabled_features.slice(0, 4).map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px]">
                {feature.replace(/_/g, ' ')}
              </Badge>
            ))}
            {agent.enabled_features.length > 4 && (
              <Badge variant="secondary" className="text-[10px]">
                +{agent.enabled_features.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface EngineCardProps {
  engine: ConversationEngine;
}

const EngineCard: React.FC<EngineCardProps> = ({ engine }) => {
  const config = ENGINE_TYPE_CONFIG[engine.engine_type] || ENGINE_TYPE_CONFIG.llm;
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-base">{engine.name}</CardTitle>
              <CardDescription className="text-xs">
                {engine.provider} / {engine.model_identifier}
              </CardDescription>
            </div>
          </div>
          <Badge variant={engine.is_active ? 'default' : 'secondary'}>
            {engine.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        </div>

        {/* Capabilities */}
        {engine.capabilities && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Capabilities</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(engine.capabilities)
                .filter(([, v]) => v === true)
                .slice(0, 4)
                .map(([key], idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px]">
                    <CheckCircle className="h-2 w-2 mr-1" />
                    {key.replace(/_/g, ' ')}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Performance */}
        {engine.performance_profile && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {engine.performance_profile.avg_response_time_ms && (
              <div className="p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Avg Response</span>
                <p className="font-medium">{engine.performance_profile.avg_response_time_ms}ms</p>
              </div>
            )}
            {engine.performance_profile.accuracy_score && (
              <div className="p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Accuracy</span>
                <p className="font-medium">{(engine.performance_profile.accuracy_score * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AgentEngineStatusDashboard: React.FC = () => {
  const {
    engines,
    agentsWithEngines,
    enginesLoading,
    agentsLoading,
    createNPIAgent,
    createEnrollmentAgent,
    createEngine,
    refetchAgents,
    refetchEngines,
    isCreatingNPIAgent,
    isCreatingEnrollmentAgent,
  } = useAgentConversationEngines();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'npi' | 'enrollment' | 'engine'>('npi');
  const [newAgentName, setNewAgentName] = useState('');
  const [screenMode, setScreenMode] = useState<'single' | 'split' | 'form-specific'>('form-specific');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof ENGINE_TEMPLATES>('enrollment_conversation');

  const handleCreate = async () => {
    if (createType === 'npi') {
      await createNPIAgent({ name: newAgentName || undefined });
    } else if (createType === 'enrollment') {
      await createEnrollmentAgent({ name: newAgentName || undefined, screenMode });
    } else if (createType === 'engine') {
      await createEngine({ template: selectedTemplate });
    }
    setShowCreateDialog(false);
    setNewAgentName('');
  };

  const activeAgents = agentsWithEngines?.filter(a => a.real_time_status.is_running) || [];
  const totalConversations = agentsWithEngines?.reduce((sum, a) => sum + a.real_time_status.active_conversations, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agentsWithEngines?.length || 0}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{activeAgents.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Conversations</p>
                <p className="text-2xl font-bold">{totalConversations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversation Engines</p>
                <p className="text-2xl font-bold">{engines?.length || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="agents">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="engines">Conversation Engines</TabsTrigger>
            <TabsTrigger value="mappings">Agent-Engine Mappings</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { refetchAgents(); refetchEngines(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Agent or Engine</DialogTitle>
                  <DialogDescription>
                    Create a new agent with pre-configured engines or add a conversation engine.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={createType} onValueChange={(v) => setCreateType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="npi">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            NPI Registry Agent
                          </div>
                        </SelectItem>
                        <SelectItem value="enrollment">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Stepwise Enrollment Agent
                          </div>
                        </SelectItem>
                        <SelectItem value="engine">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Conversation Engine
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(createType === 'npi' || createType === 'enrollment') && (
                    <div className="space-y-2">
                      <Label>Agent Name (optional)</Label>
                      <Input
                        placeholder={createType === 'npi' ? 'NPI Registry Agent' : 'Stepwise Enrollment Agent'}
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                      />
                    </div>
                  )}

                  {createType === 'enrollment' && (
                    <div className="space-y-2">
                      <Label>Screen Mode</Label>
                      <Select value={screenMode} onValueChange={(v) => setScreenMode(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single View</SelectItem>
                          <SelectItem value="split">Split View (Form + Conversation)</SelectItem>
                          <SelectItem value="form-specific">Form-Specific (Field Context)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {createType === 'engine' && (
                    <div className="space-y-2">
                      <Label>Engine Template</Label>
                      <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ENGINE_TEMPLATES).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {ENGINE_TYPE_CONFIG[template.engine_type]?.icon}
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleCreate}
                    disabled={isCreatingNPIAgent || isCreatingEnrollmentAgent}
                  >
                    {(isCreatingNPIAgent || isCreatingEnrollmentAgent) ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Agents Tab */}
        <TabsContent value="agents">
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : agentsWithEngines?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No agents created yet.</p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentsWithEngines?.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onLinkEngine={() => {}} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Engines Tab */}
        <TabsContent value="engines">
          {enginesLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : engines?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conversation engines created yet.</p>
                <Button className="mt-4" onClick={() => { setCreateType('engine'); setShowCreateDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Engine
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engines?.map((engine) => (
                <EngineCard key={engine.id} engine={engine} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <CardTitle>Agent-Engine Mappings</CardTitle>
              <CardDescription>
                Visual overview of which agents are connected to which conversation engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentsWithEngines?.map((agent) => (
                  <div key={agent.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-medium">{agent.name}</span>
                      <Badge variant="outline">{agent.id.slice(0, 8)}...</Badge>
                      {agent.real_time_status.is_running && (
                        <Badge variant="default" className="bg-green-500">Running</Badge>
                      )}
                    </div>
                    {agent.linked_engines.length > 0 ? (
                      <div className="flex flex-wrap gap-2 ml-8">
                        {agent.linked_engines.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge className={ENGINE_TYPE_CONFIG[link.engine.engine_type]?.color}>
                              {link.engine.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">({link.role})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground ml-8 italic">No engines linked</p>
                    )}
                  </div>
                ))}
                {(!agentsWithEngines || agentsWithEngines.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No agents to display</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentEngineStatusDashboard;
