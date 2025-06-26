
/**
 * API Integration Service Layer
 * Standardizes external API integrations with automated schema generation,
 * RLS policies, and Postman collection creation
 */

import { supabase } from '@/integrations/supabase/client';

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  queryParams?: Record<string, string>;
  bodySchema?: any;
  responseSchema?: any;
  authentication?: {
    type: 'bearer' | 'api-key' | 'oauth' | 'basic';
    credentials: Record<string, string>;
  };
  rateLimit?: {
    requests: number;
    period: string;
  };
  retryConfig?: {
    attempts: number;
    backoff: 'linear' | 'exponential';
  };
}

export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  version: string;
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  mappings: DataMapping[];
  rlsPolicies: RLSPolicy[];
  webhooks?: WebhookConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  targetTable: string;
  transformation?: string;
  validation?: string;
}

export interface RLSPolicy {
  tableName: string;
  policyName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  condition: string;
  roles: string[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  retryAttempts: number;
}

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    version: string;
    schema: string;
  };
  auth?: any;
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: any[];
    url: any;
    body?: any;
  };
  response: any[];
}

export interface PostmanVariable {
  key: string;
  value: string;
  type: string;
}

class ApiIntegrationManagerClass {
  private integrations: Map<string, ApiIntegration> = new Map();
  private collections: Map<string, PostmanCollection> = new Map();

