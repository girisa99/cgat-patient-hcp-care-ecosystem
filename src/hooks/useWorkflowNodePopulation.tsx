import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAIModelManager } from './useAIModelManager';
import { useApiServices } from './useApiServices';
import { WorkflowNodeType } from './useWorkflowNodes';

interface VoiceProvider {
  id: string;
  name: string;
  provider_type: string;
  capabilities: string[];
  configuration: any;
  is_active: boolean;
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  is_default: boolean;
}

interface ChannelProvider {
  id: string;
  name: string;
  channel_type: string;
  capabilities: string[];
  is_active: boolean;
}

export const useWorkflowNodePopulation = () => {
  const { aiModels, modelIntegrations } = useAIModelManager();
  const { apiServices } = useApiServices();

  // Fetch voice providers
  const { data: voiceProviders = [] } = useQuery({
    queryKey: ['voice-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as VoiceProvider[];
    }
  });

  // Fetch agent templates
  const { data: agentTemplates = [] } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AgentTemplate[];
    }
  });

  // Generate voice configuration nodes
  const generateVoiceNodes = (): Partial<WorkflowNodeType>[] => {
    return voiceProviders.map(provider => ({
      type_key: `voice_${provider.provider_type}_${provider.id}`,
      display_name: provider.name,
      description: `${provider.provider_type} voice provider with capabilities: ${provider.capabilities?.join(', ')}`,
      detailed_explanation: `Voice provider configuration for ${provider.name}`,
      icon: getVoiceProviderIcon(provider.provider_type),
      color: getVoiceProviderColor(provider.provider_type),
      is_draggable: true,
      is_configurable: true,
      default_config: {
        provider_id: provider.id,
        provider_type: provider.provider_type,
        capabilities: provider.capabilities,
        ...provider.configuration
      },
      capabilities: provider.capabilities || [],
      requirements: {
        api_key: true,
        configuration: provider.configuration
      }
    }));
  };

  // Generate channel deployment nodes
  const generateChannelNodes = (): Partial<WorkflowNodeType>[] => {
    const channels = [
      { type: 'whatsapp', name: 'WhatsApp', icon: 'message-circle', color: '#25D366' },
      { type: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
      { type: 'facebook', name: 'Facebook Messenger', icon: 'facebook', color: '#1877F2' },
      { type: 'web_chat', name: 'Web Chat', icon: 'message-square', color: '#3B82F6' },
      { type: 'voice_call', name: 'Voice Call', icon: 'phone', color: '#EF4444' },
      { type: 'email', name: 'Email', icon: 'mail', color: '#F59E0B' },
      { type: 'sms', name: 'SMS', icon: 'smartphone', color: '#10B981' },
      { type: 'telegram', name: 'Telegram', icon: 'send', color: '#0088CC' },
      { type: 'slack', name: 'Slack', icon: 'slack', color: '#4A154B' },
      { type: 'teams', name: 'Microsoft Teams', icon: 'users', color: '#6264A7' }
    ];

    return channels.map(channel => ({
      type_key: `channel_${channel.type}`,
      display_name: channel.name,
      description: `Deploy agent to ${channel.name} channel`,
      detailed_explanation: `Channel deployment configuration for ${channel.name}`,
      icon: channel.icon,
      color: channel.color,
      is_draggable: true,
      is_configurable: true,
      default_config: {
        channel_type: channel.type,
        auto_reply: true,
        max_concurrent_sessions: 100
      },
      capabilities: ['messaging', 'deployment'],
      requirements: {
        api_credentials: true,
        webhook_setup: true
      }
    }));
  };

  // Generate AI model nodes with comprehensive functionality
  const generateAIModelNodes = (): Partial<WorkflowNodeType>[] => {
    const allModels = [...(aiModels || []), ...(modelIntegrations || [])];
    
    return allModels.map(model => {
      // Handle different model types with safe property access
      const isConfig = 'model_id' in model;
      const isIntegration = 'model_config' in model;
      const modelType = model.model_type || 'text';
      const provider = model.provider.toLowerCase();
      
      // Determine comprehensive capabilities based on model type and provider
      const getModelCapabilities = () => {
        const baseCapabilities = ['text_generation', 'conversation'];
        const additionalCapabilities = [];
        
        // Model type specific capabilities
        if (modelType.includes('vision') || model.name?.toLowerCase().includes('vision')) {
          additionalCapabilities.push('vision', 'image_analysis', 'multimodal');
        }
        if (modelType.includes('embedding')) {
          additionalCapabilities.push('embeddings', 'semantic_search', 'similarity');
        }
        if (modelType.includes('code') || model.name?.toLowerCase().includes('code')) {
          additionalCapabilities.push('code_generation', 'code_analysis', 'debugging');
        }
        if (provider === 'openai' && (model.name?.includes('gpt-4') || model.name?.includes('gpt-5'))) {
          additionalCapabilities.push('function_calling', 'json_mode', 'reasoning');
        }
        if (modelType === 'small' || model.name?.toLowerCase().includes('mini')) {
          additionalCapabilities.push('fast_inference', 'low_latency', 'edge_deployment');
        }
        
        return [...baseCapabilities, ...additionalCapabilities];
      };

      // Define comprehensive input/output schemas
      const inputSchema = {
        type: "object",
        properties: {
          messages: {
            type: "array",
            description: "Array of conversation messages",
            items: {
              type: "object",
              properties: {
                role: { type: "string", enum: ["user", "assistant", "system"] },
                content: { type: "string", description: "Message content" }
              }
            }
          },
          temperature: { 
            type: "number", 
            minimum: 0, 
            maximum: 2, 
            description: "Randomness in response (0=deterministic, 2=very creative)",
            default: 0.7
          },
          max_tokens: { 
            type: "number", 
            minimum: 1, 
            maximum: 4096, 
            description: "Maximum tokens in response",
            default: 1000
          },
          ...(getModelCapabilities().includes('vision') && {
            images: {
              type: "array",
              description: "Images for analysis (base64 or URLs)",
              items: { type: "string" }
            }
          }),
          ...(getModelCapabilities().includes('function_calling') && {
            functions: {
              type: "array",
              description: "Available functions for the model to call",
              items: { type: "object" }
            }
          })
        },
        required: ["messages"]
      };

      const outputSchema = {
        type: "object",
        properties: {
          response: {
            type: "string",
            description: "Generated text response"
          },
          usage: {
            type: "object",
            properties: {
              prompt_tokens: { type: "number" },
              completion_tokens: { type: "number" },
              total_tokens: { type: "number" }
            }
          },
          ...(getModelCapabilities().includes('function_calling') && {
            function_call: {
              type: "object",
              description: "Function call details if triggered"
            }
          }),
          confidence_score: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Model confidence in response"
          }
        }
      };

      // Define comprehensive requirements
      const requirements = {
        api_key: { required: true, description: `${model.provider} API key` },
        rate_limits: { required: true, description: "Consider API rate limits" },
        ...(provider === 'openai' && {
          organization_id: { required: false, description: "OpenAI organization ID (optional)" }
        }),
        ...(provider === 'anthropic' && {
          version: { required: false, description: "Anthropic API version (optional)" }
        }),
        model_access: { 
          required: true, 
          description: `Access to ${model.name} model via ${model.provider}` 
        }
      };
      
      return {
        type_key: `ai_model_${model.id || model.name?.replace(/\s+/g, '_').toLowerCase()}`,
        display_name: model.name,
        description: `${model.provider} - ${modelType} model with ${getModelCapabilities().length} capabilities`,
        detailed_explanation: `
          AI model: ${model.name} by ${model.provider}
          Type: ${modelType}
          Capabilities: ${getModelCapabilities().join(', ')}
          Use cases: ${getModelCapabilities().includes('vision') ? 'Image analysis, ' : ''}${getModelCapabilities().includes('code_generation') ? 'Code generation, ' : ''}Text generation, Conversation
          Performance: ${modelType === 'small' ? 'Fast, low-latency' : 'High-quality, comprehensive'}
        `,
        icon: getModelIcon(model.provider),
        color: getModelColor(model.provider),
        is_draggable: true,
        is_configurable: true,
        default_config: {
          model_id: isConfig ? model.model_id : model.id,
          provider: model.provider,
          model_type: modelType,
          temperature: 0.7,
          max_tokens: 1000,
          configuration: isConfig ? model.configuration : isIntegration ? model.model_config : {},
          capabilities: getModelCapabilities()
        },
        input_schema: inputSchema,
        output_schema: outputSchema,
        capabilities: getModelCapabilities(),
        requirements: requirements
      };
    });
  };

  // Generate comprehensive MCP nodes
  const generateMCPNodes = (): Partial<WorkflowNodeType>[] => {
    const mcpServers = [
      { 
        name: 'File System MCP', 
        description: 'Complete file system operations with security controls',
        capabilities: ['read_file', 'write_file', 'list_directory', 'create_directory', 'delete_file', 'file_search', 'file_watch'],
        category: 'storage',
        use_cases: ['Document management', 'File processing', 'Content storage'],
        security_level: 'high'
      },
      { 
        name: 'Database MCP', 
        description: 'Database operations with query optimization',
        capabilities: ['sql_query', 'insert_record', 'update_record', 'delete_record', 'schema_introspection', 'transaction_management'],
        category: 'data',
        use_cases: ['Data retrieval', 'Analytics', 'Record management'],
        security_level: 'high'
      },
      { 
        name: 'Web Search MCP', 
        description: 'Advanced web search and content extraction',
        capabilities: ['web_search', 'content_scrape', 'url_analysis', 'site_crawl', 'semantic_search'],
        category: 'external',
        use_cases: ['Research', 'Data collection', 'Content discovery'],
        security_level: 'medium'
      },
      { 
        name: 'Email MCP', 
        description: 'Email communication with template support',
        capabilities: ['send_email', 'receive_email', 'list_emails', 'email_templates', 'attachment_handling'],
        category: 'communication',
        use_cases: ['Notifications', 'Customer communication', 'Automated responses'],
        security_level: 'high'
      },
      { 
        name: 'Calendar MCP', 
        description: 'Calendar management with scheduling intelligence',
        capabilities: ['create_event', 'list_events', 'update_event', 'delete_event', 'availability_check', 'timezone_conversion'],
        category: 'productivity',
        use_cases: ['Appointment scheduling', 'Meeting management', 'Availability tracking'],
        security_level: 'medium'
      },
      { 
        name: 'Notification MCP', 
        description: 'Multi-channel notification delivery',
        capabilities: ['push_notification', 'sms_send', 'email_notify', 'webhook_trigger', 'batch_notifications'],
        category: 'communication',
        use_cases: ['Alert systems', 'User notifications', 'System monitoring'],
        security_level: 'medium'
      },
      { 
        name: 'Memory MCP', 
        description: 'Persistent memory and context management',
        capabilities: ['store_memory', 'retrieve_memory', 'search_memory', 'memory_categories', 'context_linking'],
        category: 'intelligence',
        use_cases: ['Context retention', 'User preferences', 'Conversation history'],
        security_level: 'high'
      },
      { 
        name: 'Analytics MCP', 
        description: 'Data analytics and visualization tools',
        capabilities: ['data_analysis', 'chart_generation', 'statistical_analysis', 'trend_detection', 'report_generation'],
        category: 'analytics',
        use_cases: ['Business intelligence', 'Performance monitoring', 'Data insights'],
        security_level: 'medium'
      },
      { 
        name: 'API Integration MCP', 
        description: 'Generic API integration and management',
        capabilities: ['http_request', 'api_authentication', 'rate_limiting', 'response_parsing', 'error_handling'],
        category: 'external',
        use_cases: ['Third-party integrations', 'Data synchronization', 'Service orchestration'],
        security_level: 'medium'
      },
      { 
        name: 'Code Execution MCP', 
        description: 'Safe code execution environment',
        capabilities: ['python_execution', 'javascript_execution', 'code_validation', 'sandbox_security', 'result_formatting'],
        category: 'compute',
        use_cases: ['Data processing', 'Custom calculations', 'Dynamic scripting'],
        security_level: 'high'
      }
    ];

    return mcpServers.map(server => {
      // Define comprehensive input/output schemas for MCP
      const inputSchema = {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: server.capabilities,
            description: `Available actions: ${server.capabilities.join(', ')}`
          },
          parameters: {
            type: "object",
            description: "Action-specific parameters",
            properties: {
              ...(server.capabilities.includes('read_file') && {
                file_path: { type: "string", description: "Path to file" }
              }),
              ...(server.capabilities.includes('sql_query') && {
                query: { type: "string", description: "SQL query to execute" }
              }),
              ...(server.capabilities.includes('web_search') && {
                query: { type: "string", description: "Search query" },
                max_results: { type: "number", default: 10 }
              }),
              ...(server.capabilities.includes('send_email') && {
                to: { type: "string", description: "Recipient email" },
                subject: { type: "string", description: "Email subject" },
                body: { type: "string", description: "Email content" }
              })
            }
          },
          options: {
            type: "object",
            description: "Additional configuration options",
            properties: {
              timeout: { type: "number", default: 30, description: "Timeout in seconds" },
              retry_count: { type: "number", default: 3, description: "Number of retries" }
            }
          }
        },
        required: ["action", "parameters"]
      };

      const outputSchema = {
        type: "object",
        properties: {
          success: { type: "boolean", description: "Operation success status" },
          data: { 
            type: "object", 
            description: "Result data (varies by action)" 
          },
          metadata: {
            type: "object",
            properties: {
              execution_time: { type: "number", description: "Execution time in ms" },
              resource_usage: { type: "object", description: "Resource consumption metrics" }
            }
          },
          error: {
            type: "object",
            properties: {
              code: { type: "string", description: "Error code" },
              message: { type: "string", description: "Error description" }
            }
          }
        }
      };

      // Define comprehensive requirements
      const requirements = {
        server_endpoint: { 
          required: true, 
          description: `MCP server endpoint for ${server.name}` 
        },
        protocol_version: { 
          required: true, 
          description: "MCP protocol version compatibility" 
        },
        authentication: { 
          required: server.security_level === 'high', 
          description: `Authentication ${server.security_level === 'high' ? 'required' : 'optional'} for security level: ${server.security_level}` 
        },
        ...(server.category === 'external' && {
          network_access: { required: true, description: "Internet connectivity required" }
        }),
        ...(server.category === 'data' && {
          database_connection: { required: true, description: "Database connection credentials" }
        }),
        ...(server.capabilities.includes('send_email') && {
          smtp_config: { required: true, description: "SMTP server configuration" }
        })
      };

      return {
        type_key: `mcp_${server.name.replace(/\s+/g, '_').toLowerCase()}`,
        display_name: server.name,
        description: `${server.description} | ${server.capabilities.length} capabilities`,
        detailed_explanation: `
          MCP Server: ${server.name}
          Category: ${server.category}
          Security Level: ${server.security_level}
          Capabilities: ${server.capabilities.join(', ')}
          Use Cases: ${server.use_cases.join(', ')}
          Protocol: Model Context Protocol (MCP) 2024-11-05
          Integration: Connects via MCP protocol for seamless AI model integration
        `,
        icon: getMCPIcon(server.category),
        color: getMCPColor(server.category),
        is_draggable: true,
        is_configurable: true,
        default_config: {
          server_name: server.name,
          category: server.category,
          capabilities: server.capabilities,
          protocol_version: '2024-11-05',
          security_level: server.security_level,
          timeout: 30,
          retry_count: 3
        },
        input_schema: inputSchema,
        output_schema: outputSchema,
        capabilities: server.capabilities,
        requirements: requirements
      };
    });
  };

  // Generate template nodes
  const generateTemplateNodes = (): Partial<WorkflowNodeType>[] => {
    return agentTemplates.map(template => ({
      type_key: `template_${template.id}`,
      display_name: template.name,
      description: template.description || `${template.template_type} template`,
      detailed_explanation: `Agent template: ${template.description}`,
      icon: 'file-text',
      color: template.is_default ? '#10B981' : '#8B5CF6',
      is_draggable: true,
      is_configurable: true,
      default_config: {
        template_id: template.id,
        template_type: template.template_type,
        is_default: template.is_default
      },
      capabilities: ['templating', 'configuration'],
      requirements: {
        template_data: true
      }
    }));
  };

  // Get all populated nodes
  const getPopulatedNodes = () => {
    return {
      voice_config: generateVoiceNodes(),
      channel_deployment: generateChannelNodes(),
      small_language_models: generateAIModelNodes().filter(m => 
        m.default_config?.model_type === 'small' || 
        m.display_name?.toLowerCase().includes('mini') ||
        m.display_name?.toLowerCase().includes('small')
      ),
      genai_llm: generateAIModelNodes().filter(m => 
        !m.display_name?.toLowerCase().includes('mini') &&
        !m.display_name?.toLowerCase().includes('small')
      ),
      mcp: generateMCPNodes(),
      prompts: generateTemplateNodes()
    };
  };

  return {
    voiceProviders,
    agentTemplates,
    generateVoiceNodes,
    generateChannelNodes,
    generateAIModelNodes,
    generateMCPNodes,
    generateTemplateNodes,
    getPopulatedNodes
  };
};

