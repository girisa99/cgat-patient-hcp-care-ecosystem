import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Brain, MessageSquare, Settings, Database } from 'lucide-react';

export const AIModelConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Model Selection
    provider: data.provider || 'openai',
    model: data.model || 'gpt-4o-mini',
    api_key: data.api_key || '',
    endpoint: data.endpoint || '',
    
    // LLM Parameters
    temperature: data.temperature || 0.7,
    max_tokens: data.max_tokens || 1000,
    top_p: data.top_p || 0.9,
    frequency_penalty: data.frequency_penalty || 0,
    presence_penalty: data.presence_penalty || 0,
    
    // Memory & Messages
    enable_memory: data.enable_memory || false,
    memory_type: data.memory_type || 'all_messages',
    max_message_history: data.max_message_history || 10,
    system_prompt: data.system_prompt || '',
    
    // JSON Structured Output
    structured_output_enabled: data.structured_output_enabled || false,
    output_schema: data.output_schema || '',
    schema_type: data.schema_type || 'json',
    
    // Flow State Management
    flow_state_variables: data.flow_state_variables || [],
    
    // Response Processing
    response_format: data.response_format || 'text',
    parse_json_response: data.parse_json_response || false,
    
    // Message Templates
    message_templates: data.message_templates || []
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof data?.configOpen !== 'undefined') {
      setIsExpanded(!!data.configOpen);
    }
  }, [data?.configOpen]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addFlowStateVariable = () => {
    updateConfig({
      flow_state_variables: [...config.flow_state_variables, { name: '', type: 'string', description: '' }]
    });
  };

  const updateFlowStateVariable = (index: number, field: string, value: string) => {
    const updated = [...config.flow_state_variables];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ flow_state_variables: updated });
  };

  const removeFlowStateVariable = (index: number) => {
    updateConfig({
      flow_state_variables: config.flow_state_variables.filter((_, i) => i !== index)
    });
  };

  const addMessageTemplate = () => {
    updateConfig({
      message_templates: [...config.message_templates, { role: 'user', content: '', name: '' }]
    });
  };

  const updateMessageTemplate = (index: number, field: string, value: string) => {
    const updated = [...config.message_templates];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ message_templates: updated });
  };

  const removeMessageTemplate = (index: number) => {
    updateConfig({
      message_templates: config.message_templates.filter((_, i) => i !== index)
    });
  };

  const modelOptions = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    meta: ['llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b'],
    microsoft: ['phi-3-mini', 'phi-3-medium', 'phi-3-large']
  };

  const memoryTypes = [
    { value: 'all_messages', label: 'All Messages' },
    { value: 'last_n_messages', label: 'Last N Messages' },
    { value: 'summary_buffer', label: 'Summary Buffer' },
    { value: 'token_buffer', label: 'Token Buffer' }
  ];

  const schemaTypes = [
    { value: 'json', label: 'JSON Schema' },
    { value: 'api', label: 'API Schema' },
    { value: 'sql', label: 'SQL Schema' },
    { value: 'xml', label: 'XML Schema' }
  ];

  const responseFormats = [
    { value: 'text', label: 'Plain Text' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'xml', label: 'XML' }
  ];

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Brain}
      title={`${data.display_name || 'AI Model'} - ${config.provider}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.provider}
        </Badge>
        {config.enable_memory && (
          <Badge variant="outline" className="mr-1">Memory</Badge>
        )}
        {config.structured_output_enabled && (
          <Badge variant="outline">Structured Output</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Model Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Provider</Label>
                  <Select value={config.provider} onValueChange={(value) => updateConfig({ provider: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                      <SelectItem value="microsoft">Microsoft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Model</Label>
                  <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions[config.provider]?.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">API Key</Label>
                <Input
                  type="password"
                  className="h-8"
                  value={config.api_key}
                  onChange={(e) => updateConfig({ api_key: e.target.value })}
                  placeholder="Enter API key"
                />
              </div>

              {config.provider === 'microsoft' && (
                <div>
                  <Label className="text-xs">Custom Endpoint</Label>
                  <Input
                    className="h-8"
                    value={config.endpoint}
                    onChange={(e) => updateConfig({ endpoint: e.target.value })}
                    placeholder="https://your-endpoint.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* LLM Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">LLM Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Temperature: {config.temperature}</Label>
                <Slider
                  value={[config.temperature]}
                  onValueChange={(value) => updateConfig({ temperature: value[0] })}
                  max={2}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Top P: {config.top_p}</Label>
                <Slider
                  value={[config.top_p]}
                  onValueChange={(value) => updateConfig({ top_p: value[0] })}
                  max={1}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Max Tokens</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={config.max_tokens}
                    onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Response Format</Label>
                  <Select value={config.response_format} onValueChange={(value) => updateConfig({ response_format: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {responseFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory & Messages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Memory & Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Memory</Label>
                <Switch
                  checked={config.enable_memory}
                  onCheckedChange={(checked) => updateConfig({ enable_memory: checked })}
                />
              </div>

              {config.enable_memory && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Memory Type</Label>
                      <Select value={config.memory_type} onValueChange={(value) => updateConfig({ memory_type: value })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {memoryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Max History</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={config.max_message_history}
                        onChange={(e) => updateConfig({ max_message_history: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-xs">System Prompt</Label>
                <Textarea
                  className="min-h-20 text-xs"
                  value={config.system_prompt}
                  onChange={(e) => updateConfig({ system_prompt: e.target.value })}
                  placeholder="System prompt for the AI model..."
                />
              </div>
            </CardContent>
          </Card>

          {/* JSON Structured Output */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Structured Output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Structured Output</Label>
                <Switch
                  checked={config.structured_output_enabled}
                  onCheckedChange={(checked) => updateConfig({ structured_output_enabled: checked })}
                />
              </div>

              {config.structured_output_enabled && (
                <>
                  <div>
                    <Label className="text-xs">Schema Type</Label>
                    <Select value={config.schema_type} onValueChange={(value) => updateConfig({ schema_type: value })}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Output Schema</Label>
                    <Textarea
                      className="min-h-20 text-xs font-mono"
                      value={config.output_schema}
                      onChange={(e) => updateConfig({ output_schema: e.target.value })}
                      placeholder={`{"type": "object", "properties": {"result": {"type": "string"}}}`}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Flow State Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Flow State Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addFlowStateVariable}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.flow_state_variables.map((variable, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    className="h-8 flex-1"
                    value={variable.name}
                    onChange={(e) => updateFlowStateVariable(index, 'name', e.target.value)}
                    placeholder="Variable name"
                  />
                  <Select
                    value={variable.type}
                    onValueChange={(value) => updateFlowStateVariable(index, 'type', value)}
                  >
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFlowStateVariable(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </BaseWorkflowNode>
  );
};