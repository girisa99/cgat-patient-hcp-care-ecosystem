/**
 * External API Synchronization Manager
 * Handles real-time sync between internal and external APIs using actual database schema analysis
 */

import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from './ExternalApiManager';
import { databaseSchemaAnalyzer, DatabaseTable } from './DatabaseSchemaAnalyzer';
import { syncOperationWrapper } from './SyncOperationWrapper';
import { apiSyncErrorHandler } from './ApiSyncErrorHandler';
import type { Json } from '@/integrations/supabase/types';

export interface InternalApiEndpoint {
  id: string;
  api_integration_id: string;
  endpoint_path: string;
  method: string;
  description: string;
  request_schema?: Record<string, any>;
  response_schema?: Record<string, any>;
  authentication_required: boolean;
  rate_limit_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InternalApiDetails {
  id: string;
  name: string;
  description?: string;
  version: string;
  category: string;
  endpoints: InternalApiEndpoint[];
  security_requirements: Record<string, any>;
  rate_limits: Record<string, any>;
  database_tables: DatabaseTable[];
  total_tables_count: number;
  total_rls_policies_count: number;
  total_endpoints_count: number;
}

class ExternalApiSyncManagerClass {
  private syncInProgress = new Set<string>();

  /**
   * Enhanced publishing that syncs all internal data to external tables using real database analysis
   */
  async publishWithFullSync(
    internalApiId: string,
    publishConfig: any
  ): Promise<any> {
    console.log('🔄 Starting REAL DATABASE SYNC with enhanced error handling for:', internalApiId);

    if (this.syncInProgress.has(internalApiId)) {
      throw apiSyncErrorHandler.handleError(
        new Error('Sync already in progress for this API'),
        'publishWithFullSync',
        { internalApiId }
      );
    }

    this.syncInProgress.add(internalApiId);

    try {
      // Use the sync operation wrapper for better error handling
      const syncResult = await syncOperationWrapper.execute(
        async () => await this.performFullSync(internalApiId, publishConfig),
        `full-sync-${internalApiId}`,
        {
          maxRetries: 2,
          baseDelay: 2000,
          timeout: 60000,
          skipRetryOn: ['VALIDATION_ERROR', 'AUTH_ERROR']
        }
      );

      if (!syncResult.success) {
        throw syncResult.error || new Error('Sync operation failed');
      }

      return syncResult.data;

    } finally {
      this.syncInProgress.delete(internalApiId);
    }
  }

