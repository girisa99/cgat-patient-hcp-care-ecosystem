import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { NODE_SCHEMAS } from '@/components/workflow-builder/nodes/DynamicNodeConfigurator';

export interface CustomNodeSchema {
  id?: string;
  node_type: string;
  display_name: string;
  description: string;
  categories: string[];
  fields: any[];
  scenarios?: string[];
  capabilities?: string[];
  channels?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  node_type: string;
  template_config: Record<string, any>;
  category: string;
  use_case: string;
}

export const useNodeSchemaRegistry = () => {
  const [customSchemas, setCustomSchemas] = useState<CustomNodeSchema[]>([]);
  const [nodeTemplates, setNodeTemplates] = useState<NodeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  // Fetch custom node schemas from database
  const fetchCustomSchemas = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement when custom_node_schemas table is created
      // For now, use empty array
      setCustomSchemas([]);
    } catch (error: any) {
      console.error('Failed to fetch custom schemas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch node templates
  const fetchNodeTemplates = useCallback(async () => {
    try {
      // TODO: Implement when node_templates table is created
      // For now, use empty array
      setNodeTemplates([]);
    } catch (error: any) {
      console.error('Failed to fetch node templates:', error);
    }
  }, []);

  // Create custom node schema
  const createCustomSchema = useCallback(async (schema: Omit<CustomNodeSchema, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // TODO: Implement database save when custom_node_schemas table exists
      const newSchema: CustomNodeSchema = {
        ...schema,
        id: `custom_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCustomSchemas(prev => [newSchema, ...prev]);
      showSuccess('Custom node schema created');
      return newSchema;
    } catch (error: any) {
      showError(error.message || 'Failed to create custom schema');
      throw error;
    }
  }, [showSuccess, showError]);

  // Update custom node schema
  const updateCustomSchema = useCallback(async (id: string, updates: Partial<CustomNodeSchema>) => {
    try {
      setCustomSchemas(prev => prev.map(schema => 
        schema.id === id ? { ...schema, ...updates, updated_at: new Date().toISOString() } : schema
      ));
      showSuccess('Schema updated');
      return updates;
    } catch (error: any) {
      showError(error.message || 'Failed to update schema');
      throw error;
    }
  }, [showSuccess, showError]);

  // Create node template
  const createNodeTemplate = useCallback(async (template: Omit<NodeTemplate, 'id'>) => {
    try {
      // TODO: Implement database save when node_templates table exists
      const newTemplate: NodeTemplate = {
        ...template,
        id: `template_${Date.now()}`
      };
      
      setNodeTemplates(prev => [...prev, newTemplate]);
      showSuccess('Node template created');
      return newTemplate;
    } catch (error: any) {
      showError(error.message || 'Failed to create template');
      throw error;
    }
  }, [showSuccess, showError]);

  // Get all available schemas (built-in + custom)
  const getAllSchemas = useCallback(() => {
    const builtInSchemas = Object.values(NODE_SCHEMAS).map(schema => ({
      node_type: schema.nodeType,
      display_name: schema.displayName,
      description: schema.description,
      categories: schema.categories,
      fields: schema.fields,
      scenarios: schema.scenarios,
      capabilities: schema.capabilities,
      channels: schema.channels,
      is_active: true,
      isBuiltIn: true
    }));

    return [...builtInSchemas, ...customSchemas];
  }, [customSchemas]);

  // Get schema by node type
  const getSchemaByType = useCallback((nodeType: string) => {
    // Check built-in schemas first
    if (NODE_SCHEMAS[nodeType]) {
      return NODE_SCHEMAS[nodeType];
    }

    // Check custom schemas
    const customSchema = customSchemas.find(schema => schema.node_type === nodeType);
    if (customSchema) {
      return {
        nodeType: customSchema.node_type,
        displayName: customSchema.display_name,
        description: customSchema.description,
        categories: customSchema.categories,
        fields: customSchema.fields,
        scenarios: customSchema.scenarios,
        capabilities: customSchema.capabilities,
        channels: customSchema.channels
      };
    }

    return null;
  }, [customSchemas]);

  // Generate node configuration from template
  const applyTemplate = useCallback((template: NodeTemplate, customizations?: Record<string, any>) => {
    const baseConfig = { ...template.template_config };
    
    // Apply any customizations
    if (customizations) {
      Object.keys(customizations).forEach(key => {
        if (customizations[key] !== undefined) {
          baseConfig[key] = customizations[key];
        }
      });
    }

    return {
      ...baseConfig,
      nodeType: template.node_type,
      templateId: template.id,
      templateName: template.name,
      configured_at: new Date().toISOString()
    };
  }, []);

  // Auto-detect node type from configuration
  const detectNodeType = useCallback((config: Record<string, any>) => {
    // Check for specific indicators in the configuration
    if (config.voice_provider || config.speech_speed) return 'voice-agent';
    if (config.sales_approach || config.products) return 'sales-agent';
    if (config.input_format || config.validation_rules) return 'data-processor';
    if (config.channels && config.capabilities) return 'customer-support-agent';
    
    // Default fallback
    return 'customer-support-agent';
  }, []);

  // Validate node configuration against schema
  const validateConfiguration = useCallback((nodeType: string, config: Record<string, any>) => {
    const schema = getSchemaByType(nodeType);
    if (!schema) return { valid: false, errors: ['Unknown node type'] };

    const errors: string[] = [];
    const requiredFields = schema.fields?.filter(field => field.required) || [];
    
    requiredFields.forEach(field => {
      if (!(field.name in config) || config[field.name] === null || config[field.name] === undefined || config[field.name] === '') {
        errors.push(`Missing required field: ${field.label || field.name}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }, [getSchemaByType]);

  useEffect(() => {
    fetchCustomSchemas();
    fetchNodeTemplates();
  }, [fetchCustomSchemas, fetchNodeTemplates]);

  return {
    // Data
    customSchemas,
    nodeTemplates,
    allSchemas: getAllSchemas(),
    
    // State
    isLoading,
    
    // Schema operations
    createCustomSchema,
    updateCustomSchema,
    getSchemaByType,
    getAllSchemas,
    
    // Template operations
    createNodeTemplate,
    applyTemplate,
    
    // Utilities
    detectNodeType,
    validateConfiguration,
    
    // Refresh
    refetch: () => {
      fetchCustomSchemas();
      fetchNodeTemplates();
    }
  };
};