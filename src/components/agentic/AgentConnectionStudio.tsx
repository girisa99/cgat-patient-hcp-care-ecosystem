import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Brain, 
  Eye, 
  MessageSquare, 
  Phone, 
  Mail, 
  Smartphone,
  Radio,
  Building,
  Zap,
  Settings,
  Plus,
  Link,
  Trash2,
  Play,
  Pause,
  Volume2,
  Camera,
  Monitor
} from 'lucide-react';

// Language Model Providers
interface LanguageModel {
  id: string;
  name: string;
  provider: 'openai' | 'claude' | 'gemini' | 'deepseek' | 'perplexity';
  type: 'llm' | 'slm' | 'vlm';
  capabilities: string[];
  tokenLimit: number;
  costPerToken: number;
  description: string;
}

interface CommunicationChannel {
  id: string;
  name: string;
  provider: 'twilio' | 'genesys' | 'five9' | 'avaya' | 'gcp' | 'meta' | 'google';
  type: 'sms' | 'voice' | 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'alexa' | 'google-assistant';
  configuration: Record<string, any>;
  isActive: boolean;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'alexa' | 'google-home' | 'mobile' | 'web' | 'api';
  capabilities: string[];
  status: 'connected' | 'disconnected' | 'error';
}

interface DynamicAgent {
  id: string;
  name: string;
  prompt: string;
  languageModel: string;
  channels: string[];
  devices: string[];
  tokenLimit: number;
  conversationLimit: number;
  capabilities: string[];
  status: 'active' | 'inactive' | 'training';
  performance: {
    conversationsHandled: number;
    avgResponseTime: number;
    successRate: number;
  };
}

const languageModels: LanguageModel[] = [
  // LLMs
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    type: 'llm',
    capabilities: ['text', 'vision', 'reasoning', 'code'],
    tokenLimit: 128000,
    costPerToken: 0.03,
    description: 'Advanced multimodal model with vision capabilities'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'claude',
    type: 'llm',
    capabilities: ['text', 'reasoning', 'analysis', 'healthcare'],
    tokenLimit: 200000,
    costPerToken: 0.015,
    description: 'Balanced model optimized for healthcare applications'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    type: 'llm',
    capabilities: ['text', 'vision', 'multimodal'],
    tokenLimit: 32000,
    costPerToken: 0.01,
    description: 'Google\'s multimodal AI with strong reasoning'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    type: 'llm',
    capabilities: ['code', 'reasoning', 'technical'],
    tokenLimit: 16000,
    costPerToken: 0.005,
    description: 'Specialized in technical and coding tasks'
  },
  {
    id: 'perplexity-online',
    name: 'Perplexity Online',
    provider: 'perplexity',
    type: 'llm',
    capabilities: ['search', 'realtime', 'research'],
    tokenLimit: 8000,
    costPerToken: 0.02,
    description: 'Real-time search and research capabilities'
  },
  // SLMs
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'openai',
    type: 'slm',
    capabilities: ['text', 'fast-inference'],
    tokenLimit: 4000,
    costPerToken: 0.001,
    description: 'Lightweight model for quick responses'
  },
  {
    id: 'gemma-7b',
    name: 'Gemma 7B',
    provider: 'gemini',
    type: 'slm',
    capabilities: ['text', 'efficient'],
    tokenLimit: 8000,
    costPerToken: 0.002,
    description: 'Efficient small language model'
  },
  // VLMs
  {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision',
    provider: 'openai',
    type: 'vlm',
    capabilities: ['vision', 'medical-imaging', 'analysis'],
    tokenLimit: 128000,
    costPerToken: 0.04,
    description: 'Advanced vision model for medical image analysis'
  },
  {
    id: 'claude-3-vision',
    name: 'Claude 3 Vision',
    provider: 'claude',
    type: 'vlm',
    capabilities: ['vision', 'medical-charts', 'interpretation'],
    tokenLimit: 200000,
    costPerToken: 0.025,
    description: 'Medical chart and document vision analysis'
  }
];

const communicationChannels: CommunicationChannel[] = [
  {
    id: 'twilio-sms',
    name: 'Twilio SMS',
    provider: 'twilio',
    type: 'sms',
    configuration: { apiKey: '', phoneNumber: '' },
    isActive: false
  },
  {
    id: 'twilio-voice',
    name: 'Twilio Voice',
    provider: 'twilio',
    type: 'voice',
    configuration: { apiKey: '', phoneNumber: '', voiceModel: 'alloy' },
    isActive: false
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    provider: 'meta',
    type: 'whatsapp',
    configuration: { businessId: '', accessToken: '' },
    isActive: false
  },
  {
    id: 'genesys-cloud',
    name: 'Genesys Cloud',
    provider: 'genesys',
    type: 'voice',
    configuration: { clientId: '', region: 'us-east-1' },
    isActive: false
  },
  {
    id: 'five9-contact',
    name: 'Five9 Contact Center',
    provider: 'five9',
    type: 'voice',
    configuration: { domain: '', username: '' },
    isActive: false
  }
];

const connectedDevices: ConnectedDevice[] = [
  {
    id: 'alexa-skill',
    name: 'Alexa Healthcare Skill',
    type: 'alexa',
    capabilities: ['voice', 'health-queries', 'appointment-booking'],
    status: 'disconnected'
  },
  {
    id: 'google-action',
    name: 'Google Assistant Action',
    type: 'google-home',
    capabilities: ['voice', 'medication-reminders', 'health-tips'],
    status: 'disconnected'
  }
];

export const AgentConnectionStudio: React.FC = () => {
  const [agents, setAgents] = useState<DynamicAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    prompt: '',
    languageModel: '',
    tokenLimit: 5000,
    conversationLimit: 100,
    channels: [] as string[],
    devices: [] as string[]
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connections, setConnections] = useState<Array<{from: string; to: string; type: string}>>([]);

  const createDynamicAgent = useCallback(() => {
    const newAgent: DynamicAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentForm.name,
      prompt: newAgentForm.prompt,
      languageModel: newAgentForm.languageModel,
      channels: newAgentForm.channels,
      devices: newAgentForm.devices,
      tokenLimit: newAgentForm.tokenLimit,
      conversationLimit: newAgentForm.conversationLimit,
      capabilities: ['dynamic-created'],
      status: 'training',
      performance: {
        conversationsHandled: 0,
        avgResponseTime: 0,
        successRate: 0
      }
    };

    setAgents(prev => [...prev, newAgent]);
    setIsCreatingAgent(false);
    setNewAgentForm({
      name: '',
      prompt: '',
      languageModel: '',
      tokenLimit: 5000,
      conversationLimit: 100,
      channels: [],
      devices: []
    });

    // Simulate training completion
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === newAgent.id 
          ? { ...agent, status: 'active' as const }
          : agent
      ));
    }, 3000);
  }, [newAgentForm]);

  const toggleChannelConnection = (agentId: string, channelId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId
        ? {
            ...agent,
            channels: agent.channels.includes(channelId)
              ? agent.channels.filter(c => c !== channelId)
              : [...agent.channels, channelId]
          }
        : agent
    ));
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'llm': return <Brain className="h-4 w-4" />;
      case 'slm': return <Zap className="h-4 w-4" />;
      case 'vlm': return <Eye className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'alexa': return <Volume2 className="h-4 w-4" />;
      case 'google-assistant': return <Monitor className="h-4 w-4" />;
      default: return <Radio className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Connection Studio
          </CardTitle>
          <p className="text-muted-foreground">
            Create dynamic agents and connect them to language models, communication channels, and devices
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="models">
                <Brain className="h-4 w-4 mr-2" />
                Models
              </TabsTrigger>
              <TabsTrigger value="channels">
                <MessageSquare className="h-4 w-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="devices">
                <Smartphone className="h-4 w-4 mr-2" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="agents">
                <Bot className="h-4 w-4 mr-2" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="canvas">
                <Link className="h-4 w-4 mr-2" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languageModels.map((model) => (
                  <Card key={model.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getModelIcon(model.type)}
                          {model.name}
                        </CardTitle>
                        <Badge variant={model.type === 'llm' ? 'default' : model.type === 'slm' ? 'secondary' : 'outline'}>
                          {model.type.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      <div className="flex justify-between text-xs">
                        <span>Tokens: {model.tokenLimit.toLocaleString()}</span>
                        <span>Cost: ${model.costPerToken}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communicationChannels.map((channel) => (
                  <Card key={channel.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getChannelIcon(channel.type)}
                          {channel.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{channel.provider}</Badge>
                          <Switch 
                            checked={channel.isActive}
                            onCheckedChange={(checked) => {
                              // Update channel status
                            }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                        {channel.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="mt-2 space-y-1">
                        {Object.keys(channel.configuration).map((key) => (
                          <div key={key} className="text-xs text-muted-foreground">
                            {key}: {channel.configuration[key] ? '✓ Configured' : 'Not set'}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedDevices.map((device) => (
                  <Card key={device.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {device.type === 'alexa' ? <Volume2 className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                          {device.name}
                        </CardTitle>
                        <Badge variant={device.status === 'connected' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {device.capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full mt-2">
                        {device.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {agent.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs space-y-1">
                        <div>Model: {languageModels.find(m => m.id === agent.languageModel)?.name || 'Not set'}</div>
                        <div>Token Limit: {agent.tokenLimit.toLocaleString()}</div>
                        <div>Conv. Limit: {agent.conversationLimit}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium mb-1">Performance:</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Conversations: {agent.performance.conversationsHandled}</div>
                          <div>Avg Response: {agent.performance.avgResponseTime}ms</div>
                          <div>Success Rate: {agent.performance.successRate}%</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium mb-1">Channels ({agent.channels.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {agent.channels.slice(0, 3).map((channelId) => {
                            const channel = communicationChannels.find(c => c.id === channelId);
                            return channel ? (
                              <Badge key={channelId} variant="outline" className="text-xs">
                                {channel.type}
                              </Badge>
                            ) : null;
                          })}
                          {agent.channels.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.channels.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" className="w-full">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="canvas" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96 bg-gray-50">
                <div className="text-center text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive Connection Canvas</p>
                  <p className="text-sm mt-2">Drag and drop to connect agents, models, channels, and devices</p>
                </div>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ minHeight: '300px' }}
                />
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Dynamic Agent</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Provide a prompt and the system will automatically generate a specialized agent
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Agent Name</Label>
                      <Input
                        value={newAgentForm.name}
                        onChange={(e) => setNewAgentForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Cardiac Care Specialist"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Language Model</Label>
                      <Select
                        value={newAgentForm.languageModel}
                        onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, languageModel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} ({model.type.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Agent Prompt / Specialization</Label>
                    <Textarea
                      value={newAgentForm.prompt}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="You are a specialized healthcare agent focused on cardiac care. You help patients understand their treatment options, answer questions about heart conditions, and provide guidance on medication management..."
                      className="h-32"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Token Limit: {newAgentForm.tokenLimit.toLocaleString()}</Label>
                      <Slider
                        value={[newAgentForm.tokenLimit]}
                        onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, tokenLimit: value[0] }))}
                        min={1000}
                        max={50000}
                        step={1000}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conversation Limit: {newAgentForm.conversationLimit}</Label>
                      <Slider
                        value={[newAgentForm.conversationLimit]}
                        onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, conversationLimit: value[0] }))}
                        min={10}
                        max={1000}
                        step={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Channels</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {communicationChannels.map((channel) => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <Switch
                            checked={newAgentForm.channels.includes(channel.id)}
                            onCheckedChange={(checked) => {
                              setNewAgentForm(prev => ({
                                ...prev,
                                channels: checked
                                  ? [...prev.channels, channel.id]
                                  : prev.channels.filter(c => c !== channel.id)
                              }));
                            }}
                          />
                          <Label className="text-xs">{channel.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Connected Devices</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {connectedDevices.map((device) => (
                        <div key={device.id} className="flex items-center space-x-2">
                          <Switch
                            checked={newAgentForm.devices.includes(device.id)}
                            onCheckedChange={(checked) => {
                              setNewAgentForm(prev => ({
                                ...prev,
                                devices: checked
                                  ? [...prev.devices, device.id]
                                  : prev.devices.filter(d => d !== device.id)
                              }));
                            }}
                          />
                          <Label className="text-xs">{device.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={createDynamicAgent}
                    disabled={!newAgentForm.name || !newAgentForm.prompt || !newAgentForm.languageModel}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dynamic Agent
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentConnectionStudio;