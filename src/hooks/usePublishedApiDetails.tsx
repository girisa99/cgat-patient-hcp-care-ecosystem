
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
    access_control: {
      rls_enabled: boolean;
      role_based_access: boolean;
      facility_level_access: boolean;
      audit_logging: boolean;
    };
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
    technology_stack: string[];
    deployment: string[];
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

      // Step 2: Fetch actual external API endpoints from the external_api_endpoints table
      console.log('📋 Step 2: Fetching external API endpoints...');
      const { data: endpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .eq('external_api_id', apiId);

      if (endpointsError) {
        console.warn('⚠️ Error fetching external API endpoints:', endpointsError);
      }

      // Transform the endpoints data to match our interface
      const transformedEndpoints = (endpoints || []).map(endpoint => ({
        id: endpoint.id,
        name: endpoint.summary || endpoint.external_path,
        method: endpoint.method,
        url: endpoint.external_path,
        description: endpoint.description || `${endpoint.method} ${endpoint.external_path}`,
        is_public: endpoint.is_public || false,
        authentication: endpoint.requires_authentication ? {
          type: 'bearer',
          required: true,
          description: 'Bearer token authentication required',
          token_format: 'JWT'
        } : {
          type: 'none',
          required: false,
          description: 'No authentication required'
        },
        request_schema: endpoint.request_schema || generateDefaultRequestSchema(endpoint.method),
        response_schema: endpoint.response_schema || generateDefaultResponseSchema(),
        example_request: endpoint.example_request || generateExampleRequest(endpoint.method, endpoint.external_path),
        example_response: endpoint.example_response || generateExampleResponse(),
        rate_limit_override: endpoint.rate_limit_override
      }));

      // Step 3: Generate comprehensive realistic RLS policies for external API context
      const externalRlsPolicies = [
        {
          id: 'external_api_access_policy',
          policy_name: 'external_api_access_policy',
          table_name: 'api_access_logs',
          operation: 'INSERT',
          condition: 'api_key IS NOT NULL AND rate_limit_check(api_key) = true',
          description: 'External API calls must have valid API keys and pass rate limiting checks'
        },
        {
          id: 'external_api_usage_tracking',
          policy_name: 'external_api_usage_tracking',
          table_name: 'api_usage_analytics',
          operation: 'SELECT',
          condition: 'user_owns_api_key(auth.uid(), api_key_id)',
          description: 'Users can only view usage analytics for their own API keys'
        },
        {
          id: 'external_api_rate_limiting',
          policy_name: 'external_api_rate_limiting',
          table_name: 'api_rate_limits',
          operation: 'SELECT',
          condition: 'api_key_belongs_to_user(auth.uid(), api_key)',
          description: 'Rate limit information is only accessible to API key owners'
        }
      ];

      // Step 4: Generate data mappings for external API integration
      const externalDataMappings = [
        {
          id: 'external_request_mapping',
          source_field: 'external_user_reference',
          target_field: 'internal_user_id',
          target_table: 'user_mappings',
          transformation: 'external_id_to_internal_uuid',
          validation: 'required|string|max:255'
        },
        {
          id: 'external_response_mapping',
          source_field: 'internal_data_format',
          target_field: 'external_api_response',
          target_table: 'response_transformations',
          transformation: 'internal_to_external_format',
          validation: 'valid_json_structure'
        }
      ];

      // Step 5: Generate external API database schema (what external consumers would see)
      const externalDatabaseSchema = {
        tables: [
          {
            name: 'api_responses',
            columns: [
              { name: 'id', type: 'uuid', nullable: false, description: 'Unique response identifier', default: 'gen_random_uuid()' },
              { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Response generation time', default: 'now()' },
              { name: 'status', type: 'string', nullable: false, description: 'Response status (success, error)', default: null },
              { name: 'data', type: 'jsonb', nullable: true, description: 'Response payload data', default: null }
            ],
            foreign_keys: [],
            indexes: [
              { name: 'api_responses_timestamp_idx', columns: ['timestamp'], unique: false }
            ]
          },
          {
            name: 'api_errors',
            columns: [
              { name: 'id', type: 'uuid', nullable: false, description: 'Unique error identifier', default: 'gen_random_uuid()' },
              { name: 'error_code', type: 'string', nullable: false, description: 'API error code', default: null },
              { name: 'error_message', type: 'string', nullable: false, description: 'Human-readable error message', default: null },
              { name: 'details', type: 'jsonb', nullable: true, description: 'Additional error context', default: null }
            ],
            foreign_keys: [],
            indexes: []
          }
        ]
      };

      // Build complete security configuration
      const completeSecurityConfig = {
        encryption_methods: [
          'TLS 1.3 for data in transit',
          'API key encryption for authentication',
          'Request/response payload encryption',
          'Header-based security tokens'
        ],
        authentication_methods: externalApi.authentication_methods || ['api_key', 'bearer_token'],
        authorization_policies: [
          'API key-based access control',
          'Rate limiting per API key',
          'IP-based access restrictions',
          'Scope-based permission system'
        ],
        data_protection: [
          'Request/response data sanitization',
          'PII data masking in logs',
          'Secure API key storage and rotation',
          'Audit trail for all API access'
        ],
        access_control: {
          rls_enabled: false, // External APIs don't use internal RLS
          role_based_access: true, // But they have their own access control
          facility_level_access: false, // External APIs are not facility-specific
          audit_logging: true
        }
      };

      // Enhanced architecture information for external API
      const completeArchitecture = {
        design_principles: [
          'RESTful API design with clear resource endpoints',
          'Stateless architecture for scalability',
          'Consistent error handling and status codes',
          'Comprehensive API documentation and examples',
          'Rate limiting and throttling for fair usage'
        ],
        patterns: [
          'Request/response transformation middleware',
          'API key authentication and validation',
          'Comprehensive logging and monitoring',
          'Circuit breaker patterns for resilience',
          'Caching strategies for performance optimization'
        ],
        scalability: [
          'Horizontal scaling with load balancers',
          'Database connection pooling',
          'Response caching for frequently accessed data',
          'Auto-scaling based on API usage patterns'
        ],
        reliability: [
          '99.9% uptime SLA with monitoring',
          'Automated health checks and alerts',
          'Graceful error handling and recovery',
          'Backup and disaster recovery procedures'
        ],
        technology_stack: [
          'RESTful API with JSON responses',
          'API gateway for routing and security',
          'Database abstraction layer',
          'Monitoring and analytics dashboard'
        ],
        deployment: [
          'Cloud-hosted API infrastructure',
          'CI/CD pipeline for updates',
          'Environment-based deployments',
          'Automated testing and validation'
        ]
      };

      // Rate limits configuration
      const rateLimitsData = externalApi.rate_limits as any;
      const defaultRequests = 1000;
      const requestsPerHour = rateLimitsData?.requests || defaultRequests;

      console.log('📊 Final external API details:', {
        api_id: externalApi.id,
        api_name: externalApi.external_name,
        endpoints_count: transformedEndpoints.length,
        rls_policies_count: externalRlsPolicies.length,
        data_mappings_count: externalDataMappings.length,
        database_tables_count: externalDatabaseSchema.tables.length
      });

      return {
        id: externalApi.id,
        name: externalApi.external_name,
        description: externalApi.external_description || 'External API integration for healthcare data exchange and interoperability.',
        base_url: externalApi.base_url || `${window.location.origin}/external-api/v1`,
        version: externalApi.version,
        category: externalApi.category || 'external-integration',
        endpoints: transformedEndpoints,
        rls_policies: externalRlsPolicies,
        data_mappings: externalDataMappings,
        database_schema: externalDatabaseSchema,
        security_config: completeSecurityConfig,
        rate_limits: {
          requests_per_hour: requestsPerHour,
          requests_per_day: requestsPerHour * 24,
          burst_limit: Math.floor(requestsPerHour * 0.1),
          rate_limit_headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-RateLimit-Window']
        },
        architecture: completeArchitecture
      };
    } catch (error) {
      console.error('❌ Critical error in getApiDetails:', error);
      return null;
    }
  };

  return { getApiDetails };
};

// Helper functions to generate default schemas and examples
function generateDefaultRequestSchema(method: string) {
  if (method === 'GET') {
    return {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Number of records per page' },
        filters: { type: 'object', description: 'Optional filters for the request' }
      }
    };
  }
  
  return {
    type: 'object',
    required: ['data'],
    properties: {
      data: { type: 'object', description: 'Request payload data' },
      metadata: { type: 'object', description: 'Optional request metadata' }
    }
  };
}

function generateDefaultResponseSchema() {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', description: 'Request success status' },
      data: { type: 'object', description: 'Response data payload' },
      message: { type: 'string', description: 'Response message' },
      timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' }
    }
  };
}

function generateExampleRequest(method: string, path: string) {
  if (method === 'GET') {
    return null; // GET requests typically don't have request bodies
  }
  
  return {
    data: {
      example_field: 'example_value',
      numeric_field: 123,
      boolean_field: true
    },
    metadata: {
      request_id: 'req_123456789',
      client_version: '1.0.0'
    }
  };
}

function generateExampleResponse() {
  return {
    success: true,
    data: {
      id: 'example_id_123',
      status: 'processed',
      created_at: new Date().toISOString()
    },
    message: 'Request processed successfully',
    timestamp: new Date().toISOString()
  };
}
