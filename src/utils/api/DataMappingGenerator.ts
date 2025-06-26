
/**
 * Data Mapping Generation Utilities for API Integrations
 */

import { ApiIntegration, DataMapping } from './ApiIntegrationTypes';

export class DataMappingGenerator {
  static async generateDataMappings(integration: ApiIntegration): Promise<DataMapping[]> {
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

  static async suggestMapping(fieldName: string, fieldSchema: any, integrationName: string): Promise<DataMapping | null> {
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

  static async applyDataMappings(data: any, mappings: DataMapping[]): Promise<any> {
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

  static async transformValue(value: any, transformation?: string): Promise<any> {
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

  private static async getDatabaseTables(): Promise<string[]> {
    return ['profiles', 'facilities', 'modules', 'permissions', 'roles', 'user_roles', 'audit_logs'];
  }

  private static async getTableColumns(tableName: string): Promise<any[]> {
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

  private static isFieldMatch(apiField: string, dbField: string): boolean {
    const normalized1 = apiField.toLowerCase().replace(/[_-]/g, '');
    const normalized2 = dbField.toLowerCase().replace(/[_-]/g, '');
    return normalized1 === normalized2 || normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  private static suggestTransformation(fieldSchema: any, column: any): string {
    if (fieldSchema.type === 'string' && column.type === 'uuid') {
      return 'parseUUID';
    }
    if (fieldSchema.format === 'date-time' && column.type === 'timestamp') {
      return 'parseTimestamp';
    }
    return 'direct';
  }

  private static suggestValidation(fieldSchema: any): string {
    const validations = [];
    if (fieldSchema.required) validations.push('required');
    if (fieldSchema.minLength) validations.push(`minLength:${fieldSchema.minLength}`);
    if (fieldSchema.maxLength) validations.push(`maxLength:${fieldSchema.maxLength}`);
    if (fieldSchema.pattern) validations.push(`pattern:${fieldSchema.pattern}`);
    return validations.join('|');
  }
}
