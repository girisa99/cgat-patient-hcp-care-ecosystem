/**
 * Enhanced API Integration Manager
 * Handles CRUD operations for the new API integration registry system
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  ApiIntegrationRegistry, 
  ApiLifecycleEvent, 
  ApiConsumptionLog,
  ApiDirection,
  ApiEventType,
  ImpactLevel,
  ApiIntegration,
  PostmanCollection
} from './ApiIntegrationTypes';
import { PostmanCollectionGenerator } from './PostmanCollectionGenerator';
import { RealApiScanner } from './RealApiScanner';

class ApiIntegrationManagerClass {
  /**
   * Retrieves all API integrations from the registry
   */
  async getAllIntegrations(): Promise<ApiIntegrationRegistry[]> {
    const { data, error } = await supabase
      .from('api_integration_registry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API integrations:', error);
      throw error;
    }

    // Type cast the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      direction: item.direction as ApiDirection,
      contact_info: item.contact_info as Record<string, any>,
      sla_requirements: item.sla_requirements as Record<string, any>,
      security_requirements: item.security_requirements as Record<string, any>,
      rate_limits: item.rate_limits as Record<string, any>,
      webhook_config: item.webhook_config as Record<string, any>
    })) as ApiIntegrationRegistry[];
  }

  /**
   * Legacy method for backward compatibility
   */
  async getIntegrations(): Promise<ApiIntegration[]> {
    // Generate real internal API
    const internalApi = await RealApiScanner.generateRealInternalApi();
    return [internalApi];
  }

  /**
   * Legacy method for backward compatibility
   */
  async getIntegrationStats() {
    return await this.getStats();
  }

  /**
   * Legacy method for backward compatibility
   */
  async registerIntegration(integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    // Generate a unique ID for the integration
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create the complete integration object
    const completeIntegration: ApiIntegration = {
      ...integration,
      id,
      createdAt: now,
      updatedAt: now
    };

    // Convert to registry format and create
    const registryData = {
      name: integration.name,
      description: integration.description,
      direction: 'inbound' as ApiDirection,
      type: integration.type,
      purpose: 'hybrid' as const,
      category: integration.category,
      base_url: integration.baseUrl,
      version: integration.version,
      status: integration.status,
      lifecycle_stage: 'development' as const,
      endpoints_count: integration.endpoints.length,
      rls_policies_count: integration.rlsPolicies.length,
      data_mappings_count: integration.mappings.length,
      contact_info: integration.contact || {},
      sla_requirements: integration.sla || {},
      security_requirements: {},
      rate_limits: {},
      webhook_config: {}
    };

    await this.createIntegration(registryData);
    return completeIntegration;
  }

  /**
   * Legacy method for backward compatibility
   */
  async executeIntegration(integrationId: string, operation: string, data?: any) {
    console.log('Executing integration:', { integrationId, operation, data });
    return { success: true, data: data || {} };
  }

  /**
   * Exports Postman collection for an integration
   */
  async exportPostmanCollection(integrationId: string): Promise<string> {
    const integrations = await this.getIntegrations();
    const integration = integrations.find(i => i.id === integrationId);
    
    if (!integration) {
      throw new Error('Integration not found');
    }

    const collection = await PostmanCollectionGenerator.generatePostmanCollection(integration);
    return PostmanCollectionGenerator.exportPostmanCollection(collection);
  }

  /**
   * Exports complete API documentation
   */
  async exportApiDocumentation() {
    const integrations = await this.getIntegrations();
    
    return {
      metadata: {
        export_date: new Date().toISOString(),
        total_integrations: integrations.length,
        total_endpoints: integrations.reduce((acc, i) => acc + i.endpoints.length, 0),
        total_rls_policies: integrations.reduce((acc, i) => acc + i.rlsPolicies.length, 0),
        total_data_mappings: integrations.reduce((acc, i) => acc + i.mappings.length, 0)
      },
      integrations: integrations.map(integration => ({
        ...integration,
        endpoints: integration.endpoints.map(endpoint => ({
          ...endpoint,
          test_cases: this.generateTestCases(endpoint),
          security_considerations: this.generateSecurityConsiderations(endpoint)
        }))
      }))
    };
  }

  private generateTestCases(endpoint: any) {
    return [
      {
        name: `Test ${endpoint.method} ${endpoint.name}`,
        description: `Verify ${endpoint.description}`,
        method: endpoint.method,
        url: endpoint.url,
        expected_status: endpoint.method === 'POST' ? 201 : 200
      }
    ];
  }

  private generateSecurityConsiderations(endpoint: any) {
    return {
      authentication_required: !endpoint.isPublic,
      sensitive_data: endpoint.url.includes('patient') || endpoint.url.includes('user'),
      rate_limiting: true,
      data_validation: endpoint.method !== 'GET'
    };
  }

  /**
   * Creates a new API integration in the registry
   */
  async createIntegration(integration: Omit<ApiIntegrationRegistry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiIntegrationRegistry> {
    const { data, error } = await supabase
      .from('api_integration_registry')
      .insert([integration])
      .select()
      .single();

    if (error) {
      console.error('Error creating API integration:', error);
      throw error;
    }

    // Create a lifecycle event for the new integration
    await this.createLifecycleEvent({
      api_integration_id: data.id,
      event_type: 'created',
      description: `API integration ${integration.name} was created`,
      metadata: { integration_type: integration.type, category: integration.category },
      impact_level: 'low',
      requires_migration: false
    });

    return {
      ...data,
      direction: data.direction as ApiDirection,
      contact_info: data.contact_info as Record<string, any>,
      sla_requirements: data.sla_requirements as Record<string, any>,
      security_requirements: data.security_requirements as Record<string, any>,
      rate_limits: data.rate_limits as Record<string, any>,
      webhook_config: data.webhook_config as Record<string, any>
    } as ApiIntegrationRegistry;
  }

  /**
   * Updates an existing API integration
   */
  async updateIntegration(id: string, updates: Partial<ApiIntegrationRegistry>): Promise<ApiIntegrationRegistry> {
    const { data, error } = await supabase
      .from('api_integration_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating API integration:', error);
      throw error;
    }

    // Create a lifecycle event for the update
    await this.createLifecycleEvent({
      api_integration_id: id,
      event_type: 'updated',
      description: `API integration ${data.name} was updated`,
      metadata: { updated_fields: Object.keys(updates) },
      impact_level: 'low',
      requires_migration: false
    });

    return {
      ...data,
      direction: data.direction as ApiDirection,
      contact_info: data.contact_info as Record<string, any>,
      sla_requirements: data.sla_requirements as Record<string, any>,
      security_requirements: data.security_requirements as Record<string, any>,
      rate_limits: data.rate_limits as Record<string, any>,
      webhook_config: data.webhook_config as Record<string, any>
    } as ApiIntegrationRegistry;
  }

  /**
   * Deletes an API integration
   */
  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_integration_registry')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API integration:', error);
      throw error;
    }
  }

  /**
   * Gets lifecycle events for an API integration
   */
  async getLifecycleEvents(apiIntegrationId: string): Promise<ApiLifecycleEvent[]> {
    const { data, error } = await supabase
      .from('api_lifecycle_events')
      .select('*')
      .eq('api_integration_id', apiIntegrationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lifecycle events:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      event_type: item.event_type as ApiEventType,
      impact_level: item.impact_level as ImpactLevel,
      metadata: item.metadata as Record<string, any>
    })) as ApiLifecycleEvent[];
  }

  /**
   * Gets all lifecycle events
   */
  async getAllLifecycleEvents(): Promise<ApiLifecycleEvent[]> {
    const { data, error } = await supabase
      .from('api_lifecycle_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all lifecycle events:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      event_type: item.event_type as ApiEventType,
      impact_level: item.impact_level as ImpactLevel,
      metadata: item.metadata as Record<string, any>
    })) as ApiLifecycleEvent[];
  }

  /**
   * Creates a new lifecycle event
   */
  async createLifecycleEvent(event: Omit<ApiLifecycleEvent, 'id' | 'created_at'>): Promise<ApiLifecycleEvent> {
    const { data, error } = await supabase
      .from('api_lifecycle_events')
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error('Error creating lifecycle event:', error);
      throw error;
    }

    return {
      ...data,
      event_type: data.event_type as ApiEventType,
      impact_level: data.impact_level as ImpactLevel,
      metadata: data.metadata as Record<string, any>
    } as ApiLifecycleEvent;
  }

  /**
   * Gets consumption logs for an API integration
   */
  async getConsumptionLogs(apiIntegrationId: string, limit: number = 100): Promise<ApiConsumptionLog[]> {
    const { data, error } = await supabase
      .from('api_consumption_logs')
      .select('*')
      .eq('api_integration_id', apiIntegrationId)
      .order('request_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching consumption logs:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      error_details: item.error_details as Record<string, any> | undefined
    })) as ApiConsumptionLog[];
  }

  /**
   * Records API consumption
   */
  async recordConsumption(log: Omit<ApiConsumptionLog, 'id' | 'request_timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('api_consumption_logs')
      .insert([{
        ...log,
        request_timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error recording API consumption:', error);
      throw error;
    }
  }

  /**
   * Gets API integration statistics
   */
  async getStats() {
    const { data: integrations } = await supabase
      .from('api_integration_registry')
      .select('direction, type, category, status, lifecycle_stage');

    if (!integrations) return null;

    const stats = {
      totalIntegrations: integrations.length,
      internalApis: integrations.filter(i => i.type === 'internal').length,
      externalApis: integrations.filter(i => i.type === 'external').length,
      byDirection: {},
      byCategory: {},
      byStatus: {},
      byLifecycleStage: {}
    };

    // Calculate category distribution
    integrations.forEach(integration => {
      stats.byDirection[integration.direction] = (stats.byDirection[integration.direction] || 0) + 1;
      stats.byCategory[integration.category] = (stats.byCategory[integration.category] || 0) + 1;
      stats.byStatus[integration.status] = (stats.byStatus[integration.status] || 0) + 1;
      stats.byLifecycleStage[integration.lifecycle_stage] = (stats.byLifecycleStage[integration.lifecycle_stage] || 0) + 1;
    });

    return stats;
  }
}

export const apiIntegrationManager = new ApiIntegrationManagerClass();
