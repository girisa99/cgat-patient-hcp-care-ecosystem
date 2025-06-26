
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiIntegrationDetails {
  id: string;
  name: string;
  description?: string;
  base_url?: string;
  version: string;
  category: string;
  endpoints: Array<{
    id: string;
    name: string;
    method: string;
    url: string;
    description: string;
    is_public: boolean;
    authentication?: any;
    request_schema?: any;
    response_schema?: any;
    example_request?: any;
    example_response?: any;
    rate_limit_override?: any;
  }>;
  rls_policies: Array<{
    id: string;
    policy_name: string;
    table_name: string;
    operation: string;
    condition: string;
    description?: string;
  }>;
  data_mappings: Array<{
    id: string;
    source_field: string;
    target_field: string;
    target_table: string;
    transformation?: string;
    validation?: string;
  }>;
  database_schema: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        description?: string;
        default?: string;
      }>;
      foreign_keys: Array<{
        column: string;
        references_table: string;
        references_column: string;
      }>;
      indexes?: Array<{
        name: string;
        columns: string[];
        unique: boolean;
      }>;
    }>;
  };
  security_config: {
    encryption_methods: string[];
    authentication_methods: string[];
    authorization_policies: string[];
    data_protection: string[];
  };
  rate_limits: {
    requests_per_hour: number;
    requests_per_day: number;
    burst_limit: number;
    rate_limit_headers: string[];
  };
  architecture: {
    design_principles: string[];
    patterns: string[];
    scalability: string[];
    reliability: string[];
  };
}

