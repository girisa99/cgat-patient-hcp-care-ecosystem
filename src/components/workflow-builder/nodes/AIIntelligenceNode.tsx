import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Bot, ChevronDown, ChevronRight, Settings2, Zap, Database,
  MessageCircle, Save, Play, Pause, RotateCcw
} from 'lucide-react';

interface AIIntelligenceNodeProps {
  id: string;
  data: any;
  selected: boolean;
}

export const AIIntelligenceNode: React.FC<AIIntelligenceNodeProps> = ({ id, data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState({
    model: data.model || 'gpt-5-2025-08-07',
    temperature: data.temperature || [0.7],
    maxTokens: data.maxTokens || 1000,
    systemPrompt: data.systemPrompt || '',
    variables: data.variables || [],
    apiEndpoint: data.apiEndpoint || '',
    database: data.database || '',
    connectors: data.connectors || [],
    actions: data.actions || [],
    active: data.active !== false,
  });

  const aiModels = [
    { value: 'gpt-5-2025-08-07', label: 'GPT-5 (Latest)', description: 'Flagship model' },
    { value: 'gpt-5-mini-2025-08-07', label: 'GPT-5 Mini', description: 'Faster, cost-efficient' },
    { value: 'gpt-5-nano-2025-08-07', label: 'GPT-5 Nano', description: 'Fastest, cheapest' },
    { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1', description: 'Reliable flagship' },
    { value: 'o3-2025-04-16', label: 'O3', description: 'Powerful reasoning' },
    { value: 'o4-mini-2025-04-16', label: 'O4 Mini', description: 'Fast reasoning' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Advanced reasoning' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Google\'s latest' }
  ];

  const availableConnectors = [
    'REST API', 'GraphQL', 'WebSocket', 'Database', 'Email', 'SMS', 
    'Slack', 'Teams', 'Webhook', 'Zapier', 'Make', 'Airtable'
  ];

  const availableActions = [
    'Send Email', 'SMS Notification', 'Database Query', 'API Call',
    'File Upload', 'Data Transform', 'Conditional Logic', 'Loop'
  ];

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const selectedModel = aiModels.find(m => m.value === config.model);

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="custom-handle w-3 h-3 bg-primary border-2 border-background rounded-full shadow" />
      
      <Card className={`min-w-[280px] ${selected ? 'ring-2 ring-primary' : ''} ${isExpanded ? 'w-[420px]' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">AI Intelligence</h3>
                <p className="text-xs text-muted-foreground">{selectedModel?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={config.active ? "default" : "secondary"} className="text-xs">
                {config.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Compact View */}
          {!isExpanded && (
            <div className="space-y-2">
              <div className="text-xs bg-muted/50 rounded p-2">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>{config.temperature[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Tokens:</span>
                  <span>{config.maxTokens}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          )}

          {/* Expanded Configuration */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">AI Model</Label>
                <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div>
                          <div className="font-medium">{model.label}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">System Prompt</Label>
                <Textarea
                  value={config.systemPrompt}
                  onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                  placeholder="Enter system prompt for the AI..."
                  className="text-xs resize-none"
                  rows={3}
                />
              </div>

              {/* Model Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Temperature: {config.temperature[0]}</Label>
                  <Slider
                    value={config.temperature}
                    onValueChange={(value) => updateConfig({ temperature: value })}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Tokens</Label>
                  <Input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                    className="h-8 text-xs"
                    min={1}
                    max={4000}
                  />
                </div>
              </div>

              <Separator />

              {/* Variables */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Variables ({config.variables.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Input
                    placeholder="Add variable (e.g., user_name, context)"
                    className="h-8 text-xs"
                  />
                  <div className="flex flex-wrap gap-1">
                    {config.variables.map((variable: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* API Configuration */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Database className="h-3 w-3" />
                      API & Database
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="space-y-2">
                    <Label className="text-xs">API Endpoint</Label>
                    <Input
                      value={config.apiEndpoint}
                      onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com/endpoint"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Database Connection</Label>
                    <Select value={config.database} onValueChange={(value) => updateConfig({ database: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select database" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="supabase">Supabase</SelectItem>
                        <SelectItem value="firebase">Firebase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Connectors */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3" />
                      Connectors ({config.connectors.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Select onValueChange={(value) => {
                    if (!config.connectors.includes(value)) {
                      updateConfig({ connectors: [...config.connectors, value] });
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add connector" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConnectors.map((connector) => (
                        <SelectItem key={connector} value={connector}>
                          {connector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {config.connectors.map((connector: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {connector}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Actions */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                    <span className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Actions ({config.actions.length})
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <Select onValueChange={(value) => {
                    if (!config.actions.includes(value)) {
                      updateConfig({ actions: [...config.actions, value] });
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Add action" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {config.actions.map((action: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.active}
                    onCheckedChange={(checked) => updateConfig({ active: checked })}
                  />
                  <Label className="text-xs">Active</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="custom-handle w-3 h-3 bg-primary border-2 border-background rounded-full shadow" />
    </div>
  );
};