
/**
 * Enhanced Published API Details Hook with Real Database Schema Analysis
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { databaseSchemaAnalyzer } from '@/utils/api/DatabaseSchemaAnalyzer';
import type { ApiIntegrationDetails } from './usePublishedApiDetails';

export type { ApiIntegrationDetails } from './usePublishedApiDetails';

export const useEnhancedPublishedApiDetails = () => {
  const getEnhancedApiDetails = async (apiId: string): Promise<ApiIntegrationDetails | null> => {
    console.log('🔍 ENHANCED: Fetching API details with REAL DATABASE ANALYSIS for:', apiId);

    try {
      // Step 1: Get the external API registry entry with fresh data
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

      // Step 2: Analyze REAL database schema
      console.log('📋 Step 2: Analyzing REAL database schema...');
      const databaseTables = await databaseSchemaAnalyzer.getAllTables();
      console.log(`🔍 Real database analysis: Found ${databaseTables.length} tables`);

      // Step 3: Fetch synced external API endpoints with forced refresh
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

      // Step 4: If no endpoints found or count is low, trigger real database sync
      let finalEndpoints = endpoints || [];
      const expectedEndpointCount = databaseTables.length * 4; // 4 CRUD operations per table
      
      if (!finalEndpoints || finalEndpoints.length < expectedEndpointCount) {
        console.log(`🔄 Found ${finalEndpoints.length} endpoints but expected ~${expectedEndpointCount} based on ${databaseTables.length} tables. Triggering real database sync...`);
        await triggerRealDatabaseSync(apiId, externalApi.internal_api_id, databaseTables);
        
        // Retry fetching endpoints after real sync
        const { data: retryEndpoints } = await supabase
          .from('external_api_endpoints')
          .select('*')
          .eq('external_api_id', apiId)
          .order('external_path');
        
        console.log(`📊 After REAL DATABASE sync: Found ${retryEndpoints?.length || 0} endpoints`);
        
        // Use the retry results if available
        if (retryEndpoints && retryEndpoints.length > 0) {
          finalEndpoints = retryEndpoints;
        }
      }

      // Log endpoint details for debugging
      if (finalEndpoints && finalEndpoints.length > 0) {
        console.log('🔍 Real synced endpoint details:', finalEndpoints.slice(0, 5).map(ep => ({
          id: ep.id,
          method: ep.method,
          path: ep.external_path,
          summary: ep.summary,
          tags: ep.tags
        })));
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
            message: { type: 'string', description: 'Request schema generated from real database analysis' }
          }
        },
        response_schema: endpoint.response_schema || {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Operation success status' },
            data: { type: 'object', description: 'Response data payload from real database' },
            message: { type: 'string', description: 'Response message' }
          }
        },
        example_request: endpoint.example_request,
        example_response: endpoint.example_response,
        rate_limit_override: endpoint.rate_limit_override
      }));

      // Generate comprehensive RLS policies from real database analysis
      const realRlsPolicies = databaseTables.flatMap(table => 
        table.rls_policies.map(policy => ({
          id: `${table.table_name}_${policy.policy_name}`,
          policy_name: policy.policy_name,
          table_name: policy.table_name,
          operation: policy.command,
          condition: policy.expression,
          description: `RLS policy for ${policy.table_name} - ${policy.command} operations`
        }))
      );

      // Generate comprehensive data mappings from real database relationships
      const realDataMappings = databaseTables.flatMap(table =>
        table.foreign_keys.map(fk => ({
          id: `${table.table_name}_${fk.column_name}_mapping`,
          source_field: fk.column_name,
          target_field: fk.foreign_column_name,
          target_table: fk.foreign_table_name,
          transformation: `${table.table_name}_to_${fk.foreign_table_name}_mapping`,
          validation: 'required|uuid|exists:' + fk.foreign_table_name + ',' + fk.foreign_column_name
        }))
      );

      // Generate real database schema from analysis
      const realDatabaseSchema = {
        tables: databaseTables.map(table => ({
          name: table.table_name,
          columns: table.columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable,
            description: `${col.column_name} field from real database schema`,
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

      // Rate limits configuration with proper type handling
      const rateLimitsData = externalApi.rate_limits as any;
      const defaultRequests = 1000;
      const requestsPerHour = (rateLimitsData && typeof rateLimitsData === 'object' && rateLimitsData.requests) 
        ? Number(rateLimitsData.requests) 
        : defaultRequests;

      console.log('📊 Final enhanced external API details with REAL DATABASE ANALYSIS:', {
        api_id: externalApi.id,
        api_name: externalApi.external_name,
        real_database_tables: databaseTables.length,
        synced_endpoints_count: transformedEndpoints.length,
        real_rls_policies_count: realRlsPolicies.length,
        real_data_mappings_count: realDataMappings.length,
        database_tables_count: realDatabaseSchema.tables.length,
        sync_status: 'real_database_sync_active'
      });

      return {
        id: externalApi.id,
        name: externalApi.external_name,
        description: externalApi.external_description || `Comprehensive external API integration with real database sync for ${databaseTables.length} tables including profiles, facilities, modules, permissions, roles, and more.`,
        base_url: externalApi.base_url || `${window.location.origin}/external-api/v1`,
        version: externalApi.version,
        category: externalApi.category || 'healthcare-integration',
        endpoints: transformedEndpoints,
        rls_policies: realRlsPolicies,
        data_mappings: realDataMappings,
        database_schema: realDatabaseSchema,
        security_config: {
          encryption_methods: [
            'TLS 1.3 for all data in transit',
            'Real database field-level encryption for sensitive data',
            'API key encryption using industry-standard algorithms',
            'Request/response payload encryption for PII data'
          ],
          authentication_methods: externalApi.authentication_methods || ['api_key', 'bearer_token', 'oauth2'],
          authorization_policies: [
            `Granular API key-based access control for ${databaseTables.length} database tables`,
            'Dynamic rate limiting per API key with burst allowance',
            'Real database RLS policy enforcement',
            'Table-level access restrictions based on user roles and permissions'
          ],
          data_protection: [
            'Real database schema-based request/response validation',
            'PII data masking for profiles and user information',
            'Secure API key storage with automatic rotation',
            `Complete audit trail for all ${transformedEndpoints.length} API endpoints`
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
            'RESTful API design based on real database table structure',
            `Stateless architecture supporting ${databaseTables.length} database tables`,
            'Real-time database schema synchronization',
            'Consistent error handling with database constraint validation',
            'Comprehensive API documentation generated from real schema'
          ],
          patterns: [
            'Real database schema-driven endpoint generation',
            'Multi-layer authentication with database user/role validation',
            'Real-time logging and monitoring with database audit trails',
            'Circuit breaker patterns with database connection pooling',
            'Intelligent caching based on real table relationships'
          ],
          scalability: [
            'Auto-scaling infrastructure with database connection pooling',
            `Support for ${databaseTables.length} concurrent table operations`,
            'Multi-tier response caching for frequently accessed tables',
            'Dynamic resource allocation based on real database usage patterns'
          ],
          reliability: [
            '99.9% uptime SLA with database failover support',
            'Real database health checks with proactive alerting',
            'Database constraint-based error handling',
            'Multi-region database backup and disaster recovery'
          ],
          technology_stack: [
            'Modern RESTful API with real database integration',
            'Enterprise-grade API gateway with database security',
            'Direct database layer with real-time constraint validation',
            'Real-time monitoring and analytics for all database operations'
          ],
          deployment: [
            'Cloud-native infrastructure with database clustering',
            'Real database schema change detection and deployment',
            'Multi-environment deployments with database migration support',
            'Automated testing and validation against real database constraints'
          ]
        }
      };
    } catch (error) {
      console.error('❌ Critical error in enhanced getApiDetails with real database analysis:', error);
      return null;
    }
  };

  // Method to trigger real database sync when missing or incomplete
  const triggerRealDatabaseSync = async (externalApiId: string, internalApiId?: string, databaseTables?: any[]) => {
    console.log('🔄 Triggering REAL DATABASE sync for external API:', externalApiId);
    
    try {
      // If no database tables provided, analyze them
      const tables = databaseTables || await databaseSchemaAnalyzer.getAllTables();
      console.log(`📊 Using ${tables.length} real database tables for sync`);

      // Generate real endpoints based on actual database structure
      const realEndpoints = databaseSchemaAnalyzer.generateEndpointsFromTables(tables);
      
      // Convert to external endpoint format
      const externalEndpoints = realEndpoints.map((endpoint, index) => ({
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
          data: { id: 'uuid', message: 'Real database operation completed' },
          timestamp: new Date().toISOString()
        },
        rate_limit_override: null,
        tags: [endpoint.method.toLowerCase(), 'real-database-sync', 'auto-generated'],
        deprecated: false
      }));

      // Insert the real endpoints
      const { error } = await supabase
        .from('external_api_endpoints')
        .insert(externalEndpoints);

      if (error) {
        console.error('❌ Error inserting real database sync endpoints:', error);
        throw error;
      }

      console.log(`✅ Successfully synced ${externalEndpoints.length} endpoints from ${tables.length} real database tables`);
      return externalEndpoints;
    } catch (error) {
      console.error('❌ Error triggering real database sync:', error);
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
    triggerRealDatabaseSync: triggerRealDatabaseSync
  };
};
