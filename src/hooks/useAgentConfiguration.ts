/**
 * useAgentConfiguration Hook
 * Manages agent configuration, data requirements, and setup wizard state
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApiFieldRequirement {
  name: string;
  label: string;
  type: 'text' | 'secret' | 'url' | 'select';
  required: boolean;
  description?: string;
  default?: string;
  options?: string[];
}

export interface DocumentDataRequirement {
  field: string;
  label: string;
  source: string;
  fallback?: string;
  required: boolean;
}

export interface AgentDataRequirements {
  id: string;
  agent_type_id: string;
  display_name: string;
  description: string;
  category: string;
  required_api_fields: ApiFieldRequirement[];
  required_document_data: DocumentDataRequirement[];
  optional_document_data: DocumentDataRequirement[];
  supported_data_methods: string[];
  setup_instructions: string;
  documentation_url?: string;
}

export interface AgentConfiguration {
  id: string;
  agent_type_id: string;
  user_id: string;
  display_name: string;
  description?: string;
  is_enabled: boolean;
  api_base_url?: string;
  api_version?: string;
  environment: 'sandbox' | 'production';
  required_fields: Record<string, any>;
  optional_fields: Record<string, any>;
  secret_key_refs: Record<string, string>;
  data_source_config: Record<string, any>;
  agent_settings: Record<string, any>;
  is_validated: boolean;
  last_validated_at?: string;
  validation_result?: {
    errors: string[];
    warnings: string[];
    validated_at: string;
  };
}

export interface DataCollectionMethod {
  id: 'inline_upload' | 'navigate_upload' | 'ai_assist' | 'manual_entry' | 'extracted_data';
  label: string;
  description: string;
  icon: string;
}

export const DATA_COLLECTION_METHODS: DataCollectionMethod[] = [
  {
    id: 'extracted_data',
    label: 'Use Extracted Data',
    description: 'Use data already extracted from the current document',
    icon: '📄'
  },
  {
    id: 'inline_upload',
    label: 'Upload Document Here',
    description: 'Upload a document inline to extract missing data',
    icon: '📎'
  },
  {
    id: 'navigate_upload',
    label: 'Go to Upload',
    description: 'Navigate to the document upload section',
    icon: '🔗'
  },
  {
    id: 'ai_assist',
    label: 'AI Assist',
    description: 'Let AI help fill in missing information',
    icon: '🤖'
  },
  {
    id: 'manual_entry',
    label: 'Manual Entry',
    description: 'Enter the required information manually',
    icon: '✏️'
  }
];

interface UseAgentConfigurationReturn {
  requirements: AgentDataRequirements | null;
  configuration: AgentConfiguration | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRequirements: (agentTypeId: string) => Promise<void>;
  fetchAllRequirements: () => Promise<AgentDataRequirements[]>;
  saveConfiguration: (agentTypeId: string, config: Partial<AgentConfiguration>) => Promise<boolean>;
  validateConfiguration: (agentTypeId: string) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;
  testConnection: (agentTypeId: string) => Promise<{ success: boolean; message: string; details: any }>;
  
  // Data collection
  getMissingData: (agentTypeId: string, extractedData: Record<string, any>) => DocumentDataRequirement[];
  getSupportedMethods: (agentTypeId: string) => DataCollectionMethod[];
}

export function useAgentConfiguration(): UseAgentConfigurationReturn {
  const [requirements, setRequirements] = useState<AgentDataRequirements | null>(null);
  const [configuration, setConfiguration] = useState<AgentConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = configuration?.is_validated ?? false;

  const fetchRequirements = useCallback(async (agentTypeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-config-manager', {
        body: { action: 'get', agentTypeId }
      });

      if (fnError) throw fnError;

      if (data?.requirements) {
        setRequirements(data.requirements as AgentDataRequirements);
      }
      if (data?.configuration) {
        setConfiguration(data.configuration as AgentConfiguration);
      }
    } catch (err) {
      console.error('[useAgentConfiguration] Error fetching requirements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch requirements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllRequirements = useCallback(async (): Promise<AgentDataRequirements[]> => {
    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-config-manager', {
        body: { action: 'list-requirements' }
      });

      if (fnError) throw fnError;
      return (data?.requirements || []) as AgentDataRequirements[];
    } catch (err) {
      console.error('[useAgentConfiguration] Error fetching all requirements:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfiguration = useCallback(async (
    agentTypeId: string,
    config: Partial<AgentConfiguration>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-config-manager', {
        body: {
          action: 'save',
          agentTypeId,
          configuration: {
            apiBaseUrl: config.api_base_url,
            apiVersion: config.api_version,
            environment: config.environment,
            nonSecretFields: config.required_fields,
            dataSourceConfig: config.data_source_config,
            agentSettings: config.agent_settings
          }
        }
      });

      if (fnError) throw fnError;

      if (data?.configuration) {
        setConfiguration(data.configuration as AgentConfiguration);
        toast.success('Configuration saved');
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useAgentConfiguration] Error saving configuration:', err);
      toast.error('Failed to save configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateConfiguration = useCallback(async (
    agentTypeId: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-config-manager', {
        body: { action: 'validate', agentTypeId }
      });

      if (fnError) throw fnError;

      return {
        isValid: data?.isValid ?? false,
        errors: data?.errors || [],
        warnings: data?.warnings || []
      };
    } catch (err) {
      console.error('[useAgentConfiguration] Error validating configuration:', err);
      return { isValid: false, errors: ['Validation failed'], warnings: [] };
    }
  }, []);

  const testConnection = useCallback(async (
    agentTypeId: string
  ): Promise<{ success: boolean; message: string; details: any }> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('agent-config-manager', {
        body: { action: 'test', agentTypeId }
      });

      if (fnError) throw fnError;

      return data?.testResult || { success: false, message: 'No test result', details: {} };
    } catch (err) {
      console.error('[useAgentConfiguration] Error testing connection:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Test failed', details: {} };
    }
  }, []);

  const getMissingData = useCallback((
    agentTypeId: string,
    extractedData: Record<string, any>
  ): DocumentDataRequirement[] => {
    if (!requirements) return [];

    const missing: DocumentDataRequirement[] = [];
    
    for (const req of requirements.required_document_data) {
      const value = extractedData[req.field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missing.push(req);
      }
    }

    return missing;
  }, [requirements]);

  const getSupportedMethods = useCallback((agentTypeId: string): DataCollectionMethod[] => {
    if (!requirements) return DATA_COLLECTION_METHODS;

    return DATA_COLLECTION_METHODS.filter(method =>
      requirements.supported_data_methods.includes(method.id)
    );
  }, [requirements]);

  return {
    requirements,
    configuration,
    isConfigured,
    isLoading,
    error,
    fetchRequirements,
    fetchAllRequirements,
    saveConfiguration,
    validateConfiguration,
    testConnection,
    getMissingData,
    getSupportedMethods
  };
}

export default useAgentConfiguration;
