
/**
 * Enhanced External API Sync Manager with Duplicate Detection
 * Handles intelligent API publishing with endpoint-level synchronization
 */

import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from './ExternalApiManager';

interface SyncResult {
  success: boolean;
  message: string;
  synced_endpoints_count: number;
  skipped_endpoints_count: number;
  duplicate_detected: boolean;
  existing_api_id?: string;
}

interface PublishWithSyncConfig {
  check_duplicates: boolean;
  force_republish: boolean;
  sync_endpoints_only: boolean;
}

class ExternalApiSyncManagerClass {
  /**
   * Publishes API with full synchronization and duplicate detection
   */
  async publishWithFullSync(
    internalApiId: string, 
    publishConfig: any,
    options: PublishWithSyncConfig = {
      check_duplicates: true,
      force_republish: false,
      sync_endpoints_only: false
    }
  ): Promise<SyncResult> {
    console.log('🔄 Starting enhanced publish with sync:', { internalApiId, publishConfig, options });

    try {
      // Step 1: Check for existing API
      const existingApi = await this.checkForDuplicateApi(internalApiId, publishConfig.external_name);
      
      if (existingApi && options.check_duplicates && !options.force_republish) {
        console.log('⚠️ Duplicate API detected:', existingApi);
        
        // If it's a duplicate, sync only new endpoints
        const syncResult = await this.syncEndpointsOnly(existingApi.id, internalApiId);
        
        return {
          success: true,
          message: `API already exists. Synchronized ${syncResult.new_endpoints} new endpoints.`,
          synced_endpoints_count: syncResult.new_endpoints,
          skipped_endpoints_count: syncResult.existing_endpoints,
          duplicate_detected: true,
          existing_api_id: existingApi.id
        };
      }

      // Step 2: If no duplicate or force republish, create new API
      let externalApi;
      if (options.force_republish || !existingApi) {
        externalApi = await externalApiManager.publishInternalApi(internalApiId, publishConfig);
        console.log('✅ New API published:', externalApi);
      } else {
        externalApi = existingApi;
      }

      // Step 3: Sync all endpoints
      const endpointSyncResult = await this.syncAllEndpoints(externalApi.id, internalApiId);
      
      // Step 4: Update API status if needed
      if (publishConfig.status === 'published' && externalApi.status !== 'published') {
        await externalApiManager.updateExternalApiStatus(externalApi.id, 'published');
      }

      return {
        success: true,
        message: `API published successfully with ${endpointSyncResult.total_endpoints} endpoints synchronized.`,
        synced_endpoints_count: endpointSyncResult.total_endpoints,
        skipped_endpoints_count: 0,
        duplicate_detected: false
      };

    } catch (error) {
      console.error('❌ Enhanced publish failed:', error);
      throw error;
    }
  }

  /**
   * Checks for duplicate APIs based on internal API ID and name
   */
  async checkForDuplicateApi(internalApiId: string, externalName: string) {
    console.log('🔍 Checking for duplicate API:', { internalApiId, externalName });
    
    const { data: existingApis, error } = await supabase
      .from('external_api_registry')
      .select('*')
      .or(`internal_api_id.eq.${internalApiId},external_name.eq.${externalName}`)
      .limit(1);

    if (error) {
      console.error('❌ Error checking duplicates:', error);
      throw error;
    }

    return existingApis && existingApis.length > 0 ? existingApis[0] : null;
  }

  /**
   * Syncs only new endpoints for an existing API
   */
  async syncEndpointsOnly(externalApiId: string, internalApiId: string) {
    console.log('🔄 Syncing endpoints only:', { externalApiId, internalApiId });
    
    // Get existing endpoints
    const { data: existingEndpoints, error: existingError } = await supabase
      .from('external_api_endpoints')
      .select('external_path, method')
      .eq('external_api_id', externalApiId);

    if (existingError) throw existingError;

    // Get internal API endpoints (mock data for now - would come from internal API registry)
    const internalEndpoints = await this.getInternalApiEndpoints(internalApiId);
    
    // Find new endpoints that don't exist in external
    const existingPaths = new Set(existingEndpoints?.map(ep => `${ep.method}:${ep.external_path}`) || []);
    const newEndpoints = internalEndpoints.filter(ep => 
      !existingPaths.has(`${ep.method}:${ep.path}`)
    );

    // Create new endpoints
    if (newEndpoints.length > 0) {
      const endpointsToCreate = newEndpoints.map(ep => ({
        external_api_id: externalApiId,
        external_path: ep.path,
        method: ep.method,
        summary: ep.summary || `${ep.method} ${ep.path}`,
        description: ep.description,
        is_public: ep.is_public || false,
        requires_authentication: ep.requires_authentication !== false,
        tags: ep.tags || []
      }));

      const { error: createError } = await supabase
        .from('external_api_endpoints')
        .insert(endpointsToCreate);

      if (createError) throw createError;
    }

    return {
      new_endpoints: newEndpoints.length,
      existing_endpoints: existingEndpoints?.length || 0
    };
  }

