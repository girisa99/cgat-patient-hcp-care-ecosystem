
/**
 * Schema Analysis Utilities for API Integrations
 */

import { ApiEndpoint } from './ApiIntegrationTypes';

export class SchemaAnalyzer {
  static async analyzeSchemas(endpoints: ApiEndpoint[]): Promise<Record<string, any>> {
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

  static standardizeSchema(schema: any): any {
    return {
      type: 'object',
      properties: this.extractProperties(schema),
      required: this.extractRequired(schema),
      additionalProperties: false
    };
  }

  static extractProperties(schema: any): Record<string, any> {
    if (typeof schema === 'object' && schema.properties) {
      return schema.properties;
    }
    return {};
  }

  static extractRequired(schema: any): string[] {
    if (typeof schema === 'object' && Array.isArray(schema.required)) {
      return schema.required;
    }
    return [];
  }

  static generateSampleData(schema: any): any {
    if (!schema.properties) return {};
    
    const sample: any = {};
    for (const [key, prop] of Object.entries(schema.properties as any)) {
      sample[key] = this.generateSampleValue(prop);
    }
    return sample;
  }

  static generateSampleValue(prop: any): any {
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

  static generateInternalSchemas(): Record<string, any> {
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
}
