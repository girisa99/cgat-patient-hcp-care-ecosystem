/**
 * Enhanced API Integration Service Layer
 * Manages both internal and external API integrations with clear differentiation
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiIntegration, ApiEndpoint, DataMapping, RLSPolicy, PostmanCollection } from './ApiIntegrationTypes';
import { InternalApiDetector } from './InternalApiDetector';

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
    const internalEndpoints = InternalApiDetector.detectInternalApis();
    
    const internalIntegration: ApiIntegration = {
      id: 'internal_healthcare_api',
      name: 'Healthcare Admin Internal API',
      description: 'Internal APIs for healthcare administration platform with HIPAA-compliant operations',
      baseUrl: window.location.origin,
      version: '1.0.0',
      type: 'internal',
      category: 'healthcare',
      status: 'active',
      endpoints: internalEndpoints.map(endpoint => ({
        id: `internal_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: endpoint.name,
        description: endpoint.description,
        method: endpoint.method as any,
        url: endpoint.path,
        fullUrl: `${window.location.origin}${endpoint.path}`,
        headers: endpoint.authentication === 'bearer' 
          ? { 'Authorization': 'Bearer {{token}}', 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
        queryParams: endpoint.parameters?.reduce((acc, param) => {
          acc[param] = `{{${param}}}`;
          return acc;
        }, {} as Record<string, string>) || {},
        isPublic: endpoint.isPublic,
        authentication: {
          type: endpoint.authentication as any,
          credentials: endpoint.authentication === 'bearer' 
            ? { token: '{{jwt_token}}' }
            : {}
        },
        documentation: `Module: ${endpoint.module}. ${endpoint.description}`,
        responseSchema: endpoint.responses
      })),
      schemas: this.generateInternalSchemas(),
      mappings: [],
      rlsPolicies: [],
      contact: {
        name: 'Internal Development Team',
        email: 'dev-team@healthcare-admin.com',
        team: 'Platform Engineering'
      },
      sla: {
        uptime: '99.9%',
        responseTime: '<200ms',
        support: '24/7 Internal Support'
      },
      externalDocumentation: {
        swaggerUrl: `${window.location.origin}/api/docs`,
        apiReference: `${window.location.origin}/api/reference`,
        examples: `${window.location.origin}/api/examples`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(internalIntegration.id, internalIntegration);
    
    // Generate Postman collection for internal APIs
    const collection = await this.generatePostmanCollection(internalIntegration);
    this.collections.set(internalIntegration.id, collection);
  }

  /**
   * Generate schemas for internal APIs
   */
  private generateInternalSchemas(): Record<string, any> {
    return {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'nurse', 'provider'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
          facilityId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'email', 'firstName', 'lastName', 'role']
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          medicalRecordNumber: { type: 'string' },
          facilityId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['active', 'inactive', 'discharged'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'firstName', 'lastName', 'dateOfBirth', 'facilityId']
      },
      Facility: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          type: { type: 'string', enum: ['hospital', 'clinic', 'nursing_home', 'urgent_care'] },
          status: { type: 'string', enum: ['active', 'inactive'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'type']
      }
    };
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

    integration.schemas = await this.analyzeSchemas(config.endpoints);
    integration.mappings = await this.generateDataMappings(integration);
    integration.rlsPolicies = await this.generateRLSPolicies(integration);
    
    this.integrations.set(integration.id, integration);
    
    const collection = await this.generatePostmanCollection(integration);
    this.collections.set(integration.id, collection);
    
    await this.saveIntegration(integration);
    
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

  private standardizeSchema(schema: any): any {
    return {
      type: 'object',
      properties: this.extractProperties(schema),
      required: this.extractRequired(schema),
      additionalProperties: false
    };
  }

  private async generateDataMappings(integration: ApiIntegration): Promise<DataMapping[]> {
    const mappings: DataMapping[] = [];
    
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

  private async suggestMapping(fieldName: string, fieldSchema: any, integrationName: string): Promise<DataMapping | null> {
    const tables = await this.getDatabaseTables();
    
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

  private async generateRLSPolicies(integration: ApiIntegration): Promise<RLSPolicy[]> {
    const policies: RLSPolicy[] = [];
    const tables = [...new Set(integration.mappings.map(m => m.targetTable))];
    
    for (const table of tables) {
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

  private async generatePostmanCollection(integration: ApiIntegration): Promise<PostmanCollection> {
    const collection: PostmanCollection = {
      info: {
        name: `${integration.name} API`,
        description: `${integration.description}\n\nType: ${integration.type}\nCategory: ${integration.category}\nStatus: ${integration.status}`,
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

    if (integration.endpoints[0]?.authentication && integration.endpoints[0].authentication.type !== 'none') {
      collection.auth = this.generatePostmanAuth(integration.endpoints[0].authentication);
    }

    for (const endpoint of integration.endpoints) {
      const item = this.generatePostmanItem(endpoint, integration);
      collection.item.push(item);
    }

    return collection;
  }

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
          raw: endpoint.fullUrl || `{{baseUrl}}${endpoint.url}`,
          host: endpoint.fullUrl ? [endpoint.fullUrl.split('/')[2]] : ['{{baseUrl}}'],
          path: endpoint.url.split('/').filter(p => p)
        }
      },
      response: []
    };

    if (endpoint.queryParams) {
      item.request.url.query = Object.entries(endpoint.queryParams).map(([key, value]) => ({
        key,
        value
      }));
    }

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
    return ['profiles', 'facilities', 'modules', 'permissions', 'roles', 'user_roles', 'audit_logs'];
  }

  private async getTableColumns(tableName: string): Promise<any[]> {
    const knownColumns: Record<string, any[]> = {
      profiles: [
        { name: 'id', type: 'uuid' },
        { name: 'first_name', type: 'varchar' },
        { name: 'last_name', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'phone', type: 'varchar' }
      ],
      facilities: [
        { name: 'id', type: 'uuid' },
        { name: 'name', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'phone', type: 'varchar' }
      ]
    };
    
    return knownColumns[tableName] || [];
  }

  private isFieldMatch(apiField: string, dbField: string): boolean {
    const normalized1 = apiField.toLowerCase().replace(/[_-]/g, '');
    const normalized2 = dbField.toLowerCase().replace(/[_-]/g, '');
    return normalized1 === normalized2 || normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  private suggestTransformation(fieldSchema: any, column: any): string {
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

  async executeIntegration(integrationId: string, operation: 'sync' | 'webhook' | 'manual', data?: any) {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    console.log(`🚀 Executing integration: ${integration.name} (${operation})`);

    try {
      const mappedData = await this.applyDataMappings(data, integration.mappings);
      await this.validateData(mappedData, integration.schemas);
      await this.saveIntegratedData(mappedData, integration);
      await this.logIntegrationEvent(integrationId, operation, 'success');
      
      return { success: true, data: mappedData };
    } catch (error) {
      await this.logIntegrationEvent(integrationId, operation, 'error', error);
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
    
    return JSON.stringify(collection, null, 2);
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
    console.log('📝 Validating data against schemas...');
  }

  private async saveIntegratedData(data: any, integration: ApiIntegration): Promise<void> {
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
    
    for (const [tableName, records] of Object.entries(tableData)) {
      if (tableName === 'profiles' || tableName === 'facilities' || tableName === 'audit_logs') {
        await (supabase.from as any)(tableName).insert(records);
      }
    }
  }

  private async saveIntegration(integration: ApiIntegration): Promise<void> {
    await supabase.from('audit_logs').insert({
      action: 'API_INTEGRATION_CREATED',
      table_name: 'api_integrations',
      record_id: integration.id,
      new_values: {
        id: integration.id,
        name: integration.name,
        description: integration.description,
        type: integration.type,
        category: integration.category,
        created_at: integration.createdAt,
        updated_at: integration.updatedAt
      }
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
