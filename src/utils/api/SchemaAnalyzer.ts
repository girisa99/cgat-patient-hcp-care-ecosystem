
/**
 * Schema Analysis and Data Generation Utilities
 */

import { ApiEndpoint, ApiIntegration } from './ApiIntegrationTypes';

export class SchemaAnalyzer {
  /**
   * Generates OpenAPI specification from API integration
   */
  static generateOpenAPISpec(integration: ApiIntegration) {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: integration.name,
        description: integration.description,
        version: integration.version
      },
      servers: [
        {
          url: integration.baseUrl,
          description: `${integration.type} API server`
        }
      ],
      paths: {} as Record<string, any>,
      components: {
        schemas: integration.schemas,
        securitySchemes: this.generateSecuritySchemes(integration.endpoints)
      }
    };

    integration.endpoints.forEach(endpoint => {
      const path = endpoint.url;
      if (!spec.paths[path]) {
        spec.paths[path] = {};
      }
      
      spec.paths[path][endpoint.method.toLowerCase()] = {
        summary: endpoint.name,
        description: endpoint.description,
        responses: endpoint.responseSchema ? {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: endpoint.responseSchema
              }
            }
          }
        } : {
          '200': {
            description: 'Successful response'
          }
        }
      };
    });

    return spec;
  }

  /**
   * Generates security schemes based on endpoints
   */
  static generateSecuritySchemes(endpoints: ApiEndpoint[]) {
    const schemes: Record<string, any> = {};

    endpoints.forEach(endpoint => {
      if (endpoint.authentication && endpoint.authentication.type !== 'none') {
        const authType = endpoint.authentication.type;
        if (!schemes[authType]) {
          switch (authType) {
            case 'bearer':
              schemes[authType] = {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              };
              break;
            case 'apiKey':
              schemes[authType] = {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key'
              };
              break;
            case 'basic':
              schemes[authType] = {
                type: 'http',
                scheme: 'basic'
              };
              break;
            case 'oauth2':
              schemes[authType] = {
                type: 'oauth2',
                flows: {
                  authorizationCode: {
                    authorizationUrl: '/oauth/authorize',
                    tokenUrl: '/oauth/token',
                    scopes: {}
                  }
                }
              };
              break;
          }
        }
      }
    });

    return schemes;
  }

  /**
   * Generates sample data from schema
   */
  static generateSampleData(schema: Record<string, any>): any {
    if (!schema || typeof schema !== 'object') {
      return {};
    }

    if (schema.type === 'object' && schema.properties) {
      const sampleData: Record<string, any> = {};
      
      Object.entries(schema.properties).forEach(([key, propSchema]: [string, any]) => {
        sampleData[key] = this.generateSampleValue(propSchema);
      });
      
      return sampleData;
    }

    return this.generateSampleValue(schema);
  }

  /**
   * Generates sample value based on schema type
   */
  static generateSampleValue(schema: any): any {
    if (!schema || typeof schema !== 'object') {
      return null;
    }

    switch (schema.type) {
      case 'string':
        if (schema.format === 'email') return 'example@email.com';
        if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
        if (schema.format === 'date-time') return new Date().toISOString();
        return 'example string';
      case 'number':
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        return schema.items ? [this.generateSampleValue(schema.items)] : [];
      case 'object':
        return this.generateSampleData(schema);
      default:
        return null;
    }
  }

  /**
   * Generates internal API schemas
   */
  static generateInternalSchemas(): Record<string, any> {
    return {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          phone: { type: 'string' },
          department: { type: 'string' },
          facility_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Facility: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          facility_type: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          npi_number: { type: 'string' },
          license_number: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' }
        }
      },
      Module: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },
      Permission: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' }
        }
      }
    };
  }
}