  /**
   * Syncs all endpoints for an API
   */
  async syncAllEndpoints(externalApiId: string, internalApiId: string) {
    console.log('🔄 Syncing all endpoints:', { externalApiId, internalApiId });
    
    // Get internal API endpoints
    const internalEndpoints = await this.getInternalApiEndpoints(internalApiId);
    
    // Delete existing endpoints to start fresh
    await supabase
      .from('external_api_endpoints')
      .delete()
      .eq('external_api_id', externalApiId);

    // Create all endpoints
    if (internalEndpoints.length > 0) {
      const endpointsToCreate = internalEndpoints.map(ep => ({
        external_api_id: externalApiId,
        external_path: ep.path,
        method: ep.method,
        summary: ep.summary || `${ep.method} ${ep.path}`,
        description: ep.description,
        is_public: ep.is_public || false,
        requires_authentication: ep.requires_authentication !== false,
        tags: ep.tags || [],
        request_schema: ep.request_schema,
        response_schema: ep.response_schema,
        example_request: ep.example_request,
        example_response: ep.example_response
      }));

      const { error: createError } = await supabase
        .from('external_api_endpoints')
        .insert(endpointsToCreate);

      if (createError) throw createError;
    }

    return {
      total_endpoints: internalEndpoints.length
    };
  }

  /**
   * Gets internal API endpoints (mock implementation)
   */
  async getInternalApiEndpoints(internalApiId: string) {
    // This would normally fetch from the internal API registry
    // For now, return mock endpoints based on the API type
    return [
      {
        path: '/health',
        method: 'GET',
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API',
        is_public: true,
        requires_authentication: false,
        tags: ['health', 'monitoring'],
        request_schema: null,
        response_schema: { type: 'object', properties: { status: { type: 'string' } } },
        example_request: null,
        example_response: { status: 'healthy' }
      },
      {
        path: '/data',
        method: 'GET',
        summary: 'Get data',
        description: 'Retrieves data from the system',
        is_public: false,
        requires_authentication: true,
        tags: ['data'],
        request_schema: null,
        response_schema: { type: 'array', items: { type: 'object' } },
        example_request: null,
        example_response: [{ id: 1, name: 'Sample Data' }]
      },
      {
        path: '/data',
        method: 'POST',
        summary: 'Create data',
        description: 'Creates new data in the system',
        is_public: false,
        requires_authentication: true,
        tags: ['data'],
        request_schema: { type: 'object', properties: { name: { type: 'string' } } },
        response_schema: { type: 'object', properties: { id: { type: 'number' }, name: { type: 'string' } } },
        example_request: { name: 'New Data' },
        example_response: { id: 2, name: 'New Data' }
      }
    ];
  }

  /**
   * Gets sync status for an external API
   */
  async getSyncStatus(externalApiId: string) {
    console.log('📊 Getting sync status for:', externalApiId);
    
    const { data: api, error: apiError } = await supabase
      .from('external_api_registry')
      .select('*')
      .eq('id', externalApiId)
      .single();

    if (apiError) throw apiError;

    const { data: endpoints, error: endpointsError } = await supabase
      .from('external_api_endpoints')
      .select('*')
      .eq('external_api_id', externalApiId);

    if (endpointsError) throw endpointsError;

    const { data: analytics, error: analyticsError } = await supabase
      .from('api_usage_analytics')
      .select('*')
      .eq('external_api_id', externalApiId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (analyticsError) throw analyticsError;

    return {
      api,
      endpoints: endpoints || [],
      recent_usage: analytics || [],
      last_sync: new Date().toISOString(),
      endpoint_count: endpoints?.length || 0,
      usage_count: analytics?.length || 0,
      status: api.status
    };
  }

  /**
   * Reverts API publication (sets back to draft)
   */
  async revertPublication(externalApiId: string) {
    console.log('↩️ Reverting API publication:', externalApiId);
    
    const { data, error } = await supabase
      .from('external_api_registry')
      .update({ 
        status: 'draft',
        published_at: null,
        published_by: null
      })
      .eq('id', externalApiId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Cancels API publication (deletes it)
   */
  async cancelPublication(externalApiId: string) {
    console.log('❌ Canceling API publication:', externalApiId);
    
    // Delete endpoints first
    await supabase
      .from('external_api_endpoints')
      .delete()
      .eq('external_api_id', externalApiId);

    // Delete analytics
    await supabase
      .from('api_usage_analytics')
      .delete()
      .eq('external_api_id', externalApiId);

    // Delete the API
    const { error } = await supabase
      .from('external_api_registry')
      .delete()
      .eq('id', externalApiId);

    if (error) throw error;

    return { success: true, message: 'API publication canceled successfully' };
  }
}

export const externalApiSyncManager = new ExternalApiSyncManagerClass();
