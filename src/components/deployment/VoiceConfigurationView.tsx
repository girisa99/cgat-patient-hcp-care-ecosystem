import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Phone, Mic, Volume2, Settings, Zap, Check, ExternalLink, Plus, Edit, Trash2, 
  Power, PowerOff, BarChart3, TestTube, Headphones, Users, Activity, UserPlus, Link,
  Brain, Sparkles, Radio, Cloud, Database, Webhook, UserCheck, UserX
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';
import { useVoiceLiveAgents } from '@/hooks/useVoiceLiveAgents';
import { useVoiceConnectors } from '@/hooks/useVoiceConnectors';
import { useTransferQueue } from '@/hooks/useTransferQueue';
import { SoftphoneInterface } from '@/components/softphone/SoftphoneInterface';
import { LiveAgentTransfer } from '@/components/agent-testing/LiveAgentTransfer';
import ElevenLabsIntegration from '@/components/voice/ElevenLabsIntegration';
import OpenAIRealtimeChat from '@/components/voice/OpenAIRealtimeChat';
import VoiceAnalytics from '@/components/voice/VoiceAnalytics';
import SharedVoiceConnectors from '@/components/voice/SharedVoiceConnectors';
import { CreateProviderDialog } from '@/components/softphone/CreateProviderDialog';
import { EditProviderDialog } from '@/components/softphone/EditProviderDialog';
import { ApiIntegrationsDialog } from '@/components/voice/ApiIntegrationsDialog';
import { LiveAgentDialog } from '@/components/voice/LiveAgentDialog';

// Form schemas
const liveAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  department: z.string().optional(),
  skills: z.string().optional(),
  max_concurrent_calls: z.number().min(1).max(10).default(3),
});

const connectorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['SIP', 'API', 'Webhook', 'Database', 'CRM', 'Cloud']),
  endpoints: z.string().optional(),
  features: z.string().optional(),
});

