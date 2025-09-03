import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Bot, Database, MessageCircle, Search, Globe, Zap, Mail, Calculator, FileText, Code, Settings, Clock, PenTool, Image, Volume2, Webhook, Filter, BarChart3, FileCheck, Users, Shield, AlertTriangle } from 'lucide-react';

interface CategoryConfigProps {
  category: string;
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const CategorySpecificConfigurations: React.FC<CategoryConfigProps> = ({
  category,
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderAIAgentsConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || configuration.provider}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ChatAnthropic">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          ChatAnthropic
                        </div>
                      </SelectItem>
                      <SelectItem value="ChatOpenAI">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          ChatOpenAI
                        </div>
                      </SelectItem>
                      <SelectItem value="ChatGoogleGenerativeAI">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Google Gemini
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="claude-opus-4-0">Claude Opus 4.0</SelectItem>
                      <SelectItem value="claude-sonnet-4-0">Claude Sonnet 4.0</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="You are a helpful AI assistant..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Define the AI's role and behavior</FormDescription>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature: {field.value || 0.7}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[field.value || 0.7]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="4000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top P: {field.value || 1}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[field.value || 1]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataProcessingConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Processing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="inputFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="transformationRules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transformation Rules</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Define data transformation rules..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-4">
            <FormField
              control={form.control}
              name="validateInput"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Validate Input</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableCaching"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Enable Caching</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChannelsConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Channel Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="channelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="web-chat">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Web Chat
                      </div>
                    </SelectItem>
                    <SelectItem value="voice-call">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Voice Call
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="webhook">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4" />
                        Webhook
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {configuration.channelType === 'voice-call' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Voice Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="voiceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="openai">OpenAI TTS</SelectItem>
                          <SelectItem value="azure">Azure Speech</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voiceModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy</SelectItem>
                          <SelectItem value="echo">Echo</SelectItem>
                          <SelectItem value="fable">Fable</SelectItem>
                          <SelectItem value="onyx">Onyx</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="speechSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speech Speed: {field.value || 1}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0.25}
                          max={4.0}
                          step={0.25}
                          value={[field.value || 1]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speechPitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speech Pitch: {field.value || 1}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          value={[field.value || 1]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {configuration.channelType === 'webhook' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Webhook Settings</h4>
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com/webhook" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="webhookMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderLogicFlowConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Logic & Flow Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="logicType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logic Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select logic type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="condition">Conditional Logic</SelectItem>
                    <SelectItem value="loop">Loop Logic</SelectItem>
                    <SelectItem value="branch">Branch Logic</SelectItem>
                    <SelectItem value="switch">Switch Logic</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {configuration.logicType === 'condition' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Conditional Rules</h4>
              {(configuration.conditions || []).map((condition: any, index: number) => (
                <div key={index} className="space-y-2 p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Condition {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newConditions = (configuration.conditions || []).filter((_: any, i: number) => i !== index);
                        onChange({ ...configuration, conditions: newConditions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Field"
                      value={condition.field || ''}
                      onChange={(e) => {
                        const newConditions = [...(configuration.conditions || [])];
                        newConditions[index] = { ...newConditions[index], field: e.target.value };
                        onChange({ ...configuration, conditions: newConditions });
                      }}
                    />
                    <Select
                      value={condition.operator || ''}
                      onValueChange={(value) => {
                        const newConditions = [...(configuration.conditions || [])];
                        newConditions[index] = { ...newConditions[index], operator: value };
                        onChange({ ...configuration, conditions: newConditions });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
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
                      placeholder="Value"
                      value={condition.value || ''}
                      onChange={(e) => {
                        const newConditions = [...(configuration.conditions || [])];
                        newConditions[index] = { ...newConditions[index], value: e.target.value };
                        onChange({ ...configuration, conditions: newConditions });
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => {
                  const newConditions = [...(configuration.conditions || []), { field: '', operator: '', value: '' }];
                  onChange({ ...configuration, conditions: newConditions });
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          )}

          {configuration.logicType === 'loop' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Loop Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="loopType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loop Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="for">For Loop</SelectItem>
                          <SelectItem value="while">While Loop</SelectItem>
                          <SelectItem value="foreach">For Each</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxIterations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Iterations</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Monitoring Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="trackingEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Enable Tracking</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metricsCollection"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Collect Metrics</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customMetrics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Metrics</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Define custom metrics to track..."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderHumanHandoffConfiguration = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Human Handoff Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="handoffTrigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handoff Trigger</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual Request</SelectItem>
                      <SelectItem value="confidence">Low Confidence</SelectItem>
                      <SelectItem value="error">Error Occurred</SelectItem>
                      <SelectItem value="escalation">Escalation Required</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="handoffQueue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handoff Queue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select queue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Support</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="escalation">Escalation Team</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="handoffMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handoff Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Message to display during handoff..."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-4">
            <FormField
              control={form.control}
              name="preserveContext"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Preserve Context</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifyAgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Notify Agent</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render logic based on category
  switch (category) {
    case 'AI Agents':
    case 'ai-agents':
      return renderAIAgentsConfiguration();
    
    case 'Data Processing':
    case 'data-processing':
      return renderDataProcessingConfiguration();
    
    case 'Channels':
    case 'channels':
      return renderChannelsConfiguration();
    
    case 'Logic & Flow':
    case 'logic-flow':
      return renderLogicFlowConfiguration();
    
    case 'Analytics':
    case 'analytics':
      return renderAnalyticsConfiguration();
    
    case 'Human Handoff':
    case 'human-handoff':
      return renderHumanHandoffConfiguration();
    
    default:
      return (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Category Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configuration for {category} category is being prepared
          </p>
        </div>
      );
  }
};