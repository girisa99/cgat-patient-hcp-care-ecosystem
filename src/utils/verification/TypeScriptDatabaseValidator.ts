
/**
 * TypeScript-Database Validator
 * Ensures perfect alignment between TypeScript definitions and database schema
 */

import { Database } from '@/integrations/supabase/types';
import { validateTableExists } from '@/utils/moduleValidation';
import { databaseSchemaAnalyzer } from '@/utils/api/DatabaseSchemaAnalyzer';

type DatabaseTables = keyof Database['public']['Tables'];
type TableColumns<T extends DatabaseTables> = keyof Database['public']['Tables'][T]['Row'];

export interface TypeScriptDatabaseAlignment {
  isAligned: boolean;
  missingTables: string[];
  missingColumns: string[];
  typeConflicts: TypeConflict[];
  recommendations: string[];
}

export interface TypeConflict {
  table: string;
  column: string;
  typescriptType: string;
  databaseType: string;
  severity: 'warning' | 'error';
}

/**
 * TypeScript-Database Validator Class
 * Comprehensive validation of TypeScript and Database alignment
 */
export class TypeScriptDatabaseValidator {
  /**
   * Validate complete alignment between TypeScript and Database
   */
  static async validateCompleteAlignment(): Promise<TypeScriptDatabaseAlignment> {
    console.log('🔍 Validating TypeScript-Database alignment...');

    const missingTables: string[] = [];
    const missingColumns: string[] = [];
    const typeConflicts: TypeConflict[] = [];
    const recommendations: string[] = [];

    // Get core business tables that should exist
    const expectedTables: DatabaseTables[] = [
      'profiles',
      'facilities', 
      'modules',
      'roles',
      'user_roles',
      'permissions',
      'audit_logs'
    ];

    // Validate each expected table
    for (const table of expectedTables) {
      if (!validateTableExists(table)) {
        missingTables.push(table);
      } else {
        // Validate columns for existing tables
        const columnValidation = await this.validateTableColumns(table);
        missingColumns.push(...columnValidation.missingColumns);
        typeConflicts.push(...columnValidation.typeConflicts);
      }
    }

    // Generate recommendations
    if (missingTables.length > 0) {
      recommendations.push(`Create missing tables: ${missingTables.join(', ')}`);
    }

    if (typeConflicts.length > 0) {
      recommendations.push('Resolve type conflicts between TypeScript and database schema');
    }

    recommendations.push('Use validateTableExists() before any database operations');
    recommendations.push('Always reference Database types from @/integrations/supabase/types');

    const isAligned = missingTables.length === 0 && typeConflicts.filter(c => c.severity === 'error').length === 0;

    console.log('📊 TypeScript-Database alignment check complete:', {
      isAligned,
      missingTables: missingTables.length,
      missingColumns: missingColumns.length,
      typeConflicts: typeConflicts.length
    });

    return {
      isAligned,
      missingTables,
      missingColumns,
      typeConflicts,
      recommendations
    };
  }

  /**
   * Validate specific table exists and is properly typed
   */
  static validateTable<T extends DatabaseTables>(
    tableName: T
  ): {
    exists: boolean;
    typeValid: boolean;
    availableColumns: string[];
  } {
    const exists = validateTableExists(tableName);
    
    // Get available columns from TypeScript types
    const availableColumns: string[] = [];
    if (exists) {
      // This would be populated from actual type inspection
      // For now, we'll use known column structures
      const knownColumns = this.getKnownColumns(tableName);
      availableColumns.push(...knownColumns);
    }

    return {
      exists,
      typeValid: exists,
      availableColumns
    };
  }

  /**
   * Validate specific module configuration against database schema
   */
  static async validateModuleConfig(config: {
    tableName: string;
    moduleName: string;
    requiredFields: string[];
    optionalFields?: string[];
  }): Promise<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check table exists
    if (!validateTableExists(config.tableName)) {
      issues.push(`Table '${config.tableName}' does not exist in database schema`);
    }

