
/**
 * Data Mapping Generation Utilities
 */

import { ApiDataMapping, ApiIntegration } from './ApiIntegrationTypes';

export class DataMappingGenerator {
  static generateDataMappings(integration: ApiIntegration): ApiDataMapping[] {
    const mappings: ApiDataMapping[] = [];

    integration.endpoints.forEach(endpoint => {
      if (endpoint.bodySchema) {
        Object.keys(endpoint.bodySchema.properties || {}).forEach(fieldName => {
          mappings.push({
            id: `mapping_${integration.id}_${endpoint.id}_${fieldName}`,
            sourceField: fieldName,
            targetField: `target_${fieldName}`,
            targetTable: 'processed_data',
            transformation: 'direct',
            validation: {
              required: true,
              type: 'string',
              rules: ['not_empty']
            }
          });
        });
      }
    });

    return mappings;
  }

  static validateMapping(mapping: ApiDataMapping): boolean {
    return !!(
      mapping.sourceField &&
      mapping.targetField &&
      mapping.targetTable
    );
  }

  static applyMapping(data: any, mappings: ApiDataMapping[]): any {
    const result: any = {};

    mappings.forEach(mapping => {
      if (data[mapping.sourceField] !== undefined) {
        let value = data[mapping.sourceField];
        
        // Apply transformation if specified
        if (mapping.transformation) {
          switch (mapping.transformation) {
            case 'uppercase':
              value = String(value).toUpperCase();
              break;
            case 'lowercase':
              value = String(value).toLowerCase();
              break;
            case 'trim':
              value = String(value).trim();
              break;
            default:
              // Direct mapping
              break;
          }
        }

        result[mapping.targetField] = value;
      }
    });

    return result;
  }
}
