
/**
 * Integration Data Management
 */

import { ApiIntegration, ApiDataMapping } from './ApiIntegrationTypes';

export class IntegrationDataManager {
  private integrations: Map<string, ApiIntegration> = new Map();

  addIntegration(integration: ApiIntegration) {
    this.integrations.set(integration.id, integration);
  }

  getIntegration(id: string): ApiIntegration | undefined {
    return this.integrations.get(id);
  }

  processDataMappings(integrationId: string, inputData: any): any {
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    const processedData: any = {};

    integration.mappings.forEach(mapping => {
      const sourceValue = inputData[mapping.sourceField];
      if (sourceValue !== undefined) {
        // Apply transformation if specified
        let transformedValue = sourceValue;
        if (mapping.transformation) {
          transformedValue = this.applyTransformation(sourceValue, mapping.transformation);
        }

        // Validate if validation rules exist
        if (mapping.validation) {
          this.validateField(transformedValue, mapping.validation);
        }

        // Set to target field
        processedData[mapping.targetField] = transformedValue;
      }
    });

    return processedData;
  }

  private applyTransformation(value: any, transformation: string): any {
    switch (transformation) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'number':
        return Number(value);
      default:
        return value;
    }
  }

  private validateField(value: any, validation: any): void {
    if (validation.required && (value === null || value === undefined || value === '')) {
      throw new Error('Required field is missing');
    }

    if (validation.type && typeof value !== validation.type) {
      throw new Error(`Field type mismatch. Expected ${validation.type}, got ${typeof value}`);
    }

    if (validation.rules) {
      validation.rules.forEach((rule: string) => {
        switch (rule) {
          case 'not_empty':
            if (String(value).trim() === '') {
              throw new Error('Field cannot be empty');
            }
            break;
          case 'email':
            if (!/\S+@\S+\.\S+/.test(String(value))) {
              throw new Error('Invalid email format');
            }
            break;
          default:
            break;
        }
      });
    }
  }

  generateMappingReport(integrationId: string): any {
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      return { error: 'Integration not found' };
    }

    return {
      integrationId,
      totalMappings: integration.mappings.length,
      mappingsByTarget: integration.mappings.reduce((acc, mapping) => {
        const table = mapping.targetTable;
        acc[table] = (acc[table] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      validationRules: integration.mappings.filter(m => m.validation).length
    };
  }
}
