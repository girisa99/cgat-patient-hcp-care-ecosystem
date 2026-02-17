import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, Brain, Eye, Server, MessageSquare, Globe, Workflow,
  Plus, X, Settings, Code, Database, Shield, Zap
} from 'lucide-react';

interface NodeConfigurationFormProps {
  node?: {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    type: 'llm' | 'vlm' | 'mcp' | 'api' | 'channel' | 'workflow' | 'data';
    provider?: string;
    status: 'active' | 'inactive' | 'beta';
    capabilities: string[];
    configuration: Record<string, any>;
    version?: string;
  } | null;
  onSave: (nodeData: any) => void;
  onCancel: () => void;
}

const nodeTypes = [
  { value: 'llm', label: 'Language Model', icon: <Brain className="w-4 h-4" /> },
  { value: 'vlm', label: 'Vision Language Model', icon: <Eye className="w-4 h-4" /> },
  { value: 'mcp', label: 'MCP Server', icon: <Server className="w-4 h-4" /> },
  { value: 'api', label: 'API Integration', icon: <Globe className="w-4 h-4" /> },
  { value: 'channel', label: 'Communication Channel', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'workflow', label: 'Workflow Node', icon: <Workflow className="w-4 h-4" /> },
  { value: 'data', label: 'Data Node', icon: <Database className="w-4 h-4" /> }
];

const categories = [
  'Language Models',
  'MCP Servers', 
  'Channels',
  'APIs & Integrations',
  'Workflows',
  'Data Sources',
  'Custom'
];

const predefinedCapabilities = [
  'Text Generation', 'Analysis', 'Conversation', 'Code Generation',
  'Image Analysis', 'OCR', 'Visual Understanding', 'Document Processing',
  'File Operations', 'Directory Management', 'Content Reading', 'System Integration',
  'Real-time Chat', 'File Upload', 'Emoji Support', 'Voice Synthesis',
  'Speech Recognition', 'Call Routing', 'Video Calls', 'Screen Sharing',
  'CRUD Operations', 'Real-time Updates', 'Authentication', 'Data Validation',
  'Workflow Automation', 'Task Scheduling', 'Event Processing', 'Decision Making'
];

export const NodeConfigurationForm: React.FC<NodeConfigurationFormProps> = ({
  node,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Custom',
    subcategory: '',
    type: 'workflow' as 'llm' | 'vlm' | 'mcp' | 'api' | 'channel' | 'workflow' | 'data',
    provider: '',
    status: 'active' as 'active' | 'inactive' | 'beta',
    capabilities: [] as string[],
    configuration: {} as Record<string, any>,
    version: '1.0'
  });

  const [newCapability, setNewCapability] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name,
        description: node.description,
        category: node.category,
        subcategory: node.subcategory || '',
        type: node.type,
        provider: node.provider || '',
        status: node.status,
        capabilities: [...node.capabilities],
        configuration: { ...node.configuration },
        version: node.version || '1.0'
      });
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCapability = (capability: string) => {
    if (capability && !formData.capabilities.includes(capability)) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capability]
      }));
    }
    setNewCapability('');
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const addConfiguration = () => {
    if (configKey && configValue) {
      setFormData(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          [configKey]: configValue
        }
      }));
      setConfigKey('');
      setConfigValue('');
    }
  };

  const removeConfiguration = (key: string) => {
    setFormData(prev => {
      const newConfig = { ...prev.configuration };
      delete newConfig[key];
      return { ...prev, configuration: newConfig };
    });
  };

  const getTypeSpecificFields = () => {
    switch (formData.type) {
      case 'llm':
      case 'vlm':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={formData.configuration.max_tokens || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, max_tokens: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.configuration.temperature || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, temperature: parseFloat(e.target.value) }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="system_prompt">System Prompt</Label>
              <Textarea
                id="system_prompt"
                value={formData.configuration.system_prompt || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, system_prompt: e.target.value }
                }))}
                placeholder="Enter system prompt for this model..."
              />
            </div>
          </div>
        );
      
      case 'mcp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="server_url">Server URL</Label>
              <Input
                id="server_url"
                value={formData.configuration.server_url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, server_url: e.target.value }
                }))}
                placeholder="http://localhost:3000"
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.configuration.timeout || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, timeout: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
        );
      
      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                value={formData.configuration.base_url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, base_url: e.target.value }
                }))}
                placeholder="https://api.example.com"
              />
            </div>
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.configuration.api_key || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, api_key: e.target.value }
                }))}
                placeholder="Enter API key..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ssl_verify"
                checked={formData.configuration.ssl_verify !== false}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, ssl_verify: checked }
                }))}
              />
              <Label htmlFor="ssl_verify">SSL Verification</Label>
            </div>
          </div>
        );
      
      case 'channel':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="channel_type">Channel Type</Label>
              <Select
                value={formData.configuration.channel_type || ''}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, channel_type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="real_time"
                checked={formData.configuration.real_time !== false}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, real_time: checked }
                }))}
              />
              <Label htmlFor="real_time">Real-time Communication</Label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Node name"
                required
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this node does..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="OpenAI, Anthropic, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              placeholder="Optional subcategory"
            />
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <div>
            <Label>Add Capabilities</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                placeholder="Enter capability"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability(newCapability))}
              />
              <Button type="button" onClick={() => addCapability(newCapability)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Predefined Capabilities</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
              {predefinedCapabilities.map(capability => (
                <Button
                  key={capability}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => addCapability(capability)}
                  disabled={formData.capabilities.includes(capability)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {capability}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Current Capabilities</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.capabilities.map(capability => (
                <Badge key={capability} variant="secondary" className="gap-1">
                  {capability}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeCapability(capability)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Type-Specific Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {getTypeSpecificFields() || (
                <p className="text-sm text-muted-foreground">
                  No specific configuration options for this node type.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custom Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="Configuration key"
                />
                <Input
                  value={configValue}
                  onChange={(e) => setConfigValue(e.target.value)}
                  placeholder="Configuration value"
                />
                <Button type="button" onClick={addConfiguration}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(formData.configuration).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <code className="text-sm">{key}: {JSON.stringify(value)}</code>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConfiguration(key)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {node ? 'Update Node' : 'Create Node'}
        </Button>
      </div>
    </form>
  );
};