// Helper functions for icons and colors
const getVoiceProviderIcon = (providerType: string): string => {
  const iconMap: Record<string, string> = {
    'elevenlabs': 'volume-2',
    'twilio': 'phone',
    'vonage': 'phone-call',
    'genesys': 'headphones',
    'voxinplant': 'mic',
    'huggingface': 'brain',
    'openai': 'zap',
    'azure': 'cloud',
    'google': 'chrome'
  };
  return iconMap[providerType.toLowerCase()] || 'mic';
};

const getVoiceProviderColor = (providerType: string): string => {
  const colorMap: Record<string, string> = {
    'elevenlabs': '#7C3AED',
    'twilio': '#F56565',
    'vonage': '#3182CE',
    'genesys': '#38A169',
    'voxinplant': '#805AD5',
    'huggingface': '#F6AD55',
    'openai': '#4299E1',
    'azure': '#0078D4',
    'google': '#4285F4'
  };
  return colorMap[providerType.toLowerCase()] || '#6B7280';
};

const getModelIcon = (provider: string): string => {
  const iconMap: Record<string, string> = {
    'openai': 'zap',
    'anthropic': 'brain',
    'huggingface': 'heart',
    'google': 'chrome',
    'meta': 'facebook',
    'microsoft': 'box',
    'cohere': 'layers',
    'ai21': 'cpu'
  };
  return iconMap[provider.toLowerCase()] || 'cpu';
};

const getModelColor = (provider: string): string => {
  const colorMap: Record<string, string> = {
    'openai': '#10B981',
    'anthropic': '#F59E0B',
    'huggingface': '#F97316',
    'google': '#3B82F6',
    'meta': '#1877F2',
    'microsoft': '#0078D4',
    'cohere': '#8B5CF6',
    'ai21': '#EF4444'
  };
  return colorMap[provider.toLowerCase()] || '#6B7280';
};

// Helper functions for MCP nodes
const getMCPIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'storage': 'hard-drive',
    'data': 'database',
    'external': 'globe',
    'communication': 'mail',
    'productivity': 'calendar',
    'intelligence': 'brain',
    'analytics': 'bar-chart',
    'compute': 'cpu'
  };
  return iconMap[category] || 'git-branch';
};

const getMCPColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'storage': '#059669',
    'data': '#0891B2',
    'external': '#7C3AED',
    'communication': '#DC2626',
    'productivity': '#EA580C',
    'intelligence': '#9333EA',
    'analytics': '#0D9488',
    'compute': '#1D4ED8'
  };
  return colorMap[category] || '#0EA5E9';
};