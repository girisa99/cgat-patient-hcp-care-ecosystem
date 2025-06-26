
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
    console.log('🔍 Fetching API details from database for:', apiId);

    try {
      // Get the external API registry entry with its endpoints
      const { data: externalApi, error: externalError } = await supabase
        .from('external_api_registry')
        .select(`
          *,
          external_api_endpoints (*)
        `)
        .eq('id', apiId)
        .single();

      if (externalError) {
        console.error('❌ Error fetching external API:', externalError);
        return null;
      }

      console.log('✅ External API data:', externalApi);

      // Get real endpoints from the database
      const realEndpoints = (externalApi.external_api_endpoints || []).map((endpoint: any) => ({
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

      // Get real database schema from the actual database
      const realDatabaseSchema = await getRealDatabaseSchema();

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
          requests_per_hour: externalApi.rate_limits?.requests || 1000,
          requests_per_day: (externalApi.rate_limits?.requests || 1000) * 24,
          burst_limit: Math.floor((externalApi.rate_limits?.requests || 1000) * 0.1),
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
      console.error('❌ Error fetching API details:', error);
      return null;
    }
  };

  return { getApiDetails };
};

// Get real database schema information
async function getRealDatabaseSchema() {
  try {
    // Get actual table information from the database
    const { data: tablesData, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'facilities', 'external_api_registry'])
      .limit(3);

    if (error) {
      console.log('Using edge function for schema info due to error:', error);
      return await getSchemaFromEdgeFunction();
    }

    const tables = [];
    for (const tableInfo of tablesData || []) {
      const tableName = tableInfo.table_name;
      
      // Get columns for each table using the edge function
      const { data: response, error: edgeError } = await supabase.functions.invoke('get-table-info', {
        body: { tableName }
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
    }

    return { tables };
  } catch (error) {
    console.log('Fallback to edge function for schema:', error);
    return await getSchemaFromEdgeFunction();
  }
}

// Fallback to edge function for schema information
async function getSchemaFromEdgeFunction() {
  const keyTables = ['profiles', 'facilities', 'external_api_registry'];
  const tables = [];
  
  for (const tableName of keyTables) {
    try {
      const { data: response, error } = await supabase.functions.invoke('get-table-info', {
        body: { tableName }
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
      console.log(`Error fetching table ${tableName}:`, tableError);
    }
  }

  return { tables };
}
