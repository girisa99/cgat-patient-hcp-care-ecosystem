
/**
 * Enhanced Published API Details Hook with Core Business Schema Analysis
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { databaseSchemaAnalyzer } from '@/utils/api/DatabaseSchemaAnalyzer';
import type { ApiIntegrationDetails } from './usePublishedApiDetails';

export type { ApiIntegrationDetails } from './usePublishedApiDetails';

export const useEnhancedPublishedApiDetails = () => {
  const getEnhancedApiDetails = async (apiId: string): Promise<ApiIntegrationDetails | null> => {
    console.log('🔍 ENHANCED: Fetching API details with CORE BUSINESS ANALYSIS for:', apiId);

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

      // Step 2: Analyze CORE BUSINESS database schema only
      console.log('📋 Step 2: Analyzing CORE BUSINESS database schema...');
      const coreBusinessTables = await databaseSchemaAnalyzer.getAllTables();
      console.log(`🔍 Core business analysis: Found ${coreBusinessTables.length} relevant tables`);

      // Step 3: Fetch synced external API endpoints
      console.log('📋 Step 3: Fetching synced external API endpoints...');
      const { data: endpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .eq('external_api_id', apiId)
        .order('external_path');

      if (endpointsError) {
        console.warn('⚠️ Error fetching external API endpoints:', endpointsError);
      }

      console.log(`📊 Found ${endpoints?.length || 0} synced endpoints`);

      // Step 4: If no endpoints found, trigger core business sync
      let finalEndpoints = endpoints || [];
      const expectedEndpointCount = coreBusinessTables.length * 3; // ~3 core endpoints per table
      
      if (!finalEndpoints || finalEndpoints.length < expectedEndpointCount) {
        console.log(`🔄 Found ${finalEndpoints.length} endpoints but expected ~${expectedEndpointCount} based on ${coreBusinessTables.length} core tables. Triggering core business sync...`);
        await triggerCoreBusinessSync(apiId, externalApi.internal_api_id, coreBusinessTables);
        
        // Retry fetching endpoints after sync
        const { data: retryEndpoints } = await supabase
          .from('external_api_endpoints')
          .select('*')
          .eq('external_api_id', apiId)
          .order('external_path');
        
        console.log(`📊 After CORE BUSINESS sync: Found ${retryEndpoints?.length || 0} endpoints`);
        
        if (retryEndpoints && retryEndpoints.length > 0) {
          finalEndpoints = retryEndpoints;
        }
      }

      // Transform the endpoints data with proper structure
      const transformedEndpoints = (finalEndpoints || []).map(endpoint => ({
        id: endpoint.id,
        name: endpoint.summary || `${endpoint.method} ${endpoint.external_path}`,
        method: endpoint.method,
        url: endpoint.external_path,
        description: endpoint.description || `${endpoint.method} endpoint for ${endpoint.external_path}`,
        is_public: endpoint.is_public || false,
        authentication: endpoint.requires_authentication ? {
          type: 'bearer',
          required: true,
          description: 'Bearer token authentication required for this endpoint',
          token_format: 'JWT',
          scopes: ['api:read', 'api:write']
        } : {
          type: 'none',
          required: false,
          description: 'No authentication required for this endpoint'
        },
        request_schema: endpoint.request_schema || {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Request schema generated from core business analysis' }
          }
        },
        response_schema: endpoint.response_schema || {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Operation success status' },
            data: { type: 'object', description: 'Response data payload from core business tables' },
            message: { type: 'string', description: 'Response message' }
          }
        },
        example_request: endpoint.example_request,
        example_response: endpoint.example_response,
        rate_limit_override: endpoint.rate_limit_override
      }));

      // Generate core business RLS policies only
      const coreRlsPolicies = coreBusinessTables.flatMap(table => 
        table.rls_policies.map(policy => ({
          id: `${table.table_name}_${policy.policy_name}`,
          policy_name: policy.policy_name,
          table_name: policy.table_name,
          operation: policy.command,
          condition: policy.expression,
          description: `Core business RLS policy for ${policy.table_name} - ${policy.command} operations`
        }))
      );

      // Generate core business data mappings only
      const coreDataMappings = coreBusinessTables.flatMap(table =>
        table.foreign_keys.map(fk => ({
          id: `${table.table_name}_${fk.column_name}_mapping`,
          source_field: fk.column_name,
          target_field: fk.foreign_column_name,
          target_table: fk.foreign_table_name,
          transformation: `${table.table_name}_to_${fk.foreign_table_name}_mapping`,
          validation: 'required|uuid|exists:' + fk.foreign_table_name + ',' + fk.foreign_column_name
        }))
      );

      // Generate core business database schema
      const coreBusinessSchema = {
        tables: coreBusinessTables.map(table => ({
          name: table.table_name,
          columns: table.columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable,
            description: `${col.column_name} field from core business schema`,
            default: col.column_default,
            is_primary_key: col.is_primary_key
          })),
          foreign_keys: table.foreign_keys.map(fk => ({
            column: fk.column_name,
            references_table: fk.foreign_table_name,
            references_column: fk.foreign_column_name
          })),
          indexes: [
            { name: `${table.table_name}_pkey`, columns: ['id'], unique: true }
          ]
        }))
      };

      // Rate limits configuration
      const rateLimitsData = externalApi.rate_limits as any;
      const defaultRequests = 1000;
      const requestsPerHour = (rateLimitsData && typeof rateLimitsData === 'object' && rateLimitsData.requests) 
        ? Number(rateLimitsData.requests) 
        : defaultRequests;

      console.log('📊 Final enhanced external API details with CORE BUSINESS ANALYSIS:', {
        api_id: externalApi.id,
        api_name: externalApi.external_name,
        core_business_tables: coreBusinessTables.length,
        synced_endpoints_count: transformedEndpoints.length,
        core_rls_policies_count: coreRlsPolicies.length,
        core_data_mappings_count: coreDataMappings.length,
        database_tables_count: coreBusinessSchema.tables.length,
        sync_status: 'core_business_sync_active'
      });

      return {
        id: externalApi.id,
        name: externalApi.external_name,
        description: externalApi.external_description || `Core business API integration for healthcare with ${coreBusinessTables.length} essential tables: profiles, facilities, modules, roles, and user_roles.`,
        base_url: externalApi.base_url || `${window.location.origin}/external-api/v1`,
        version: externalApi.version,
        category: externalApi.category || 'healthcare-core',
        endpoints: transformedEndpoints,
        rls_policies: coreRlsPolicies,
        data_mappings: coreDataMappings,
        database_schema: coreBusinessSchema,
        security_config: {
          encryption_methods: [
            'TLS 1.3 for all data in transit',
            'Core business data field-level encryption',
            'API key encryption using industry-standard algorithms',
            'Request/response payload encryption for PII data'
          ],
          authentication_methods: externalApi.authentication_methods || ['api_key', 'bearer_token'],
          authorization_policies: [
            `Role-based access control for ${coreBusinessTables.length} core business tables`,
            'Dynamic rate limiting per API key with burst allowance',
            'Core business RLS policy enforcement',
            'Table-level access restrictions based on user roles and permissions'
          ],
          data_protection: [
            'Core business schema-based request/response validation',
            'PII data masking for profiles and user information',
            'Secure API key storage with automatic rotation',
            `Complete audit trail for all ${transformedEndpoints.length} core API endpoints`
          ],
          access_control: {
            rls_enabled: true,
            role_based_access: true,
            facility_level_access: true,
            audit_logging: true
          }
        },
        rate_limits: {
          requests_per_hour: requestsPerHour,
          requests_per_day: requestsPerHour * 24,
          burst_limit: Math.floor(requestsPerHour * 0.1),
          rate_limit_headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-RateLimit-Window']
        },
        architecture: {
          design_principles: [
            'RESTful API design based on core business table structure',
            `Stateless architecture supporting ${coreBusinessTables.length} core business tables`,
            'Real-time core business schema synchronization',
            'Consistent error handling with business constraint validation',
            'Comprehensive API documentation generated from core business schema'
          ],
          patterns: [
            'Core business schema-driven endpoint generation',
            'Multi-layer authentication with user/role validation',
            'Real-time logging and monitoring with business audit trails',
            'Circuit breaker patterns with optimized connection pooling',
            'Intelligent caching based on core business relationships'
          ],
          scalability: [
            'Auto-scaling infrastructure with optimized connection pooling',
            `Support for ${coreBusinessTables.length} concurrent core business operations`,
            'Multi-tier response caching for frequently accessed business data',
            'Dynamic resource allocation based on core business usage patterns'
          ],
          reliability: [
            '99.9% uptime SLA with core business failover support',
            'Core business health checks with proactive alerting',
            'Business constraint-based error handling',
            'Multi-region core business backup and disaster recovery'
          ],
          technology_stack: [
            'Modern RESTful API with core business integration',
            'Enterprise-grade API gateway with business security',
            'Direct core business layer with real-time constraint validation',
            'Real-time monitoring and analytics for all core business operations'
          ],
          deployment: [
            'Cloud-native infrastructure with business clustering',
            'Core business schema change detection and deployment',
            'Multi-environment deployments with business migration support',
            'Automated testing and validation against core business constraints'
          ]
        }
      };
    } catch (error) {
      console.error('❌ Critical error in enhanced getApiDetails with core business analysis:', error);
      return null;
    }
  };

  // Method to trigger core business sync when missing or incomplete
  const triggerCoreBusinessSync = async (externalApiId: string, internalApiId?: string, coreBusinessTables?: any[]) => {
    console.log('🔄 Triggering CORE BUSINESS sync for external API:', externalApiId);
    
    try {
      // If no core business tables provided, analyze them
      const tables = coreBusinessTables || await databaseSchemaAnalyzer.getAllTables();
      console.log(`📊 Using ${tables.length} core business tables for sync`);

      // Generate core business endpoints based on actual table structure
      const coreEndpoints = databaseSchemaAnalyzer.generateEndpointsFromTables(tables);
      
      // Convert to external endpoint format
      const externalEndpoints = coreEndpoints.map((endpoint, index) => ({
        external_api_id: externalApiId,
        internal_endpoint_id: `${internalApiId}_${endpoint.method}_${index}`,
        external_path: endpoint.external_path,
        method: endpoint.method.toUpperCase(),
        summary: endpoint.summary,
        description: endpoint.description,
        is_public: true,
        requires_authentication: endpoint.requires_authentication,
        request_schema: endpoint.request_schema,
        response_schema: endpoint.response_schema,
        example_request: null,
        example_response: {
          success: true,
          data: { id: 'uuid', message: 'Core business operation completed' },
          timestamp: new Date().toISOString()
        },
        rate_limit_override: null,
        tags: [endpoint.method.toLowerCase(), 'core-business-sync', 'auto-generated'],
        deprecated: false
      }));

      // Insert the core business endpoints
      const { error } = await supabase
        .from('external_api_endpoints')
        .insert(externalEndpoints);

      if (error) {
        console.error('❌ Error inserting core business sync endpoints:', error);
        throw error;
      }

      console.log(`✅ Successfully synced ${externalEndpoints.length} endpoints from ${tables.length} core business tables`);
      return externalEndpoints;
    } catch (error) {
      console.error('❌ Error triggering core business sync:', error);
      throw error;
    }
  };

  // Return hook with cache invalidation support
  const useApiDetailsQuery = (apiId: string) => {
    return useQuery({
      queryKey: ['enhanced-api-details', apiId],
      queryFn: () => getEnhancedApiDetails(apiId),
      enabled: !!apiId,
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache results
      refetchOnMount: true,
      refetchOnWindowFocus: true
    });
  };

  return { 
    getEnhancedApiDetails,
    useApiDetailsQuery,
    triggerRealDatabaseSync: triggerCoreBusinessSync
  };
};