  /**
   * Perform the actual sync operation
   */
  private async performFullSync(internalApiId: string, publishConfig: any): Promise<any> {
    // Step 1: Analyze real database schema
    const databaseTables = await this.executeWithErrorHandling(
      () => databaseSchemaAnalyzer.getAllTables(),
      'analyze-database-schema'
    );
    console.log(`📊 Analyzed ${databaseTables.length} real database tables`);

    // Step 2: Get complete internal API details with real data
    const internalApiDetails = await this.executeWithErrorHandling(
      () => this.getInternalApiDetailsWithRealData(internalApiId, databaseTables),
      'get-internal-api-details'
    );
    console.log('📋 Internal API details with real database:', {
      name: internalApiDetails.name,
      tables: internalApiDetails.total_tables_count,
      endpoints: internalApiDetails.total_endpoints_count,
      rls_policies: internalApiDetails.total_rls_policies_count
    });

    // Step 3: Publish the external API registry entry
    const externalApi = await this.executeWithErrorHandling(
      () => externalApiManager.publishInternalApi(internalApiId, publishConfig),
      'publish-external-api'
    );
    console.log('✅ External API published:', externalApi.id);

    // Step 4: Clear existing endpoints for this external API
    await this.executeWithErrorHandling(
      () => this.clearExistingEndpoints(externalApi.id),
      'clear-existing-endpoints'
    );

    // Step 5: Sync ALL real endpoints to external tables
    let externalEndpoints = [];
    if (internalApiDetails.endpoints.length > 0) {
      externalEndpoints = await this.executeWithErrorHandling(
        () => this.syncRealEndpointsToExternalWithRetry(externalApi.id, internalApiDetails.endpoints),
        'sync-real-endpoints'
      );
      console.log(`✅ Successfully synced ${externalEndpoints.length} REAL endpoints to external tables`);
    }

    // Step 6: Set up real-time sync for future changes
    await this.executeWithErrorHandling(
      () => this.setupRealtimeSync(internalApiId, externalApi.id),
      'setup-realtime-sync'
    );
    console.log('✅ Real-time sync established');

    // Step 7: Verify sync completion with real data
    const verificationResult = await this.executeWithErrorHandling(
      () => this.verifySyncCompletion(externalApi.id),
      'verify-sync-completion'
    );
    console.log('🔍 Real data sync verification:', verificationResult);

    // Step 8: Log the sync event for tracking
    await this.executeWithErrorHandling(
      () => this.logSyncEvent(externalApi.id, 'real_database_sync_completed', {
        database_tables_analyzed: databaseTables.length,
        endpoints_synced: externalEndpoints.length,
        rls_policies_generated: internalApiDetails.total_rls_policies_count,
        verification: verificationResult
      }),
      'log-sync-event'
    );

    return {
      ...externalApi,
      synced_endpoints_count: externalEndpoints.length,
      synced_tables_count: internalApiDetails.total_tables_count,
      synced_rls_policies_count: internalApiDetails.total_rls_policies_count,
      sync_status: 'active',
      verification: verificationResult,
      database_analysis: {
        total_tables: databaseTables.length,
        analyzed_tables: databaseTables.map(t => t.table_name)
      }
    };
  }

  /**
   * Execute operation with error handling
   */
  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const result = await syncOperationWrapper.execute(operation, operationName, {
      maxRetries: 1,
      baseDelay: 1000,
      timeout: 30000
    });

    if (!result.success) {
      throw result.error || new Error(`${operationName} failed`);
    }

    return result.data!;
  }

  /**
   * Clear existing endpoints for an external API to avoid duplicates
   */
  private async clearExistingEndpoints(externalApiId: string) {
    console.log('🧹 Clearing existing endpoints for external API:', externalApiId);
    
    try {
      const { error } = await supabase
        .from('external_api_endpoints')
        .delete()
        .eq('external_api_id', externalApiId);

      if (error) {
        throw apiSyncErrorHandler.handleError(error, 'clearExistingEndpoints', {
          externalApiId
        });
      }
      
      console.log('✅ Existing endpoints cleared');
    } catch (err) {
      console.warn('⚠️ Error clearing existing endpoints:', err);
      throw err;
    }
  }

  /**
   * Enhanced sync with better error handling and validation
   */
  private async syncRealEndpointsToExternalWithRetry(
    externalApiId: string,
    realEndpoints: InternalApiEndpoint[],
    maxRetries: number = 3
  ) {
    const result = await syncOperationWrapper.execute(
      () => this.syncRealEndpointsToExternal(externalApiId, realEndpoints),
      `sync-endpoints-${externalApiId}`,
      {
        maxRetries,
        baseDelay: 1000,
        timeout: 45000,
        skipRetryOn: ['VALIDATION_ERROR', 'SCHEMA_ERROR']
      }
    );

    if (!result.success) {
      throw result.error || new Error('Failed to sync endpoints');
    }

    // Verify the sync immediately after
    const verifyResult = await this.verifyEndpointsSync(externalApiId, realEndpoints.length);
    if (!verifyResult.success) {
      throw apiSyncErrorHandler.handleError(
        new Error(`Real sync verification failed: ${verifyResult.error}`),
        'verifyEndpointsSync',
        { externalApiId, expectedCount: realEndpoints.length }
      );
    }
    
    return result.data;
  }

