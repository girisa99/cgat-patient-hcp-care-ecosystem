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
import { ChevronDown, ChevronUp, Plus, Trash2, Settings, Bot, Database, Webhook, MessageCircle, Brain, Search, Calculator, Code, FileText, Globe, Clock, Zap, Mail, Sheet, Image, PenTool, AlertTriangle } from 'lucide-react';
import { CategorySpecificConfigurations } from './CategorySpecificConfigurations';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useIntegrationOptions } from '@/hooks/useIntegrationOptions';

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
  const { nodeTypes, getNodeTypeByKey } = useWorkflowNodes();
  
  // Get node type information for category-specific configuration
  const nodeTypeInfo = getNodeTypeByKey(nodeType);
const category = nodeTypeInfo?.category?.name || nodeType;

// Integration options (schema tables, MCP/function-calling tools)
const { tables, mcpLikeTools, getTextLikeColumns, isLoading: isOptionsLoading } = useIntegrationOptions();

// Local UI state for adding document stores
const [docStoreSelection, setDocStoreSelection] = useState<{ table?: string; column?: string }>({});

  // AI Provider configurations
  const aiProviders = [
    { 
      value: 'ChatAnthropic', 
      label: 'ChatAnthropic', 
      icon: Bot,
      models: [
        'claude-opus-4-0', 'claude-4.1-opus', 'claude-sonnet-4-0', 'claude-4-sonnet',
        'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest',
        'claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'
      ]
    },
    { 
      value: 'AWS ChatBedrock', 
      label: 'AWS ChatBedrock', 
      icon: Database,
      models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'titan-text-express']
    },
    { 
      value: 'Azure ChatOpenAI', 
      label: 'Azure ChatOpenAI', 
      icon: Globe,
      models: ['gpt-4o', 'gpt-4o-mini']
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
      models: ['gemini-2.5-pro', 'gemini-2.5-flash']
    },
    { 
      value: 'ChatGoogleVertexAI', 
      label: 'ChatGoogleVertexAI', 
      icon: Search,
      models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'text-bison']
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

  // Dynamically include MCP/function-calling capable integrations from DB
  const dynamicTools = (mcpLikeTools || []).map((i: any) => ({
    value: `integration:${i.id}`,
    label: i.name,
    icon: Settings,
    description: `${i.provider || 'Integration'} (function-calling)`
  }));
  const toolsOptions = [...dynamicTools, ...availableTools];

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
      
      // Knowledge & Configuration (Consolidated)
      knowledgeDocumentStores: z.array(z.object({
        table: z.string(),
        column: z.string(),
        name: z.string(),
        description: z.string().optional()
      })).optional(),
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
      
      // Variables Configuration
      variables: z.array(z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
        defaultValue: z.string().optional(),
        description: z.string().optional()
      })).optional(),
      
      // Data Destinations Configuration
      destinations: z.array(z.object({
        type: z.enum(['database', 'api', 'vector']),
        table: z.string().optional(),
        operation: z.enum(['insert', 'update', 'upsert']).optional(),
        url: z.string().optional(),
        method: z.enum(['POST', 'PUT', 'PATCH']).optional(),
        vectorStore: z.string().optional()
      })).optional(),
      
      // Logging & Error Handling
      enableLogging: z.boolean().optional(),
      retryOnFailure: z.boolean().optional(),
      maxRetries: z.number().min(1).max(10).optional(),
      retryDelay: z.number().min(1).max(300).optional(),
      
      // Consolidated Configuration Fields
      configurationSchema: z.any().optional(),
      aiModelConfig: z.any().optional(),
      variablesConfig: z.array(z.any()).optional(),
      apisConfig: z.array(z.any()).optional(),
      connectorsConfig: z.array(z.any()).optional(),
      dataStorageConfig: z.any().optional(),
      validationRules: z.any().optional(),
      businessRules: z.any().optional(),
      
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

  // Watch form changes and immediately propagate them
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Only propagate if there are actual changes
      if (JSON.stringify(value) !== JSON.stringify(configuration)) {
        onChange(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange, configuration]);

  const renderFormFields = () => {
    return (
      <div className="space-y-6">
        {/* Category-specific configuration */}
        <CategorySpecificConfigurations
          category={category}
          nodeType={nodeType}
          configuration={configuration}
          onChange={onChange}
          form={form}
        />
        
        {/* Universal accordion sections that apply to all nodes */}
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
          
          {/* Messages Configuration - Universal */}
          <AccordionItem value="messages">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages & Communication
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

          {/* Tools Configuration - Universal */}
          <AccordionItem value="tools">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tools & Integrations
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
                            const selectedTool = (toolsOptions || []).find(t => t.value === value);
                            const originalTool = availableTools.find(t => t.value === value);
                            
                            if (originalTool) {
                              // This is an original tool with known parameters
                              newTools[index] = { 
                                ...newTools[index], 
                                type: value, 
                                name: selectedTool?.label || value,
                                parameters: {}
                              };
                            } else {
                              // This is a dynamic MCP integration
                              newTools[index] = { 
                                ...newTools[index], 
                                type: value, 
                                name: selectedTool?.label || value,
                                parameters: { integrationId: value.replace('integration:', '') }
                              };
                            }
                            onChange({ ...configuration, tools: newTools });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tool" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {toolsOptions.map((availableTool) => (
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

          {/* Knowledge Configuration - Universal */}
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
                      const newDocStores = [...(configuration.knowledgeDocumentStores || []), {
                        table: '',
                        column: '',
                        name: '',
                        description: ''
                      }];
                      onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Knowledge (Document Store)
                  </Button>

                  {/* Document Stores List */}
                  {(configuration.knowledgeDocumentStores || []).map((docStore: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Document Store {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDocStores = (configuration.knowledgeDocumentStores || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FormLabel className="text-sm">Table *</FormLabel>
                          <Select 
                            value={docStore.table}
                            onValueChange={(value) => {
                              const newDocStores = [...(configuration.knowledgeDocumentStores || [])];
                              newDocStores[index] = { ...newDocStores[index], table: value, column: '' };
                              onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {tables.map((table) => (
                                <SelectItem key={table.table_name} value={table.table_name}>
                                  <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    <span>{table.table_name}</span>
                                    {table.rls_enabled && <Badge variant="secondary" className="text-xs">RLS</Badge>}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <FormLabel className="text-sm">Text Column *</FormLabel>
                          <Select 
                            value={docStore.column}
                            onValueChange={(value) => {
                              const newDocStores = [...(configuration.knowledgeDocumentStores || [])];
                              newDocStores[index] = { ...newDocStores[index], column: value };
                              onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                            }}
                            disabled={!docStore.table}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTextLikeColumns(docStore.table).map((column) => (
                                <SelectItem key={column.column_name} value={column.column_name}>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{column.column_name}</span>
                                    <Badge variant="outline" className="text-xs">{column.data_type}</Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <FormLabel className="text-sm">Store Name *</FormLabel>
                        <Input
                          placeholder="Enter document store name"
                          value={docStore.name}
                          onChange={(e) => {
                            const newDocStores = [...(configuration.knowledgeDocumentStores || [])];
                            newDocStores[index] = { ...newDocStores[index], name: e.target.value };
                            onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                          }}
                        />
                      </div>

                      <div>
                        <FormLabel className="text-sm">Description</FormLabel>
                        <Textarea
                          placeholder="Describe what this document store contains..."
                          value={docStore.description}
                          onChange={(e) => {
                            const newDocStores = [...(configuration.knowledgeDocumentStores || [])];
                            newDocStores[index] = { ...newDocStores[index], description: e.target.value };
                            onChange({ ...configuration, knowledgeDocumentStores: newDocStores });
                          }}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  ))}

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

          {/* Variables Configuration - Universal */}
          <AccordionItem value="variables">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Variables & Parameters
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {(configuration.variables || []).map((variable: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Variable {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newVariables = (configuration.variables || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, variables: newVariables });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FormLabel className="text-sm">Variable Name *</FormLabel>
                          <Input
                            placeholder="e.g., user_id, api_key"
                            value={variable.name}
                            onChange={(e) => {
                              const newVariables = [...(configuration.variables || [])];
                              newVariables[index] = { ...newVariables[index], name: e.target.value };
                              onChange({ ...configuration, variables: newVariables });
                            }}
                          />
                        </div>

                        <div>
                          <FormLabel className="text-sm">Type *</FormLabel>
                          <Select 
                            value={variable.type}
                            onValueChange={(value) => {
                              const newVariables = [...(configuration.variables || [])];
                              newVariables[index] = { ...newVariables[index], type: value };
                              onChange({ ...configuration, variables: newVariables });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="array">Array</SelectItem>
                              <SelectItem value="object">Object</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <FormLabel className="text-sm">Default Value</FormLabel>
                        <Input
                          placeholder="Default value (optional)"
                          value={variable.defaultValue}
                          onChange={(e) => {
                            const newVariables = [...(configuration.variables || [])];
                            newVariables[index] = { ...newVariables[index], defaultValue: e.target.value };
                            onChange({ ...configuration, variables: newVariables });
                          }}
                        />
                      </div>

                      <div>
                        <FormLabel className="text-sm">Description</FormLabel>
                        <Textarea
                          placeholder="Describe this variable..."
                          value={variable.description}
                          onChange={(e) => {
                            const newVariables = [...(configuration.variables || [])];
                            newVariables[index] = { ...newVariables[index], description: e.target.value };
                            onChange({ ...configuration, variables: newVariables });
                          }}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newVariables = [...(configuration.variables || []), { 
                        name: '', 
                        type: 'string', 
                        defaultValue: '', 
                        description: '' 
                      }];
                      onChange({ ...configuration, variables: newVariables });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Database & API Destinations - Universal */}
          <AccordionItem value="destinations">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Destinations & APIs
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Configure where to push data from this node
                  </div>
                  
                  {(configuration.destinations || []).map((destination: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Destination {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDestinations = (configuration.destinations || []).filter((_: any, i: number) => i !== index);
                            onChange({ ...configuration, destinations: newDestinations });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <FormLabel className="text-sm">Destination Type *</FormLabel>
                        <Select 
                          value={destination.type}
                          onValueChange={(value) => {
                            const newDestinations = [...(configuration.destinations || [])];
                            newDestinations[index] = { ...newDestinations[index], type: value };
                            onChange({ ...configuration, destinations: newDestinations });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="database">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span>Database Table</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="api">
                              <div className="flex items-center gap-2">
                                <Webhook className="h-4 w-4" />
                                <span>API Endpoint</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="vector">
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                <span>Vector Store</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {destination.type === 'database' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FormLabel className="text-sm">Table *</FormLabel>
                            <Select 
                              value={destination.table}
                              onValueChange={(value) => {
                                const newDestinations = [...(configuration.destinations || [])];
                                newDestinations[index] = { ...newDestinations[index], table: value };
                                onChange({ ...configuration, destinations: newDestinations });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select table" />
                              </SelectTrigger>
                              <SelectContent>
                                {tables.map((table) => (
                                  <SelectItem key={table.table_name} value={table.table_name}>
                                    <div className="flex items-center gap-2">
                                      <Database className="h-4 w-4" />
                                      <span>{table.table_name}</span>
                                      {table.rls_enabled && <Badge variant="secondary" className="text-xs">RLS</Badge>}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <FormLabel className="text-sm">Operation *</FormLabel>
                            <Select 
                              value={destination.operation}
                              onValueChange={(value) => {
                                const newDestinations = [...(configuration.destinations || [])];
                                newDestinations[index] = { ...newDestinations[index], operation: value };
                                onChange({ ...configuration, destinations: newDestinations });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select operation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="insert">Insert</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="upsert">Upsert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {destination.type === 'api' && (
                        <div className="space-y-3">
                          <div>
                            <FormLabel className="text-sm">API URL *</FormLabel>
                            <Input
                              placeholder="https://api.example.com/webhook"
                              value={destination.url}
                              onChange={(e) => {
                                const newDestinations = [...(configuration.destinations || [])];
                                newDestinations[index] = { ...newDestinations[index], url: e.target.value };
                                onChange({ ...configuration, destinations: newDestinations });
                              }}
                            />
                          </div>

                          <div>
                            <FormLabel className="text-sm">HTTP Method *</FormLabel>
                            <Select 
                              value={destination.method}
                              onValueChange={(value) => {
                                const newDestinations = [...(configuration.destinations || [])];
                                newDestinations[index] = { ...newDestinations[index], method: value };
                                onChange({ ...configuration, destinations: newDestinations });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {destination.type === 'vector' && (
                        <div>
                          <FormLabel className="text-sm">Vector Store *</FormLabel>
                          <Select 
                            value={destination.vectorStore}
                            onValueChange={(value) => {
                              const newDestinations = [...(configuration.destinations || [])];
                              newDestinations[index] = { ...newDestinations[index], vectorStore: value };
                              onChange({ ...configuration, destinations: newDestinations });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vector store" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pinecone">Pinecone</SelectItem>
                              <SelectItem value="weaviate">Weaviate</SelectItem>
                              <SelectItem value="chroma">Chroma</SelectItem>
                              <SelectItem value="supabase-vector">Supabase Vector</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newDestinations = [...(configuration.destinations || []), { 
                        type: 'database', 
                        table: '', 
                        operation: 'insert' 
                      }];
                      onChange({ ...configuration, destinations: newDestinations });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Data Destination
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Logging & Retry Configuration - Universal */}
          <AccordionItem value="logging">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Logging & Error Handling
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="enableLogging"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Logging</FormLabel>
                          <FormDescription>
                            Log node execution details for debugging
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
                    name="retryOnFailure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Retry on Failure</FormLabel>
                          <FormDescription>
                            Automatically retry failed operations
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

                  {configuration.retryOnFailure && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="maxRetries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Retries</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="retryDelay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retry Delay (seconds)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="300"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Basic Configuration - Always available */}
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