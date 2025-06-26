
/**
 * Enhanced API Integration Service Layer
 * Manages both internal and external API integrations with clear differentiation
 */

import { ApiIntegration, PostmanCollection } from './ApiIntegrationTypes';
import { InternalApiDetector } from './InternalApiDetector';
import { InternalApiInitializer } from './InternalApiInitializer';
import { SchemaAnalyzer } from './SchemaAnalyzer';
import { DataMappingGenerator } from './DataMappingGenerator';
import { RLSPolicyGenerator } from './RLSPolicyGenerator';
import { PostmanCollectionGenerator } from './PostmanCollectionGenerator';
import { IntegrationDataManager } from './IntegrationDataManager';

class ApiIntegrationManagerClass {
  private integrations: Map<string, ApiIntegration> = new Map();
  private collections: Map<string, PostmanCollection> = new Map();

  constructor() {
    this.initializeInternalApis();
  }

  /**
   * Initialize internal APIs from the application
   */
  private async initializeInternalApis(): Promise<void> {
    const { integration, collection } = await InternalApiInitializer.initializeInternalApis();
    
    this.integrations.set(integration.id, integration);
    this.collections.set(integration.id, collection);
  }

  /**
   * Register external API integration
   */
  async registerIntegration(config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    const integration: ApiIntegration = {
      ...config,
      id: this.generateId(),
      type: 'external', // Mark as external
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    integration.schemas = await SchemaAnalyzer.analyzeSchemas(config.endpoints);
    integration.mappings = await DataMappingGenerator.generateDataMappings(integration);
    integration.rlsPolicies = await RLSPolicyGenerator.generateRLSPolicies(integration);
    
    this.integrations.set(integration.id, integration);
    
    const collection = await PostmanCollectionGenerator.generatePostmanCollection(integration);
    this.collections.set(integration.id, collection);
    
    await IntegrationDataManager.saveIntegration(integration);
    
    console.log(`🔗 External API Integration registered: ${integration.name}`);
    return integration;
  }

  /**
   * Get all integrations with type filtering
   */
  getIntegrations(type?: 'internal' | 'external'): ApiIntegration[] {
    const allIntegrations = Array.from(this.integrations.values());
    
    if (type) {
      return allIntegrations.filter(integration => integration.type === type);
    }
    
    return allIntegrations;
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats() {
    const allIntegrations = Array.from(this.integrations.values());
    
    return {
      total: allIntegrations.length,
      internal: allIntegrations.filter(i => i.type === 'internal').length,
      external: allIntegrations.filter(i => i.type === 'external').length,
      active: allIntegrations.filter(i => i.status === 'active').length,
      inactive: allIntegrations.filter(i => i.status === 'inactive').length,
      byCategory: allIntegrations.reduce((acc, integration) => {
        acc[integration.category] = (acc[integration.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Export comprehensive API documentation
   */
  exportApiDocumentation(): any {
    return {
      internal: InternalApiDetector.generateExternalDocumentation(),
      external: Array.from(this.integrations.values())
        .filter(i => i.type === 'external')
        .map(integration => ({
          name: integration.name,
          description: integration.description,
          baseUrl: integration.baseUrl,
          version: integration.version,
          endpoints: integration.endpoints,
          schemas: integration.schemas,
          contact: integration.contact,
          sla: integration.sla,
          documentation: integration.externalDocumentation
        }))
    };
  }

  async executeIntegration(integrationId: string, operation: 'sync' | 'webhook' | 'manual', data?: any) {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    console.log(`🚀 Executing integration: ${integration.name} (${operation})`);

    try {
      const mappedData = await DataMappingGenerator.applyDataMappings(data, integration.mappings);
      await IntegrationDataManager.validateData(mappedData, integration.schemas);
      await IntegrationDataManager.saveIntegratedData(mappedData, integration);
      await IntegrationDataManager.logIntegrationEvent(integrationId, operation, 'success');
      
      return { success: true, data: mappedData };
    } catch (error) {
      await IntegrationDataManager.logIntegrationEvent(integrationId, operation, 'error', error);
      throw error;
    }
  }

  getPostmanCollection(integrationId: string): PostmanCollection | null {
    return this.collections.get(integrationId) || null;
  }

  exportPostmanCollection(integrationId: string): string {
    const collection = this.getPostmanCollection(integrationId);
    if (!collection) {
      throw new Error(`Collection not found for integration: ${integrationId}`);
    }
    
    return PostmanCollectionGenerator.exportPostmanCollection(collection);
  }

  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const apiIntegrationManager = new ApiIntegrationManagerClass();