  /**
   * Verify that endpoints were synced correctly
   */
  private async verifyEndpointsSync(externalApiId: string, expectedCount: number) {
    const { data: syncedEndpoints, error } = await supabase
      .from('external_api_endpoints')
      .select('id, external_path, method')
      .eq('external_api_id', externalApiId);

    if (error) {
      return { success: false, error: error.message };
    }

    const actualCount = syncedEndpoints?.length || 0;
    if (actualCount !== expectedCount) {
      return { 
        success: false, 
        error: `Expected ${expectedCount} endpoints, but found ${actualCount}` 
      };
    }

    return { success: true, count: actualCount };
  }

  /**
   * Verify that sync completed successfully
   */
  private async verifySyncCompletion(externalApiId: string) {
    const { data: endpoints, error } = await supabase
      .from('external_api_endpoints')
      .select('id, external_path, method')
      .eq('external_api_id', externalApiId);

    if (error) {
      console.error('❌ Error verifying sync completion:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      synced_endpoints: endpoints?.length || 0,
      endpoints_preview: endpoints?.slice(0, 3).map(ep => `${ep.method} ${ep.external_path}`) || []
    };
  }

  /**
   * Log sync events for tracking and debugging
   */
  private async logSyncEvent(externalApiId: string, eventType: string, metadata: any) {
    try {
      const { error } = await supabase
        .from('api_lifecycle_events')
        .insert({
          api_integration_id: externalApiId,
          event_type: eventType,
          description: `Sync event: ${eventType}`,
          metadata: metadata,
          impact_level: 'medium'
        });

      if (error) {
        console.warn('⚠️ Error logging sync event:', error);
      }
    } catch (error) {
      console.warn('⚠️ Error logging sync event:', error);
    }
  }

  /**
   * Get complete internal API details including REAL database analysis
   */
  private async getInternalApiDetailsWithRealData(internalApiId: string, databaseTables: DatabaseTable[]): Promise<InternalApiDetails> {
    // Get the main API record
    const { data: apiData, error: apiError } = await supabase
      .from('api_integration_registry')
      .select('*')
      .eq('id', internalApiId)
      .single();

    if (apiError) {
      console.error('❌ Error fetching internal API:', apiError);
      throw apiError;
    }

    console.log(`🔍 Generating REAL endpoints from ${databaseTables.length} database tables`);

    // Generate real endpoints from actual database tables
    const realEndpointsData = databaseSchemaAnalyzer.generateEndpointsFromTables(databaseTables);
    
    // Convert to internal endpoint format
    const realEndpoints: InternalApiEndpoint[] = realEndpointsData.map((endpoint, index) => ({
      id: `${internalApiId}_${endpoint.method}_${endpoint.external_path.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`,
      api_integration_id: internalApiId,
      endpoint_path: endpoint.external_path,
      method: endpoint.method,
      description: endpoint.description,
      request_schema: endpoint.request_schema,
      response_schema: endpoint.response_schema,
      authentication_required: endpoint.requires_authentication,
      rate_limit_config: { requests: 100, period: 'minute' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Calculate real RLS policies count
    const totalRlsPolicies = databaseTables.reduce((sum, table) => sum + table.rls_policies.length, 0);

    // Convert Json types to Record<string, any> safely
    const securityRequirements = this.convertJsonToRecord(apiData.security_requirements);
    const rateLimits = this.convertJsonToRecord(apiData.rate_limits);

    return {
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      version: apiData.version,
      category: apiData.category,
      endpoints: realEndpoints,
      security_requirements: securityRequirements,
      rate_limits: rateLimits,
      database_tables: databaseTables,
      total_tables_count: databaseTables.length,
      total_rls_policies_count: totalRlsPolicies,
      total_endpoints_count: realEndpoints.length
    };
  }

  /**
   * Safely convert Json type to Record<string, any>
   */
  private convertJsonToRecord(jsonValue: Json | null): Record<string, any> {
    if (!jsonValue) return {};
    if (typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
      return jsonValue as Record<string, any>;
    }
    return {};
  }

  /**
   * Sync real internal endpoints to external API endpoints table
   */
  private async syncRealEndpointsToExternal(
    externalApiId: string,
    realEndpoints: InternalApiEndpoint[]
  ) {
    console.log(`🔄 Syncing ${realEndpoints.length} REAL endpoints to external tables`);

    const externalEndpoints = realEndpoints.map(endpoint => ({
      external_api_id: externalApiId,
      internal_endpoint_id: endpoint.id,
      external_path: endpoint.endpoint_path,
      method: endpoint.method.toUpperCase(),
      summary: `${endpoint.method.toUpperCase()} ${endpoint.endpoint_path}`,
      description: endpoint.description,
      is_public: true,
      requires_authentication: endpoint.authentication_required,
      request_schema: endpoint.request_schema,
      response_schema: endpoint.response_schema,
      example_request: this.generateExampleRequest(endpoint),
      example_response: this.generateExampleResponse(endpoint),
      rate_limit_override: endpoint.rate_limit_config,
      tags: [endpoint.method.toLowerCase(), 'real-database-sync', 'generated-from-schema'],
      deprecated: false
    }));

    const { data, error } = await supabase
      .from('external_api_endpoints')
      .insert(externalEndpoints)
      .select();

    if (error) {
      console.error('❌ Error syncing REAL endpoints:', error);
      throw error;
    }

    console.log(`✅ Successfully synced ${data?.length || 0} REAL endpoints`);
    return data || [];
  }

  /**
   * Generate example request from schema
   */
  private generateExampleRequest(endpoint: InternalApiEndpoint) {
    if (endpoint.method.toUpperCase() === 'GET') {
      return null; // GET requests don't have request bodies
    }

    if (!endpoint.request_schema) {
      return { message: 'No request schema available' };
    }

    // Generate example based on schema
    const schema = endpoint.request_schema;
    if (schema.type === 'object' && schema.properties) {
      const example: Record<string, any> = {};
      
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        switch (prop.type) {
          case 'string':
            if (prop.format === 'email') {
              example[key] = 'patient@example.com';
            } else if (prop.format === 'date') {
              example[key] = '1990-01-01';
            } else if (prop.format === 'uuid') {
              example[key] = '550e8400-e29b-41d4-a716-446655440000';
            } else {
              example[key] = `example_${key}`;
            }
            break;
          case 'integer':
            example[key] = prop.minimum || 1;
            break;
          case 'boolean':
            example[key] = prop.default !== undefined ? prop.default : true;
            break;
          case 'object':
            example[key] = { example: 'nested_object' };
            break;
          default:
            example[key] = `example_${key}`;
        }
      });

      return example;
    }

    return { example: 'request_data' };
  }

  /**
   * Generate example response from schema
   */
  private generateExampleResponse(endpoint: InternalApiEndpoint) {
    if (!endpoint.response_schema) {
      return {
        success: true,
        message: 'Operation completed successfully',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Operation completed successfully'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set up real-time synchronization between internal and external APIs
   */
  private async setupRealtimeSync(internalApiId: string, externalApiId: string) {
    console.log('🔗 Setting up real-time sync between:', { internalApiId, externalApiId });

    // Create a subscription to monitor changes to the internal API
    const channel = supabase
      .channel(`api_sync_${internalApiId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_integration_registry',
          filter: `id=eq.${internalApiId}`
        },
        async (payload) => {
          console.log('🔄 Internal API changed, syncing to external:', payload);
          await this.handleInternalApiChange(internalApiId, externalApiId, payload);
        }
      )
      .subscribe();

    console.log('✅ Real-time sync channel established:', channel);
    return channel;
  }

  /**
   * Handle changes to internal APIs and sync to external
   */
  private async handleInternalApiChange(
    internalApiId: string,
    externalApiId: string,
    payload: any
  ) {
    console.log('🔄 Handling internal API change:', payload.eventType);

    try {
      switch (payload.eventType) {
        case 'UPDATE':
          await this.syncInternalUpdateToExternal(externalApiId, payload.new);
          break;
        case 'DELETE':
          await this.handleInternalApiDeletion(externalApiId);
          break;
        default:
          console.log('ℹ️ Unhandled event type:', payload.eventType);
      }
    } catch (error) {
      console.error('❌ Error handling internal API change:', error);
    }
  }

  /**
   * Sync internal API updates to external API
   */
  private async syncInternalUpdateToExternal(externalApiId: string, updatedInternalData: any) {
    console.log('🔄 Syncing internal update to external API:', externalApiId);

    const updateData: any = {};

    // Map internal changes to external format
    if (updatedInternalData.name) {
      updateData.external_name = updatedInternalData.name;
    }
    if (updatedInternalData.description) {
      updateData.external_description = updatedInternalData.description;
    }
    if (updatedInternalData.version) {
      updateData.version = updatedInternalData.version;
    }
    if (updatedInternalData.category) {
      updateData.category = updatedInternalData.category;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('external_api_registry')
        .update(updateData)
        .eq('id', externalApiId);

      if (error) {
        throw error;
      }

      console.log('✅ External API updated successfully');
    }
  }

  /**
   * Handle internal API deletion
   */
  private async handleInternalApiDeletion(externalApiId: string) {
    console.log('🗑️ Handling internal API deletion, updating external status');

    const { error } = await supabase
      .from('external_api_registry')
      .update({ 
        status: 'deprecated',
        updated_at: new Date().toISOString()
      })
      .eq('id', externalApiId);

    if (error) {
      throw error;
    }

    console.log('✅ External API marked as deprecated');
  }

  /**
   * Get sync status for an external API with real data metrics
   */
  async getSyncStatus(externalApiId: string) {
    const { data: externalApi, error } = await supabase
      .from('external_api_registry')
      .select('*, internal_api_id')
      .eq('id', externalApiId)
      .single();

    if (error) {
      return { status: 'error', error: error.message };
    }

    const { data: endpoints, error: endpointsError } = await supabase
      .from('external_api_endpoints')
      .select('count')
      .eq('external_api_id', externalApiId);

    // Get real database table count for comparison
    const databaseTables = await databaseSchemaAnalyzer.getAllTables();

    return {
      status: 'active',
      external_api_id: externalApiId,
      internal_api_id: externalApi.internal_api_id,
      synced_endpoints: endpoints?.length || 0,
      database_tables_analyzed: databaseTables.length,
      last_sync: externalApi.updated_at,
      sync_type: 'real_database_analysis'
    };
  }

  /**
   * Force refresh sync using real database analysis
   */
  async forceRefreshSync(externalApiId: string) {
    console.log('🔄 Force refreshing sync with REAL DATABASE ANALYSIS and enhanced error handling for external API:', externalApiId);
    
    const result = await syncOperationWrapper.execute(
      async () => {
        // Get the external API info
        const { data: externalApi, error } = await supabase
          .from('external_api_registry')
          .select('internal_api_id')
          .eq('id', externalApiId)
          .single();

        if (error || !externalApi) {
          throw apiSyncErrorHandler.handleError(
            error || new Error('External API not found'),
            'forceRefreshSync',
            { externalApiId }
          );
        }

        // Clear existing endpoints
        await this.clearExistingEndpoints(externalApiId);

        // Analyze real database and re-sync
        const databaseTables = await databaseSchemaAnalyzer.getAllTables();
        const internalApiDetails = await this.getInternalApiDetailsWithRealData(externalApi.internal_api_id, databaseTables);
        const syncedEndpoints = await this.syncRealEndpointsToExternal(externalApiId, internalApiDetails.endpoints);

        console.log(`✅ Force refresh with REAL DATA completed: ${syncedEndpoints.length} endpoints synced from ${databaseTables.length} tables`);
        return { 
          success: true, 
          synced_endpoints: syncedEndpoints.length,
          analyzed_tables: databaseTables.length,
          sync_type: 'real_database_analysis'
        };
      },
      `force-refresh-${externalApiId}`,
      {
        maxRetries: 1,
        baseDelay: 2000,
        timeout: 60000
      }
    );

    if (!result.success) {
      console.error('❌ Error during real database force refresh:', result.error);
      throw result.error;
    }

    return result.data;
  }
}

export const externalApiSyncManager = new ExternalApiSyncManagerClass();
