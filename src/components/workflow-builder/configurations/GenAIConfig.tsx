import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Bot, Brain, Zap, Plus, Trash2, Settings } from 'lucide-react';

interface GenAIConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const GenAIConfig: React.FC<GenAIConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderAnthropicAgent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-500" />
          Anthropic Claude Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="claudeModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Claude Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Claude model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="claude-opus-4-20250514">🟣 Claude 4 Opus (Most Capable)</SelectItem>
                  <SelectItem value="claude-sonnet-4-20250514">🟣 Claude 4 Sonnet (High Performance)</SelectItem>
                  <SelectItem value="claude-3-5-haiku-20241022">🟣 Claude 3.5 Haiku (Fastest)</SelectItem>
                  <SelectItem value="claude-3-7-sonnet-20250219">🟣 Claude 3.7 Sonnet (Extended Thinking)</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022">🟣 Claude 3.5 Sonnet (Previous)</SelectItem>
                  <SelectItem value="claude-3-opus-20240229">🟣 Claude 3 Opus (Legacy)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="sk-ant-..." {...field} />
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
                <FormLabel>Temperature: {field.value || 0.7}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0.7]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </FormControl>
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
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enableVision"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Vision</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streamResponse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Stream Response</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableThinking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Thinking</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderOpenAIAgent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-500" />
          OpenAI GPT Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="gptModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPT Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GPT model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gpt-4o">🚀 GPT-4o (Multimodal)</SelectItem>
                  <SelectItem value="gpt-4o-mini">⚡ GPT-4o Mini (Fast & Efficient)</SelectItem>
                  <SelectItem value="gpt-4-turbo">🧠 GPT-4 Turbo (Advanced)</SelectItem>
                  <SelectItem value="gpt-4">🎯 GPT-4 (Standard)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">💨 GPT-3.5 Turbo (Fast)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo-16k">📚 GPT-3.5 Turbo 16K (Long Context)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="sk-..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
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
                <FormLabel>Temperature: {field.value || 0.7}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0.7]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={2}
                    min={0}
                    step={0.1}
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
                    value={[field.value || 1]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="baseURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://api.openai.com/v1" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableFunctions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Function Calling</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableVision"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Vision (GPT-4V)</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Function Definitions */}
        {configuration.enableFunctions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Function Definitions</FormLabel>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => {
                  const functions = configuration.functions || [];
                  onChange({ 
                    ...configuration, 
                    functions: [...functions, { name: '', description: '', parameters: '{}' }] 
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Function
              </Button>
            </div>
            
            {(configuration.functions || []).map((func: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={func.name || ''}
                    onChange={(e) => {
                      const functions = [...(configuration.functions || [])];
                      functions[index] = { ...functions[index], name: e.target.value };
                      onChange({ ...configuration, functions });
                    }}
                    placeholder="Function name"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const functions = [...(configuration.functions || [])];
                      functions.splice(index, 1);
                      onChange({ ...configuration, functions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={func.description || ''}
                  onChange={(e) => {
                    const functions = [...(configuration.functions || [])];
                    functions[index] = { ...functions[index], description: e.target.value };
                    onChange({ ...configuration, functions });
                  }}
                  placeholder="Function description"
                />
                <Textarea
                  value={func.parameters || '{}'}
                  onChange={(e) => {
                    const functions = [...(configuration.functions || [])];
                    functions[index] = { ...functions[index], parameters: e.target.value };
                    onChange({ ...configuration, functions });
                  }}
                  placeholder='{"type": "object", "properties": {...}}'
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderLLMChain = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          LLM Chain Configuration
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
                  <SelectItem value="simple">Simple Chain</SelectItem>
                  <SelectItem value="sequential">Sequential Chain</SelectItem>
                  <SelectItem value="transform">Transform Chain</SelectItem>
                  <SelectItem value="conditional">Conditional Chain</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llmProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LLM Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LLM provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="azure">Azure OpenAI</SelectItem>
                  <SelectItem value="google">Google Vertex AI</SelectItem>
                  <SelectItem value="huggingface">Hugging Face</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Template *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt template with variables like {variable_name}"
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
            name="verbose"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Verbose Logging</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderGenericModel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter model name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter API key" {...field} />
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
                <FormLabel>Temperature: {field.value || 0.7}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0.7]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </FormControl>
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
                  placeholder="System instructions for the model..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'anthropic_agent':
      return renderAnthropicAgent();
    case 'openai_agent':
      return renderOpenAIAgent();
    case 'llm_chain':
      return renderLLMChain();
    case 'deepseek_agent':
    case 'react_agent_llm':
    case 'xml_agent':
    default:
      return renderGenericModel();
  }
};