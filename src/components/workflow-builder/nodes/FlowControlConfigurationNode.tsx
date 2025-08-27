import React, { useState, useEffect } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GitBranch, RotateCw, PlayCircle, StopCircle } from 'lucide-react';

export const FlowControlConfigurationNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [config, setConfig] = useState({
    // Flow Control Type
    flow_type: data.flow_type || 'condition',
    
    // Conditions
    conditions: data.conditions || [],
    logical_operator: data.logical_operator || 'AND',
    
    // Variables
    input_variables: data.input_variables || [],
    output_variables: data.output_variables || [],
    
    // Flow State Management
    flow_state_key: data.flow_state_key || '',
    flow_state_value: data.flow_state_value || '',
    state_operation: data.state_operation || 'set',
    
    // Iteration Settings
    iteration_type: data.iteration_type || 'for_each',
    max_iterations: data.max_iterations || 10,
    iteration_condition: data.iteration_condition || '',
    break_condition: data.break_condition || '',
    
    // Decision Logic
    decision_criteria: data.decision_criteria || [],
    default_branch: data.default_branch || '',
    
    // Start Flow Settings
    trigger_conditions: data.trigger_conditions || [],
    auto_start: data.auto_start || false,
    
    // Loop Control
    loop_variable: data.loop_variable || '',
    loop_start: data.loop_start || 0,
    loop_end: data.loop_end || 10,
    loop_step: data.loop_step || 1,
    
    // Human Input Flow
    input_prompt: data.input_prompt || '',
    input_type: data.input_type || 'text',
    validation_rules: data.validation_rules || [],
    timeout_seconds: data.timeout_seconds || 300,
    
    // Error Handling
    error_handling: data.error_handling || 'continue',
    retry_attempts: data.retry_attempts || 3,
    retry_delay: data.retry_delay || 1000
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

  const addCondition = () => {
    updateConfig({
      conditions: [...config.conditions, { 
        variable: '', 
        operator: 'equals', 
        value: '', 
        type: 'string' 
      }]
    });
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const updated = [...config.conditions];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ conditions: updated });
  };

  const removeCondition = (index: number) => {
    updateConfig({
      conditions: config.conditions.filter((_, i) => i !== index)
    });
  };

  const addVariable = (type: 'input' | 'output') => {
    const field = type === 'input' ? 'input_variables' : 'output_variables';
    updateConfig({
      [field]: [...config[field], { name: '', type: 'string', description: '', required: false }]
    });
  };

  const updateVariable = (type: 'input' | 'output', index: number, field: string, value: any) => {
    const configField = type === 'input' ? 'input_variables' : 'output_variables';
    const updated = [...config[configField]];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ [configField]: updated });
  };

  const removeVariable = (type: 'input' | 'output', index: number) => {
    const field = type === 'input' ? 'input_variables' : 'output_variables';
    updateConfig({
      [field]: config[field].filter((_, i) => i !== index)
    });
  };

  const addDecisionCriteria = () => {
    updateConfig({
      decision_criteria: [...config.decision_criteria, { 
        name: '', 
        condition: '', 
        next_node: '', 
        priority: 1 
      }]
    });
  };

  const updateDecisionCriteria = (index: number, field: string, value: any) => {
    const updated = [...config.decision_criteria];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ decision_criteria: updated });
  };

  const removeDecisionCriteria = (index: number) => {
    updateConfig({
      decision_criteria: config.decision_criteria.filter((_, i) => i !== index)
    });
  };

  const getFlowIcon = () => {
    switch (config.flow_type) {
      case 'condition': return GitBranch;
      case 'iteration': return RotateCw;
      case 'start': return PlayCircle;
      case 'stop': return StopCircle;
      default: return GitBranch;
    }
  };

  const FlowIcon = getFlowIcon();

  const flowTypes = [
    { value: 'condition', label: 'Condition Flow' },
    { value: 'iteration', label: 'Iteration Flow' },
    { value: 'start', label: 'Start Flow' },
    { value: 'decision', label: 'Decision Flow' },
    { value: 'loop', label: 'Loop Flow' },
    { value: 'human_input', label: 'Human Input Flow' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  const variableTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
  ];

  const stateOperations = [
    { value: 'set', label: 'Set Value' },
    { value: 'append', label: 'Append' },
    { value: 'increment', label: 'Increment' },
    { value: 'decrement', label: 'Decrement' },
    { value: 'merge', label: 'Merge Object' }
  ];

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={FlowIcon}
      title={`${data.display_name || 'Flow Control'} - ${config.flow_type}`}
    >
      <div className="text-xs text-muted-foreground mb-2">
        <Badge variant="secondary" className="mr-1">
          {config.flow_type}
        </Badge>
        {config.conditions.length > 0 && (
          <Badge variant="outline" className="mr-1">{config.conditions.length} Conditions</Badge>
        )}
        {config.input_variables.length > 0 && (
          <Badge variant="outline">{config.input_variables.length} Variables</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Flow Type Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Flow Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={config.flow_type} onValueChange={(value) => updateConfig({ flow_type: value })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flowTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Conditions */}
          {(config.flow_type === 'condition' || config.flow_type === 'decision') && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Conditions
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addCondition}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.conditions.length > 1 && (
                  <div>
                    <Label className="text-xs">Logical Operator</Label>
                    <Select value={config.logical_operator} onValueChange={(value) => updateConfig({ logical_operator: value })}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.conditions.map((condition, index) => (
                  <div key={index} className="border rounded p-2 space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        className="h-8 flex-1"
                        value={condition.variable}
                        onChange={(e) => updateCondition(index, 'variable', e.target.value)}
                        placeholder="Variable name"
                      />
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, 'operator', value)}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCondition(index)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        className="h-8 flex-1"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Comparison value"
                      />
                      <Select
                        value={condition.type}
                        onValueChange={(value) => updateCondition(index, 'type', value)}
                      >
                        <SelectTrigger className="h-8 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {variableTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Flow State Management */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Flow State Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">State Key</Label>
                  <Input
                    className="h-8"
                    value={config.flow_state_key}
                    onChange={(e) => updateConfig({ flow_state_key: e.target.value })}
                    placeholder="state_key"
                  />
                </div>
                <div>
                  <Label className="text-xs">Operation</Label>
                  <Select value={config.state_operation} onValueChange={(value) => updateConfig({ state_operation: value })}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOperations.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">State Value</Label>
                <Textarea
                  className="min-h-16 text-xs"
                  value={config.flow_state_value}
                  onChange={(e) => updateConfig({ flow_state_value: e.target.value })}
                  placeholder="Value to set/append/merge..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Input Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Input Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addVariable('input')}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.input_variables.map((variable, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={variable.name}
                      onChange={(e) => updateVariable('input', index, 'name', e.target.value)}
                      placeholder="Variable name"
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) => updateVariable('input', index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={variable.required}
                        onCheckedChange={(checked) => updateVariable('input', index, 'required', checked)}
                      />
                      <Label className="text-xs">Required</Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable('input', index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={variable.description}
                    onChange={(e) => updateVariable('input', index, 'description', e.target.value)}
                    placeholder="Variable description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Output Variables */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Output Variables
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addVariable('output')}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.output_variables.map((variable, index) => (
                <div key={index} className="border rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      className="h-8 flex-1"
                      value={variable.name}
                      onChange={(e) => updateVariable('output', index, 'name', e.target.value)}
                      placeholder="Variable name"
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) => updateVariable('output', index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariable('output', index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    className="h-8"
                    value={variable.description}
                    onChange={(e) => updateVariable('output', index, 'description', e.target.value)}
                    placeholder="Variable description"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Iteration Settings */}
          {config.flow_type === 'iteration' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Iteration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Max Iterations</Label>
                    <Input
                      type="number"
                      className="h-8"
                      value={config.max_iterations}
                      onChange={(e) => updateConfig({ max_iterations: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Iteration Type</Label>
                    <Select value={config.iteration_type} onValueChange={(value) => updateConfig({ iteration_type: value })}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for_each">For Each</SelectItem>
                        <SelectItem value="while">While</SelectItem>
                        <SelectItem value="until">Until</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Iteration Condition</Label>
                  <Textarea
                    className="min-h-16 text-xs"
                    value={config.iteration_condition}
                    onChange={(e) => updateConfig({ iteration_condition: e.target.value })}
                    placeholder="Condition to continue iteration..."
                  />
                </div>

                <div>
                  <Label className="text-xs">Break Condition</Label>
                  <Textarea
                    className="min-h-16 text-xs"
                    value={config.break_condition}
                    onChange={(e) => updateConfig({ break_condition: e.target.value })}
                    placeholder="Condition to break out of iteration..."
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </BaseWorkflowNode>
  );
};