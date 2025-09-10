/**
 * ROLE-BASED API SUITE MANAGEMENT
 * Manages role-specific API access, field mappings, and agent integrations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMasterApiServices } from './useMasterApiServices';
import { useRoles } from './useRoles';

export type UserRole = 'superAdmin' | 'onboardingTeam' | 'patientCaregiver' | 'demoUser';

export interface ApiAccessConfig {
  id: string;
  role: UserRole;
  api_service_id: string;
  access_level: 'read' | 'write' | 'admin' | 'none';
  field_mappings: Record<string, any>;
  endpoints_allowed: string[];
  rate_limit?: number;
  sandbox_access: boolean;
  production_access: boolean;
  agent_integration_enabled: boolean;
  postman_collection_access: boolean;
  testing_permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiFieldMapping {
  id: string;
  table_name: string;
  api_field: string;
  database_column: string;
  data_type: string;
  is_required: boolean;
  transformation_rule?: string;
  validation_rule?: string;
  role_visibility: UserRole[];
}

export const useRoleBasedApiSuite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { apiServices } = useMasterApiServices();
  const { roles } = useRoles();

  // Fetch role-based API access configurations
  const { data: apiAccessConfigs = [], isLoading: isLoadingAccess } = useQuery({
    queryKey: ['role-api-access'],
    queryFn: async (): Promise<ApiAccessConfig[]> => {
      const { data, error } = await supabase
        .from('role_api_access')
        .select('*')
        .order('role, api_service_id');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch field mappings for updated column structure
  const { data: fieldMappings = [], isLoading: isLoadingMappings } = useQuery({
    queryKey: ['api-field-mappings'],
    queryFn: async (): Promise<ApiFieldMapping[]> => {
      const { data, error } = await supabase
        .from('api_field_mappings')
        .select('*')
        .order('table_name, api_field');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update API access configuration
  const updateApiAccessMutation = useMutation({
    mutationFn: async (config: Partial<ApiAccessConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('role_api_access')
        .update(config)
        .eq('id', config.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-api-access'] });
      toast({
        title: "API Access Updated",
        description: "Role-based API access has been updated successfully.",
      });
    }
  });

  // Create field mapping for new columns
  const createFieldMappingMutation = useMutation({
    mutationFn: async (mapping: Omit<ApiFieldMapping, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('api_field_mappings')
        .insert(mapping)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-field-mappings'] });
      toast({
        title: "Field Mapping Created",
        description: "New API field mapping has been created.",
      });
    }
  });

  // Get APIs accessible by specific role
  const getApisByRole = (role: UserRole) => {
    const roleConfigs = apiAccessConfigs.filter(config => config.role === role);
    return roleConfigs.map(config => {
      const apiService = apiServices.find(api => api.id === config.api_service_id);
      return {
        ...apiService,
        accessConfig: config
      };
    });
  };

  // Get field mappings by table and role
  const getFieldMappingsByTable = (tableName: string, role?: UserRole) => {
    return fieldMappings.filter(mapping => 
      mapping.table_name === tableName &&
      (!role || mapping.role_visibility.includes(role))
    );
  };

  // Generate role-specific API documentation
  const generateRoleApiDocs = (role: UserRole) => {
    const roleApis = getApisByRole(role);
    
    return {
      role,
      total_apis: roleApis.length,
      internal_apis: roleApis.filter(api => api?.type === 'internal').length,
      external_apis: roleApis.filter(api => api?.type === 'external').length,
      sandbox_enabled: roleApis.filter(api => api?.accessConfig?.sandbox_access).length,
      production_enabled: roleApis.filter(api => api?.accessConfig?.production_access).length,
      agent_integration_enabled: roleApis.filter(api => api?.accessConfig?.agent_integration_enabled).length,
      postman_access: roleApis.filter(api => api?.accessConfig?.postman_collection_access).length,
      apis: roleApis
    };
  };

  // Update field mappings for new column structure
  const syncFieldMappingsWithSchema = async () => {
    const tablesToSync = [
      'treatment_center_onboarding',
      'enrollment_instances', 
      'insurance_coverages',
      'treatment_assessments'
    ];

    const mappingUpdates = [];
    
    for (const table of tablesToSync) {
      // Get current schema info for the table
      const { data: schemaInfo } = await supabase.rpc('get_complete_schema_info');
      const tableSchema = schemaInfo?.find((t: any) => t.table_name === table);
      
      if (tableSchema?.columns) {
        for (const column of tableSchema.columns) {
          // Check if mapping exists
          const existingMapping = fieldMappings.find(
            m => m.table_name === table && m.database_column === column.column_name
          );
          
          if (!existingMapping) {
            mappingUpdates.push({
              table_name: table,
              api_field: column.column_name,
              database_column: column.column_name,
              data_type: column.data_type,
              is_required: !column.is_nullable,
              role_visibility: ['superAdmin', 'onboardingTeam'] as UserRole[]
            });
          }
        }
      }
    }

    return mappingUpdates;
  };

  // Generate Postman collection for role
  const generatePostmanCollection = (role: UserRole) => {
    const roleApis = getApisByRole(role).filter(api => api?.accessConfig?.postman_collection_access);
    
    return {
      info: {
        name: `${role} API Collection`,
        description: `API collection for ${role} role with appropriate access levels`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: roleApis.map(api => ({
        name: api?.name || 'Unknown API',
        description: api?.description || '',
        item: api?.accessConfig?.endpoints_allowed?.map(endpoint => ({
          name: endpoint,
          request: {
            method: "GET",
            header: [
              {
                key: "Authorization",
                value: "Bearer {{api_key}}",
                type: "text"
              }
            ],
            url: {
              raw: `${api?.base_url}${endpoint}`,
              host: [api?.base_url],
              path: [endpoint]
            }
          }
        })) || []
      }))
    };
  };

  return {
    // Data
    apiAccessConfigs,
    fieldMappings,
    
    // Loading states
    isLoading: isLoadingAccess || isLoadingMappings,
    
    // Role-specific queries
    getApisByRole,
    getFieldMappingsByTable,
    generateRoleApiDocs,
    generatePostmanCollection,
    
    // Mutations
    updateApiAccess: updateApiAccessMutation.mutate,
    createFieldMapping: createFieldMappingMutation.mutate,
    syncFieldMappingsWithSchema,
    
    // Loading states for mutations
    isUpdatingAccess: updateApiAccessMutation.isPending,
    isCreatingMapping: createFieldMappingMutation.isPending,
    
    // Utilities
    getRolePermissions: (role: UserRole) => {
      const configs = apiAccessConfigs.filter(config => config.role === role);
      return {
        canAccessSandbox: configs.some(c => c.sandbox_access),
        canAccessProduction: configs.some(c => c.production_access),
        canUseAgents: configs.some(c => c.agent_integration_enabled),
        canAccessPostman: configs.some(c => c.postman_collection_access),
        totalApis: configs.length
      };
    },
    
    // Meta
    meta: {
      totalConfigs: apiAccessConfigs.length,
      totalMappings: fieldMappings.length,
      rolesWithAccess: [...new Set(apiAccessConfigs.map(c => c.role))],
      tablesWithMappings: [...new Set(fieldMappings.map(m => m.table_name))]
    }
  };
};