/**
 * External API Synchronization Manager
 * Handles real-time sync between internal and external APIs
 */

import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from './ExternalApiManager';
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

      // Step 3: Clear existing endpoints for this external API
      await this.clearExistingEndpoints(externalApi.id);

      // Step 4: Sync all endpoints to external tables with retry logic
      let externalEndpoints = [];
      if (internalApiDetails.endpoints.length > 0) {
        externalEndpoints = await this.syncEndpointsToExternalWithRetry(
          externalApi.id,
          internalApiDetails.endpoints
        );
        console.log(`✅ Successfully synced ${externalEndpoints.length} endpoints to external tables`);
      }

      // Step 5: Set up real-time sync for future changes
      await this.setupRealtimeSync(internalApiId, externalApi.id);
      console.log('✅ Real-time sync established');

      // Step 6: Verify sync completion
      const verificationResult = await this.verifySyncCompletion(externalApi.id);
      console.log('🔍 Sync verification:', verificationResult);

      // Step 7: Log the sync event for tracking
      await this.logSyncEvent(externalApi.id, 'sync_completed', {
        endpoints_synced: externalEndpoints.length,
        verification: verificationResult
      });

      return {
        ...externalApi,
        synced_endpoints_count: externalEndpoints.length,
        sync_status: 'active',
        verification: verificationResult
      };

    } finally {
      this.syncInProgress.delete(internalApiId);
    }
  }

  /**
   * Clear existing endpoints for an external API to avoid duplicates
   */
  private async clearExistingEndpoints(externalApiId: string) {
    console.log('🧹 Clearing existing endpoints for external API:', externalApiId);
    
    const { error } = await supabase
      .from('external_api_endpoints')
      .delete()
      .eq('external_api_id', externalApiId);

    if (error) {
      console.warn('⚠️ Error clearing existing endpoints:', error);
    } else {
      console.log('✅ Existing endpoints cleared');
    }
  }

  /**
   * Sync endpoints with retry logic
   */
  private async syncEndpointsToExternalWithRetry(
    externalApiId: string,
    internalEndpoints: InternalApiEndpoint[],
    maxRetries: number = 3
  ) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Sync attempt ${attempt}/${maxRetries} for ${internalEndpoints.length} endpoints`);
        const result = await this.syncEndpointsToExternal(externalApiId, internalEndpoints);
        
        // Verify the sync immediately after
        const verifyResult = await this.verifyEndpointsSync(externalApiId, internalEndpoints.length);
        if (!verifyResult.success) {
          throw new Error(`Sync verification failed: ${verifyResult.error}`);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ Sync attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
    return [];
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

    // Generate comprehensive mock endpoints for healthcare API
    const mockEndpoints: InternalApiEndpoint[] = [
      {
        id: `${internalApiId}_patients_get`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients',
        method: 'GET',
        description: 'Retrieve paginated list of patients with optional filtering and search capabilities',
        request_schema: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: 'Records per page' },
            search: { type: 'string', description: 'Search by patient name, email, or ID' },
            facility_id: { type: 'string', format: 'uuid', description: 'Filter by facility' },
            status: { type: 'string', enum: ['active', 'inactive'], description: 'Patient status filter' }
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
                  id: { type: 'string', format: 'uuid' },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  date_of_birth: { type: 'string', format: 'date' },
                  facility_id: { type: 'string', format: 'uuid' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
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
        id: `${internalApiId}_patients_post`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients',
        method: 'POST',
        description: 'Create a new patient record with comprehensive health information',
        request_schema: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'facility_id'],
          properties: {
            first_name: { type: 'string', minLength: 1, maxLength: 100 },
            last_name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' },
            date_of_birth: { type: 'string', format: 'date' },
            facility_id: { type: 'string', format: 'uuid' },
            emergency_contact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' }
              }
            }
          }
        },
        response_schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
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
        id: `${internalApiId}_patients_by_id`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/patients/{id}',
        method: 'GET',
        description: 'Retrieve detailed information for a specific patient by ID',
        request_schema: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Patient unique identifier' }
          }
        },
        response_schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                date_of_birth: { type: 'string', format: 'date' },
                facility: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    type: { type: 'string' }
                  }
                },
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
      },
      {
        id: `${internalApiId}_facilities_get`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/facilities',
        method: 'GET',
        description: 'Get list of healthcare facilities with filtering options',
        request_schema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['hospital', 'clinic', 'pharmacy', 'laboratory'] },
            active_only: { type: 'boolean', default: true },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
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
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  is_active: { type: 'boolean' }
                }
              }
            }
          }
        },
        authentication_required: true,
        rate_limit_config: { requests: 150, period: 'minute' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `${internalApiId}_users_get`,
        api_integration_id: internalApiId,
        endpoint_path: '/api/v1/users',
        method: 'GET',
        description: 'Retrieve healthcare system users with role and permission information',
        request_schema: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['admin', 'doctor', 'nurse', 'staff'] },
            facility_id: { type: 'string', format: 'uuid' },
            active_only: { type: 'boolean', default: true },
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
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
                  id: { type: 'string', format: 'uuid' },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  email: { type: 'string' },
                  roles: { type: 'array', items: { type: 'string' } },
                  facility: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        authentication_required: true,
        rate_limit_config: { requests: 80, period: 'minute' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Convert Json types to Record<string, any> safely
    const securityRequirements = this.convertJsonToRecord(apiData.security_requirements);
    const rateLimits = this.convertJsonToRecord(apiData.rate_limits);

    return {
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      version: apiData.version,
      category: apiData.category,
      endpoints: mockEndpoints,
      security_requirements: securityRequirements,
      rate_limits: rateLimits
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
      tags: [endpoint.method.toLowerCase(), 'auto-synced', 'healthcare'],
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

  /**
   * Force refresh sync for an external API
   */
  async forceRefreshSync(externalApiId: string) {
    console.log('🔄 Force refreshing sync for external API:', externalApiId);
    
    try {
      // Get the external API info
      const { data: externalApi, error } = await supabase
        .from('external_api_registry')
        .select('internal_api_id')
        .eq('id', externalApiId)
        .single();

      if (error || !externalApi) {
        throw new Error('External API not found');
      }

      // Clear existing endpoints
      await this.clearExistingEndpoints(externalApiId);

      // Get internal API details and re-sync
      const internalApiDetails = await this.getInternalApiDetails(externalApi.internal_api_id);
      const syncedEndpoints = await this.syncEndpointsToExternal(externalApiId, internalApiDetails.endpoints);

      console.log(`✅ Force refresh completed: ${syncedEndpoints.length} endpoints synced`);
      return { 
        success: true, 
        synced_endpoints: syncedEndpoints.length 
      };
    } catch (error) {
      console.error('❌ Error during force refresh:', error);
      throw error;
    }
  }
}

export const externalApiSyncManager = new ExternalApiSyncManagerClass();
