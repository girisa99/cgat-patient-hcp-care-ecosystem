import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface GenieConfiguration {
  id?: string;
  configuration_name: string;
  selected_mode: 'system' | 'single' | 'multi';
  selected_models: string[];
  left_model: string;
  right_model: string;
  selected_model_type: 'llm' | 'slm' | 'vlm';
  enabled_features: string[];
  selected_mcp_tools: string[];
  knowledge_base: string;
  medical_context: boolean;
  is_default: boolean;
}

type DatabaseGenieConfiguration = {
  id: string;
  user_id: string;
  configuration_name: string;
  selected_mode: string;
  selected_models: any;
  left_model: string;
  right_model: string;
  selected_model_type: string;
  enabled_features: any;
  selected_mcp_tools: any;
  knowledge_base: string;
  medical_context: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const useGenieConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const [configurations, setConfigurations] = useState<GenieConfiguration[]>([]);
  const [currentConfig, setCurrentConfig] = useState<GenieConfiguration | null>(null);
  const { showError, showSuccess } = useMasterToast();

  // Load user configurations
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('genie_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const configs = (data || []).map((dbConfig: DatabaseGenieConfiguration): GenieConfiguration => ({
        id: dbConfig.id,
        configuration_name: dbConfig.configuration_name,
        selected_mode: dbConfig.selected_mode as 'system' | 'single' | 'multi',
        selected_models: Array.isArray(dbConfig.selected_models) ? (dbConfig.selected_models as string[]) : [],
        left_model: dbConfig.left_model,
        right_model: dbConfig.right_model,
        selected_model_type: dbConfig.selected_model_type as 'llm' | 'slm' | 'vlm',
        enabled_features: Array.isArray(dbConfig.enabled_features) ? (dbConfig.enabled_features as string[]) : [],
        selected_mcp_tools: Array.isArray(dbConfig.selected_mcp_tools) ? (dbConfig.selected_mcp_tools as string[]) : [],
        knowledge_base: dbConfig.knowledge_base,
        medical_context: dbConfig.medical_context,
        is_default: dbConfig.is_default
      }));
      
      setConfigurations(configs);

      // Set default or first config as current
      const defaultConfig = configs.find(c => c.is_default) || configs[0];
      if (defaultConfig && !currentConfig) {
        setCurrentConfig(defaultConfig);
      }
    } catch (error: any) {
      console.error('Error loading genie configurations:', error);
      showError(error.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, [currentConfig, showError]);

  // Save configuration
  const saveConfiguration = useCallback(async (config: Omit<GenieConfiguration, 'id'>) => {
    try {
      setLoading(true);
      
      // If setting as default, unset other defaults first
      if (config.is_default) {
        await supabase
          .from('genie_configurations')
          .update({ is_default: false })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
      }

      const { data, error } = await supabase
        .from('genie_configurations')
        .insert([config])
        .select()
        .single();

      if (error) throw error;

      const savedConfig: GenieConfiguration = {
        id: data.id,
        configuration_name: data.configuration_name,
        selected_mode: data.selected_mode as 'system' | 'single' | 'multi',
        selected_models: Array.isArray(data.selected_models) ? data.selected_models.map(String) : [],
        left_model: data.left_model,
        right_model: data.right_model,
        selected_model_type: data.selected_model_type as 'llm' | 'slm' | 'vlm',
        enabled_features: Array.isArray(data.enabled_features) ? data.enabled_features.map(String) : [],
        selected_mcp_tools: Array.isArray(data.selected_mcp_tools) ? data.selected_mcp_tools.map(String) : [],
        knowledge_base: data.knowledge_base,
        medical_context: data.medical_context,
        is_default: data.is_default
      };

      await loadConfigurations();
      setCurrentConfig(savedConfig);
      showSuccess('Configuration saved successfully');
      return savedConfig;
    } catch (error: any) {
      console.error('Error saving genie configuration:', error);
      showError(error.message || 'Failed to save configuration');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadConfigurations, showError, showSuccess]);

  // Update configuration
  const updateConfiguration = useCallback(async (id: string, updates: Partial<GenieConfiguration>) => {
    try {
      setLoading(true);
      
      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('genie_configurations')
          .update({ is_default: false })
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('genie_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedConfig: GenieConfiguration = {
        id: data.id,
        configuration_name: data.configuration_name,
        selected_mode: data.selected_mode as 'system' | 'single' | 'multi',
        selected_models: Array.isArray(data.selected_models) ? data.selected_models.map(String) : [],
        left_model: data.left_model,
        right_model: data.right_model,
        selected_model_type: data.selected_model_type as 'llm' | 'slm' | 'vlm',
        enabled_features: Array.isArray(data.enabled_features) ? data.enabled_features.map(String) : [],
        selected_mcp_tools: Array.isArray(data.selected_mcp_tools) ? data.selected_mcp_tools.map(String) : [],
        knowledge_base: data.knowledge_base,
        medical_context: data.medical_context,
        is_default: data.is_default
      };

      await loadConfigurations();
      setCurrentConfig(updatedConfig);
      showSuccess('Configuration updated successfully');
      return updatedConfig;
    } catch (error: any) {
      console.error('Error updating genie configuration:', error);
      showError(error.message || 'Failed to update configuration');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadConfigurations, showError, showSuccess]);

  // Delete configuration
  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('genie_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadConfigurations();
      showSuccess('Configuration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting genie configuration:', error);
      showError(error.message || 'Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  }, [loadConfigurations, showError, showSuccess]);

  // Set current configuration
  const setConfiguration = useCallback((config: GenieConfiguration) => {
    setCurrentConfig(config);
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  return {
    loading,
    configurations,
    currentConfig,
    loadConfigurations,
    saveConfiguration,
    updateConfiguration,
    deleteConfiguration,
    setConfiguration
  };
};