export const usePublishedApiDetails = () => {
  const getApiDetails = async (apiId: string): Promise<ApiIntegrationDetails | null> => {
    console.log('🔍 DETAILED DEBUG: Starting API details fetch for:', apiId);

    try {
      // Step 1: Get the external API registry entry
      console.log('📋 Step 1: Fetching external API registry entry...');
      const { data: externalApi, error: externalError } = await supabase
        .from('external_api_registry')
        .select('*')
        .eq('id', apiId)
        .single();

      if (externalError) {
        console.error('❌ Error fetching external API registry:', externalError);
        return null;
      }

      console.log('✅ External API Registry Data:', {
        id: externalApi.id,
        external_name: externalApi.external_name,
        internal_api_id: externalApi.internal_api_id,
        status: externalApi.status,
        visibility: externalApi.visibility
      });

      // Step 2: Fetch external API endpoints
      console.log('📋 Step 2: Fetching external API endpoints...');
      const { data: externalEndpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .eq('external_api_id', apiId);

      console.log('🔗 External API Endpoints Query Result:', {
        error: endpointsError,
        count: externalEndpoints?.length || 0,
        endpoints: externalEndpoints
      });

      // Step 3: Check internal API if linked
      let internalApi = null;
      if (externalApi.internal_api_id) {
        console.log('📋 Step 3: Checking internal API registry...');
        const { data: internalApiData, error: internalError } = await supabase
          .from('api_integration_registry')
          .select('*')
          .eq('id', externalApi.internal_api_id)
          .single();

        console.log('🔗 Internal API Registry Data:', {
          error: internalError,
          data: internalApiData ? {
            id: internalApiData.id,
            name: internalApiData.name,
            endpoints_count: internalApiData.endpoints_count,
            rls_policies_count: internalApiData.rls_policies_count,
            data_mappings_count: internalApiData.data_mappings_count
          } : null
        });

        internalApi = internalApiData;
      }

      // Safely access rate_limits JSON data
      const rateLimitsData = externalApi.rate_limits as any;
      const defaultRequests = 1000;
      const requestsPerHour = rateLimitsData?.requests || defaultRequests;

      // Build endpoints from external_api_endpoints
      const realEndpoints = (externalEndpoints || []).map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.summary || endpoint.external_path || 'Unnamed endpoint',
        method: endpoint.method?.toUpperCase() || 'GET',
        url: endpoint.external_path || '/api/endpoint',
        description: endpoint.description || endpoint.summary || 'No description available',
        is_public: endpoint.is_public || false,
        authentication: endpoint.requires_authentication ? {
          type: 'bearer',
          required: true,
          description: 'Bearer token authentication required'
        } : {
          type: 'none',
          required: false,
          description: 'No authentication required'
        },
        request_schema: endpoint.request_schema || null,
        response_schema: endpoint.response_schema || null,
        example_request: endpoint.example_request || null,
        example_response: endpoint.example_response || null,
        rate_limit_override: endpoint.rate_limit_override || null
      }));

      console.log('🔗 Final endpoints array:', {
        count: realEndpoints.length,
        endpoints: realEndpoints
      });

      // Get real database schema from the edge function
      const realDatabaseSchema = await getRealDatabaseSchema();

      console.log('📊 Final API details summary:', {
        api_id: externalApi.id,
        api_name: externalApi.external_name,
        endpoints_count: realEndpoints.length,
        database_tables_count: realDatabaseSchema.tables.length,
        internal_api_linked: !!externalApi.internal_api_id,
        internal_api_found: !!internalApi
      });

      // Build the API details from real database data
      return {
        id: externalApi.id,
        name: externalApi.external_name,
        description: externalApi.external_description || 'No description provided',
        base_url: externalApi.base_url || `${window.location.origin}/api/v1`,
        version: externalApi.version,
        category: externalApi.category || 'healthcare',
        endpoints: realEndpoints,
        rls_policies: [], // Will be populated from actual database policies
        data_mappings: [], // Will be populated from actual database mappings
        database_schema: realDatabaseSchema,
        security_config: {
          encryption_methods: ['TLS 1.3 for data in transit', 'Database encryption at rest'],
          authentication_methods: externalApi.authentication_methods || ['api_key'],
          authorization_policies: ['Row-Level Security (RLS)'],
          data_protection: ['HIPAA compliance for healthcare data']
        },
        rate_limits: {
          requests_per_hour: requestsPerHour,
          requests_per_day: requestsPerHour * 24,
          burst_limit: Math.floor(requestsPerHour * 0.1),
          rate_limit_headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
        },
        architecture: {
          design_principles: ['RESTful API design', 'Healthcare data standards'],
          patterns: ['Repository pattern', 'Authentication middleware'],
          scalability: ['Horizontal scaling', 'Database optimization'],
          reliability: ['99.9% uptime target', 'Automated backups']
        }
      };
    } catch (error) {
      console.error('❌ Critical error in getApiDetails:', error);
      return null;
    }
  };

  return { getApiDetails };
};

// Get real database schema information using the edge function
async function getRealDatabaseSchema() {
  console.log('📋 Fetching database schema from edge function...');
  
  const keyTables = ['profiles', 'facilities', 'external_api_registry'];
  const tables = [];
  
  for (const tableName of keyTables) {
    try {
      console.log(`🔍 Fetching schema for table: ${tableName}`);
      const { data: response, error } = await supabase.functions.invoke('get-table-info', {
        body: { tableName }
      });
      
      console.log(`📊 Schema response for ${tableName}:`, {
        error: error,
        columns_count: response?.columns?.length || 0,
        columns: response?.columns
      });
      
      if (response && response.columns && Array.isArray(response.columns)) {
        tables.push({
          name: tableName,
          columns: response.columns.map((col: any) => ({
            name: col.column_name || col.name,
            type: col.data_type || col.type,
            nullable: col.is_nullable === 'YES',
            description: `${tableName} column: ${col.column_name || col.name}`,
            default: col.column_default || col.default
          })),
          foreign_keys: [],
          indexes: []
        });
      }
    } catch (tableError) {
      console.log(`❌ Error fetching table ${tableName}:`, tableError);
    }
  }

  console.log('📊 Final database schema:', {
    tables_count: tables.length,
    tables: tables.map(t => ({ name: t.name, columns_count: t.columns.length }))
  });

  return { tables };
}
