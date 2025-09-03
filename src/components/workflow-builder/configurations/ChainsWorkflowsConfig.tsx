import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Link, GitBranch, Workflow, Repeat, Database, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ChainsWorkflowsConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const ChainsWorkflowsConfig: React.FC<ChainsWorkflowsConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderCommonConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Flow State & Memory Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableFlowState"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Flow State</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Memory</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableMemory && (
          <FormField
            control={form.control}
            name="memoryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memory Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'workflow'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="workflow">🔄 Workflow Memory</SelectItem>
                    <SelectItem value="chain">⛓️ Chain Memory</SelectItem>
                    <SelectItem value="step">📝 Step Memory</SelectItem>
                    <SelectItem value="global">🌐 Global Memory</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableJsonOutput"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>JSON Structured Output</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addKnowledge"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Add Knowledge Base</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableJsonOutput && (
          <FormField
            control={form.control}
            name="jsonSchema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JSON Output Schema</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"type": "object", "properties": {"workflow_result": {"type": "object"}, "step_outputs": {"type": "array"}, "execution_time": {"type": "number"}}}'
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderSequentialChain = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-green-500" />
          Sequential Chain Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="chainType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="simple">🔗 Simple Sequential</SelectItem>
                  <SelectItem value="transform">🔄 Transform Chain</SelectItem>
                  <SelectItem value="router">🚦 Router Chain</SelectItem>
                  <SelectItem value="conversation">💬 Conversation Chain</SelectItem>
                  <SelectItem value="retrieval">🔍 Retrieval Chain</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Chain</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormLabel>Chain Steps</FormLabel>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => {
              const steps = configuration.chainSteps || [];
              onChange({ 
                ...configuration, 
                chainSteps: [...steps, { name: '', type: 'llm', config: {} }] 
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
        
        {(configuration.chainSteps || []).map((step: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const steps = [...(configuration.chainSteps || [])];
                  steps.splice(index, 1);
                  onChange({ ...configuration, chainSteps: steps });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={step.name || ''}
                onChange={(e) => {
                  const steps = [...(configuration.chainSteps || [])];
                  steps[index] = { ...steps[index], name: e.target.value };
                  onChange({ ...configuration, chainSteps: steps });
                }}
                placeholder="Step name"
              />
              <Select
                value={step.type || 'llm'}
                onValueChange={(value) => {
                  const steps = [...(configuration.chainSteps || [])];
                  steps[index] = { ...steps[index], type: value };
                  onChange({ ...configuration, chainSteps: steps });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llm">🤖 LLM</SelectItem>
                  <SelectItem value="tool">🔧 Tool</SelectItem>
                  <SelectItem value="retrieval">🔍 Retrieval</SelectItem>
                  <SelectItem value="transform">🔄 Transform</SelectItem>
                  <SelectItem value="condition">❓ Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={JSON.stringify(step.config || {}, null, 2)}
              onChange={(e) => {
                const steps = [...(configuration.chainSteps || [])];
                try {
                  steps[index] = { ...steps[index], config: JSON.parse(e.target.value) };
                } catch {
                  // Keep previous config if parsing fails
                }
                onChange({ ...configuration, chainSteps: steps });
              }}
              placeholder='{"prompt": "Your prompt here", "model": "gpt-4"}'
              rows={3}
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableErrorHandling"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Error Handling</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableRetry"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Retry Failed Steps</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableRetry && (
          <FormField
            control={form.control}
            name="maxRetries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Retry Attempts</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const renderParallelWorkflow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-500" />
          Parallel Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="workflowType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="parallel">⚡ Full Parallel</SelectItem>
                  <SelectItem value="pipeline">🔄 Pipeline</SelectItem>
                  <SelectItem value="dag">📊 Directed Acyclic Graph</SelectItem>
                  <SelectItem value="fan-out">📤 Fan-out</SelectItem>
                  <SelectItem value="fan-in">📥 Fan-in</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concurrencyLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concurrency Limit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aggregationStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Result Aggregation Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'collect'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="collect">📥 Collect All</SelectItem>
                  <SelectItem value="merge">🔗 Merge Objects</SelectItem>
                  <SelectItem value="first">🥇 First Result</SelectItem>
                  <SelectItem value="best">⭐ Best Score</SelectItem>
                  <SelectItem value="custom">⚙️ Custom Logic</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.aggregationStrategy === 'custom' && (
          <FormField
            control={form.control}
            name="customAggregation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Aggregation Logic</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="// JavaScript function to aggregate results\nfunction aggregate(results) {\n  return results.reduce((acc, curr) => acc + curr.score, 0) / results.length;\n}"
                    rows={4}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableProgressTracking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Progress Tracking</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="failFast"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Fail Fast</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderConditionalWorkflow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-purple-500" />
          Conditional Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Conditional Rules</FormLabel>
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => {
              const rules = configuration.conditionalRules || [];
              onChange({ 
                ...configuration, 
                conditionalRules: [...rules, { condition: '', action: '', target: '' }] 
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
        
        {(configuration.conditionalRules || []).map((rule: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rule {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const rules = [...(configuration.conditionalRules || [])];
                  rules.splice(index, 1);
                  onChange({ ...configuration, conditionalRules: rules });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                value={rule.condition || ''}
                onChange={(e) => {
                  const rules = [...(configuration.conditionalRules || [])];
                  rules[index] = { ...rules[index], condition: e.target.value };
                  onChange({ ...configuration, conditionalRules: rules });
                }}
                placeholder="Condition (e.g., score > 0.8)"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={rule.action || 'continue'}
                  onValueChange={(value) => {
                    const rules = [...(configuration.conditionalRules || [])];
                    rules[index] = { ...rules[index], action: value };
                    onChange({ ...configuration, conditionalRules: rules });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continue">➡️ Continue</SelectItem>
                    <SelectItem value="skip">⏭️ Skip</SelectItem>
                    <SelectItem value="retry">🔄 Retry</SelectItem>
                    <SelectItem value="branch">🌿 Branch</SelectItem>
                    <SelectItem value="stop">⛔ Stop</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={rule.target || ''}
                  onChange={(e) => {
                    const rules = [...(configuration.conditionalRules || [])];
                    rules[index] = { ...rules[index], target: e.target.value };
                    onChange({ ...configuration, conditionalRules: rules });
                  }}
                  placeholder="Target step/branch"
                />
              </div>
            </div>
          </div>
        ))}

        <FormField
          control={form.control}
          name="defaultAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Action</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'continue'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="continue">➡️ Continue</SelectItem>
                  <SelectItem value="stop">⛔ Stop</SelectItem>
                  <SelectItem value="error">❌ Throw Error</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderLoopWorkflow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-orange-500" />
          Loop Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="loopType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loop Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loop type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="for">🔢 For Loop</SelectItem>
                  <SelectItem value="while">⚡ While Loop</SelectItem>
                  <SelectItem value="foreach">📋 For Each</SelectItem>
                  <SelectItem value="until">🎯 Until</SelectItem>
                  <SelectItem value="recursive">🔄 Recursive</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {(configuration.loopType === 'for' || configuration.loopType === 'while') && (
          <FormField
            control={form.control}
            name="maxIterations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Iterations</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.loopType === 'while' || configuration.loopType === 'until' && (
          <FormField
            control={form.control}
            name="exitCondition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exit Condition</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="condition_variable == target_value"
                    rows={2}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.loopType === 'foreach' && (
          <FormField
            control={form.control}
            name="iterationSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Iteration Source</FormLabel>
                <FormControl>
                  <Input placeholder="array_variable_name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableBreakCondition"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Early Break</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableContinueCondition"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Skip Iterations</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {configuration.enableBreakCondition && (
          <FormField
            control={form.control}
            name="breakCondition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Condition</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="error_count > 5"
                    rows={2}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );

  const getConfigurationForNodeType = () => {
    switch (nodeType) {
      case 'sequential_chain':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderSequentialChain()}
          </div>
        );
      case 'parallel_workflow':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderParallelWorkflow()}
          </div>
        );
      case 'conditional_workflow':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderConditionalWorkflow()}
          </div>
        );
      case 'loop_workflow':
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderLoopWorkflow()}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {renderCommonConfig()}
            {renderSequentialChain()}
            {renderParallelWorkflow()}
            {renderConditionalWorkflow()}
            {renderLoopWorkflow()}
          </div>
        );
    }
  };

  return getConfigurationForNodeType();
};
