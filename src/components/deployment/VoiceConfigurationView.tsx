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
  Power, PowerOff, BarChart3, TestTube, Headphones, Users, Activity, UserPlus, Link
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
    liveAgentForm.reset();
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
        <Button onClick={() => setShowAddProvider(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Voice Provider
        </Button>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 text-xs bg-card shadow-lg border">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="softphone">Softphone</TabsTrigger>
          <TabsTrigger value="live-agents">Live Agents</TabsTrigger>
          <TabsTrigger value="ai-voice">AI Voice</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {voiceProviders && voiceProviders.length > 0 ? (
            <div className="grid gap-4">
              {voiceProviders.map(provider => (
                <Card key={provider.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.provider_type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => testVoiceProvider(provider.id)}
                          disabled={isTesting}
                          size="sm"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          {isTesting ? "Testing..." : "Test"}
                        </Button>
                        <Button
                          onClick={() => updateProviderStatus({ id: provider.id, isActive: !provider.is_active })}
                          disabled={isUpdating}
                          variant={provider.is_active ? "default" : "outline"}
                          size="sm"
                        >
                          {provider.is_active ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No voice providers configured</p>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Live Agent</DialogTitle>
                </DialogHeader>
                <Form {...liveAgentForm}>
                  <form onSubmit={liveAgentForm.handleSubmit(handleCreateLiveAgent)} className="space-y-4">
                    <FormField
                      control={liveAgentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Agent Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={liveAgentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="agent@company.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={liveAgentForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Customer Support" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={liveAgentForm.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (comma-separated)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="General Support, Technical Issues" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={isCreatingAgent}>
                        {isCreatingAgent ? "Creating..." : "Create Agent"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {liveAgents?.length > 0 ? (
              liveAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                        <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateAgent({ id: agent.id, updates: { status: agent.status === 'online' ? 'offline' : 'online' } })}
                          disabled={isUpdatingAgent}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                          disabled={isDeletingAgent}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No live agents configured</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-voice">
          <div className="space-y-6">
            <ElevenLabsIntegration />
            <OpenAIRealtimeChat />
          </div>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-6">
          <SharedVoiceConnectors variant="full" showOverview={true} showSecurity={false} showActions={true} />
        </TabsContent>

        <TabsContent value="analytics">
          <VoiceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceConfigurationView;