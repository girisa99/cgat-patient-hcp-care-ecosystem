
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Calendar, 
  Car, 
  MessageCircle, 
  Phone, 
  Mail,
  Globe,
  Smartphone,
  Bot,
  Brain,
  Database,
  Zap,
  Clock,
  Users,
  Code,
  Download
} from 'lucide-react';
import { DraggableAgentCard } from '@/components/deployment/DraggableAgentCard';

interface Channel {
  id: string;
  name: string;
  type: 'voice' | 'webchat' | 'email' | 'sms' | 'scheduling' | 'uber' | 'web' | 'mobile';
  enabled: boolean;
  config: Record<string, any>;
  agents: any[];
  capabilities: string[];
}

interface Agent {
  id: string;
  name: string;
  status: 'draft' | 'ready_to_deploy' | 'deployed' | 'paused';
  config: {
    models?: any[];
    connectors?: any[];
    apis?: any[];
    knowledgeBase?: any[];
    actions?: any[];
    voice?: any;
    canvas?: any;
  };
}

export const EnhancedChannelMatrix: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'voice',
      name: 'Voice Call',
      type: 'voice',
      enabled: true,
      config: { provider: 'twilio', number: '+1-555-0123' },
      agents: [],
      capabilities: ['speech', 'tts', 'real_time']
    },
    {
      id: 'webchat',
      name: 'Web Chat',
      type: 'webchat',
      enabled: true,
      config: { widget_enabled: true, gen_ai: false },
      agents: [],
      capabilities: ['text', 'file_upload', 'quick_replies']
    },
    {
      id: 'email',
      name: 'Email Support',
      type: 'email',
      enabled: false,
      config: { smtp_server: '', auto_reply: false },
      agents: [],
      capabilities: ['async', 'attachments', 'rich_text']
    }
  ]);

  const [agents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Customer Support Agent',
      status: 'ready_to_deploy',
      config: {
        models: [{ name: 'GPT-4', provider: 'OpenAI' }],
        connectors: [{ name: 'CRM API', type: 'rest' }],
        knowledgeBase: [{ name: 'Product KB', articles: 150 }]
      }
    },
    {
      id: 'agent-2',
      name: 'Sales Assistant',
      status: 'deployed',
      config: {
        models: [{ name: 'Claude-3', provider: 'Anthropic' }],
        apis: [{ name: 'Payment API', type: 'stripe' }]
      }
    }
  ]);

  const [showAddChannel, setShowAddChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const addNewChannel = (channelData: any) => {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: channelData.name,
      type: channelData.type,
      enabled: false,
      config: channelData.config || {},
      agents: [],
      capabilities: getChannelCapabilities(channelData.type)
    };
    setChannels([...channels, newChannel]);
    setShowAddChannel(false);
  };

  const getChannelCapabilities = (type: string): string[] => {
    switch (type) {
      case 'scheduling':
        return ['appointment_booking', 'calendar_sync', 'reminders'];
      case 'uber':
        return ['ride_booking', 'location_services', 'payment'];
      case 'webchat':
        return ['text', 'file_upload', 'gen_ai', 'knowledge_base'];
      case 'voice':
        return ['speech', 'tts', 'real_time', 'phone_system'];
      default:
        return ['basic_messaging'];
    }
  };

  const enableChannel = (channelId: string, enabled: boolean) => {
    setChannels(channels.map(ch => 
      ch.id === channelId ? { ...ch, enabled } : ch
    ));
  };

  const generateDeploymentCode = (agent: Agent, channel: Channel) => {
    return `
// Single Agent Deployment
import { AgentDeployment } from '@/lib/agent-deployment';

const deployment = new AgentDeployment({
  agent: {
    id: "${agent.id}",
    name: "${agent.name}",
    models: ${JSON.stringify(agent.config.models || [], null, 2)},
    connectors: ${JSON.stringify(agent.config.connectors || [], null, 2)},
    knowledgeBase: ${JSON.stringify(agent.config.knowledgeBase || [], null, 2)}
  },
  channel: {
    type: "${channel.type}",
    config: ${JSON.stringify(channel.config, null, 2)}
  }
});

// Deploy anywhere
deployment.deploy();

// Multi-Agent Setup
const multiAgentDeployment = new MultiAgentDeployment({
  agents: [${agents.map(a => `"${a.id}"`).join(', ')}],
  channels: [${channels.filter(c => c.enabled).map(c => `"${c.id}"`).join(', ')}],
  orchestration: "round_robin" // or "intelligent_routing"
});
`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Channel */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Enhanced Channel & Agent Matrix</h3>
          <p className="text-muted-foreground">Configure channels, assign agents, and generate deployment code</p>
        </div>
        <Dialog open={showAddChannel} onOpenChange={setShowAddChannel}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Channel</DialogTitle>
            </DialogHeader>
            <AddChannelForm onSubmit={addNewChannel} onCancel={() => setShowAddChannel(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card key={channel.id} className={`${channel.enabled ? 'ring-2 ring-green-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChannelIcon(channel.type)}
                  <div>
                    <CardTitle className="text-base">{channel.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{channel.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={(enabled) => enableChannel(channel.id, enabled)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Channel Capabilities */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Capabilities</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {channel.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Assigned Agents */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Assigned Agents ({channel.agents.length})
                </Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {channel.agents.length === 0 ? (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <Bot className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Drop agents here</p>
                    </div>
                  ) : (
                    channel.agents.map((agent) => (
                      <div key={agent.id} className="p-2 bg-muted rounded flex items-center justify-between">
                        <span className="text-sm">{agent.name}</span>
                        <Badge variant="outline">{agent.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Channel-Specific Config */}
              {channel.type === 'scheduling' && channel.enabled && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Scheduling Config</Label>
                  <div className="text-xs space-y-1">
                    <div>Calendar: {channel.config.calendar || 'Google Calendar'}</div>
                    <div>Time Slots: {channel.config.slots || '30min intervals'}</div>
                    <div>Buffer: {channel.config.buffer || '15min'}</div>
                  </div>
                </div>
              )}

              {channel.type === 'uber' && channel.enabled && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Uber Integration</Label>
                  <div className="text-xs space-y-1">
                    <div>API Status: {channel.config.api_status || 'Connected'}</div>
                    <div>Service Area: {channel.config.service_area || 'Global'}</div>
                  </div>
                </div>
              )}

              {channel.type === 'webchat' && channel.enabled && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Gen AI Config</Label>
                  <div className="flex items-center gap-2 text-xs">
                    <Brain className="h-3 w-3" />
                    <span>Gen AI: {channel.config.gen_ai ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Database className="h-3 w-3" />
                    <span>Knowledge Base: {channel.config.knowledge_base ? 'Connected' : 'Not Connected'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="relative">
                <DraggableAgentCard
                  agent={agent as any}
                  onConfigure={() => {
                    setSelectedAgent(agent);
                    setShowAgentConfig(true);
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowAgentConfig(true);
                    }}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Configuration Dialog */}
      {selectedChannel && (
        <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Configure {selectedChannel.name}</DialogTitle>
            </DialogHeader>
            <ChannelConfigDialog 
              channel={selectedChannel} 
              onSave={(updatedChannel) => {
                setChannels(channels.map(ch => 
                  ch.id === updatedChannel.id ? updatedChannel : ch
                ));
                setSelectedChannel(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Agent Configuration Dialog */}
      {selectedAgent && (
        <Dialog open={showAgentConfig} onOpenChange={setShowAgentConfig}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agent Configuration & Deployment Code</DialogTitle>
            </DialogHeader>
            <AgentConfigDialog 
              agent={selectedAgent}
              channels={channels.filter(c => c.enabled)}
              onGenerateCode={(agent, channel) => generateDeploymentCode(agent, channel)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'voice': return <Phone className="h-4 w-4" />;
    case 'webchat': return <MessageCircle className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'sms': return <Smartphone className="h-4 w-4" />;
    case 'scheduling': return <Calendar className="h-4 w-4" />;
    case 'uber': return <Car className="h-4 w-4" />;
    case 'web': return <Globe className="h-4 w-4" />;
    default: return <MessageCircle className="h-4 w-4" />;
  }
};

// Add Channel Form Component
const AddChannelForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    config: {}
  });

  const channelTypes = [
    { value: 'scheduling', label: 'Scheduling System', icon: Calendar },
    { value: 'uber', label: 'Uber Integration', icon: Car },
    { value: 'webchat', label: 'Web Chat', icon: MessageCircle },
    { value: 'voice', label: 'Voice Call', icon: Phone },
    { value: 'email', label: 'Email Support', icon: Mail },
    { value: 'sms', label: 'SMS', icon: Smartphone },
    { value: 'web', label: 'Web Portal', icon: Globe },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone }
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label>Channel Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter channel name"
        />
      </div>

      <div>
        <Label>Channel Type</Label>
        <Select onValueChange={(type) => setFormData({ ...formData, type })}>
          <SelectTrigger>
            <SelectValue placeholder="Select channel type" />
          </SelectTrigger>
          <SelectContent>
            {channelTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'scheduling' && (
        <div className="space-y-3">
          <h4 className="font-medium">Scheduling Configuration</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Calendar Provider</Label>
              <Select onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, calendar: value }
              })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="calendly">Calendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Slots</Label>
              <Select onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, slots: value }
              })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 minutes</SelectItem>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="60min">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {formData.type === 'uber' && (
        <div className="space-y-3">
          <h4 className="font-medium">Uber Integration</h4>
          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter Uber API key"
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, api_key: e.target.value }
              })}
            />
          </div>
          <div>
            <Label>Service Area</Label>
            <Input
              placeholder="e.g., San Francisco, Global"
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, service_area: e.target.value }
              })}
            />
          </div>
        </div>
      )}

      {formData.type === 'webchat' && (
        <div className="space-y-3">
          <h4 className="font-medium">Web Chat Configuration</h4>
          <div className="flex items-center gap-2">
            <Switch
              onCheckedChange={(checked) => setFormData({
                ...formData,
                config: { ...formData.config, gen_ai: checked }
              })}
            />
            <Label>Enable Gen AI</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              onCheckedChange={(checked) => setFormData({
                ...formData,
                config: { ...formData.config, knowledge_base: checked }
              })}
            />
            <Label>Enable Knowledge Base</Label>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.type}>
          Add Channel
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Channel Configuration Dialog
const ChannelConfigDialog: React.FC<{
  channel: Channel;
  onSave: (channel: Channel) => void;
}> = ({ channel, onSave }) => {
  const [config, setConfig] = useState(channel.config);

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        <TabsTrigger value="integration">Integration</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <div>
          <Label>Channel Name</Label>
          <Input
            value={channel.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={channel.enabled}
            onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
          />
          <Label>Channel Enabled</Label>
        </div>
      </TabsContent>

      <TabsContent value="capabilities" className="space-y-4">
        <div>
          <Label>Available Capabilities</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {channel.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2">
                <Switch defaultChecked />
                <Label className="text-sm">{cap.replace('_', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="integration" className="space-y-4">
        {channel.type === 'scheduling' && (
          <div className="space-y-3">
            <div>
              <Label>Calendar Integration</Label>
              <Select defaultValue={config.calendar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="calendly">Calendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Booking URL</Label>
              <Input
                value={config.booking_url || ''}
                onChange={(e) => setConfig({ ...config, booking_url: e.target.value })}
                placeholder="https://calendly.com/your-link"
              />
            </div>
          </div>
        )}
        
        {channel.type === 'uber' && (
          <div className="space-y-3">
            <div>
              <Label>Uber API Configuration</Label>
              <Textarea
                value={JSON.stringify(config.uber_config || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setConfig({ ...config, uber_config: parsed });
                  } catch (e) {
                    // Invalid JSON
                  }
                }}
                rows={6}
              />
            </div>
          </div>
        )}
      </TabsContent>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ ...channel, config })}>
          Save Configuration
        </Button>
      </div>
    </Tabs>
  );
};

// Agent Configuration Dialog
const AgentConfigDialog: React.FC<{
  agent: Agent;
  channels: Channel[];
  onGenerateCode: (agent: Agent, channel: Channel) => string;
}> = ({ agent, channels, onGenerateCode }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [deploymentCode, setDeploymentCode] = useState('');

  const generateCode = (channel: Channel) => {
    const code = onGenerateCode(agent, channel);
    setDeploymentCode(code);
  };

  const downloadCode = () => {
    const blob = new Blob([deploymentCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name}-deployment.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agent Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-xs">Models</Label>
              <div className="text-sm">{agent.config.models?.length || 0} configured</div>
            </div>
            <div>
              <Label className="text-xs">Connectors</Label>
              <div className="text-sm">{agent.config.connectors?.length || 0} configured</div>
            </div>
            <div>
              <Label className="text-xs">Knowledge Base</Label>
              <div className="text-sm">{agent.config.knowledgeBase?.length || 0} sources</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Deployment Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-xs">Select Channel</Label>
              <Select onValueChange={(channelId) => {
                const channel = channels.find(c => c.id === channelId);
                setSelectedChannel(channel || null);
                if (channel) generateCode(channel);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose deployment channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel.type)}
                        {channel.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Code */}
      {deploymentCode && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Deployment Code</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              <pre>{deploymentCode}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Flow Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Configuration Flow Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Basic Info & Configuration ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Canvas & Branding ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Actions & AI Models ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Connectors & APIs ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Knowledge Base ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Voice Configuration {agent.config.voice ? '✓' : '⚠'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Ready for Deployment</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedChannelMatrix;
