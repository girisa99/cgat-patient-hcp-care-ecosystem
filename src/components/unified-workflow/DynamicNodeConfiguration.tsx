import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Settings, 
  Brain, 
  Zap, 
  Database, 
  MessageSquare, 
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';

interface DynamicNodeConfigurationProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const DynamicNodeConfiguration: React.FC<DynamicNodeConfigurationProps> = ({
  nodeType,
  configuration,
  onChange,
  onSave,
  onCancel
}) => {
  const { getNodeTypeByKey } = useWorkflowNodes();
  const [localConfig, setLocalConfig] = useState(configuration || {});
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const nodeTypeData = getNodeTypeByKey(nodeType);

  useEffect(() => {
    setLocalConfig(configuration || {});
  }, [configuration]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderBasicConfiguration = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nodeName">Node Name</Label>
          <Input
            id="nodeName"
            value={localConfig.name || ''}
            onChange={(e) => handleConfigChange('name', e.target.value)}
            placeholder="Enter node name"
          />
        </div>
        <div>
          <Label htmlFor="nodeDescription">Description</Label>
          <Input
            id="nodeDescription"
            value={localConfig.description || ''}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            placeholder="Brief description"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={localConfig.systemPrompt || ''}
          onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
          placeholder="Enter system prompt for this node"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={localConfig.enabled !== false}
          onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
        />
        <Label htmlFor="enabled">Enable this node</Label>
      </div>
    </div>
  );

  const renderAIConfiguration = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="provider">AI Provider</Label>
          <Select 
            value={localConfig.provider || 'openai'}
            onValueChange={(value) => handleConfigChange('provider', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="microsoft">Microsoft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Select 
            value={localConfig.model || ''}
            onValueChange={(value) => handleConfigChange('model', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
              <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={localConfig.temperature || 0.7}
            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={localConfig.maxTokens || 1000}
            onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="timeout">Timeout (s)</Label>
          <Input
            id="timeout"
            type="number"
            value={localConfig.timeout || 30}
            onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="streamResponse"
          checked={localConfig.streamResponse || false}
          onCheckedChange={(checked) => handleConfigChange('streamResponse', checked)}
        />
        <Label htmlFor="streamResponse">Stream response</Label>
      </div>
    </div>
  );

  const renderAdvancedConfiguration = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="retryAttempts">Retry Attempts</Label>
          <Input
            id="retryAttempts"
            type="number"
            min="0"
            max="10"
            value={localConfig.retryAttempts || 3}
            onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={localConfig.priority || 'medium'}
            onValueChange={(value) => handleConfigChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Logging Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableLogging"
              checked={localConfig.enableLogging !== false}
              onCheckedChange={(checked) => handleConfigChange('enableLogging', checked)}
            />
            <Label htmlFor="enableLogging">Enable detailed logging</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="logInputOutput"
              checked={localConfig.logInputOutput || false}
              onCheckedChange={(checked) => handleConfigChange('logInputOutput', checked)}
            />
            <Label htmlFor="logInputOutput">Log input/output data</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="customMetadata">Custom Metadata (JSON)</Label>
        <Textarea
          id="customMetadata"
          value={localConfig.customMetadata ? JSON.stringify(localConfig.customMetadata, null, 2) : '{}'}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleConfigChange('customMetadata', parsed);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"key": "value"}'
          rows={4}
        />
      </div>
    </div>
  );

  const configSections = [
    {
      id: 'basic',
      title: 'Basic Configuration',
      icon: Settings,
      content: renderBasicConfiguration()
    },
    {
      id: 'ai',
      title: 'AI Settings',
      icon: Brain,
      content: renderAIConfiguration()
    },
    {
      id: 'advanced',
      title: 'Advanced Options',
      icon: Zap,
      content: renderAdvancedConfiguration()
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Configure {nodeTypeData?.display_name || nodeType}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {nodeTypeData?.description || 'Customize this node\'s behavior and settings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{nodeType}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Accordion type="multiple" value={expandedSections} className="w-full">
          {configSections.map((section) => {
            const Icon = section.icon;
            return (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger 
                  onClick={() => toggleSection(section.id)}
                  className="hover:no-underline"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Sparkles className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};