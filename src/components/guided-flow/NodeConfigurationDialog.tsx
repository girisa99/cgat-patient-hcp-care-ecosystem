import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bot, Brain, Database, Settings, MessageCircle, Phone, Mail, 
  Calendar, Cloud, TestTube, Layers, Zap, Target, GitBranch,
  Plus, Trash2, Edit, Save
} from 'lucide-react';

interface NodeConfigurationDialogProps {
  node: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

export const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> = ({
  node,
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (node) {
      setConfig(node.data?.config || {});
    }
  }, [node]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderBasicConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={config.label || node?.data?.label || ''}
          onChange={(e) => setConfig({...config, label: e.target.value})}
          placeholder="Enter node label"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.description || node?.data?.description || ''}
          onChange={(e) => setConfig({...config, description: e.target.value})}
          placeholder="Enter node description"
          className="min-h-20"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={config.enabled !== false}
          onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
        />
        <Label htmlFor="enabled">Enable this node</Label>
      </div>
    </div>
  );

  const renderUseCaseConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="useCase">Use Case Description</Label>
        <Textarea
          id="useCase"
          value={config.useCase || ''}
          onChange={(e) => setConfig({...config, useCase: e.target.value})}
          placeholder="Describe your use case in detail..."
          className="min-h-32"
        />
      </div>
      
      <div>
        <Label htmlFor="targetUsers">Target Users</Label>
        <Input
          id="targetUsers"
          value={config.targetUsers || ''}
          onChange={(e) => setConfig({...config, targetUsers: e.target.value})}
          placeholder="e.g., Healthcare staff, patients, administrators"
        />
      </div>

      <div>
        <Label htmlFor="expectedOutcomes">Expected Outcomes</Label>
        <Input
          id="expectedOutcomes"
          value={config.expectedOutcomes || ''}
          onChange={(e) => setConfig({...config, expectedOutcomes: e.target.value})}
          placeholder="What should this agent accomplish?"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Journey Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoGenerate"
              checked={config.autoGenerateJourney !== false}
              onCheckedChange={(checked) => setConfig({...config, autoGenerateJourney: checked})}
            />
            <Label htmlFor="autoGenerate">Auto-generate journey steps</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="agentType">Agent Type</Label>
        <Select
          value={config.agentType || 'conversational'}
          onValueChange={(value) => setConfig({...config, agentType: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conversational">Conversational</SelectItem>
            <SelectItem value="task">Task-based</SelectItem>
            <SelectItem value="workflow">Workflow</SelectItem>
            <SelectItem value="decision">Decision Support</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="personality">Agent Personality</Label>
        <Select
          value={config.personality || 'professional'}
          onValueChange={(value) => setConfig({...config, personality: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="empathetic">Empathetic</SelectItem>
            <SelectItem value="authoritative">Authoritative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="capabilities">Capabilities</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(config.capabilities || []).map((capability: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {capability}
              <Trash2 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const newCapabilities = config.capabilities.filter((_: any, i: number) => i !== idx);
                  setConfig({...config, capabilities: newCapabilities});
                }}
              />
            </Badge>
          ))}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const newCapability = prompt('Enter capability:');
              if (newCapability) {
                setConfig({
                  ...config, 
                  capabilities: [...(config.capabilities || []), newCapability]
                });
              }
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAIModelConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="provider">AI Provider</Label>
        <Select
          value={config.provider || 'openai'}
          onValueChange={(value) => setConfig({...config, provider: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="local">Local Model</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Select
          value={config.model || 'gpt-4o-mini'}
          onValueChange={(value) => setConfig({...config, model: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="claude-haiku-4-5">Claude Haiku 4.5</SelectItem>
            <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="temperature">Temperature</Label>
        <Input
          id="temperature"
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature || 0.7}
          onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          value={config.maxTokens || 1000}
          onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
        />
      </div>
    </div>
  );

  const renderChannelsConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Available Channels</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'phone', label: 'Phone', icon: Phone },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'calendar', label: 'Calendar', icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <Card 
              key={id} 
              className={`cursor-pointer transition-colors ${
                config.channels?.includes(id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                const channels = config.channels || [];
                const newChannels = channels.includes(id)
                  ? channels.filter((c: string) => c !== id)
                  : [...channels, id];
                setConfig({...config, channels: newChannels});
              }}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm font-medium">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="multiChannel"
          checked={config.multiChannel !== false}
          onCheckedChange={(checked) => setConfig({...config, multiChannel: checked})}
        />
        <Label htmlFor="multiChannel">Enable multi-channel support</Label>
      </div>
    </div>
  );

  const renderDeploymentConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="environment">Target Environment</Label>
        <Select
          value={config.environment || 'development'}
          onValueChange={(value) => setConfig({...config, environment: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="uat">UAT</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="scaling">Scaling Strategy</Label>
        <Select
          value={config.scaling || 'auto'}
          onValueChange={(value) => setConfig({...config, scaling: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-scaling</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="monitoring"
          checked={config.monitoring !== false}
          onCheckedChange={(checked) => setConfig({...config, monitoring: checked})}
        />
        <Label htmlFor="monitoring">Enable monitoring</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="logging"
          checked={config.logging !== false}
          onCheckedChange={(checked) => setConfig({...config, logging: checked})}
        />
        <Label htmlFor="logging">Enable detailed logging</Label>
      </div>
    </div>
  );

  if (!node) return null;

  const getNodeIcon = () => {
    switch (node.data?.stepType) {
      case 'useCase': return Target;
      case 'journey': return GitBranch;
      case 'agent': return Bot;
      case 'aiModel': return Brain;
      case 'assets': return Database;
      case 'deployment': return Cloud;
      case 'channels': return MessageCircle;
      case 'testing': return TestTube;
      case 'template': return Layers;
      default: return Settings;
    }
  };

  const Icon = getNodeIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Configure {node.data?.label}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {renderBasicConfig()}
            {node.data?.stepType === 'useCase' && renderUseCaseConfig()}
            {node.data?.stepType === 'agent' && renderAgentConfig()}
            {node.data?.stepType === 'aiModel' && renderAIModelConfig()}
            {node.data?.stepType === 'channels' && renderChannelsConfig()}
            {node.data?.stepType === 'deployment' && renderDeploymentConfig()}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="customCode">Custom Configuration (JSON)</Label>
              <Textarea
                id="customCode"
                value={JSON.stringify(config, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setConfig(parsed);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="min-h-40 font-mono text-xs"
                placeholder="Enter custom configuration..."
              />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <div>
              <Label>Available Integrations</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['Supabase', 'OpenAI', 'Stripe', 'Twilio', 'SendGrid', 'Zoom', 'Slack', 'Teams', 'Calendar'].map((integration) => (
                  <Card 
                    key={integration}
                    className={`cursor-pointer transition-colors ${
                      config.integrations?.includes(integration) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      const integrations = config.integrations || [];
                      const newIntegrations = integrations.includes(integration)
                        ? integrations.filter((i: string) => i !== integration)
                        : [...integrations, integration];
                      setConfig({...config, integrations: newIntegrations});
                    }}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-xs font-medium">{integration}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};