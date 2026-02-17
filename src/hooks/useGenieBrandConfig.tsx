/**
 * GENIE BRAND CONFIGURATION HOOK
 * Manages brand-specific Genie configurations including themes, models, RAG, and deployment
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface GenieBrandTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  logoUrl?: string;
  brandingText: string;
}

export interface GenieModelConfig {
  defaultMode: 'single' | 'multi' | 'system';
  allowedModes: ('single' | 'multi' | 'system')[];
  defaultModels: Array<{
    provider: string;
    model: string;
    category: string;
  }>;
  maxModels: number;
  temperature: number;
  maxTokens: number;
  enabledFeatures: string[];
}

export interface GenieRAGConfig {
  enabled: boolean;
  knowledgeBaseIds: string[];
  contextWindowSize: number;
  enableFutureContext: boolean;
  ragEnhancementLevel: 'basic' | 'standard' | 'advanced';
}

export interface GenieDeploymentConfig {
  embedType: 'popup' | 'inline' | 'fullscreen' | 'sidebar';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  triggerText: string;
  allowedDomains: string[];
  customCSS: string;
  enableAnalytics: boolean;
  requireAuth: boolean;
  privacyPolicy?: string;
  termsOfService?: string;
}

export interface GenieMCPConfig {
  enabled: boolean;
  enabledTools: string[];
  customTools: Array<{
    name: string;
    description: string;
    endpoint: string;
    parameters: Record<string, any>;
  }>;
  mcpServerConfigs: Array<{
    name: string;
    url: string;
    auth?: Record<string, any>;
  }>;
}

export interface GenieBrandConfig {
  id?: string;
  brand_name: string;
  business_unit?: string;
  theme_config: GenieBrandTheme;
  model_config: GenieModelConfig;
  rag_config: GenieRAGConfig;
  system_prompt: string;
  welcome_message: string;
  deployment_config: GenieDeploymentConfig;
  mcp_config: GenieMCPConfig;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useGenieBrandConfig = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch all brand configurations
  const { data: brandConfigs, isLoading } = useQuery({
    queryKey: ['genie-brand-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as GenieBrandConfig[];
    },
  });

  // Fetch specific brand configuration
  const getBrandConfig = async (configId: string): Promise<GenieBrandConfig | null> => {
    const { data, error } = await supabase
      .from('genie_brand_configs')
      .select('*')
      .eq('id', configId)
      .single();
    
    if (error) {
      console.error('Error fetching brand config:', error);
      return null;
    }
    return data as unknown as GenieBrandConfig;
  };

  // Create brand configuration
  const createBrandConfig = useMutation({
    mutationFn: async (config: Omit<GenieBrandConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .insert(config as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as GenieBrandConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genie-brand-configs'] });
      showSuccess('Brand configuration created successfully');
    },
    onError: (error) => {
      showError('Failed to create brand configuration: ' + error.message);
    }
  });

  // Update brand configuration
  const updateBrandConfig = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GenieBrandConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as GenieBrandConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genie-brand-configs'] });
      showSuccess('Brand configuration updated successfully');
    },
    onError: (error) => {
      showError('Failed to update brand configuration: ' + error.message);
    }
  });

  // Delete brand configuration
  const deleteBrandConfig = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('genie_brand_configs')
        .delete()
        .eq('id', configId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genie-brand-configs'] });
      showSuccess('Brand configuration deleted successfully');
    },
    onError: (error) => {
      showError('Failed to delete brand configuration: ' + error.message);
    }
  });

  // Clone brand configuration
  const cloneBrandConfig = useMutation({
    mutationFn: async (configId: string) => {
      const originalConfig = await getBrandConfig(configId);
      if (!originalConfig) throw new Error('Configuration not found');

      const { id, created_at, updated_at, ...configToClone } = originalConfig;
      const clonedConfig = {
        ...configToClone,
        brand_name: `${originalConfig.brand_name} (Copy)`,
      };

      const { data, error } = await supabase
        .from('genie_brand_configs')
        .insert(clonedConfig as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as GenieBrandConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genie-brand-configs'] });
      showSuccess('Brand configuration cloned successfully');
    },
    onError: (error) => {
      showError('Failed to clone brand configuration: ' + error.message);
    }
  });

  // Generate CSS variables from theme config
  const generateThemeCSS = (theme: GenieBrandTheme): string => {
    return `
      :root {
        --genie-primary: ${theme.primaryColor};
        --genie-secondary: ${theme.secondaryColor};
        --genie-accent: ${theme.accentColor};
        --genie-background: ${theme.backgroundColor};
        --genie-text: ${theme.textColor};
        --genie-border-radius: ${theme.borderRadius};
        --genie-font-family: ${theme.fontFamily};
      }
      
      .genie-branded {
        background-color: var(--genie-background);
        color: var(--genie-text);
        font-family: var(--genie-font-family);
        border-radius: var(--genie-border-radius);
      }
      
      .genie-primary {
        background-color: var(--genie-primary);
      }
      
      .genie-secondary {
        background-color: var(--genie-secondary);
      }
      
      .genie-accent {
        background-color: var(--genie-accent);
      }
    `;
  };

  // Get default configuration
  const getDefaultConfig = (): Omit<GenieBrandConfig, 'id' | 'created_at' | 'updated_at'> => ({
    brand_name: 'New GENIE Configuration',
    business_unit: '',
    theme_config: {
      primaryColor: '#2563eb',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '8px',
      fontFamily: 'system-ui',
      brandingText: 'GENIE AI'
    },
    model_config: {
      defaultMode: 'single',
      allowedModes: ['single', 'multi'],
      defaultModels: [
        { provider: 'google', model: 'gemini-2.5-flash', category: 'llm' }
      ],
      maxModels: 6,
      temperature: 0.4,
      maxTokens: 1500,
      enabledFeatures: ['medical', 'vision']
    },
    rag_config: {
      enabled: true,
      knowledgeBaseIds: [],
      contextWindowSize: 10,
      enableFutureContext: true,
      ragEnhancementLevel: 'standard'
    },
    system_prompt: 'You are GENIE AI, a helpful healthcare technology assistant.',
    welcome_message: 'Hello! I\'m GENIE AI, your healthcare technology navigator. How can I help you today?',
    deployment_config: {
      embedType: 'popup',
      position: 'bottom-right',
      triggerText: 'Chat with GENIE',
      allowedDomains: [],
      customCSS: '',
      enableAnalytics: true,
      requireAuth: false
    },
    mcp_config: {
      enabled: false,
      enabledTools: [],
      customTools: [],
      mcpServerConfigs: []
    },
    is_active: true
  });

  return {
    brandConfigs,
    isLoading,
    getBrandConfig,
    createBrandConfig: createBrandConfig.mutate,
    updateBrandConfig: updateBrandConfig.mutate,
    deleteBrandConfig: deleteBrandConfig.mutate,
    cloneBrandConfig: cloneBrandConfig.mutate,
    generateThemeCSS,
    getDefaultConfig,
    isCreating: createBrandConfig.isPending,
    isUpdating: updateBrandConfig.isPending,
    isDeleting: deleteBrandConfig.isPending,
    isCloning: cloneBrandConfig.isPending,
  };
};