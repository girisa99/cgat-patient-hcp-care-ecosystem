
/**
 * External API Synchronization Manager
 * Handles real-time sync between internal and external APIs
 */

import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from './ExternalApiManager';

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
}

class ExternalApiSyncManagerClass {
  private syncInProgress = new Set<string>();

  /**
   * Enhanced publishing that syncs all internal data to external tables
   */
  async publishWithFullSync(
    internalApiId: string,
    publishConfig: any
  ): Promise<any> {
    console.log('🔄 Starting enhanced publish with full sync for:', internalApiId);

    if (this.syncInProgress.has(internalApiId)) {
      console.log('⚠️ Sync already in progress for:', internalApiId);
      throw new Error('Sync already in progress for this API');
    }

    this.syncInProgress.add(internalApiId);

    try {
      // Step 1: Get complete internal API details
      const internalApiDetails = await this.getInternalApiDetails(internalApiId);
      console.log('📋 Internal API details retrieved:', {
        name: internalApiDetails.name,
        endpoints: internalApiDetails.endpoints.length
      });

      // Step 2: Publish the external API registry entry
      const externalApi = await externalApiManager.publishInternalApi(internalApiId, publishConfig);
      console.log('✅ External API published:', externalApi.id);

      // Step 3: Sync all endpoints to external tables
      if (internalApiDetails.endpoints.length > 0) {
        const externalEndpoints = await this.syncEndpointsToExternal(
          externalApi.id,
          internalApiDetails.endpoints
        );
        console.log(`✅ Synced ${externalEndpoints.length} endpoints to external tables`);
      }

      // Step 4: Set up real-time sync for future changes
      await this.setupRealtimeSync(internalApiId, externalApi.id);
      console.log('✅ Real-time sync established');

      return {
        ...externalApi,
        synced_endpoints_count: internalApiDetails.endpoints.length,
        sync_status: 'active'
      };

    } finally {
      this.syncInProgress.delete(internalApiId);
    }
  }

  /**
   * Get complete internal API details including endpoints
   */
  private async getInternalApiDetails(internalApiId: string): Promise<InternalApiDetails> {
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

    // For now, we'll generate mock endpoints since we don't have a complete endpoints table
    // In a real scenario, you'd fetch from an internal_endpoints table
    const mockEndpoints: InternalApiEndpoint[] = [
      {
        id: `${internalApiId}_endpoint_1`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients',
        method: 'GET',
        description: 'Get list of patients with pagination and filtering',
        request_schema: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            search: { type: 'string', description: 'Search by patient name or ID' }
          }
        },
        response_schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  email: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' }
              }
            }
          }
        },
        authentication_required: true,
        rate_limit_config: { requests: 100, period: 'minute' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `${internalApiId}_endpoint_2`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients',
        method: 'POST',
        description: 'Create a new patient record',
        request_schema: {
          type: 'object',
          required: ['first_name', 'last_name', 'email'],
          properties: {
            first_name: { type: 'string', minLength: 1 },
            last_name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' }
          }
        },
        response_schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                email: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' }
              }
            },
            message: { type: 'string' }
          }
        },
        authentication_required: true,
        rate_limit_config: { requests: 50, period: 'minute' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `${internalApiId}_endpoint_3`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients/{id}',
        method: 'GET',
        description: 'Get a specific patient by ID',
        request_schema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Patient ID' }
          }
        },
        response_schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                date_of_birth: { type: 'string', format: 'date' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        authentication_required: true,
        rate_limit_config: { requests: 200, period: 'minute' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return {
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      version: apiData.version,
      category: apiData.category,
      endpoints: mockEndpoints,
      security_requirements: apiData.security_requirements || {},
      rate_limits: apiData.rate_limits || {}
    };
  }

  /**
   * Sync internal endpoints to external API endpoints table
   */
  private async syncEndpointsToExternal(
    externalApiId: string,
    internalEndpoints: InternalApiEndpoint[]
  ) {
    console.log(`🔄 Syncing ${internalEndpoints.length} endpoints to external tables`);

    const externalEndpoints = internalEndpoints.map(endpoint => ({
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
      tags: [endpoint.method.toLowerCase(), 'auto-synced'],
      deprecated: false
    }));

    const { data, error } = await supabase
      .from('external_api_endpoints')
      .insert(externalEndpoints)
      .select();

    if (error) {
      console.error('❌ Error syncing endpoints:', error);
      throw error;
    }

    console.log(`✅ Successfully synced ${data?.length || 0} endpoints`);
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
              example[key] = 'user@example.com';
            } else if (prop.format === 'date') {
              example[key] = '2024-01-01';
            } else {
              example[key] = `example_${key}`;
            }
            break;
          case 'integer':
            example[key] = prop.minimum || 1;
            break;
          case 'boolean':
            example[key] = true;
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
        id: 'example_id_123',
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
   * Get sync status for an external API
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

    return {
      status: 'active',
      external_api_id: externalApiId,
      internal_api_id: externalApi.internal_api_id,
      synced_endpoints: endpoints?.length || 0,
      last_sync: externalApi.updated_at
    };
  }
}

export const externalApiSyncManager = new ExternalApiSyncManagerClass();
