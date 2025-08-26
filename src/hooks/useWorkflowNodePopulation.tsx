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

  // Generate AI model nodes
  const generateAIModelNodes = (): Partial<WorkflowNodeType>[] => {
    const allModels = [...(aiModels || []), ...(modelIntegrations || [])];
    
    return allModels.map(model => {
      // Handle different model types with safe property access
      const isConfig = 'model_id' in model;
      const isIntegration = 'model_config' in model;
      
      return {
        type_key: `ai_model_${model.id || model.name?.replace(/\s+/g, '_').toLowerCase()}`,
        display_name: model.name,
        description: `${model.provider} - ${isConfig ? model.model_type : model.model_type || 'AI Model'}`,
        detailed_explanation: `AI model configuration for ${model.name} by ${model.provider}`,
        icon: getModelIcon(model.provider),
        color: getModelColor(model.provider),
        is_draggable: true,
        is_configurable: true,
        default_config: {
          model_id: isConfig ? model.model_id : model.id,
          provider: model.provider,
          model_type: model.model_type,
          configuration: isConfig ? model.configuration : isIntegration ? model.model_config : {},
          capabilities: isIntegration ? model.capabilities : []
        },
        capabilities: isIntegration ? model.capabilities : ['text_generation'],
        requirements: {
          api_key: true,
          rate_limits: true
        }
      };
    });
  };

  // Generate MCP nodes
  const generateMCPNodes = (): Partial<WorkflowNodeType>[] => {
    const mcpServers = [
      { name: 'File System MCP', description: 'File system operations', capabilities: ['read', 'write', 'list'] },
      { name: 'Database MCP', description: 'Database operations', capabilities: ['query', 'insert', 'update'] },
      { name: 'Web Search MCP', description: 'Web search operations', capabilities: ['search', 'scrape'] },
      { name: 'Email MCP', description: 'Email operations', capabilities: ['send', 'receive', 'list'] },
      { name: 'Calendar MCP', description: 'Calendar operations', capabilities: ['create', 'read', 'update'] },
      { name: 'Notification MCP', description: 'Notification services', capabilities: ['push', 'sms', 'email'] }
    ];

    return mcpServers.map(server => ({
      type_key: `mcp_${server.name.replace(/\s+/g, '_').toLowerCase()}`,
      display_name: server.name,
      description: server.description,
      detailed_explanation: `Model Context Protocol server for ${server.description}`,
      icon: 'git-branch',
      color: '#0EA5E9',
      is_draggable: true,
      is_configurable: true,
      default_config: {
        server_name: server.name,
        capabilities: server.capabilities,
        protocol_version: '2024-11-05'
      },
      capabilities: server.capabilities,
      requirements: {
        server_endpoint: true,
        authentication: false
      }
    }));
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