/**
 * Schema Analysis and Data Generation Utilities
 * REFINED: Core healthcare business schemas with MCP and SML integration
 */

import { ApiEndpoint, ApiIntegration } from './ApiIntegrationTypes';
import { MCPResource, MCPTool } from '@/integrations/mcp/healthcare-server';

export class SchemaAnalyzer {
  /**
   * Generates OpenAPI specification from API integration with MCP support
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
        schemas: {
          ...integration.schemas,
          ...this.generateMCPSchemas(),
          ...this.generateSMLSchemas()
        },
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
   * Generate MCP protocol schemas for healthcare integrations
   */
  static generateMCPSchemas(): Record<string, any> {
    return {
      // MCP Request Schema
      MCPRequest: {
        type: 'object',
        description: 'Model Context Protocol request schema',
        properties: {
          jsonrpc: { type: 'string', enum: ['2.0'], description: 'JSON-RPC version' },
          id: { type: 'string', description: 'Request identifier' },
          method: { type: 'string', description: 'MCP method name' },
          params: { 
            type: 'object', 
            description: 'Method parameters',
            additionalProperties: true 
          }
        },
        required: ['jsonrpc', 'id', 'method']
      },

      // MCP Response Schema
      MCPResponse: {
        type: 'object',
        description: 'Model Context Protocol response schema',
        properties: {
          jsonrpc: { type: 'string', enum: ['2.0'], description: 'JSON-RPC version' },
          id: { type: 'string', description: 'Request identifier' },
          result: { 
            type: 'object', 
            description: 'Response result',
            additionalProperties: true 
          },
          error: {
            type: 'object',
            description: 'Error information',
            properties: {
              code: { type: 'integer', description: 'Error code' },
              message: { type: 'string', description: 'Error message' },
              data: { description: 'Additional error data' }
            }
          }
        },
        required: ['jsonrpc', 'id']
      },

      // MCP Resource Schema
      MCPResource: {
        type: 'object',
        description: 'MCP resource definition for healthcare data',
        properties: {
          uri: { type: 'string', format: 'uri', description: 'Resource URI' },
          name: { type: 'string', description: 'Resource name' },
          description: { type: 'string', description: 'Resource description' },
          mimeType: { type: 'string', description: 'MIME type' },
          annotations: {
            type: 'object',
            description: 'Resource annotations',
            properties: {
              audience: { type: 'array', items: { type: 'string' } },
              priority: { type: 'number' }
            }
          }
        },
        required: ['uri', 'name']
      },

      // MCP Tool Schema
      MCPTool: {
        type: 'object',
        description: 'MCP tool definition for healthcare operations',
        properties: {
          name: { type: 'string', description: 'Tool name' },
          description: { type: 'string', description: 'Tool description' },
          inputSchema: { 
            type: 'object', 
            description: 'JSON Schema for tool input',
            additionalProperties: true 
          }
        },
        required: ['name', 'description', 'inputSchema']
      }
    };
  }

