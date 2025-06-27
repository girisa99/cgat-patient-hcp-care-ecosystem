
/**
 * API Integration Management System
 * Centralized management for all API integrations
 */

import { ApiIntegration } from './ApiIntegrationTypes';
import { InternalApiDetector } from './InternalApiDetector';
import { PostmanCollectionGenerator } from './PostmanCollectionGenerator';

export class ApiIntegrationManager {
  private static integrations: ApiIntegration[] = [];

  /**
   * Initialize all API integrations
   */
  static async initializeIntegrations(): Promise<ApiIntegration[]> {
    try {
      // Clear existing integrations first
      this.integrations = [];
      
      // Get the core internal API integration from InternalApiDetector
      const internalIntegration = InternalApiDetector.generateMockInternalIntegration();
      
      // Add the internal integration
      this.integrations = [internalIntegration];
      
      return this.integrations;
    } catch (error) {
      // Fallback: return at least the internal integration
      const fallbackIntegration = InternalApiDetector.generateMockInternalIntegration();
      this.integrations = [fallbackIntegration];
      
      return this.integrations;
    }
  }

  /**
   * Get all integrations
   */
  static getIntegrations(): ApiIntegration[] {
    return [...this.integrations];
  }

  /**
   * Get integration by ID
   */
  static getIntegrationById(id: string): ApiIntegration | undefined {
    return this.integrations.find(integration => integration.id === id);
  }

  /**
   * Add new integration
   */
  static addIntegration(integration: ApiIntegration): void {
    this.integrations.push(integration);
  }

  /**
   * Update existing integration
   */
  static updateIntegration(id: string, updates: Partial<ApiIntegration>): boolean {
    const index = this.integrations.findIndex(integration => integration.id === id);
    if (index !== -1) {
      this.integrations[index] = { ...this.integrations[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Remove integration
   */
  static removeIntegration(id: string): boolean {
    const index = this.integrations.findIndex(integration => integration.id === id);
    if (index !== -1) {
      this.integrations.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get integration statistics
   */
  static getIntegrationStats() {
    return {
      total: this.integrations.length,
      byType: {
        internal: this.integrations.filter(i => i.type === 'internal').length,
        external: this.integrations.filter(i => i.type === 'external').length
      },
      byStatus: {
        active: this.integrations.filter(i => i.status === 'active').length,
        inactive: this.integrations.filter(i => i.status === 'inactive').length,
        draft: this.integrations.filter(i => i.status === 'draft').length,
        deprecated: this.integrations.filter(i => i.status === 'deprecated').length
      },
      totalEndpoints: this.integrations.reduce((sum, i) => sum + i.endpoints.length, 0),
      totalSchemas: this.integrations.reduce((sum, i) => sum + Object.keys(i.schemas).length, 0)
    };
  }

  /**
   * Register new integration
   */
  static async registerIntegration(config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    const integration: ApiIntegration = {
      ...config,
      id: `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.addIntegration(integration);
    return integration;
  }

  /**
   * Execute integration
   */
  static async executeIntegration(integrationId: string, operation: 'sync' | 'webhook' | 'manual', data?: any) {
    const integration = this.getIntegrationById(integrationId);
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    // Mock execution result
    return {
      success: true,
      operation,
      integrationId,
      data: data || {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export Postman collection
   */
  static async exportPostmanCollection(integrationId: string): Promise<string> {
    const integration = this.getIntegrationById(integrationId);
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    const collection = await PostmanCollectionGenerator.generatePostmanCollection(integration);
    return PostmanCollectionGenerator.exportPostmanCollection(collection);
  }

  /**
   * Export API documentation
   */
  static async exportApiDocumentation() {
    const allIntegrations = this.getIntegrations();
    
    return {
      metadata: {
        total_integrations: allIntegrations.length,
        total_endpoints: allIntegrations.reduce((sum, i) => sum + i.endpoints.length, 0),
        total_rls_policies: allIntegrations.reduce((sum, i) => sum + i.rlsPolicies.length, 0),
        total_data_mappings: allIntegrations.reduce((sum, i) => sum + i.mappings.length, 0),
        export_timestamp: new Date().toISOString()
      },
      integrations: allIntegrations.map(integration => ({
        id: integration.id,
        name: integration.name,
        type: integration.type,
        endpoints: integration.endpoints,
        schemas: integration.schemas,
        rlsPolicies: integration.rlsPolicies,
        mappings: integration.mappings
      }))
    };
  }

  /**
   * Generate Postman collection for integration
   */
  static async generatePostmanCollection(integrationId: string): Promise<any> {
    const integration = this.getIntegrationById(integrationId);
    if (!integration) {
      throw new Error(`Integration with ID ${integrationId} not found`);
    }
    
    return await PostmanCollectionGenerator.generatePostmanCollection(integration);
  }
}
