/**
 * AGENT API INTEGRATION HOOK
 * Manages API access for AI agents based on user roles and field mappings
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedApiSuite, UserRole } from './useRoleBasedApiSuite';

export interface AgentApiConfiguration {
  id: string;
  agent_id: string;
  api_service_id: string;
  user_role: UserRole;
  enabled_endpoints: string[];
  field_access_rules: Record<string, any>;
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  data_access_scope: {
    tables: string[];
    columns: string[];
    filters: Record<string, any>;
  };
  transformation_rules: Record<string, string>;
  security_policies: {
    require_approval: boolean;
    audit_all_requests: boolean;
    mask_sensitive_data: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useAgentApiIntegration = (agentId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    apiAccessConfigs, 
    fieldMappings, 
    getApisByRole, 
    getFieldMappingsByTable 
  } = useRoleBasedApiSuite();

  // Fetch agent API configurations
  const { data: agentConfigs = [], isLoading } = useQuery({
    queryKey: ['agent-api-configs', agentId],
    queryFn: async (): Promise<AgentApiConfiguration[]> => {
      let query = supabase
        .from('agent_api_configurations')
        .select('*')
        .order('created_at desc');
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data as any[])?.map(item => ({
        id: item.id,
        agent_id: item.agent_id,
        api_service_id: item.api_service_id,
        user_role: item.user_role,
        enabled_endpoints: item.enabled_endpoints || [],
        field_access_rules: item.field_access_rules || {},
        rate_limits: item.rate_limits || { requests_per_minute: 100, requests_per_hour: 1000 },
        data_access_scope: item.data_access_scope || { tables: [], columns: [], filters: {} },
        transformation_rules: item.transformation_rules || {},
        security_policies: item.security_policies || { require_approval: true, audit_all_requests: true, mask_sensitive_data: false },
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    },
    enabled: !!agentId || agentId === undefined
  });

  // Create agent API configuration
  const createConfigMutation = useMutation({
    mutationFn: async (config: Omit<AgentApiConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('agent_api_configurations')
        .insert(config as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-api-configs'] });
      toast({
        title: "Agent API Configuration Created",
        description: "API integration has been configured for the agent.",
      });
    }
  });

  // Update agent API configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<AgentApiConfiguration> & { id: string }) => {
      const { data, error } = await supabase
        .from('agent_api_configurations')
        .update(config as any)
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-api-configs'] });
      toast({
        title: "Agent API Configuration Updated",
        description: "API integration settings have been updated.",
      });
    }
  });

  // Generate agent-specific API access based on role
  const generateAgentApiAccess = (role: UserRole, tablesToAccess: string[] = []) => {
    const allowedApis = getApisByRole(role);
    const relevantMappings = tablesToAccess.flatMap(table => 
      getFieldMappingsByTable(table, role)
    );

    return {
      apis: allowedApis.map(api => ({
        api_service_id: api?.id,
        name: api?.name,
        access_level: api?.accessConfig?.access_level,
        endpoints: api?.accessConfig?.endpoints_allowed || [],
        rate_limit: api?.accessConfig?.rate_limit,
        sandbox_access: api?.accessConfig?.sandbox_access,
        production_access: api?.accessConfig?.production_access
      })),
      field_mappings: relevantMappings.map(mapping => ({
        table: mapping.table_name,
        api_field: mapping.api_field,
        database_column: mapping.database_column,
        data_type: mapping.data_type,
        required: mapping.is_required,
        transformation: mapping.transformation_rule,
        validation: mapping.validation_rule
      })),
      permissions: {
        can_read: allowedApis.some(api => 
          ['read', 'write', 'admin'].includes(api?.accessConfig?.access_level || '')
        ),
        can_write: allowedApis.some(api => 
          ['write', 'admin'].includes(api?.accessConfig?.access_level || '')
        ),
        can_admin: allowedApis.some(api => 
          api?.accessConfig?.access_level === 'admin'
        ),
        sandbox_enabled: allowedApis.some(api => api?.accessConfig?.sandbox_access),
        production_enabled: allowedApis.some(api => api?.accessConfig?.production_access)
      }
    };
  };

  // Configure agent for specific healthcare workflows
  const configureHealthcareAgentApis = async (
    agentId: string, 
    role: UserRole, 
    workflowType: 'onboarding' | 'patient_care' | 'treatment_assessment' | 'insurance_processing'
  ) => {
    const workflowTableMap = {
      onboarding: ['treatment_center_onboarding', 'profiles'],
      patient_care: ['enrollment_instances', 'treatment_assessments'],
      treatment_assessment: ['treatment_assessments', 'insurance_coverages'],
      insurance_processing: ['insurance_coverages', 'enrollment_instances']
    };

    const tables = workflowTableMap[workflowType] || [];
    const apiAccess = generateAgentApiAccess(role, tables);

    const configuration: Omit<AgentApiConfiguration, 'id' | 'created_at' | 'updated_at'> = {
      agent_id: agentId,
      api_service_id: 'healthcare_workflow_apis',
      user_role: role,
      enabled_endpoints: apiAccess.apis.flatMap(api => api.endpoints),
      field_access_rules: {
        allowed_tables: tables,
        field_mappings: apiAccess.field_mappings,
        transformation_rules: apiAccess.field_mappings.reduce((acc, mapping) => {
          if (mapping.transformation) {
            acc[mapping.api_field] = mapping.transformation;
          }
          return acc;
        }, {} as Record<string, string>)
      },
      rate_limits: {
        requests_per_minute: role === 'superAdmin' ? 1000 : 100,
        requests_per_hour: role === 'superAdmin' ? 10000 : 1000
      },
      data_access_scope: {
        tables,
        columns: apiAccess.field_mappings.map(m => m.database_column),
        filters: {
          role_based: true,
          workflow_type: workflowType
        }
      },
      transformation_rules: apiAccess.field_mappings.reduce((acc, mapping) => {
        if (mapping.transformation) {
          acc[mapping.database_column] = mapping.transformation;
        }
        return acc;
      }, {} as Record<string, string>),
      security_policies: {
        require_approval: role !== 'superAdmin',
        audit_all_requests: true,
        mask_sensitive_data: workflowType === 'patient_care'
      }
    };

    return createConfigMutation.mutateAsync(configuration);
  };

  // Validate agent API access for specific operation
  const validateAgentApiAccess = (agentConfig: AgentApiConfiguration, operation: {
    endpoint: string;
    table: string;
    action: 'read' | 'write' | 'delete';
  }) => {
    const hasEndpointAccess = agentConfig.enabled_endpoints.includes(operation.endpoint);
    const hasTableAccess = agentConfig.data_access_scope.tables.includes(operation.table);
    
    const accessLevel = apiAccessConfigs.find(
      config => config.role === agentConfig.user_role
    )?.access_level;

    const hasActionAccess = 
      operation.action === 'read' ? ['read', 'write', 'admin'].includes(accessLevel || '') :
      operation.action === 'write' ? ['write', 'admin'].includes(accessLevel || '') :
      operation.action === 'delete' ? accessLevel === 'admin' : false;

    return {
      allowed: hasEndpointAccess && hasTableAccess && hasActionAccess,
      reasons: {
        endpoint_access: hasEndpointAccess,
        table_access: hasTableAccess,
        action_access: hasActionAccess
      }
    };
  };

  return {
    // Data
    agentConfigs,
    
    // Loading states
    isLoading,
    isCreating: createConfigMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    
    // Mutations
    createConfig: createConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    
    // Utilities
    generateAgentApiAccess,
    configureHealthcareAgentApis,
    validateAgentApiAccess,
    
    // Agent-specific helpers
    getAgentApisByRole: (role: UserRole) => getApisByRole(role),
    getAgentFieldMappings: (tables: string[], role: UserRole) => 
      tables.flatMap(table => getFieldMappingsByTable(table, role)),
    
    // Meta
    meta: {
      total_configurations: agentConfigs.length,
      roles_configured: [...new Set(agentConfigs.map(c => c.user_role))],
      apis_integrated: [...new Set(agentConfigs.map(c => c.api_service_id))]
    }
  };
};