  /**
   * Generate SML (Schema Markup Language) schemas for enhanced metadata
   */
  static generateSMLSchemas(): Record<string, any> {
    return {
      // SML Schema Definition
      SMLSchema: {
        type: 'object',
        description: 'Schema Markup Language definition for healthcare schemas',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Schema identifier' },
          version: { type: 'string', description: 'Schema version' },
          namespace: { type: 'string', description: 'Schema namespace' },
          metadata: {
            type: 'object',
            description: 'Schema metadata',
            properties: {
              title: { type: 'string', description: 'Schema title' },
              description: { type: 'string', description: 'Schema description' },
              author: { type: 'string', description: 'Schema author' },
              created: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
              updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
              tags: { type: 'array', items: { type: 'string' }, description: 'Schema tags' },
              compliance: {
                type: 'array',
                items: { type: 'string' },
                description: 'Compliance standards (HIPAA, HL7, etc.)'
              }
            }
          },
          entities: {
            type: 'array',
            description: 'Schema entities',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Entity name' },
                type: { type: 'string', description: 'Entity type' },
                properties: { type: 'object', description: 'Entity properties' },
                relationships: { type: 'array', items: { type: 'string' } },
                constraints: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          transformations: {
            type: 'array',
            description: 'Data transformation rules',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'Source field' },
                target: { type: 'string', description: 'Target field' },
                rule: { type: 'string', description: 'Transformation rule' },
                validation: { type: 'string', description: 'Validation pattern' }
              }
            }
          }
        },
        required: ['id', 'version', 'namespace', 'metadata']
      },

      // SML Validation Schema
      SMLValidation: {
        type: 'object',
        description: 'SML validation rules for healthcare data',
        properties: {
          schemaId: { type: 'string', format: 'uuid', description: 'Associated schema ID' },
          rules: {
            type: 'array',
            description: 'Validation rules',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', description: 'Field name' },
                type: { type: 'string', description: 'Validation type' },
                pattern: { type: 'string', description: 'Validation pattern' },
                required: { type: 'boolean', description: 'Field required' },
                message: { type: 'string', description: 'Error message' }
              }
            }
          },
          customValidators: {
            type: 'array',
            description: 'Custom validation functions',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Validator name' },
                function: { type: 'string', description: 'Validation function' },
                parameters: { type: 'object', description: 'Function parameters' }
              }
            }
          }
        },
        required: ['schemaId', 'rules']
      }
    };
  }

  /**
   * Generate only CORE CRITICAL healthcare schemas (3 essential schemas)
   */
  static generateInternalSchemas(): Record<string, any> {
    return {
      // Core Schema 1: Healthcare User Profile
      HealthcareUser: {
        type: 'object',
        description: 'Core healthcare user profile schema',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique healthcare user identifier' },
          email: { type: 'string', format: 'email', description: 'Healthcare user email address' },
          first_name: { type: 'string', description: 'Healthcare user first name' },
          last_name: { type: 'string', description: 'Healthcare user last name' },
          phone: { type: 'string', description: 'Healthcare user phone number' },
          department: { type: 'string', description: 'Healthcare department assignment' },
          facility_id: { type: 'string', format: 'uuid', description: 'Primary healthcare facility ID' },
          roles: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Assigned healthcare roles'
          },
          created_at: { type: 'string', format: 'date-time', description: 'User creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Last profile update timestamp' }
        },
        required: ['id', 'email', 'first_name', 'last_name']
      },

      // Core Schema 2: Healthcare Facility
      HealthcareFacility: {
        type: 'object',
        description: 'Core healthcare facility schema',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique healthcare facility identifier' },
          name: { type: 'string', description: 'Healthcare facility name' },
          facility_type: { 
            type: 'string', 
            enum: ['hospital', 'clinic', 'private_practice', 'urgent_care', 'specialty_center'],
            description: 'Type of healthcare facility'
          },
          address: { type: 'string', description: 'Physical address of facility' },
          phone: { type: 'string', description: 'Facility contact phone number' },
          email: { type: 'string', format: 'email', description: 'Facility contact email' },
          npi_number: { type: 'string', description: 'National Provider Identifier' },
          license_number: { type: 'string', description: 'State healthcare license number' },
          is_active: { type: 'boolean', description: 'Facility operational status' }
        },
        required: ['id', 'name', 'facility_type']
      },

      // Core Schema 3: Healthcare Role & Permission
      HealthcareRole: {
        type: 'object',
        description: 'Core healthcare role and permission schema',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique healthcare role identifier' },
          name: { 
            type: 'string',
            enum: ['superAdmin', 'admin', 'manager', 'staff', 'viewer', 'patientCaregiver'],
            description: 'Healthcare role name'
          },
          description: { type: 'string', description: 'Role description and responsibilities' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Granted healthcare permissions'
          },
          module_access: {
            type: 'array',
            items: { type: 'string' },
            description: 'Accessible healthcare modules'
          },
          facility_access: {
            type: 'array',
            items: { 
              type: 'object',
              properties: {
                facility_id: { type: 'string', format: 'uuid' },
                access_level: { type: 'string', enum: ['read', 'write', 'admin'] }
              }
            },
            description: 'Facility-specific access levels'
          }
        },
        required: ['id', 'name', 'permissions']
      }
    };
  }
}
