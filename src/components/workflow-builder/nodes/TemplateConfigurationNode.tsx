import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Settings, FileText, Code, Database, Globe } from 'lucide-react';

export const TemplateConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Template basics
    template_type: data.template_type || 'system_prompt',
    template_content: data.template_content || '',
    
    // Schema configuration
    input_schema_type: data.input_schema_type || 'json',
    input_schema: data.input_schema || '',
    output_schema_type: data.output_schema_type || 'json',
    output_schema: data.output_schema || '',
    
    // Variables and conditions
    variables: data.variables || [],
    conditions: data.conditions || [],
    
    // Instructions and scenarios
    instructions: data.instructions || '',
    scenarios: data.scenarios || [],
    
    // System prompt override
    can_override_system_prompt: data.can_override_system_prompt || false,
    system_prompt_override: data.system_prompt_override || '',
    
    // JavaScript functions
    javascript_functions: data.javascript_functions || [],
    
    // Flow state management
    flow_state_variables: data.flow_state_variables || [],
    
    // Direct reply configuration
    direct_reply_enabled: data.direct_reply_enabled || false,
    direct_reply_message: data.direct_reply_message || '',
    
    // Execution settings
    execute_flow_enabled: data.execute_flow_enabled || false,
    selected_flow: data.selected_flow || '',
    
    // HTTP configuration
    http_enabled: data.http_enabled || false,
    http_method: data.http_method || 'GET',
    http_url: data.http_url || '',
    http_headers: data.http_headers || [],
    http_query_params: data.http_query_params || [],
    http_body_type: data.http_body_type || 'json',
    
    // LLM configuration
    llm_model: data.llm_model || '',
    llm_messages: data.llm_messages || [],
    enable_memory: data.enable_memory || false,
    memory_type: data.memory_type || 'all_messages',
    
    // JSON structured output
    json_structured_output: data.json_structured_output || [],
    
    // Return response configuration
    return_response_type: data.return_response_type || 'user_message'
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

  const addVariable = () => {
    updateConfig({
      variables: [...config.variables, { name: '', value: '', type: 'string' }]
    });
  };

  const updateVariable = (index: number, field: string, value: string) => {
    const updatedVariables = [...config.variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    updateConfig({ variables: updatedVariables });
  };

  const removeVariable = (index: number) => {
    updateConfig({
      variables: config.variables.filter((_, i) => i !== index)
    });
  };

  const addHttpHeader = () => {
    updateConfig({
      http_headers: [...config.http_headers, { key: '', value: '' }]
    });
  };

  const updateHttpHeader = (index: number, field: string, value: string) => {
    const updatedHeaders = [...config.http_headers];
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value };
    updateConfig({ http_headers: updatedHeaders });
  };

  const addLLMMessage = () => {
    updateConfig({
      llm_messages: [...config.llm_messages, { role: 'user', content: '' }]
    });
  };

  const updateLLMMessage = (index: number, field: string, value: string) => {
    const updatedMessages = [...config.llm_messages];
    updatedMessages[index] = { ...updatedMessages[index], [field]: value };
    updateConfig({ llm_messages: updatedMessages });
  };

  const addJSONOutput = () => {
    updateConfig({
      json_structured_output: [...config.json_structured_output, { key: '', type: 'string', description: '' }]
    });
  };

  const updateJSONOutput = (index: number, field: string, value: string) => {
    const updatedOutputs = [...config.json_structured_output];
    updatedOutputs[index] = { ...updatedOutputs[index], [field]: value };
    updateConfig({ json_structured_output: updatedOutputs });
  };

  const addFlowState = () => {
    updateConfig({
      flow_state_variables: [...config.flow_state_variables, { key: '', value: '' }]
    });
  };

  const getTemplateIcon = () => {
    switch (config.template_type) {
      case 'http': return Globe;
      case 'llm': return Code;
      case 'database': return Database;
      default: return FileText;
    }
  };

  const Icon = getTemplateIcon();

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Icon}
      title={data.label || `${config.template_type} Template`}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 min-w-[250px]"
    >
      <div className="space-y-2">
        {/* Inline Template Display */}
        <div className="flex items-center gap-2 bg-white/80 rounded px-2 py-1">
          <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
            <Icon className="h-3 w-3 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{config.template_type}</div>
            <div className="text-[10px] text-muted-foreground">
              {config.variables.length} vars | {config.conditions.length} conditions
            </div>
          </div>
        </div>

        {/* Quick Status */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] px-1">
            {data.status || 'Ready'}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            {isExpanded ? 'Close' : 'Config'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Template Type */}
            <div className="space-y-2">
              <Label className="text-xs">Template Type</Label>
              <Select value={config.template_type} onValueChange={(value) => updateConfig({ template_type: value })}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_prompt">System Prompt</SelectItem>
                  <SelectItem value="few_shot">Few-Shot Learning</SelectItem>
                  <SelectItem value="instruction">Instruction</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="http">HTTP Request</SelectItem>
                  <SelectItem value="llm">LLM Processing</SelectItem>
                  <SelectItem value="human_input">Human Input</SelectItem>
                  <SelectItem value="execute_flow">Execute Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Content */}
            <div className="space-y-2">
              <Label className="text-xs">Template Content</Label>
              <Textarea
                value={config.template_content}
                onChange={(e) => updateConfig({ template_content: e.target.value })}
                className="min-h-[60px] text-xs"
                placeholder="Enter template content..."
              />
            </div>

            {/* Input Schema Configuration */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Input Schema</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Schema Type</Label>
                  <Select value={config.input_schema_type} onValueChange={(value) => updateConfig({ input_schema_type: value })}>
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={config.input_schema}
                  onChange={(e) => updateConfig({ input_schema: e.target.value })}
                  className="min-h-[40px] text-xs"
                  placeholder="Define input schema..."
                />
              </CardContent>
            </Card>

            {/* Variables */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  Variables
                  <Button size="sm" variant="outline" onClick={addVariable} className="h-5 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {config.variables.map((variable: any, index: number) => (
                  <div key={index} className="flex items-center gap-1 p-1 border rounded">
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      placeholder="Variable name"
                      className="h-6 text-xs"
                    />
                    <Select value={variable.type} onValueChange={(value) => updateVariable(index, 'type', value)}>
                      <SelectTrigger className="h-6 text-xs w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={variable.value}
                      onChange={(e) => updateVariable(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="h-6 text-xs"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeVariable(index)} className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* HTTP Configuration */}
            {config.template_type === 'http' && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">HTTP Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Method</Label>
                      <Select value={config.http_method} onValueChange={(value) => updateConfig({ http_method: value })}>
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Body Type</Label>
                      <Select value={config.http_body_type} onValueChange={(value) => updateConfig({ http_body_type: value })}>
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="form-data">Form Data</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={config.http_url}
                      onChange={(e) => updateConfig({ http_url: e.target.value })}
                      placeholder="https://api.example.com"
                      className="h-6 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center justify-between">
                      Headers
                      <Button size="sm" variant="outline" onClick={addHttpHeader} className="h-5 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Label>
                    {config.http_headers.map((header: any, index: number) => (
                      <div key={index} className="flex items-center gap-1">
                        <Input
                          value={header.key}
                          onChange={(e) => updateHttpHeader(index, 'key', e.target.value)}
                          placeholder="Header name"
                          className="h-6 text-xs"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updateHttpHeader(index, 'value', e.target.value)}
                          placeholder="Header value"
                          className="h-6 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LLM Configuration */}
            {config.template_type === 'llm' && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">LLM Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <Label className="text-xs">Model</Label>
                    <Select value={config.llm_model} onValueChange={(value) => updateConfig({ llm_model: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="claude-opus-4-7">Claude Opus 4.7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center justify-between">
                      Messages
                      <Button size="sm" variant="outline" onClick={addLLMMessage} className="h-5 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Label>
                    {config.llm_messages.map((message: any, index: number) => (
                      <div key={index} className="space-y-1 p-2 border rounded">
                        <Select value={message.role} onValueChange={(value) => updateLLMMessage(index, 'role', value)}>
                          <SelectTrigger className="h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={message.content}
                          onChange={(e) => updateLLMMessage(index, 'content', e.target.value)}
                          placeholder="Message content"
                          className="min-h-[40px] text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.enable_memory}
                      onCheckedChange={(checked) => updateConfig({ enable_memory: checked })}
                    />
                    <Label className="text-xs">Enable Memory</Label>
                  </div>
                  {config.enable_memory && (
                    <Select value={config.memory_type} onValueChange={(value) => updateConfig({ memory_type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_messages">All Messages</SelectItem>
                        <SelectItem value="last_n">Last N Messages</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            )}

            {/* JSON Structured Output */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  JSON Structured Output
                  <Button size="sm" variant="outline" onClick={addJSONOutput} className="h-5 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {config.json_structured_output.map((output: any, index: number) => (
                  <div key={index} className="space-y-1 p-2 border rounded">
                    <Input
                      value={output.key}
                      onChange={(e) => updateJSONOutput(index, 'key', e.target.value)}
                      placeholder="Key"
                      className="h-6 text-xs"
                    />
                    <Select value={output.type} onValueChange={(value) => updateJSONOutput(index, 'type', value)}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={output.description}
                      onChange={(e) => updateJSONOutput(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="h-6 text-xs"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Flow State Management */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  Update Flow State
                  <Button size="sm" variant="outline" onClick={addFlowState} className="h-5 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {config.flow_state_variables.map((state: any, index: number) => (
                  <div key={index} className="flex items-center gap-1">
                    <Input
                      value={state.key}
                      onChange={(e) => {
                        const updated = [...config.flow_state_variables];
                        updated[index] = { ...updated[index], key: e.target.value };
                        updateConfig({ flow_state_variables: updated });
                      }}
                      placeholder="Key"
                      className="h-6 text-xs"
                    />
                    <Input
                      value={state.value}
                      onChange={(e) => {
                        const updated = [...config.flow_state_variables];
                        updated[index] = { ...updated[index], value: e.target.value };
                        updateConfig({ flow_state_variables: updated });
                      }}
                      placeholder="Value"
                      className="h-6 text-xs"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Return Response Configuration */}
            <div className="space-y-2">
              <Label className="text-xs">Return Response As</Label>
              <Select value={config.return_response_type} onValueChange={(value) => updateConfig({ return_response_type: value })}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_message">User Message</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="flow_state">Flow State</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* System Prompt Override */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.can_override_system_prompt}
                  onCheckedChange={(checked) => updateConfig({ can_override_system_prompt: checked })}
                />
                <Label className="text-xs">Allow System Prompt Override</Label>
              </div>
              {config.can_override_system_prompt && (
                <Textarea
                  value={config.system_prompt_override}
                  onChange={(e) => updateConfig({ system_prompt_override: e.target.value })}
                  placeholder="System prompt override..."
                  className="min-h-[40px] text-xs"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};