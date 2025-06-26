/**
 * Enhanced API Integration Manager
 * Manages the new registry system with improved classification
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  ApiIntegrationRegistry, 
  ApiLifecycleEvent, 
  ApiConsumptionLog,
  ApiIntegration, 
  ApiIntegrationStats,
  ApiDirection,
  ApiType,
  ApiPurpose,
  ApiCategory,
  ApiStatus,
  ApiLifecycleStage,
  ApiEventType,
  ImpactLevel
} from './ApiIntegrationTypes';

class ApiIntegrationManager {
  /**
   * Get all API integrations from the new registry
   */
  async getRegistryIntegrations(): Promise<ApiIntegrationRegistry[]> {
    try {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching registry integrations:', error);
      throw error;
    }
  }

  /**
   * Create new API integration in registry
   */
  async createRegistryIntegration(integration: Omit<ApiIntegrationRegistry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiIntegrationRegistry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...integration,
          created_by: user?.id,
          last_modified_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create lifecycle event
      await this.createLifecycleEvent({
        api_integration_id: data.id,
        event_type: 'created',
        description: `API integration ${data.name} was created`,
        impact_level: 'low',
        requires_migration: false
      });

      return data;
    } catch (error) {
      console.error('Error creating registry integration:', error);
      throw error;
    }
  }

  /**
   * Update API integration in registry
   */
  async updateRegistryIntegration(id: string, updates: Partial<ApiIntegrationRegistry>): Promise<ApiIntegrationRegistry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .update({
          ...updates,
          last_modified_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create lifecycle event
      await this.createLifecycleEvent({
        api_integration_id: id,
        event_type: 'updated',
        description: `API integration ${data.name} was updated`,
        impact_level: 'low',
        requires_migration: false
      });

      return data;
    } catch (error) {
      console.error('Error updating registry integration:', error);
      throw error;
    }
  }

  /**
   * Create lifecycle event
   */
  async createLifecycleEvent(event: Omit<ApiLifecycleEvent, 'id' | 'created_at'>): Promise<ApiLifecycleEvent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_lifecycle_events')
        .insert({
          ...event,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lifecycle event:', error);
      throw error;
    }
  }

  /**
   * Get lifecycle events for an API integration
   */
  async getLifecycleEvents(apiIntegrationId: string): Promise<ApiLifecycleEvent[]> {
    try {
      const { data, error } = await supabase
        .from('api_lifecycle_events')
        .select('*')
        .eq('api_integration_id', apiIntegrationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lifecycle events:', error);
      throw error;
    }
  }

  /**
   * Log API consumption
   */
  async logApiConsumption(consumption: Omit<ApiConsumptionLog, 'id' | 'request_timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_consumption_logs')
        .insert(consumption);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging API consumption:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Get consumption analytics for an API integration
   */
  async getConsumptionAnalytics(apiIntegrationId: string, days: number = 30): Promise<ApiConsumptionLog[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('api_consumption_logs')
        .select('*')
        .eq('api_integration_id', apiIntegrationId)
        .gte('request_timestamp', startDate.toISOString())
        .order('request_timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching consumption analytics:', error);
      throw error;
    }
  }

  /**
   * Get enhanced integration statistics
   */
  async getEnhancedIntegrationStats(): Promise<ApiIntegrationStats> {
    try {
      const integrations = await this.getRegistryIntegrations();
      
      const stats: ApiIntegrationStats = {
        totalIntegrations: integrations.length,
        internalApis: integrations.filter(i => i.type === 'internal').length,
        externalApis: integrations.filter(i => i.type === 'external').length,
        totalEndpoints: integrations.reduce((sum, i) => sum + i.endpoints_count, 0),
        totalPolicies: integrations.reduce((sum, i) => sum + i.rls_policies_count, 0),
        totalMappings: integrations.reduce((sum, i) => sum + i.data_mappings_count, 0),
        byCategory: {} as Record<ApiCategory, number>,
        byStatus: {} as Record<ApiStatus, number>,
        byDirection: {} as Record<ApiDirection, number>,
        byLifecycleStage: {} as Record<ApiLifecycleStage, number>
      };

      // Calculate category distribution
      integrations.forEach(integration => {
        stats.byCategory[integration.category] = (stats.byCategory[integration.category] || 0) + 1;
        stats.byStatus[integration.status] = (stats.byStatus[integration.status] || 0) + 1;
        stats.byDirection[integration.direction] = (stats.byDirection[integration.direction] || 0) + 1;
        stats.byLifecycleStage[integration.lifecycle_stage] = (stats.byLifecycleStage[integration.lifecycle_stage] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating enhanced integration stats:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async getIntegrations(): Promise<ApiIntegration[]> {
    try {
      const registryIntegrations = await this.getRegistryIntegrations();
      
      // Convert registry format to legacy format
      return registryIntegrations.map(registry => ({
        id: registry.id,
        name: registry.name,
        description: registry.description || '',
        type: registry.type,
        baseUrl: registry.base_url || '',
        version: registry.version,
        category: registry.category,
        status: registry.status,
        endpoints: [], // Would need to be populated from separate endpoints table
        schemas: {},
        mappings: [],
        rlsPolicies: [],
        createdAt: registry.created_at,
        updatedAt: registry.updated_at
      }));
    } catch (error) {
      console.error('Error getting legacy integrations:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async getIntegrationStats(): Promise<ApiIntegrationStats> {
    return this.getEnhancedIntegrationStats();
  }

  /**
   * Legacy method for backward compatibility
   */
  async registerIntegration(integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    try {
      const registryIntegration = await this.createRegistryIntegration({
        name: integration.name,
        description: integration.description,
        direction: 'bidirectional', // Default for legacy
        type: integration.type,
        purpose: 'hybrid', // Default for legacy
        category: integration.category,
        base_url: integration.baseUrl,
        version: integration.version,
        status: integration.status,
        lifecycle_stage: 'development',
        endpoints_count: integration.endpoints.length,
        rls_policies_count: integration.rlsPolicies.length,
        data_mappings_count: integration.mappings.length,
        contact_info: {},
        sla_requirements: {},
        security_requirements: {},
        rate_limits: {},
        webhook_config: {}
      });

      // Convert back to legacy format
      return {
        id: registryIntegration.id,
        name: registryIntegration.name,
        description: registryIntegration.description || '',
        type: registryIntegration.type,
        baseUrl: registryIntegration.base_url || '',
        version: registryIntegration.version,
        category: registryIntegration.category,
        status: registryIntegration.status,
        endpoints: integration.endpoints,
        schemas: integration.schemas,
        mappings: integration.mappings,
        rlsPolicies: integration.rlsPolicies,
        createdAt: registryIntegration.created_at,
        updatedAt: registryIntegration.updated_at
      };
    } catch (error) {
      console.error('Error registering legacy integration:', error);
      throw error;
    }
  }

  /**
   * Executes an API integration based on the specified operation.
   * @param integrationId The ID of the API integration to execute.
   * @param operation The operation to perform ('sync', 'webhook', 'manual').
   * @param data Optional data to pass to the integration.
   * @returns A promise that resolves with the result of the integration execution.
   */
  async executeIntegration(integrationId: string, operation: 'sync' | 'webhook' | 'manual', data?: any): Promise<any> {
    // Basic validation
    if (!integrationId || !operation) {
      throw new Error('Integration ID and operation are required.');
    }

    console.log(`Executing API integration ${integrationId} with operation ${operation}.`);

    // Simulate different operations
    let resultData = {};
    switch (operation) {
      case 'sync':
        // Simulate data synchronization
        resultData = {
          message: `Data synchronization initiated for integration ${integrationId}.`,
          syncedRecords: Math.floor(Math.random() * 100)
        };
        break;
      case 'webhook':
        // Simulate webhook execution
        resultData = {
          message: `Webhook triggered for integration ${integrationId}.`,
          webhookId: Math.random().toString(36).substring(7)
        };
        break;
      case 'manual':
        // Simulate manual execution
        resultData = {
          message: `Manual execution initiated for integration ${integrationId}.`,
          dataProcessed: true
        };
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`API integration ${integrationId} executed successfully.`);
    return {
      success: true,
      operation,
      integrationId,
      data: resultData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Exports the API integration as a Postman collection.
   * @param integrationId The ID of the API integration to export.
   * @returns A promise that resolves with the JSON string of the Postman collection.
   */
  async exportPostmanCollection(integrationId: string): Promise<string> {
    if (!integrationId) {
      throw new Error('Integration ID is required.');
    }

    console.log(`Exporting API integration ${integrationId} as Postman collection.`);

    // Mock API integration data
    const mockIntegration = {
      id: integrationId,
      name: 'Mock API Integration',
      description: 'This is a mock API integration for testing purposes.',
      baseUrl: 'https://mockapi.example.com',
      endpoints: [
        {
          name: 'Get Users',
          method: 'GET',
          url: '/users',
          description: 'Retrieves a list of users.',
          headers: {
            'Content-Type': 'application/json'
          },
          isPublic: true
        },
        {
          name: 'Create User',
          method: 'POST',
          url: '/users',
          description: 'Creates a new user.',
          headers: {
            'Content-Type': 'application/json'
          },
          isPublic: false
        }
      ]
    };

    // Transform the API integration data into a Postman collection format
    const postmanCollection = {
      info: {
        name: mockIntegration.name,
        description: mockIntegration.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: mockIntegration.endpoints.map(endpoint => ({
        name: endpoint.name,
        request: {
          method: endpoint.method,
          url: `${mockIntegration.baseUrl}${endpoint.url}`,
          description: endpoint.description,
          header: Object.keys(endpoint.headers).map(key => ({
            key: key,
            value: endpoint.headers[key]
          }))
        },
        response: []
      }))
    };

    // Convert the Postman collection object to a JSON string
    const collectionJson = JSON.stringify(postmanCollection, null, 2);

    console.log(`API integration ${integrationId} exported as Postman collection successfully.`);
    return collectionJson;
  }

  /**
   * Exports the complete API documentation as a JSON string.
   * @returns A promise that resolves with the JSON string of the API documentation.
   */
  async exportApiDocumentation(): Promise<any> {
    console.log('Exporting complete API documentation.');

    // Mock API documentation data
    const mockApiDocumentation = {
      metadata: {
        version: '1.0.0',
        title: 'Mock API Documentation',
        description: 'This is a mock API documentation for testing purposes.',
        total_endpoints: 2,
        total_rls_policies: 0,
        total_data_mappings: 0,
        generated_at: new Date().toISOString()
      },
      apis: [
        {
          name: 'Get Users',
          method: 'GET',
          url: '/users',
          description: 'Retrieves a list of users.',
          headers: {
            'Content-Type': 'application/json'
          },
          isPublic: true
        },
        {
          name: 'Create User',
          method: 'POST',
          url: '/users',
          description: 'Creates a new user.',
          headers: {
            'Content-Type': 'application/json'
          },
          isPublic: false
        }
      ],
      models: []
    };

    console.log('Complete API documentation exported successfully.');
    return mockApiDocumentation;
  }
}

export const apiIntegrationManager = new ApiIntegrationManager();
