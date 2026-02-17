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
import { Plus, Trash2, Settings, Users, MessageSquare } from 'lucide-react';

export const HumanInputNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    description_type: data.description_type || 'fixed',
    description: data.description || '',
    dynamic_prompt: data.dynamic_prompt || '',
    
    // Input validation
    input_type: data.input_type || 'text',
    required: data.required !== false,
    validation_rules: data.validation_rules || [],
    
    // User interface options
    ui_type: data.ui_type || 'input',
    placeholder: data.placeholder || '',
    options: data.options || [],
    
    // Timeout and retry
    timeout_seconds: data.timeout_seconds || 300,
    allow_skip: data.allow_skip || false,
    
    // Flow control
    on_timeout: data.on_timeout || 'continue',
    on_skip: data.on_skip || 'continue',
    
    // Variable assignment
    assign_to_variable: data.assign_to_variable || '',
    variable_name: data.variable_name || '',
    
    // Conditional logic
    conditions: data.conditions || [],
    
    // Response formatting
    response_format: data.response_format || 'text',
    
    // Instructions for user
    instructions: data.instructions || '',
    help_text: data.help_text || ''
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

  const addValidationRule = () => {
    updateConfig({
      validation_rules: [...config.validation_rules, { type: 'required', message: '' }]
    });
  };

  const updateValidationRule = (index: number, field: string, value: string) => {
    const updatedRules = [...config.validation_rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    updateConfig({ validation_rules: updatedRules });
  };

  const removeValidationRule = (index: number) => {
    updateConfig({
      validation_rules: config.validation_rules.filter((_, i) => i !== index)
    });
  };

  const addOption = () => {
    updateConfig({
      options: [...config.options, { value: '', label: '' }]
    });
  };

  const updateOption = (index: number, field: string, value: string) => {
    const updatedOptions = [...config.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    updateConfig({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    updateConfig({
      options: config.options.filter((_, i) => i !== index)
    });
  };

  const addCondition = () => {
    updateConfig({
      conditions: [...config.conditions, { field: 'input_value', operator: 'equals', value: '', action: 'continue' }]
    });
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Users}
      title={data.label || "Human Input"}
      className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 min-w-[220px]"
    >
      <div className="space-y-2">
        {/* Inline Description Display */}
        <div className="flex items-center gap-2 bg-white/80 rounded px-2 py-1">
          <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
            <MessageSquare className="h-3 w-3 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{config.description_type}</div>
            <div className="text-[10px] text-muted-foreground">
              {config.input_type} | {config.required ? 'Required' : 'Optional'}
            </div>
          </div>
        </div>

        {/* Quick Status */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] px-1">
            {data.status || 'Waiting'}
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
            {/* Description Type */}
            <div className="space-y-2">
              <Label className="text-xs">Description Type *</Label>
              <Select value={config.description_type} onValueChange={(value) => updateConfig({ description_type: value })}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">
                    <div>
                      <div className="font-medium">Fixed</div>
                      <div className="text-xs text-muted-foreground">Specify a fixed description</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dynamic">
                    <div>
                      <div className="font-medium">Dynamic</div>
                      <div className="text-xs text-muted-foreground">Use LLM to generate a description</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description Content */}
            {config.description_type === 'fixed' ? (
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => updateConfig({ description: e.target.value })}
                  className="min-h-[60px] text-xs"
                  placeholder="Enter description for the human input..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs">Dynamic Prompt</Label>
                <Textarea
                  value={config.dynamic_prompt}
                  onChange={(e) => updateConfig({ dynamic_prompt: e.target.value })}
                  className="min-h-[60px] text-xs"
                  placeholder="Enter prompt for LLM to generate description..."
                />
              </div>
            )}

            {/* Input Configuration */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Input Configuration</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Input Type</Label>
                    <Select value={config.input_type} onValueChange={(value) => updateConfig({ input_type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="multiselect">Multi-Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">UI Type</Label>
                    <Select value={config.ui_type} onValueChange={(value) => updateConfig({ ui_type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="input">Input Field</SelectItem>
                        <SelectItem value="modal">Modal Dialog</SelectItem>
                        <SelectItem value="inline">Inline Form</SelectItem>
                        <SelectItem value="chat">Chat Interface</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Placeholder Text</Label>
                  <Input
                    value={config.placeholder}
                    onChange={(e) => updateConfig({ placeholder: e.target.value })}
                    className="h-6 text-xs"
                    placeholder="Enter placeholder text..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.required}
                    onCheckedChange={(checked) => updateConfig({ required: checked })}
                  />
                  <Label className="text-xs">Required Field</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.allow_skip}
                    onCheckedChange={(checked) => updateConfig({ allow_skip: checked })}
                  />
                  <Label className="text-xs">Allow Skip</Label>
                </div>
              </CardContent>
            </Card>

            {/* Options for Select/Radio/Checkbox */}
            {['select', 'multiselect', 'radio', 'checkbox'].includes(config.input_type) && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center justify-between">
                    Options
                    <Button size="sm" variant="outline" onClick={addOption} className="h-5 px-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {config.options.map((option: any, index: number) => (
                    <div key={index} className="flex items-center gap-1">
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="h-6 text-xs"
                      />
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="h-6 text-xs"
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeOption(index)} className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Validation Rules */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  Validation Rules
                  <Button size="sm" variant="outline" onClick={addValidationRule} className="h-5 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {config.validation_rules.map((rule: any, index: number) => (
                  <div key={index} className="flex items-center gap-1 p-1 border rounded">
                    <Select value={rule.type} onValueChange={(value) => updateValidationRule(index, 'type', value)}>
                      <SelectTrigger className="h-6 text-xs w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="min_length">Min Length</SelectItem>
                        <SelectItem value="max_length">Max Length</SelectItem>
                        <SelectItem value="pattern">Pattern</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={rule.value || ''}
                      onChange={(e) => updateValidationRule(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="h-6 text-xs"
                    />
                    <Input
                      value={rule.message}
                      onChange={(e) => updateValidationRule(index, 'message', e.target.value)}
                      placeholder="Error message"
                      className="h-6 text-xs"
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeValidationRule(index)} className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timing Configuration */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Timing & Flow Control</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <Label className="text-xs">Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={config.timeout_seconds}
                    onChange={(e) => updateConfig({ timeout_seconds: parseInt(e.target.value) || 300 })}
                    className="h-6 text-xs"
                    min={30}
                    max={3600}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">On Timeout</Label>
                    <Select value={config.on_timeout} onValueChange={(value) => updateConfig({ on_timeout: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continue">Continue</SelectItem>
                        <SelectItem value="retry">Retry</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">On Skip</Label>
                    <Select value={config.on_skip} onValueChange={(value) => updateConfig({ on_skip: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continue">Continue</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="default_value">Use Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variable Assignment */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Variable Assignment</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <Label className="text-xs">Assign to Variable</Label>
                  <Input
                    value={config.variable_name}
                    onChange={(e) => updateConfig({ variable_name: e.target.value })}
                    placeholder="Variable name (e.g., user_input)"
                    className="h-6 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Response Format</Label>
                  <Select value={config.response_format} onValueChange={(value) => updateConfig({ response_format: value })}>
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Instructions and Help */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">User Guidance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <Label className="text-xs">Instructions</Label>
                  <Textarea
                    value={config.instructions}
                    onChange={(e) => updateConfig({ instructions: e.target.value })}
                    placeholder="Instructions for the user..."
                    className="min-h-[40px] text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Help Text</Label>
                  <Textarea
                    value={config.help_text}
                    onChange={(e) => updateConfig({ help_text: e.target.value })}
                    placeholder="Additional help text..."
                    className="min-h-[40px] text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Conditional Logic */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between">
                  Conditional Logic
                  <Button size="sm" variant="outline" onClick={addCondition} className="h-5 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {config.conditions.map((condition: any, index: number) => (
                  <div key={index} className="space-y-1 p-2 border rounded">
                    <div className="grid grid-cols-3 gap-1">
                      <Input
                        value={condition.field}
                        onChange={(e) => {
                          const updated = [...config.conditions];
                          updated[index] = { ...updated[index], field: e.target.value };
                          updateConfig({ conditions: updated });
                        }}
                        placeholder="Field"
                        className="h-6 text-xs"
                      />
                      <Select value={condition.operator} onValueChange={(value) => {
                        const updated = [...config.conditions];
                        updated[index] = { ...updated[index], operator: value };
                        updateConfig({ conditions: updated });
                      }}>
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value}
                        onChange={(e) => {
                          const updated = [...config.conditions];
                          updated[index] = { ...updated[index], value: e.target.value };
                          updateConfig({ conditions: updated });
                        }}
                        placeholder="Value"
                        className="h-6 text-xs"
                      />
                    </div>
                    <Select value={condition.action} onValueChange={(value) => {
                      const updated = [...config.conditions];
                      updated[index] = { ...updated[index], action: value };
                      updateConfig({ conditions: updated });
                    }}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continue">Continue</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                        <SelectItem value="redirect">Redirect</SelectItem>
                        <SelectItem value="validate">Validate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};