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
          
          {/* Condition Agent Configuration */}
          {nodeType === 'condition' && (
            <>
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ChatAnthropic">ChatAnthropic</SelectItem>
                        <SelectItem value="ChatOpenAI">ChatOpenAI</SelectItem>
                        <SelectItem value="ChatGoogleGenerativeAI">ChatGoogleGenerativeAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Determine if the user is interested in learning about AI"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="{{question}}"
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Scenarios *</FormLabel>
                {(configuration.scenarios || []).map((scenario: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Scenario {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newScenarios = (configuration.scenarios || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, scenarios: newScenarios });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <FormLabel>Scenario *</FormLabel>
                      <Input
                        placeholder="User is asking for a pizza"
                        value={scenario.text || ''}
                        onChange={(e) => {
                          const newScenarios = [...(configuration.scenarios || [])];
                          newScenarios[index] = { ...newScenarios[index], text: e.target.value };
                          onChange({ ...configuration, scenarios: newScenarios });
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newScenarios = [...(configuration.scenarios || []), { text: '' }];
                    onChange({ ...configuration, scenarios: newScenarios });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scenarios
                </Button>
              </div>

              <FormField
                control={form.control}
                name="overrideSystemPrompt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Override System Prompt</FormLabel>
                      <FormDescription>
                        Override the default system prompt
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Custom Function Configuration */}
          {nodeType === 'customFunction' && (
            <>
              <div className="space-y-4">
                <FormLabel>Input Variables</FormLabel>
                {(configuration.inputVariables || []).map((variable: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Variable {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newVariables = (configuration.inputVariables || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, inputVariables: newVariables });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FormLabel>Variable Name *</FormLabel>
                        <Input
                          placeholder="variableName"
                          value={variable.name || ''}
                          onChange={(e) => {
                            const newVariables = [...(configuration.inputVariables || [])];
                            newVariables[index] = { ...newVariables[index], name: e.target.value };
                            onChange({ ...configuration, inputVariables: newVariables });
                          }}
                        />
                      </div>
                      <div>
                        <FormLabel>Variable Value *</FormLabel>
                        <Input
                          placeholder="{{value}}"
                          value={variable.value || ''}
                          onChange={(e) => {
                            const newVariables = [...(configuration.inputVariables || [])];
                            newVariables[index] = { ...newVariables[index], value: e.target.value };
                            onChange({ ...configuration, inputVariables: newVariables });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newVariables = [...(configuration.inputVariables || []), { name: '', value: '' }];
                    onChange({ ...configuration, inputVariables: newVariables });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Input Variables
                </Button>
              </div>

              <FormField
                control={form.control}
                name="javascriptFunction"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Javascript Function *</FormLabel>
                      <Button variant="outline" size="sm">
                        See Example
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="// Your JavaScript code here"
                        className="min-h-[200px] font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Update Flow State</FormLabel>
                {(configuration.updateFlowState || []).map((state: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 border rounded">
                    <div>
                      <FormLabel>Key *</FormLabel>
                      <Input
                        placeholder="key"
                        value={state.key || ''}
                        onChange={(e) => {
                          const newStates = [...(configuration.updateFlowState || [])];
                          newStates[index] = { ...newStates[index], key: e.target.value };
                          onChange({ ...configuration, updateFlowState: newStates });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormLabel>Value *</FormLabel>
                        <Input
                          placeholder="{{value}}"
                          value={state.value || ''}
                          onChange={(e) => {
                            const newStates = [...(configuration.updateFlowState || [])];
                            newStates[index] = { ...newStates[index], value: e.target.value };
                            onChange({ ...configuration, updateFlowState: newStates });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-6"
                        onClick={() => {
                          const newStates = (configuration.updateFlowState || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, updateFlowState: newStates });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newStates = [...(configuration.updateFlowState || []), { key: '', value: '' }];
                    onChange({ ...configuration, updateFlowState: newStates });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Update Flow State
                </Button>
              </div>
            </>
          )}

          {/* Execute Flow Configuration */}
          {nodeType === 'executeFlow' && (
            <>
              <FormField
                control={form.control}
                name="connectCredential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connect Credential</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectFlow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Flow *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flow to execute" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flow1">Flow 1</SelectItem>
                        <SelectItem value="flow2">Flow 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter input data"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button variant="outline" className="w-full">
                Override Config
              </Button>

              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="http://localhost:3000"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnResponseAs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Response As *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select response format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Update Flow State</FormLabel>
                {(configuration.updateFlowState || []).map((state: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 border rounded">
                    <div>
                      <FormLabel>Key *</FormLabel>
                      <Input
                        placeholder="key"
                        value={state.key || ''}
                        onChange={(e) => {
                          const newStates = [...(configuration.updateFlowState || [])];
                          newStates[index] = { ...newStates[index], key: e.target.value };
                          onChange({ ...configuration, updateFlowState: newStates });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormLabel>Value *</FormLabel>
                        <Input
                          placeholder="{{value}}"
                          value={state.value || ''}
                          onChange={(e) => {
                            const newStates = [...(configuration.updateFlowState || [])];
                            newStates[index] = { ...newStates[index], value: e.target.value };
                            onChange({ ...configuration, updateFlowState: newStates });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-6"
                        onClick={() => {
                          const newStates = (configuration.updateFlowState || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, updateFlowState: newStates });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newStates = [...(configuration.updateFlowState || []), { key: '', value: '' }];
                    onChange({ ...configuration, updateFlowState: newStates });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Update Flow State
                </Button>
              </div>
            </>
          )}

          {/* Direct Reply Configuration */}
          {nodeType === 'directReply' && (
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your direct reply message"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {/* Human Input Configuration */}
          {nodeType === 'humanInput' && (
            <FormField
              control={form.control}
              name="descriptionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select description type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">
                        <div className="space-y-1">
                          <div className="font-medium">Fixed</div>
                          <div className="text-sm text-muted-foreground">Specify a fixed description</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="dynamic">
                        <div className="space-y-1">
                          <div className="font-medium">Dynamic</div>
                          <div className="text-sm text-muted-foreground">Use LLM to generate a description</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}

          {/* HTTP Configuration */}
          {nodeType === 'http' && (
            <>
              <FormField
                control={form.control}
                name="httpCredential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTTP Credential</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select credential" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">HTTP Basic Auth</SelectItem>
                          <SelectItem value="bearer">HTTP Bearer Token</SelectItem>
                          <SelectItem value="apikey">HTTP Api Key</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        + Add
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select HTTP method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.example.com/endpoint"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Headers</FormLabel>
                {(configuration.headers || []).map((header: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 border rounded">
                    <div>
                      <FormLabel>Key *</FormLabel>
                      <Input
                        placeholder="Content-Type"
                        value={header.key || ''}
                        onChange={(e) => {
                          const newHeaders = [...(configuration.headers || [])];
                          newHeaders[index] = { ...newHeaders[index], key: e.target.value };
                          onChange({ ...configuration, headers: newHeaders });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormLabel>Value *</FormLabel>
                        <Input
                          placeholder="application/json"
                          value={header.value || ''}
                          onChange={(e) => {
                            const newHeaders = [...(configuration.headers || [])];
                            newHeaders[index] = { ...newHeaders[index], value: e.target.value };
                            onChange({ ...configuration, headers: newHeaders });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-6"
                        onClick={() => {
                          const newHeaders = (configuration.headers || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, headers: newHeaders });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newHeaders = [...(configuration.headers || []), { key: '', value: '' }];
                    onChange({ ...configuration, headers: newHeaders });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Headers
                </Button>
              </div>

              <div className="space-y-4">
                <FormLabel>Query Params</FormLabel>
                {(configuration.queryParams || []).map((param: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 border rounded">
                    <div>
                      <FormLabel>Key *</FormLabel>
                      <Input
                        placeholder="param"
                        value={param.key || ''}
                        onChange={(e) => {
                          const newParams = [...(configuration.queryParams || [])];
                          newParams[index] = { ...newParams[index], key: e.target.value };
                          onChange({ ...configuration, queryParams: newParams });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormLabel>Value *</FormLabel>
                        <Input
                          placeholder="value"
                          value={param.value || ''}
                          onChange={(e) => {
                            const newParams = [...(configuration.queryParams || [])];
                            newParams[index] = { ...newParams[index], value: e.target.value };
                            onChange({ ...configuration, queryParams: newParams });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-6"
                        onClick={() => {
                          const newParams = (configuration.queryParams || []).filter((_: any, i: number) => i !== index);
                          onChange({ ...configuration, queryParams: newParams });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newParams = [...(configuration.queryParams || []), { key: '', value: '' }];
                    onChange({ ...configuration, queryParams: newParams });
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Query Params
                </Button>
              </div>

              <FormField
                control={form.control}
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Array Buffer">Array Buffer</SelectItem>
                        <SelectItem value="Raw (Base64)">Raw (Base64)</SelectItem>
                        <SelectItem value="x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select response type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Array Buffer">Array Buffer</SelectItem>
                        <SelectItem value="Raw (Base64)">Raw (Base64)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Generic logic type for other nodes */}
          {!['condition', 'customFunction', 'executeFlow', 'directReply', 'humanInput', 'http'].includes(nodeType) && (
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

  // Main render logic based on category and node type
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
    case 'condition':
    case 'customFunction':
    case 'executeFlow':
    case 'directReply':
    case 'humanInput':
    case 'http':
      return renderLogicFlowConfiguration();
    
    case 'Analytics':
    case 'analytics':
      return renderAnalyticsConfiguration();
    
    case 'Human Handoff':
    case 'human-handoff':
      return renderHumanHandoffConfiguration();
    
    default:
      // Check for specific node types that need custom configuration
      if (['condition', 'customFunction', 'executeFlow', 'directReply', 'humanInput', 'http'].includes(nodeType)) {
        return renderLogicFlowConfiguration();
      }
      
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