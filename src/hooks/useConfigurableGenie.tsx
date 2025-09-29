/**
 * CONFIGURABLE GENIE HOOK
 * Manages dynamic configuration loading and application for Genie instances
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useConversationalContext } from './useConversationalContext';
import useRAGContext from './useRAGContext';
import { GenieBrandConfig, useGenieBrandConfig } from './useGenieBrandConfig';

interface ConfigurableGenieOptions {
  configId?: string;
  domain?: string;
  embedKey?: string;
  brandName?: string;
  businessUnit?: string;
}

export const useConfigurableGenie = (options: ConfigurableGenieOptions = {}) => {
  const [activeConfig, setActiveConfig] = useState<GenieBrandConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [themeApplied, setThemeApplied] = useState(false);

  const { generateThemeCSS } = useGenieBrandConfig();
  const { context: conversationContext, updateContext, generateContextualResponse } = useConversationalContext();
  const { enhanceWithRAG, addFutureContext } = useRAGContext();

  // Fetch configuration based on provided options
  const { data: config, isLoading } = useQuery({
    queryKey: ['configurable-genie-config', options],
    queryFn: async () => {
      if (options.configId) {
        // Direct config ID lookup
        const { data, error } = await supabase
          .from('genie_brand_configs')
          .select('*')
          .eq('id', options.configId)
          .eq('is_active', true)
          .single();
        
        if (error) throw error;
        return data as GenieBrandConfig;
      }

      if (options.embedKey) {
        // Lookup by embed key
        const { data: embedData, error: embedError } = await supabase
          .from('genie_deployment_embeds')
          .select('brand_config_id')
          .eq('api_key', options.embedKey)
          .eq('is_active', true)
          .single();
        
        if (embedError) throw embedError;

        const { data, error } = await supabase
          .from('genie_brand_configs')
          .select('*')
          .eq('id', embedData.brand_config_id)
          .eq('is_active', true)
          .single();
        
        if (error) throw error;
        return data as GenieBrandConfig;
      }

      if (options.brandName || options.businessUnit) {
        // Lookup by brand name or business unit
        let query = supabase
          .from('genie_brand_configs')
          .select('*')
          .eq('is_active', true);

        if (options.brandName) {
          query = query.eq('brand_name', options.brandName);
        }
        
        if (options.businessUnit) {
          query = query.eq('business_unit', options.businessUnit);
        }

        const { data, error } = await query.single();
        
        if (error) throw error;
        return data as GenieBrandConfig;
      }

      // Default: get first active configuration
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as GenieBrandConfig;
    },
    enabled: Object.keys(options).length > 0
  });

  // Apply configuration when loaded
  useEffect(() => {
    if (config && !isConfigured) {
      setActiveConfig(config);
      setIsConfigured(true);
      applyTheme(config.theme_config);
    }
  }, [config, isConfigured]);

  // Apply theme to DOM
  const applyTheme = (theme: any) => {
    if (themeApplied) return;
    
    const css = generateThemeCSS(theme);
    const styleElement = document.createElement('style');
    styleElement.id = 'genie-dynamic-theme';
    styleElement.textContent = css;
    
    // Remove existing theme if present
    const existingStyle = document.getElementById('genie-dynamic-theme');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(styleElement);
    setThemeApplied(true);
  };

  // Get enhanced system prompt
  const getSystemPrompt = useMemo(() => {
    if (!activeConfig) return 'You are GENIE AI, a helpful assistant.';
    
    let prompt = activeConfig.system_prompt;
    
    // Add RAG context if enabled
    if (activeConfig.rag_config.enabled) {
      prompt += `\n\nRAG Configuration:
- Context window: ${activeConfig.rag_config.contextWindowSize} messages
- Enhancement level: ${activeConfig.rag_config.ragEnhancementLevel}
- Future context enabled: ${activeConfig.rag_config.enableFutureContext}`;
    }

    // Add MCP tools if enabled
    if (activeConfig.mcp_config.enabled) {
      prompt += `\n\nAvailable Tools:
${activeConfig.mcp_config.enabledTools.map(tool => `- ${tool}`).join('\n')}`;
    }

    // Add brand context
    prompt += `\n\nBrand Context:
- Brand: ${activeConfig.brand_name}
- Business Unit: ${activeConfig.business_unit || 'General'}
- Welcome Message: ${activeConfig.welcome_message}`;

    return prompt;
  }, [activeConfig]);

  // Get model configuration
  const getModelConfig = useMemo(() => {
    if (!activeConfig) return null;
    return activeConfig.model_config;
  }, [activeConfig]);

  // Enhanced message processing with RAG
  const processMessage = async (
    message: string, 
    userId?: string, 
    conversationId?: string
  ): Promise<string> => {
    if (!activeConfig) return message;

    let enhancedMessage = message;

    // Apply conversational context
    updateContext(message);
    const contextualResponse = generateContextualResponse(message);
    enhancedMessage = contextualResponse.enhancedPrompt;

    // Apply RAG enhancement if enabled
    if (activeConfig.rag_config.enabled && userId) {
      enhancedMessage = await enhanceWithRAG(enhancedMessage, userId, conversationId);
      
      // Add to future context if enabled
      if (activeConfig.rag_config.enableFutureContext) {
        await addFutureContext(message, 'conversation', userId);
      }
    }

    return enhancedMessage;
  };

  // Log conversation for analytics
  const logConversation = async (
    sessionId: string,
    conversationData: any[],
    metadata: Record<string, any> = {}
  ) => {
    if (!activeConfig || !activeConfig.deployment_config.enableAnalytics) return;

    try {
      await supabase
        .from('genie_brand_conversations')
        .insert({
          brand_config_id: activeConfig.id,
          session_id: sessionId,
          conversation_data: conversationData,
          metadata: {
            ...metadata,
            config_version: activeConfig.updated_at,
            models_used: activeConfig.model_config.defaultModels.map(m => `${m.provider}/${m.model}`)
          },
          message_count: conversationData.length,
          status: 'active'
        });
    } catch (error) {
      console.error('Failed to log conversation:', error);
    }
  };

  // Generate embed code
  const generateEmbedCode = (domain: string, embedType: string = 'popup'): string => {
    if (!activeConfig) return '';

    const config = activeConfig.deployment_config;
    const embedKey = `embed_${Date.now()}`;

    return `
<!-- GENIE AI Configurable Widget -->
<script>
  (function() {
    var genieConfig = {
      brandConfig: '${activeConfig.id}',
      embedType: '${embedType}',
      position: '${config.position}',
      triggerText: '${config.triggerText}',
      theme: ${JSON.stringify(activeConfig.theme_config)},
      welcomeMessage: '${activeConfig.welcome_message}',
      requireAuth: ${config.requireAuth},
      domain: '${domain}'
    };

    var script = document.createElement('script');
    script.src = '${window.location.origin}/genie-embed.js';
    script.setAttribute('data-genie-config', JSON.stringify(genieConfig));
    document.head.appendChild(script);
  })();
</script>
<!-- End GENIE AI Widget -->`;
  };

  return {
    activeConfig,
    isConfigured,
    isLoading,
    systemPrompt: getSystemPrompt,
    modelConfig: getModelConfig,
    processMessage,
    logConversation,
    generateEmbedCode,
    applyTheme,
    conversationContext,
    // Convenience getters
    brandName: activeConfig?.brand_name,
    welcomeMessage: activeConfig?.welcome_message,
    theme: activeConfig?.theme_config,
    deployment: activeConfig?.deployment_config,
    ragEnabled: activeConfig?.rag_config.enabled,
    mcpEnabled: activeConfig?.mcp_config.enabled,
  };
};