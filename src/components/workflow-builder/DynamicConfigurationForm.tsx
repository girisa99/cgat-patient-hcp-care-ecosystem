import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, ChevronUp, Plus, Trash2, Settings, Bot, Database, Webhook, MessageCircle, Brain, Search, Calculator, Code, FileText, Globe, Clock, Zap, Mail, Sheet, Image, PenTool } from 'lucide-react';

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
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  // AI Provider configurations
  const aiProviders = [
    { 
      value: 'ChatAnthropic', 
      label: 'ChatAnthropic', 
      icon: Bot,
      models: [
        'claude-opus-4-0', 'claude-4.1-opus', 'claude-sonnet-4-0', 'claude-4-sonnet',
        'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest',
        'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'
      ]
    },
    { 
      value: 'AWS ChatBedrock', 
      label: 'AWS ChatBedrock', 
      icon: Database,
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'titan-text-express']
    },
    { 
      value: 'Azure ChatOpenAI', 
      label: 'Azure ChatOpenAI', 
      icon: Globe,
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-35-turbo']
    },
    { 
      value: 'ChatAlibabaTongyi', 
      label: 'ChatAlibabaTongyi', 
      icon: Brain,
      models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
    },
    { 
      value: 'ChatBaiduWenxin', 
      label: 'ChatBaiduWenxin', 
      icon: MessageCircle,
      models: ['ernie-bot', 'ernie-bot-turbo']
    },
    { 
      value: 'ChatCerebras', 
      label: 'ChatCerebras', 
      icon: Zap,
      models: ['llama3.1-8b', 'llama3.1-70b']
    },
    { 
      value: 'ChatCohere', 
      label: 'ChatCohere', 
      icon: Bot,
      models: ['command-r', 'command-r-plus']
    },
    { 
      value: 'ChatFireworks', 
      label: 'ChatFireworks', 
      icon: Zap,
      models: ['llama-v3p1-405b-instruct', 'llama-v3p1-70b-instruct']
    },
    { 
      value: 'ChatGoogleGenerativeAI', 
      label: 'ChatGoogleGenerativeAI', 
      icon: Search,
      models: ['gemini-1.5-pro', 'gemini-1.5-flash']
    },
    { 
      value: 'ChatGoogleVertexAI', 
      label: 'ChatGoogleVertexAI', 
      icon: Search,
      models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'text-bison']
    },
    { 
      value: 'ChatHuggingFace', 
      label: 'ChatHuggingFace', 
      icon: Bot,
      models: ['meta-llama/Llama-2-7b-chat-hf', 'microsoft/DialoGPT-medium']
    }
  ];

  // Tool configurations
  const availableTools = [
    { 
      value: 'Arxiv', 
      label: 'Arxiv', 
      icon: FileText, 
      description: 'Search academic papers',
      parameters: ['name', 'description', 'topKResults', 'maxQueryLength', 'maxContentLength', 'loadFullContent', 'continueOnFailure', 'useLegacyBuild']
    },
    { 
      value: 'BraveSearch API', 
      label: 'BraveSearch API', 
      icon: Search, 
      description: 'Web search using Brave',
      parameters: ['connectCredential', 'availableActions']
    },
    { 
      value: 'BraveSearch MCP', 
      label: 'BraveSearch MCP', 
      icon: Search, 
      description: 'Brave search MCP server',
      parameters: ['connectCredential', 'availableActions']
    },
    { 
      value: 'Tavily API', 
      label: 'Tavily API', 
      icon: Search, 
      description: 'Search and research',
      parameters: ['connectCredential', 'topic', 'searchDepth', 'chunksPerSource', 'maxResults', 'timeRange', 'days', 'includeAnswer', 'includeRawContent', 'includeImages', 'includeImageDescriptions', 'includeDomains', 'excludeDomains']
    },
    { 
      value: 'Google Sheets', 
      label: 'Google Sheets', 
      icon: Sheet, 
      description: 'Work with spreadsheets',
      parameters: ['connectCredential']
    },
    { 
      value: 'Calculator', 
      label: 'Calculator', 
      icon: Calculator, 
      description: 'Mathematical calculations',
      parameters: []
    },
    { 
      value: 'Code Interpreter by E2B', 
      label: 'Code Interpreter by E2B', 
      icon: Code, 
      description: 'Execute code safely',
      parameters: []
    },
    { 
      value: 'Composio', 
      label: 'Composio', 
      icon: PenTool, 
      description: 'Tool integration platform',
      parameters: []
    },
    { 
      value: 'CurrentDateTime', 
      label: 'CurrentDateTime', 
      icon: Clock, 
      description: 'Get current date and time',
      parameters: []
    },
    { 
      value: 'Custom Tool', 
      label: 'Custom Tool', 
      icon: Settings, 
      description: 'Create custom functionality',
      parameters: []
    },
    { 
      value: 'Gmail', 
      label: 'Gmail', 
      icon: Mail, 
      description: 'Send and manage emails',
      parameters: []
    },
    { 
      value: 'Google Custom Search', 
      label: 'Google Custom Search', 
      icon: Search, 
      description: 'Custom search engine',
      parameters: []
    }
  ];

  const getFormSchema = () => {
    // Flexible schema that accommodates all configuration types
    return z.object({
      // Basic fields
      name: z.string().optional(),
      description: z.string().optional(),
      enabled: z.boolean().optional(),
      
      // Start node fields
      inputType: z.enum(['chat', 'form', 'api', 'webhook']).optional(),
      ephemeralMemory: z.boolean().optional(),
      persistState: z.boolean().optional(),
      flowState: z.array(z.object({
        key: z.string().min(1),
        value: z.string()
      })).optional(),
      
      // AI Model fields
      provider: z.string().optional(),
      model: z.string().optional(),
      connectCredential: z.string().optional(),
      modelName: z.string().optional(),
      extendedThinking: z.boolean().optional(),
      budgetTokens: z.number().optional(),
      allowImageUploads: z.boolean().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).max(100000).optional(),
      topP: z.number().min(0).max(1).optional(),
      frequencyPenalty: z.number().min(-2).max(2).optional(),
      presencePenalty: z.number().min(-2).max(2).optional(),
      
      // Messages
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
      })).optional(),
      
      // Tools
      tools: z.array(z.object({
        name: z.string(),
        type: z.string(),
        parameters: z.record(z.any()).optional(),
        requiresHuman: z.boolean().optional()
      })).optional(),
      
      // Knowledge
      knowledgeDocumentStores: z.array(z.string()).optional(),
      knowledgeVectorEmbeddings: z.array(z.object({
        vectorStore: z.string(),
        embeddingModel: z.string(),
        knowledgeName: z.string(),
        description: z.string(),
        returnSourceDocuments: z.boolean().optional()
      })).optional(),
      enableMemory: z.boolean().optional(),
      memoryType: z.string().optional(),
      inputMessage: z.string().optional(),
      returnResponseAs: z.string().optional(),
      updateFlowState: z.boolean().optional(),
      
      // API fields
      url: z.string().optional(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
      timeout: z.number().min(1000).max(300000).optional(),
      retries: z.number().min(0).max(5).optional()
    });
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
    // Comprehensive configuration that works for all node types
    return (
      <div className="space-y-6">
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
          
          {/* AI Model Configuration */}
          {(nodeType === 'agent' || configAction === 'ai-model' || configuration.provider) && (
            <AccordionItem value="model">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Model Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Provider *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || configuration.provider}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {aiProviders.map((provider) => (
                                <SelectItem key={provider.value} value={provider.value}>
                                  <div className="flex items-center gap-2">
                                    <provider.icon className="h-4 w-4" />
                                    {provider.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {configuration.provider && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="provider-params">
                          <AccordionTrigger className="text-sm">
                            {configuration.provider} Parameters
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="connectCredential"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Connect Credential *</FormLabel>
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="modelName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Model Name *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60">
                                      {aiProviders.find(p => p.value === configuration.provider)?.models.map((model) => (
                                        <SelectItem key={model} value={model}>
                                          <div className="space-y-1">
                                            <div className="font-medium">{model}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {model.includes('opus') ? 'Most capable model for complex tasks' :
                                               model.includes('sonnet') ? 'Balanced performance and speed' :
                                               model.includes('haiku') ? 'Fastest model for simple tasks' :
                                               'High-performance model'}
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="extendedThinking"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm">Extended Thinking</FormLabel>
                                    <FormDescription className="text-xs">
                                      Enable deeper reasoning for complex problems
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

                            <FormField
                              control={form.control}
                              name="budgetTokens"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Budget Tokens</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="1024"
                                      value={field.value || ''}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Maximum tokens to use for this request
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="allowImageUploads"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm">Allow Image Uploads</FormLabel>
                                    <FormDescription className="text-xs">
                                      Enable image processing capabilities
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
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Messages Configuration */}
          <AccordionItem value="messages">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {(configuration.messages || []).map((message: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Message {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newMessages = (configuration.messages || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, messages: newMessages });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <FormLabel>Role *</FormLabel>
                        <Select 
                          value={message.role}
                          onValueChange={(value) => {
                            const newMessages = [...(configuration.messages || [])];
                            newMessages[index] = { ...newMessages[index], role: value };
                            onChange({ ...configuration, messages: newMessages });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <FormLabel>Content *</FormLabel>
                        <Textarea
                          placeholder="Enter message content..."
                          value={message.content}
                          onChange={(e) => {
                            const newMessages = [...(configuration.messages || [])];
                            newMessages[index] = { ...newMessages[index], content: e.target.value };
                            onChange({ ...configuration, messages: newMessages });
                          }}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newMessages = [...(configuration.messages || []), { role: 'user', content: '' }];
                      onChange({ ...configuration, messages: newMessages });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Message
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Tools Configuration */}
          <AccordionItem value="tools">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tools
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {(configuration.tools || []).map((tool: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Tool {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTools = (configuration.tools || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, tools: newTools });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <FormLabel>Tool *</FormLabel>
                        <Select 
                          value={tool.type}
                          onValueChange={(value) => {
                            const newTools = [...(configuration.tools || [])];
                            const selectedTool = availableTools.find(t => t.value === value);
                            newTools[index] = { 
                              ...newTools[index], 
                              type: value, 
                              name: selectedTool?.label || value,
                              parameters: {}
                            };
                            onChange({ ...configuration, tools: newTools });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tool" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {availableTools.map((availableTool) => (
                              <SelectItem key={availableTool.value} value={availableTool.value}>
                                <div className="flex items-center gap-2">
                                  <availableTool.icon className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{availableTool.label}</div>
                                    <div className="text-xs text-muted-foreground">{availableTool.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tool.type && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value={`tool-params-${index}`}>
                            <AccordionTrigger className="text-sm">
                              {tool.name || tool.type} Parameters
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                              {availableTools.find(t => t.value === tool.type)?.parameters.map((param: string) => (
                                <div key={param}>
                                  <FormLabel className="text-sm capitalize">
                                    {param.replace(/([A-Z])/g, ' $1').trim()}
                                  </FormLabel>
                                  {param === 'connectCredential' ? (
                                    <Select 
                                      value={tool.parameters?.[param] || ''}
                                      onValueChange={(value) => {
                                        const newTools = [...(configuration.tools || [])];
                                        newTools[index] = { 
                                          ...newTools[index], 
                                          parameters: { ...(newTools[index].parameters || {}), [param]: value }
                                        };
                                        onChange({ ...configuration, tools: newTools });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select credential" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : param.includes('include') || param.includes('require') || param.includes('load') || param.includes('continue') || param.includes('legacy') ? (
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={tool.parameters?.[param] || false}
                                        onCheckedChange={(checked) => {
                                          const newTools = [...(configuration.tools || [])];
                                          newTools[index] = { 
                                            ...newTools[index], 
                                            parameters: { ...(newTools[index].parameters || {}), [param]: checked }
                                          };
                                          onChange({ ...configuration, tools: newTools });
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <Input
                                      placeholder={`Enter ${param}`}
                                      value={tool.parameters?.[param] || ''}
                                      onChange={(e) => {
                                        const newTools = [...(configuration.tools || [])];
                                        newTools[index] = { 
                                          ...newTools[index], 
                                          parameters: { ...(newTools[index].parameters || {}), [param]: e.target.value }
                                        };
                                        onChange({ ...configuration, tools: newTools });
                                      }}
                                    />
                                  )}
                                </div>
                              ))}

                              <FormField
                                control={form.control}
                                name={`tools.${index}.requiresHuman`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-sm">Require Human Input</FormLabel>
                                      <FormDescription className="text-xs">
                                        Pause execution for human approval
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={tool.requiresHuman || false}
                                        onCheckedChange={(checked) => {
                                          const newTools = [...(configuration.tools || [])];
                                          newTools[index] = { ...newTools[index], requiresHuman: checked };
                                          onChange({ ...configuration, tools: newTools });
                                        }}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newTools = [...(configuration.tools || []), { name: '', type: '', parameters: {}, requiresHuman: false }];
                      onChange({ ...configuration, tools: newTools });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tool
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Knowledge Configuration */}
          <AccordionItem value="knowledge">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Knowledge & Memory
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Add knowledge document store
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Knowledge (Document Store)
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || []), {
                        vectorStore: '',
                        embeddingModel: '',
                        knowledgeName: '',
                        description: '',
                        returnSourceDocuments: false
                      }];
                      onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Knowledge (Vector Embeddings)
                  </Button>

                  {(configuration.knowledgeVectorEmbeddings || []).map((embedding: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Vector Store {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEmbeddings = (configuration.knowledgeVectorEmbeddings || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FormLabel className="text-sm">Vector Store *</FormLabel>
                          <Select 
                            value={embedding.vectorStore}
                            onValueChange={(value) => {
                              const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || [])];
                              newEmbeddings[index] = { ...newEmbeddings[index], vectorStore: value };
                              onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vector store" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <FormLabel className="text-sm">Embedding Model *</FormLabel>
                          <Select 
                            value={embedding.embeddingModel}
                            onValueChange={(value) => {
                              const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || [])];
                              newEmbeddings[index] = { ...newEmbeddings[index], embeddingModel: value };
                              onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                              <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <FormLabel className="text-sm">Knowledge Name *</FormLabel>
                        <Input
                          placeholder="Enter knowledge name"
                          value={embedding.knowledgeName}
                          onChange={(e) => {
                            const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || [])];
                            newEmbeddings[index] = { ...newEmbeddings[index], knowledgeName: e.target.value };
                            onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                          }}
                        />
                      </div>

                      <div>
                        <FormLabel className="text-sm">Describe Knowledge *</FormLabel>
                        <Textarea
                          placeholder="Describe what this knowledge contains..."
                          value={embedding.description}
                          onChange={(e) => {
                            const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || [])];
                            newEmbeddings[index] = { ...newEmbeddings[index], description: e.target.value };
                            onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                          }}
                          className="min-h-[60px]"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Return Source Documents</FormLabel>
                          <FormDescription className="text-xs">
                            Include source document references in responses
                          </FormDescription>
                        </div>
                        <Switch
                          checked={embedding.returnSourceDocuments || false}
                          onCheckedChange={(checked) => {
                            const newEmbeddings = [...(configuration.knowledgeVectorEmbeddings || [])];
                            newEmbeddings[index] = { ...newEmbeddings[index], returnSourceDocuments: checked };
                            onChange({ ...configuration, knowledgeVectorEmbeddings: newEmbeddings });
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <FormField
                    control={form.control}
                    name="enableMemory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Memory</FormLabel>
                          <FormDescription>
                            Remember conversation context
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

                  {configuration.enableMemory && (
                    <FormField
                      control={form.control}
                      name="memoryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Memory Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select memory type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="All Messages">All Messages</SelectItem>
                              <SelectItem value="Summary">Summary</SelectItem>
                              <SelectItem value="Recent">Recent Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}

                  <div>
                    <FormLabel>Input Message</FormLabel>
                    <Textarea
                      placeholder="Enter input message template..."
                      value={configuration.inputMessage || ''}
                      onChange={(e) => onChange({ ...configuration, inputMessage: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <FormLabel>Return Response As *</FormLabel>
                    <Select 
                      value={configuration.returnResponseAs || 'User Message'}
                      onValueChange={(value) => onChange({ ...configuration, returnResponseAs: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select response format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User Message">User Message</SelectItem>
                        <SelectItem value="Assistant Message">Assistant Message</SelectItem>
                        <SelectItem value="Raw Response">Raw Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="updateFlowState"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Update Flow State</FormLabel>
                          <FormDescription>
                            Update workflow state with response
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
            </AccordionContent>
          </AccordionItem>

          {/* Start Node Configuration */}
          {(nodeType === 'start' || nodeType === 'Start' || configAction === 'basic') && (
            <AccordionItem value="start">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Start Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="space-y-4 pt-4">
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
                                  <div className="text-sm text-muted-foreground">Start with chat input</div>
                                </div>
                              </SelectItem>
                              <SelectItem value="form">
                                <div className="space-y-1">
                                  <div className="font-medium">Form Input</div>
                                  <div className="text-sm text-muted-foreground">Start with form inputs</div>
                                </div>
                              </SelectItem>
                              <SelectItem value="api">
                                <div className="space-y-1">
                                  <div className="font-medium">API Input</div>
                                  <div className="text-sm text-muted-foreground">Start with API trigger</div>
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
                              <Trash2 className="h-4 w-4" />
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
                          <Plus className="h-4 w-4 mr-2" />
                          Add Flow State
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
              </AccordionContent>
            </AccordionItem>
          )}

          {/* API Configuration */}
          {(nodeType === 'api' || configAction === 'endpoint') && (
            <AccordionItem value="api">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  API Configuration
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API URL *</FormLabel>
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
                          <FormLabel>HTTP Method *</FormLabel>
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
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Basic Configuration - Always available as fallback */}
          <AccordionItem value="basic">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Settings
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
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
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderFormFields()}
      </form>
    </Form>
  );
};