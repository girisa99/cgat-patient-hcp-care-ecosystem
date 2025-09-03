import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DynamicConfigurationFormProps {
  nodeType: string;
  configAction: string;
  configuration: any;
  onChange: (config: any) => void;
}

export const DynamicConfigurationForm: React.FC<DynamicConfigurationFormProps> = ({
  nodeType,
  configAction,
  configuration,
  onChange,
}) => {
  const getFormSchema = () => {
    switch (`${nodeType}-${configAction}`) {
      case 'start-basic':
      case 'Start-basic':
        return z.object({
          inputType: z.enum(['chat', 'form', 'api', 'webhook']),
          ephemeralMemory: z.boolean().optional(),
          persistState: z.boolean().optional(),
          flowState: z.array(z.object({
            key: z.string().min(1),
            value: z.string()
          })).optional(),
        });

      case 'agent-ai-model':
        return z.object({
          model: z.string().min(1, 'Model is required'),
          temperature: z.number().min(0).max(2),
          maxTokens: z.number().min(1).max(8000),
          topP: z.number().min(0).max(1),
          frequencyPenalty: z.number().min(-2).max(2),
          presencePenalty: z.number().min(-2).max(2),
        });
      
      case 'agent-prompt':
        return z.object({
          systemPrompt: z.string().min(1, 'System prompt is required'),
          userPromptTemplate: z.string().min(1, 'User prompt template is required'),
          responseFormat: z.enum(['text', 'json', 'structured']),
          maxLength: z.number().min(1).max(2000),
        });
      
      case 'api-endpoint':
        return z.object({
          url: z.string().url('Valid URL is required'),
          method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
          timeout: z.number().min(1000).max(300000),
          retries: z.number().min(0).max(5),
        });
      
      case 'database-connection':
        return z.object({
          host: z.string().min(1, 'Host is required'),
          port: z.number().min(1).max(65535),
          database: z.string().min(1, 'Database name is required'),
          ssl: z.boolean(),
          poolSize: z.number().min(1).max(100),
        });
      
      default:
        return z.object({
          name: z.string().min(1, 'Name is required'),
          description: z.string().optional(),
          enabled: z.boolean(),
        });
    }
  };

  const schema = getFormSchema();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: configuration,
  });

  const onSubmit = (data: any) => {
    onChange(data);
  };

  const renderFormFields = () => {
    switch (`${nodeType}-${configAction}`) {
      case 'start-basic':
      case 'Start-basic':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Start Node Configuration</CardTitle>
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
                          <SelectItem value="chat">
                            <div className="space-y-1">
                              <div className="font-medium">Chat Input</div>
                              <div className="text-sm text-muted-foreground">Start the conversation with chat input</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="form">
                            <div className="space-y-1">
                              <div className="font-medium">Form Input</div>
                              <div className="text-sm text-muted-foreground">Start the workflow with form inputs</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="api">
                            <div className="space-y-1">
                              <div className="font-medium">API Input</div>
                              <div className="text-sm text-muted-foreground">Start with API endpoint trigger</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="webhook">
                            <div className="space-y-1">
                              <div className="font-medium">Webhook Input</div>
                              <div className="text-sm text-muted-foreground">Start with webhook trigger</div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ephemeralMemory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ephemeral Memory</FormLabel>
                        <FormDescription>
                          Enable temporary memory for this session
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

                <div className="space-y-2">
                  <FormLabel>Flow State</FormLabel>
                  <div className="space-y-2">
                    {(configuration.flowState || []).map((state: any, index: number) => (
                      <div key={index} className="flex gap-2 p-2 border rounded">
                        <Input
                          placeholder="Key"
                          value={state.key}
                          onChange={(e) => {
                            const newFlowState = [...(configuration.flowState || [])];
                            newFlowState[index] = { ...newFlowState[index], key: e.target.value };
                            onChange({ ...configuration, flowState: newFlowState });
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={state.value}
                          onChange={(e) => {
                            const newFlowState = [...(configuration.flowState || [])];
                            newFlowState[index] = { ...newFlowState[index], value: e.target.value };
                            onChange({ ...configuration, flowState: newFlowState });
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFlowState = (configuration.flowState || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, flowState: newFlowState });
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newFlowState = [...(configuration.flowState || []), { key: '', value: '' }];
                        onChange({ ...configuration, flowState: newFlowState });
                      }}
                      className="w-full"
                    >
                      + Add Flow State
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="persistState"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Persist State</FormLabel>
                        <FormDescription>
                          Save state across workflow sessions
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
              </CardContent>
            </Card>
          </div>
        );

      case 'agent-ai-model':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Controls randomness. Lower values are more focused.
                      </FormDescription>
                      <FormMessage />
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
                      <FormDescription>Maximum tokens in the response</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'agent-prompt':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <FormDescription>
                        The system prompt defines the AI's behavior and personality
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userPromptTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Prompt Template</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please help me with: {user_input}"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Template for user inputs. Use {'{variable}'} for dynamic content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select response format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="structured">Structured</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'api-endpoint':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com/endpoint" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeout"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Configuration name" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Enable this configuration
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
          </div>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderFormFields()}
      </form>
    </Form>
  );
};