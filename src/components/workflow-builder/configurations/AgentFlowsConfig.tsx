import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Play, GitBranch, RotateCw, Users, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface AgentFlowsConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const AgentFlowsConfig: React.FC<AgentFlowsConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderStartFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-green-500" />
          Start Flow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="triggerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="webhook">🔗 Webhook</SelectItem>
                  <SelectItem value="schedule">⏰ Schedule</SelectItem>
                  <SelectItem value="manual">👆 Manual</SelectItem>
                  <SelectItem value="event">📡 Event</SelectItem>
                  <SelectItem value="api-call">🌐 API Call</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flowName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flow Name *</FormLabel>
              <FormControl>
                <Input placeholder="Customer Support Flow" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this flow does..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {configuration.triggerType === 'schedule' && (
          <FormField
            control={form.control}
            name="cronExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cron Expression</FormLabel>
                <FormControl>
                  <Input placeholder="0 9 * * 1-5" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {configuration.triggerType === 'webhook' && (
          <FormField
            control={form.control}
            name="webhookPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Path</FormLabel>
                <FormControl>
                  <Input placeholder="/webhook/start-flow" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableLogging"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Logging</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retryOnFailure"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Retry on Failure</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Initial Variables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Initial Variables</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const variables = configuration.initialVariables || [];
                onChange({ 
                  ...configuration, 
                  initialVariables: [...variables, { name: '', value: '', type: 'string' }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variable
            </Button>
          </div>
          
          {(configuration.initialVariables || []).map((variable: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={variable.name || ''}
                  onChange={(e) => {
                    const variables = [...(configuration.initialVariables || [])];
                    variables[index] = { ...variables[index], name: e.target.value };
                    onChange({ ...configuration, initialVariables: variables });
                  }}
                  placeholder="Variable name"
                />
                <Input
                  value={variable.value || ''}
                  onChange={(e) => {
                    const variables = [...(configuration.initialVariables || [])];
                    variables[index] = { ...variables[index], value: e.target.value };
                    onChange({ ...configuration, initialVariables: variables });
                  }}
                  placeholder="Initial value"
                />
                <Select
                  value={variable.type || 'string'}
                  onValueChange={(value) => {
                    const variables = [...(configuration.initialVariables || [])];
                    variables[index] = { ...variables[index], type: value };
                    onChange({ ...configuration, initialVariables: variables });
                  }}
                >
                  <SelectTrigger className="w-28">
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
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const variables = [...(configuration.initialVariables || [])];
                    variables.splice(index, 1);
                    onChange({ ...configuration, initialVariables: variables });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderConditionFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-500" />
          Condition Flow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="conditionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="if-else">🔀 If-Else</SelectItem>
                  <SelectItem value="switch">🎛️ Switch/Case</SelectItem>
                  <SelectItem value="multiple">📊 Multiple Conditions</SelectItem>
                  <SelectItem value="expression">💭 Expression</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition Expression *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="user.age >= 18 && user.verified === true"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trueAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>True Action</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Action when true" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="continue">➡️ Continue Flow</SelectItem>
                    <SelectItem value="redirect">🔄 Redirect to Node</SelectItem>
                    <SelectItem value="stop">⏹️ Stop Flow</SelectItem>
                    <SelectItem value="branch">🌿 Branch to Subflow</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="falseAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>False Action</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Action when false" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="continue">➡️ Continue Flow</SelectItem>
                    <SelectItem value="redirect">🔄 Redirect to Node</SelectItem>
                    <SelectItem value="stop">⏹️ Stop Flow</SelectItem>
                    <SelectItem value="branch">🌿 Branch to Subflow</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableShortCircuit"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Short Circuit Evaluation</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strictComparison"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Strict Comparison</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderIterationFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="h-5 w-5 text-orange-500" />
          Iteration Flow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="iterationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Iteration Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select iteration type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="for-each">🔄 For Each</SelectItem>
                  <SelectItem value="while">♻️ While Loop</SelectItem>
                  <SelectItem value="do-while">🔁 Do-While</SelectItem>
                  <SelectItem value="counter">🔢 Counter Loop</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Source *</FormLabel>
              <FormControl>
                <Input placeholder="users, items, data.results" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iterationVariable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Iteration Variable</FormLabel>
              <FormControl>
                <Input placeholder="item, user, element" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {configuration.iterationType === 'counter' && (
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="startValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stepValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {(configuration.iterationType === 'while' || configuration.iterationType === 'do-while') && (
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loop Condition</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="index < items.length"
                    rows={2}
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
            name="maxIterations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Iterations</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batchSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Size</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="parallel"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Parallel Processing</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="breakOnError"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Break on Error</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collectResults"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Collect Results</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderHumanInputFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Human Input Flow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="inputType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Input Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select input type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="approval">✅ Approval/Rejection</SelectItem>
                  <SelectItem value="form">📝 Form Input</SelectItem>
                  <SelectItem value="selection">🎯 Multiple Choice</SelectItem>
                  <SelectItem value="text">✏️ Text Input</SelectItem>
                  <SelectItem value="file">📎 File Upload</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promptMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please review and approve the following request..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="any">👥 Any User</SelectItem>
                  <SelectItem value="role-admin">👑 Admin Role</SelectItem>
                  <SelectItem value="role-manager">👔 Manager Role</SelectItem>
                  <SelectItem value="role-user">👤 User Role</SelectItem>
                  <SelectItem value="specific">🎯 Specific User</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {configuration.assignedTo === 'specific' && (
          <FormField
            control={form.control}
            name="specificUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID/Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (hours)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="24" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'normal'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="normal">🟡 Normal</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sendNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Send Notification</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowDelegation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Allow Delegation</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderAgentFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-500" />
          Agent Flow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="agentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="conversational">💬 Conversational Agent</SelectItem>
                  <SelectItem value="task-executor">⚡ Task Executor</SelectItem>
                  <SelectItem value="data-processor">📊 Data Processor</SelectItem>
                  <SelectItem value="orchestrator">🎭 Flow Orchestrator</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gpt-4o">🤖 GPT-4o</SelectItem>
                  <SelectItem value="claude-4-opus">🟣 Claude 4 Opus</SelectItem>
                  <SelectItem value="gemini-pro">💎 Gemini Pro</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are a helpful AI assistant specialized in..."
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="4096" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="2" placeholder="0.7" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Memory</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableTools"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Tools</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streamingResponse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Streaming</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'start_flow':
      return renderStartFlow();
    case 'condition_flow':
      return renderConditionFlow();
    case 'iteration_flow':
      return renderIterationFlow();
    case 'human_input_flow':
      return renderHumanInputFlow();
    case 'agent_flow':
      return renderAgentFlow();
    default:
      return renderStartFlow(); // Default fallback
  }
};