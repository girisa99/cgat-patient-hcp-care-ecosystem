
/**
 * Enhanced API Integration Service Layer
 * Manages both internal and external API integrations with real data detection
 */

import { ApiIntegration, PostmanCollection } from './ApiIntegrationTypes';
import { RealApiScanner } from './RealApiScanner';
import { SchemaAnalyzer } from './SchemaAnalyzer';
import { DataMappingGenerator } from './DataMappingGenerator';
import { RLSPolicyGenerator } from './RLSPolicyGenerator';
import { PostmanCollectionGenerator } from './PostmanCollectionGenerator';
import { IntegrationDataManager } from './IntegrationDataManager';

class ApiIntegrationManagerClass {
  private integrations: Map<string, ApiIntegration> = new Map();
  private collections: Map<string, PostmanCollection> = new Map();
  private initialized = false;

  constructor() {
    this.initializeRealApis();
  }

  /**
   * Initialize APIs using real data scanning
   */
  private async initializeRealApis(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔍 Scanning real API data...');
      
      // Generate real internal API with actual RLS policies and data mappings
      const realInternalApi = await RealApiScanner.generateRealInternalApi();
      
      this.integrations.set(realInternalApi.id, realInternalApi);
      
      // Generate Postman collection for the real API
      const collection = await PostmanCollectionGenerator.generatePostmanCollection(realInternalApi);
      this.collections.set(realInternalApi.id, collection);
      
      this.initialized = true;
      console.log(`✅ Real API Integration initialized: ${realInternalApi.name}`);
      console.log(`📊 Found ${realInternalApi.endpoints.length} endpoints`);
      console.log(`🛡️ Found ${realInternalApi.rlsPolicies.length} RLS policies`);
      console.log(`🔗 Found ${realInternalApi.mappings.length} data mappings`);
      
    } catch (error) {
      console.error('❌ Failed to initialize real APIs:', error);
      // Fallback to basic structure if scanning fails
      await this.initializeFallbackApi();
    }
  }

  /**
   * Fallback initialization if real scanning fails
   */
  private async initializeFallbackApi(): Promise<void> {
    const fallbackApi: ApiIntegration = {
      id: 'internal_healthcare_api',
      name: 'Healthcare Admin Internal API',
      description: 'Internal API for healthcare administration',
      type: 'internal',
      baseUrl: window.location.origin,
      version: '1.0.0',
      status: 'active',
      category: 'healthcare',
      endpoints: RealApiScanner.scanApiEndpoints(),
      rlsPolicies: RealApiScanner.detectRLSFromSchema(),
      mappings: await RealApiScanner.scanDataMappings(),
      schemas: RealApiScanner.generateApiSchemas(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(fallbackApi.id, fallbackApi);
    
    const collection = await PostmanCollectionGenerator.generatePostmanCollection(fallbackApi);
    this.collections.set(fallbackApi.id, collection);
    
    console.log('⚠️ Using fallback API initialization');
  }

  /**
   * Register external API integration
   */
  async registerIntegration(config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    await this.ensureInitialized();
    
    const integration: ApiIntegration = {
      ...config,
      id: this.generateId(),
      type: 'external',
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
   * Ensure initialization is complete
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeRealApis();
    }
  }

  /**
   * Get all integrations with type filtering
   */
  async getIntegrations(type?: 'internal' | 'external'): Promise<ApiIntegration[]> {
    await this.ensureInitialized();
    
    const allIntegrations = Array.from(this.integrations.values());
    
    if (type) {
      return allIntegrations.filter(integration => integration.type === type);
    }
    
    return allIntegrations;
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats() {
    await this.ensureInitialized();
    
    const allIntegrations = Array.from(this.integrations.values());
    
    return {
      total: allIntegrations.length,
      internal: allIntegrations.filter(i => i.type === 'internal').length,
      external: allIntegrations.filter(i => i.type === 'external').length,
      active: allIntegrations.filter(i => i.status === 'active').length,
      inactive: allIntegrations.filter(i => i.status === 'inactive').length,
      totalEndpoints: allIntegrations.reduce((acc, i) => acc + i.endpoints.length, 0),
      totalRlsPolicies: allIntegrations.reduce((acc, i) => acc + i.rlsPolicies.length, 0),
      totalMappings: allIntegrations.reduce((acc, i) => acc + i.mappings.length, 0),
      byCategory: allIntegrations.reduce((acc, integration) => {
        acc[integration.category] = (acc[integration.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Export comprehensive API documentation
   */
  async exportApiDocumentation(): Promise<any> {
    await this.ensureInitialized();
    
    const allIntegrations = Array.from(this.integrations.values());
    
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        total_apis: allIntegrations.length,
        total_endpoints: allIntegrations.reduce((acc, i) => acc + i.endpoints.length, 0),
        total_rls_policies: allIntegrations.reduce((acc, i) => acc + i.rlsPolicies.length, 0),
        total_data_mappings: allIntegrations.reduce((acc, i) => acc + i.mappings.length, 0)
      },
      internal: allIntegrations
        .filter(i => i.type === 'internal')
        .map(integration => ({
          name: integration.name,
          description: integration.description,
          baseUrl: integration.baseUrl,
          version: integration.version,
          endpoints: integration.endpoints,
          rlsPolicies: integration.rlsPolicies,
          mappings: integration.mappings,
          schemas: integration.schemas
        })),
      external: allIntegrations
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
    await this.ensureInitialized();
    
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

  async getPostmanCollection(integrationId: string): Promise<PostmanCollection | null> {
    await this.ensureInitialized();
    return this.collections.get(integrationId) || null;
  }

  async exportPostmanCollection(integrationId: string): Promise<string> {
    const collection = await this.getPostmanCollection(integrationId);
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