const VoiceConfigurationView = () => {
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [selectedAIVoiceType, setSelectedAIVoiceType] = useState('elevenlabs');
  const [showApiIntegrations, setShowApiIntegrations] = useState(false);
  const [apiIntegrationType, setApiIntegrationType] = useState<'internal' | 'external' | 'webhooks'>('internal');
  const [showEditProvider, setShowEditProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showLiveAgentDialog, setShowLiveAgentDialog] = useState(false);
  const [selectedLiveAgent, setSelectedLiveAgent] = useState<any>(null);
  const [liveAgentMode, setLiveAgentMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();
  
  const {
    voiceProviders,
    voiceConfigurations,
    isLoading,
    updateProviderStatus,
    testVoiceProvider,
    isUpdating,
    isTesting
  } = useVoiceProviders();

  const {
    liveAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    isCreating: isCreatingAgent,
    isUpdating: isUpdatingAgent,
    isDeleting: isDeletingAgent
  } = useVoiceLiveAgents();

  const {
    connectors,
    createConnector,
    updateConnector,
    testConnector,
    testAllConnectors,
    deleteConnector,
    isCreating: isCreatingConnector,
    isUpdating: isUpdatingConnector,
    isTesting: isTestingConnector,
    isDeleting: isDeletingConnector
  } = useVoiceConnectors();

  // Form handlers
  const liveAgentForm = useForm<z.infer<typeof liveAgentSchema>>({
    resolver: zodResolver(liveAgentSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      skills: "",
      max_concurrent_calls: 3,
    },
  });

  const connectorForm = useForm<z.infer<typeof connectorSchema>>({
    resolver: zodResolver(connectorSchema),
    defaultValues: {
      name: "",
      type: "API",
      endpoints: "",
      features: "",
    },
  });

  const handleCreateLiveAgent = (values: z.infer<typeof liveAgentSchema>) => {
    createAgent({
      name: values.name,
      email: values.email,
      department: values.department,
      skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
      max_concurrent_calls: values.max_concurrent_calls,
    });
    setShowLiveAgentDialog(false);
  };

  const handleEditLiveAgent = ({ id, updates }: { id: string; updates: any }) => {
    updateAgent({ id, updates });
    setShowLiveAgentDialog(false);
    setSelectedLiveAgent(null);
  };

  const handleDeleteLiveAgent = (id: string) => {
    deleteAgent(id);
    setShowLiveAgentDialog(false);
    setSelectedLiveAgent(null);
  };

  const handleProviderEdit = (provider: any) => {
    setSelectedProvider(provider);
    setShowEditProvider(true);
  };

  const handleProviderConfig = (provider: any) => {
    // Navigate to provider configuration
    toast({
      title: "Provider Configuration",
      description: `Opening configuration for ${provider.name}`,
    });
  };

  const handleCreateConnector = (values: z.infer<typeof connectorSchema>) => {
    createConnector({
      name: values.name,
      connector_type: values.type,
      configuration: {},
      endpoints: values.endpoints ? values.endpoints.split(',').map(s => s.trim()) : [],
      features: values.features ? values.features.split(',').map(s => s.trim()) : [],
    });
    connectorForm.reset();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading voice configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Configuration & Management</h2>
          <p className="text-muted-foreground">Complete voice system management including softphone, providers, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddProvider(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Voice Provider
          </Button>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 bg-muted/30 border">
          <TabsTrigger value="providers" className="flex items-center gap-2 h-10 text-xs">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Providers</span>
          </TabsTrigger>
          <TabsTrigger value="softphone" className="flex items-center gap-2 h-10 text-xs">
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Softphone</span>
          </TabsTrigger>
          <TabsTrigger value="live-agents" className="flex items-center gap-2 h-10 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Live Agents</span>
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="flex items-center gap-2 h-10 text-xs">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Voice</span>
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-2 h-10 text-xs">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Connectors</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 h-10 text-xs">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Voice Providers
              </h3>
              <p className="text-sm text-muted-foreground">Manage your voice service providers and configurations</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {voiceProviders?.length || 0} Providers
            </Badge>
          </div>

          {voiceProviders && voiceProviders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {voiceProviders.map(provider => (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {provider.provider_type === 'twilio' && <Phone className="h-4 w-4 text-primary" />}
                          {provider.provider_type === 'elevenlabs' && <Mic className="h-4 w-4 text-primary" />}
                          {provider.provider_type === 'openai' && <Brain className="h-4 w-4 text-primary" />}
                          {!['twilio', 'elevenlabs', 'openai'].includes(provider.provider_type) && <Phone className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{provider.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{provider.provider_type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={provider.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-1">
                        {provider.capabilities && Object.entries(provider.capabilities).map(([key, value]) => 
                          value && (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key.toUpperCase()}
                            </Badge>
                          )
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => testVoiceProvider(provider.id)}
                          disabled={isTesting}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <TestTube className="h-3 w-3 mr-2" />
                          {isTesting ? "Testing..." : "Test"}
                        </Button>
                        <Button
                          onClick={() => updateProviderStatus({ id: provider.id, isActive: !provider.is_active })}
                          disabled={isUpdating}
                          size="sm"
                          variant={provider.is_active ? "destructive" : "default"}
                          className="flex-1"
                        >
                          {provider.is_active ? (
                            <>
                              <PowerOff className="h-3 w-3 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Power className="h-3 w-3 mr-2" />
                              Enable
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="flex-1"
                          onClick={() => handleProviderEdit(provider)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="flex-1"
                          onClick={() => handleProviderConfig(provider)}
                        >
                          <Settings className="h-3 w-3 mr-2" />
                          Config
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/25">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Voice Providers</h3>
                <p className="text-muted-foreground text-sm mb-4">Get started by adding your first voice provider</p>
                <Button onClick={() => setShowAddProvider(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Voice Provider
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="softphone">
          <SoftphoneInterface />
        </TabsContent>

        <TabsContent value="live-agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Live Agent Management</h3>
                <p className="text-sm text-muted-foreground">Manage live agents and transfer queues</p>
              </div>
              <Button 
                className="gap-2" 
                size="sm"
                onClick={() => {
                  setLiveAgentMode('create');
                  setSelectedLiveAgent(null);
                  setShowLiveAgentDialog(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Agent
              </Button>
            </div>

            <div className="grid gap-4">
              {liveAgents?.length > 0 ? (
                liveAgents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{agent.name}</h4>
                            <Badge variant={
                              agent.status === 'online' ? 'default' : 
                              agent.status === 'busy' ? 'destructive' :
                              agent.status === 'away' ? 'secondary' : 'outline'
                            }>
                              {agent.status || 'offline'}
                            </Badge>
                            {agent.status === 'offline' && (
                              <Badge variant="outline" className="text-red-600">
                                Disabled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.department} • Max calls: {agent.max_concurrent_calls || 3}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setLiveAgentMode('edit');
                              setSelectedLiveAgent(agent);
                              setShowLiveAgentDialog(true);
                            }}
                            disabled={isUpdatingAgent}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updateAgent({ 
                              id: agent.id, 
                              updates: { status: agent.status === 'offline' ? 'online' : 'offline' } 
                            })}
                            disabled={isUpdatingAgent}
                          >
                            {agent.status !== 'offline' ? (
                              <UserX className="h-4 w-4 text-red-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/25">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Live Agents</h3>
                    <p className="text-muted-foreground text-sm mb-4">Add your first live agent for call transfers</p>
                    <Button 
                      onClick={() => {
                        setLiveAgentMode('create');
                        setSelectedLiveAgent(null);
                        setShowLiveAgentDialog(true);
                      }} 
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Live Agent
                    </Button>
                  </div>
                </div>
              )}
            </div>
        </TabsContent>

        <TabsContent value="ai-voice" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Voice Configuration
              </h3>
              <p className="text-sm text-muted-foreground">Configure AI-powered voice interactions and models</p>
            </div>
            <Select value={selectedAIVoiceType} onValueChange={setSelectedAIVoiceType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevenlabs">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    ElevenLabs TTS
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    OpenAI Realtime
                  </div>
                </SelectItem>
                <SelectItem value="combined">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Combined Setup
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {selectedAIVoiceType === 'elevenlabs' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    ElevenLabs Text-to-Speech
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ElevenLabsIntegration />
                </CardContent>
              </Card>
            )}

            {selectedAIVoiceType === 'openai' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    OpenAI Realtime Voice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OpenAIRealtimeChat />
                </CardContent>
              </Card>
            )}

            {selectedAIVoiceType === 'combined' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      ElevenLabs Text-to-Speech
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ElevenLabsIntegration />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      OpenAI Realtime Voice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OpenAIRealtimeChat />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  System Connectors & API Ecosystem
                </h3>
                <p className="text-sm text-muted-foreground">Manage voice system connectors, API integrations, and external services</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-2 min-w-fit"
                  onClick={() => {
                    setApiIntegrationType('internal');
                    setShowApiIntegrations(true);
                  }}
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Internal APIs</span>
                  <span className="sm:hidden">Internal</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-2 min-w-fit"
                  onClick={() => {
                    setApiIntegrationType('external');
                    setShowApiIntegrations(true);
                  }}
                >
                  <Cloud className="h-4 w-4" />
                  <span className="hidden sm:inline">External APIs</span>
                  <span className="sm:hidden">External</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center gap-2 min-w-fit"
                  onClick={() => {
                    setApiIntegrationType('webhooks');
                    setShowApiIntegrations(true);
                  }}
                >
                  <Webhook className="h-4 w-4" />
                  <span className="hidden sm:inline">Webhooks</span>
                  <span className="sm:hidden">Hooks</span>
                </Button>
              </div>
            </div>
          </div>
          
          <SharedVoiceConnectors variant="full" showOverview={true} showSecurity={false} showActions={true} />
        </TabsContent>

        <TabsContent value="analytics">
          <VoiceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateProviderDialog
        open={showAddProvider}
        onOpenChange={setShowAddProvider}
      />
      
      <EditProviderDialog
        open={showEditProvider}
        onOpenChange={setShowEditProvider}
        provider={selectedProvider}
      />
      
      <ApiIntegrationsDialog
        open={showApiIntegrations}
        onOpenChange={setShowApiIntegrations}
        initialTab={apiIntegrationType}
      />

      <LiveAgentDialog
        open={showLiveAgentDialog}
        onOpenChange={setShowLiveAgentDialog}
        agent={selectedLiveAgent}
        mode={liveAgentMode}
        onSave={liveAgentMode === 'create' ? handleCreateLiveAgent : handleEditLiveAgent}
        onDelete={handleDeleteLiveAgent}
        isLoading={isCreatingAgent || isUpdatingAgent || isDeletingAgent}
      />
    </div>
  );
};

export default VoiceConfigurationView;