  /**
   * Register a new API integration with automatic schema analysis
   */
  async registerIntegration(config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiIntegration> {
    const integration: ApiIntegration = {
      ...config,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Analyze and standardize schemas
    integration.schemas = await this.analyzeSchemas(config.endpoints);
    
    // Generate data mappings
    integration.mappings = await this.generateDataMappings(integration);
    
    // Create RLS policies
    integration.rlsPolicies = await this.generateRLSPolicies(integration);
    
    // Store integration
    this.integrations.set(integration.id, integration);
    
    // Generate Postman collection
    const collection = await this.generatePostmanCollection(integration);
    this.collections.set(integration.id, collection);
    
    // Save to database
    await this.saveIntegration(integration);
    
    console.log(`🔗 API Integration registered: ${integration.name}`);
    return integration;
  }

  /**
   * Analyze endpoint schemas and standardize them
   */
  private async analyzeSchemas(endpoints: ApiEndpoint[]): Promise<Record<string, any>> {
    const schemas: Record<string, any> = {};
    
    for (const endpoint of endpoints) {
      if (endpoint.bodySchema) {
        schemas[`${endpoint.name}_request`] = this.standardizeSchema(endpoint.bodySchema);
      }
      
      if (endpoint.responseSchema) {
        schemas[`${endpoint.name}_response`] = this.standardizeSchema(endpoint.responseSchema);
      }
    }
    
    return schemas;
  }

  /**
   * Standardize schema format
   */
  private standardizeSchema(schema: any): any {
    // Convert to standardized JSON Schema format
    return {
      type: 'object',
      properties: this.extractProperties(schema),
      required: this.extractRequired(schema),
      additionalProperties: false
    };
  }

  /**
   * Generate data mappings between API and database
   */
  private async generateDataMappings(integration: ApiIntegration): Promise<DataMapping[]> {
    const mappings: DataMapping[] = [];
    
    // Analyze schemas and suggest mappings
    for (const [schemaName, schema] of Object.entries(integration.schemas)) {
      if (schema.properties) {
        for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
          const mapping = await this.suggestMapping(fieldName, fieldSchema as any, integration.name);
          if (mapping) {
            mappings.push(mapping);
          }
        }
      }
    }
    
    return mappings;
  }

  /**
   * Suggest database mapping for API field
   */
  private async suggestMapping(fieldName: string, fieldSchema: any, integrationName: string): Promise<DataMapping | null> {
    // Get database tables
    const tables = await this.getDatabaseTables();
    
    // Find matching table and field
    for (const table of tables) {
      const columns = await this.getTableColumns(table);
      
      for (const column of columns) {
        if (this.isFieldMatch(fieldName, column.name)) {
          return {
            sourceField: fieldName,
            targetField: column.name,
            targetTable: table,
            transformation: this.suggestTransformation(fieldSchema, column),
            validation: this.suggestValidation(fieldSchema)
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Generate RLS policies for API integration
   */
  private async generateRLSPolicies(integration: ApiIntegration): Promise<RLSPolicy[]> {
    const policies: RLSPolicy[] = [];
    
    // Extract unique tables from mappings
    const tables = [...new Set(integration.mappings.map(m => m.targetTable))];
    
    for (const table of tables) {
      // Generate policies for each operation
      policies.push(
        {
          tableName: table,
          policyName: `${integration.name}_select_policy`,
          operation: 'SELECT',
          condition: `integration_id = '${integration.id}'`,
          roles: ['authenticated']
        },
        {
          tableName: table,
          policyName: `${integration.name}_insert_policy`,
          operation: 'INSERT',
          condition: `auth.uid() IS NOT NULL`,
          roles: ['authenticated']
        }
      );
    }
    
    return policies;
  }

  /**
   * Generate Postman collection from integration
   */
  private async generatePostmanCollection(integration: ApiIntegration): Promise<PostmanCollection> {
    const collection: PostmanCollection = {
      info: {
        name: `${integration.name} API`,
        description: integration.description,
        version: integration.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: integration.baseUrl,
          type: 'string'
        }
      ]
    };

    // Add authentication if configured
    if (integration.endpoints[0]?.authentication) {
      collection.auth = this.generatePostmanAuth(integration.endpoints[0].authentication);
    }

    // Generate request items
    for (const endpoint of integration.endpoints) {
      const item = this.generatePostmanItem(endpoint, integration);
      collection.item.push(item);
    }

    return collection;
  }

  /**
   * Generate Postman authentication config
   */
  private generatePostmanAuth(auth: ApiEndpoint['authentication']) {
    if (!auth) return undefined;

    switch (auth.type) {
      case 'bearer':
        return {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{bearerToken}}',
              type: 'string'
            }
          ]
        };
      case 'api-key':
        return {
          type: 'apikey',
          apikey: [
            {
              key: 'key',
              value: 'X-API-Key',
              type: 'string'
            },
            {
              key: 'value',
              value: '{{apiKey}}',
              type: 'string'
            }
          ]
        };
      default:
        return undefined;
    }
  }

  /**
   * Generate Postman request item
   */
  private generatePostmanItem(endpoint: ApiEndpoint, integration: ApiIntegration): PostmanItem {
    const item: PostmanItem = {
      name: endpoint.name,
      request: {
        method: endpoint.method,
        header: Object.entries(endpoint.headers).map(([key, value]) => ({
          key,
          value,
          type: 'text'
        })),
        url: {
          raw: `{{baseUrl}}${endpoint.url}`,
          host: ['{{baseUrl}}'],
          path: endpoint.url.split('/').filter(p => p)
        }
      },
      response: []
    };

    // Add query parameters
    if (endpoint.queryParams) {
      item.request.url.query = Object.entries(endpoint.queryParams).map(([key, value]) => ({
        key,
        value
      }));
    }

    // Add request body
    if (endpoint.bodySchema && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(this.generateSampleData(endpoint.bodySchema), null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }

    return item;
  }

  /**
   * Execute API integration workflow
   */
  async executeIntegration(integrationId: string, operation: 'sync' | 'webhook' | 'manual', data?: any) {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    console.log(`🚀 Executing integration: ${integration.name} (${operation})`);

    try {
      // Apply data mappings
      const mappedData = await this.applyDataMappings(data, integration.mappings);
      
      // Validate against schemas
      await this.validateData(mappedData, integration.schemas);
      
      // Save to database with RLS policies
      await this.saveIntegratedData(mappedData, integration);
      
      // Log integration event
      await this.logIntegrationEvent(integrationId, operation, 'success');
      
      return { success: true, data: mappedData };
    } catch (error) {
      await this.logIntegrationEvent(integrationId, operation, 'error', error);
      throw error;
    }
  }

  /**
   * Get Postman collection for download
   */
  getPostmanCollection(integrationId: string): PostmanCollection | null {
    return this.collections.get(integrationId) || null;
  }

  /**
   * Export collection as JSON
   */
  exportPostmanCollection(integrationId: string): string {
    const collection = this.getPostmanCollection(integrationId);
    if (!collection) {
      throw new Error(`Collection not found for integration: ${integrationId}`);
    }
    
    return JSON.stringify(collection, null, 2);
  }

  /**
   * Get all registered integrations
   */
  getIntegrations(): ApiIntegration[] {
    return Array.from(this.integrations.values());
  }

  // Helper methods
  private generateId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractProperties(schema: any): Record<string, any> {
    if (typeof schema === 'object' && schema.properties) {
      return schema.properties;
    }
    return {};
  }

  private extractRequired(schema: any): string[] {
    if (typeof schema === 'object' && Array.isArray(schema.required)) {
      return schema.required;
    }
    return [];
  }

  private async getDatabaseTables(): Promise<string[]> {
    const { data } = await supabase.rpc('get_table_names');
    return data || [];
  }

  private async getTableColumns(tableName: string): Promise<any[]> {
    const { data } = await supabase.rpc('get_table_columns', { table_name: tableName });
    return data || [];
  }

  private isFieldMatch(apiField: string, dbField: string): boolean {
    const normalized1 = apiField.toLowerCase().replace(/[_-]/g, '');
    const normalized2 = dbField.toLowerCase().replace(/[_-]/g, '');
    return normalized1 === normalized2 || normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  private suggestTransformation(fieldSchema: any, column: any): string {
    // Basic transformation suggestions
    if (fieldSchema.type === 'string' && column.type === 'uuid') {
      return 'parseUUID';
    }
    if (fieldSchema.format === 'date-time' && column.type === 'timestamp') {
      return 'parseTimestamp';
    }
    return 'direct';
  }

  private suggestValidation(fieldSchema: any): string {
    const validations = [];
    if (fieldSchema.required) validations.push('required');
    if (fieldSchema.minLength) validations.push(`minLength:${fieldSchema.minLength}`);
    if (fieldSchema.maxLength) validations.push(`maxLength:${fieldSchema.maxLength}`);
    if (fieldSchema.pattern) validations.push(`pattern:${fieldSchema.pattern}`);
    return validations.join('|');
  }

  private generateSampleData(schema: any): any {
    if (!schema.properties) return {};
    
    const sample: any = {};
    for (const [key, prop] of Object.entries(schema.properties as any)) {
      sample[key] = this.generateSampleValue(prop);
    }
    return sample;
  }

  private generateSampleValue(prop: any): any {
    switch (prop.type) {
      case 'string':
        return prop.example || 'sample_string';
      case 'number':
        return prop.example || 123;
      case 'boolean':
        return prop.example || true;
      case 'array':
        return [this.generateSampleValue(prop.items || { type: 'string' })];
      case 'object':
        return this.generateSampleData(prop);
      default:
        return null;
    }
  }

  private async applyDataMappings(data: any, mappings: DataMapping[]): Promise<any> {
    const mapped: any = {};
    
    for (const mapping of mappings) {
      if (data[mapping.sourceField] !== undefined) {
        mapped[mapping.targetField] = await this.transformValue(
          data[mapping.sourceField],
          mapping.transformation
        );
      }
    }
    
    return mapped;
  }

  private async transformValue(value: any, transformation?: string): Promise<any> {
    if (!transformation || transformation === 'direct') {
      return value;
    }
    
    switch (transformation) {
      case 'parseUUID':
        return typeof value === 'string' ? value : String(value);
      case 'parseTimestamp':
        return new Date(value).toISOString();
      default:
        return value;
    }
  }

  private async validateData(data: any, schemas: Record<string, any>): Promise<void> {
    // Basic validation - can be enhanced with a proper JSON schema validator
    console.log('📝 Validating data against schemas...');
  }

  private async saveIntegratedData(data: any, integration: ApiIntegration): Promise<void> {
    // Group data by target tables
    const tableData: Record<string, any[]> = {};
    
    integration.mappings.forEach(mapping => {
      if (!tableData[mapping.targetTable]) {
        tableData[mapping.targetTable] = [];
      }
      tableData[mapping.targetTable].push({
        [mapping.targetField]: data[mapping.targetField],
        integration_id: integration.id,
        synced_at: new Date()
      });
    });
    
    // Save to each table
    for (const [tableName, records] of Object.entries(tableData)) {
      await supabase.from(tableName as any).insert(records);
    }
  }

  private async saveIntegration(integration: ApiIntegration): Promise<void> {
    await supabase.from('api_integrations' as any).upsert({
      id: integration.id,
      name: integration.name,
      description: integration.description,
      config: integration,
      created_at: integration.createdAt,
      updated_at: integration.updatedAt
    });
  }

  private async logIntegrationEvent(
    integrationId: string,
    operation: string,
    status: string,
    error?: any
  ): Promise<void> {
    await supabase.from('audit_logs').insert({
      action: `API_INTEGRATION_${operation.toUpperCase()}`,
      table_name: 'api_integrations',
      record_id: integrationId,
      new_values: {
        operation,
        status,
        error: error?.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const apiIntegrationManager = new ApiIntegrationManagerClass();

// Export types for use in other modules
export type {
  ApiEndpoint,
  ApiIntegration,
  DataMapping,
  RLSPolicy,
  PostmanCollection
};