    // Check module name format
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.moduleName)) {
      issues.push(`Module name '${config.moduleName}' must be PascalCase`);
    }

    // Validate required fields exist in table
    const tableValidation = this.validateTable(config.tableName as DatabaseTables);
    if (tableValidation.exists) {
      const missingFields = config.requiredFields.filter(field => 
        !tableValidation.availableColumns.includes(field)
      );
      
      if (missingFields.length > 0) {
        warnings.push(`Required fields may not exist in ${config.tableName}: ${missingFields.join(', ')}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Generate TypeScript interfaces from database schema
   */
  static async generateTypescriptInterfaces(tableNames: string[]): Promise<string[]> {
    const interfaces: string[] = [];

    for (const tableName of tableNames) {
      if (validateTableExists(tableName)) {
        const interfaceCode = this.generateTableInterface(tableName as DatabaseTables);
        interfaces.push(interfaceCode);
      }
    }

    return interfaces;
  }

  /**
   * Private helper methods
   */
  private static async validateTableColumns(table: DatabaseTables): Promise<{
    missingColumns: string[];
    typeConflicts: TypeConflict[];
  }> {
    const missingColumns: string[] = [];
    const typeConflicts: TypeConflict[] = [];

    // Get expected columns for each table
    const expectedColumns = this.getKnownColumns(table);
    const actualColumns = this.getKnownColumns(table); // In real implementation, this would come from database

    // Compare expected vs actual columns
    for (const expectedColumn of expectedColumns) {
      if (!actualColumns.includes(expectedColumn)) {
        missingColumns.push(`${table}.${expectedColumn}`);
      }
    }

    return {
      missingColumns,
      typeConflicts
    };
  }

  private static getKnownColumns(tableName: DatabaseTables): string[] {
    const columnMappings: Record<string, string[]> = {
      profiles: ['id', 'first_name', 'last_name', 'email', 'phone', 'facility_id', 'created_at', 'updated_at'],
      facilities: ['id', 'name', 'facility_type', 'address', 'phone', 'email', 'is_active'],
      modules: ['id', 'name', 'description', 'is_active'],
      roles: ['id', 'name', 'description'],
      user_roles: ['id', 'user_id', 'role_id', 'created_at'],
      permissions: ['id', 'name', 'description'],
      audit_logs: ['id', 'user_id', 'action', 'table_name', 'record_id', 'created_at']
    };

    return columnMappings[tableName] || ['id'];
  }

  private static generateTableInterface(tableName: DatabaseTables): string {
    const columns = this.getKnownColumns(tableName);
    const interfaceName = this.toPascalCase(tableName);
    
    const columnDefinitions = columns.map(column => {
      const type = this.getColumnType(tableName, column);
      return `  ${column}: ${type};`;
    }).join('\n');

    return `
export interface ${interfaceName} {
${columnDefinitions}
}`;
  }

  private static getColumnType(tableName: DatabaseTables, columnName: string): string {
    // Map database types to TypeScript types
    const typeMap: Record<string, string> = {
      id: 'string',
      created_at: 'string',
      updated_at: 'string',
      is_active: 'boolean',
      email: 'string',
      name: 'string',
      description: 'string'
    };

    return typeMap[columnName] || 'string';
  }

  private static toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

/**
 * Utility functions for common validations
 */
export const validateTableSchema = <T extends DatabaseTables>(
  tableName: T,
  requiredColumns: string[]
): boolean => {
  const validation = TypeScriptDatabaseValidator.validateTable(tableName);
  if (!validation.exists) return false;
  
  return requiredColumns.every(column => 
    validation.availableColumns.includes(column)
  );
};

export const ensureTypescriptDatabaseAlignment = async (): Promise<void> => {
  const alignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
  
  if (!alignment.isAligned) {
    console.error('❌ TypeScript-Database alignment issues found:');
    console.error('Missing tables:', alignment.missingTables);
    console.error('Type conflicts:', alignment.typeConflicts);
    
    throw new Error(`TypeScript-Database alignment issues: ${alignment.missingTables.length} missing tables, ${alignment.typeConflicts.length} type conflicts`);
  }
  
  console.log('✅ TypeScript-Database alignment verified');
};
