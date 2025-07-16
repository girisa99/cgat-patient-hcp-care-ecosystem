/**
 * TypeScript Generator - Business Logic Layer
 * Automatically generates and syncs TypeScript definitions with database schema changes
 */

import type { SchemaAnalysisResult, DatabaseTable, DatabaseColumn } from './AdvancedSchemaAnalyzer';
import type { MigrationPlan } from './MigrationGenerator';

export interface TypeScriptDefinition {
  interface_name: string;
  file_path: string;
  content: string;
  imports: string[];
  exports: string[];
}

export interface TypeGenerationResult {
  definitions: TypeScriptDefinition[];
  updated_files: string[];
  naming_conflicts: string[];
  suggestions: string[];
}

export interface NamingConvention {
  table_to_interface: (tableName: string) => string;
  column_to_property: (columnName: string) => string;
  enum_naming: (enumName: string) => string;
  file_naming: (interfaceName: string) => string;
}

export class TypeScriptGenerator {
  private namingConvention: NamingConvention;
  
  constructor() {
    this.namingConvention = {
      table_to_interface: (tableName: string) => this.toPascalCase(tableName),
      column_to_property: (columnName: string) => this.toCamelCase(columnName),
      enum_naming: (enumName: string) => this.toPascalCase(enumName),
      file_naming: (interfaceName: string) => `${interfaceName}.ts`
    };
  }
  
  /**
   * Generate TypeScript definitions from schema analysis
   */
  async generateTypeDefinitions(
    schemaAnalysis: SchemaAnalysisResult,
    migrationPlan?: MigrationPlan
  ): Promise<TypeGenerationResult> {
    console.log('🔧 Generating TypeScript definitions...');
    
    const definitions: TypeScriptDefinition[] = [];
    const updatedFiles: string[] = [];
    const namingConflicts: string[] = [];
    const suggestions: string[] = [];
    
    // Generate interface for each table
    for (const table of schemaAnalysis.tables) {
      const definition = await this.generateTableInterface(table, schemaAnalysis);
      definitions.push(definition);
    }
    
    // Generate utility types and enums
    const utilityTypes = await this.generateUtilityTypes(schemaAnalysis);
    definitions.push(...utilityTypes);
    
    // Generate index file
    const indexFile = await this.generateIndexFile(definitions);
    definitions.push(indexFile);
    
    // Check for naming conflicts
    const conflicts = this.detectNamingConflicts(definitions);
    namingConflicts.push(...conflicts);
    
    // Generate suggestions
    const generatedSuggestions = this.generateSuggestions(schemaAnalysis, definitions);
    suggestions.push(...generatedSuggestions);
    
    return {
      definitions,
      updated_files: definitions.map(def => def.file_path),
      naming_conflicts: namingConflicts,
      suggestions
    };
  }
  
  /**
   * Update existing TypeScript files with new schema changes
   */
  async updateExistingTypes(
    existingSchema: SchemaAnalysisResult,
    newSchema: SchemaAnalysisResult,
    migrationPlan: MigrationPlan
  ): Promise<TypeGenerationResult> {
    console.log('🔄 Updating existing TypeScript definitions...');
    
    const changes = this.analyzeSchemaChanges(existingSchema, newSchema);
    const definitions: TypeScriptDefinition[] = [];
    
    // Update only changed interfaces
    for (const change of changes) {
      if (change.type === 'table_added') {
        const table = newSchema.tables.find(t => t.table_name === change.table_name);
        if (table) {
          const definition = await this.generateTableInterface(table, newSchema);
          definitions.push(definition);
        }
      } else if (change.type === 'table_modified') {
        const table = newSchema.tables.find(t => t.table_name === change.table_name);
        if (table) {
          const definition = await this.generateTableInterface(table, newSchema);
          definitions.push(definition);
        }
      }
    }
    
    return {
      definitions,
      updated_files: definitions.map(def => def.file_path),
      naming_conflicts: [],
      suggestions: []
    };
  }
  
  /**
   * Validate TypeScript compatibility of schema changes
   */
  async validateTypeScriptCompatibility(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<{
    compatible: boolean;
    breaking_changes: string[];
    warnings: string[];
    fixes: string[];
  }> {
    const breaking_changes: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];
    
    for (const operation of migrationPlan.operations) {
      if (operation.type === 'alter_table') {
        // Check if column removal would break existing types
        if (operation.sql.includes('DROP COLUMN')) {
          breaking_changes.push(`Column removal in operation ${operation.id} may break existing types`);
          fixes.push(`Update TypeScript interfaces to remove corresponding properties`);
        }
      }
      
      if (operation.type === 'create_table') {
        // Check for naming conflicts
        const tableName = this.extractTableNameFromSQL(operation.sql);
        const interfaceName = this.namingConvention.table_to_interface(tableName);
        
        const conflict = existingSchema.tables.some(table => 
          this.namingConvention.table_to_interface(table.table_name) === interfaceName
        );
        
        if (conflict) {
          warnings.push(`Interface name conflict for table ${tableName}`);
          fixes.push(`Consider renaming table or using interface aliases`);
        }
      }
    }
    
    return {
      compatible: breaking_changes.length === 0,
      breaking_changes,
      warnings,
      fixes
    };
  }
  
  /**
   * Private helper methods
   */
  private async generateTableInterface(
    table: DatabaseTable,
    schemaAnalysis: SchemaAnalysisResult
  ): Promise<TypeScriptDefinition> {
    const interfaceName = this.namingConvention.table_to_interface(table.table_name);
    const imports = this.generateImports(table);
    
    const properties = table.columns.map(column => 
      this.generatePropertyDefinition(column, table, schemaAnalysis)
    ).join('\n  ');
    
    const content = `${imports.join('\n')}

export interface ${interfaceName} {
  ${properties}
}

export interface ${interfaceName}Insert {
  ${this.generateInsertProperties(table)}
}

export interface ${interfaceName}Update {
  ${this.generateUpdateProperties(table)}
}

// Utility types for ${interfaceName}
export type ${interfaceName}Select = Partial<${interfaceName}>;
export type ${interfaceName}Relations = {
  ${this.generateRelationTypes(table, schemaAnalysis)}
};`;
    
    return {
      interface_name: interfaceName,
      file_path: `src/types/generated/${this.namingConvention.file_naming(interfaceName)}`,
      content,
      imports,
      exports: [interfaceName, `${interfaceName}Insert`, `${interfaceName}Update`]
    };
  }
  
  private generatePropertyDefinition(
    column: DatabaseColumn,
    table: DatabaseTable,
    schemaAnalysis: SchemaAnalysisResult
  ): string {
    const propertyName = this.namingConvention.column_to_property(column.column_name);
    const typeScript = this.mapPostgresToTypeScript(column.data_type);
    const nullable = column.is_nullable ? '?' : '';
    const nullType = column.is_nullable ? ' | null' : '';
    
    // Add JSDoc comments for foreign keys
    let comment = '';
    if (column.is_foreign_key && column.foreign_key_table) {
      comment = `  /** Foreign key reference to ${column.foreign_key_table}.${column.foreign_key_column} */\n`;
    }
    
    return `${comment}  ${propertyName}${nullable}: ${typeScript}${nullType};`;
  }
  
  private generateInsertProperties(table: DatabaseTable): string {
    return table.columns
      .filter(col => !col.column_name.match(/^(id|created_at|updated_at)$/))
      .map(column => {
        const propertyName = this.namingConvention.column_to_property(column.column_name);
        const typeScript = this.mapPostgresToTypeScript(column.data_type);
        const optional = column.is_nullable || column.column_default ? '?' : '';
        const nullType = column.is_nullable ? ' | null' : '';
        
        return `  ${propertyName}${optional}: ${typeScript}${nullType};`;
      })
      .join('\n');
  }
  
  private generateUpdateProperties(table: DatabaseTable): string {
    return table.columns
      .filter(col => !col.column_name.match(/^(id|created_at)$/))
      .map(column => {
        const propertyName = this.namingConvention.column_to_property(column.column_name);
        const typeScript = this.mapPostgresToTypeScript(column.data_type);
        const nullType = column.is_nullable ? ' | null' : '';
        
        return `  ${propertyName}?: ${typeScript}${nullType};`;
      })
      .join('\n');
  }
  
  private generateRelationTypes(table: DatabaseTable, schemaAnalysis: SchemaAnalysisResult): string {
    const relations: string[] = [];
    
    // Find parent relations (foreign keys)
    for (const column of table.columns) {
      if (column.is_foreign_key && column.foreign_key_table) {
        const relatedTable = schemaAnalysis.tables.find(t => t.table_name === column.foreign_key_table);
        if (relatedTable) {
          const relatedInterface = this.namingConvention.table_to_interface(relatedTable.table_name);
          const relationName = this.namingConvention.column_to_property(column.foreign_key_table);
          relations.push(`  ${relationName}?: ${relatedInterface};`);
        }
      }
    }
    
    // Find child relations
    const relationships = schemaAnalysis.relationships[table.table_name];
    if (relationships) {
      for (const childTable of relationships.child_tables) {
        const relatedTable = schemaAnalysis.tables.find(t => t.table_name === childTable);
        if (relatedTable) {
          const relatedInterface = this.namingConvention.table_to_interface(relatedTable.table_name);
          const relationName = this.pluralize(this.namingConvention.column_to_property(childTable));
          relations.push(`  ${relationName}?: ${relatedInterface}[];`);
        }
      }
    }
    
    return relations.join('\n');
  }
  
  private generateImports(table: DatabaseTable): string[] {
    const imports: string[] = [];
    
    // Add common imports
    if (table.columns.some(col => col.data_type === 'uuid')) {
      imports.push("// UUID type is already handled by TypeScript");
    }
    
    if (table.columns.some(col => col.data_type === 'jsonb')) {
      imports.push("// JSONB is mapped to Record<string, any> or specific interfaces");
    }
    
    return imports;
  }
  
  private async generateUtilityTypes(schemaAnalysis: SchemaAnalysisResult): Promise<TypeScriptDefinition[]> {
    const definitions: TypeScriptDefinition[] = [];
    
    // Generate database utility types
    const dbUtilityContent = `// Database utility types
export type UUID = string;
export type Json = Record<string, any> | any[] | string | number | boolean | null;
export type Timestamp = string;

// Common database patterns
export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Query helper types
export type OrderBy<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};

export type WhereClause<T> = {
  [K in keyof T]?: T[K] | T[K][] | { 
    eq?: T[K]; 
    neq?: T[K]; 
    gt?: T[K]; 
    gte?: T[K]; 
    lt?: T[K]; 
    lte?: T[K];
    in?: T[K][];
    like?: string;
  };
};`;
    
    definitions.push({
      interface_name: 'DatabaseUtilities',
      file_path: 'src/types/generated/database-utilities.ts',
      content: dbUtilityContent,
      imports: [],
      exports: ['UUID', 'Json', 'Timestamp', 'BaseEntity', 'OrderBy', 'WhereClause']
    });
    
    return definitions;
  }
  
  private async generateIndexFile(definitions: TypeScriptDefinition[]): Promise<TypeScriptDefinition> {
    const exports = definitions
      .filter(def => def.interface_name !== 'Index')
      .map(def => {
        const relativePath = def.file_path.replace('src/types/generated/', './').replace('.ts', '');
        return `export * from '${relativePath}';`;
      })
      .join('\n');
    
    const content = `// Auto-generated index file for database types
// Do not edit manually - this file is regenerated on schema changes

${exports}

// Re-export common types for convenience
export type { UUID, Json, Timestamp, BaseEntity } from './database-utilities';`;
    
    return {
      interface_name: 'Index',
      file_path: 'src/types/generated/index.ts',
      content,
      imports: [],
      exports: []
    };
  }
  
  private detectNamingConflicts(definitions: TypeScriptDefinition[]): string[] {
    const conflicts: string[] = [];
    const names = new Set<string>();
    
    for (const def of definitions) {
      if (names.has(def.interface_name)) {
        conflicts.push(`Naming conflict detected: ${def.interface_name}`);
      }
      names.add(def.interface_name);
    }
    
    return conflicts;
  }
  
  private generateSuggestions(
    schemaAnalysis: SchemaAnalysisResult,
    definitions: TypeScriptDefinition[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggest enum types for columns with limited values
    for (const table of schemaAnalysis.tables) {
      for (const column of table.columns) {
        if (column.data_type === 'text' && column.column_name.includes('status')) {
          suggestions.push(`Consider creating an enum type for ${table.table_name}.${column.column_name}`);
        }
      }
    }
    
    // Suggest utility functions
    suggestions.push('Consider generating CRUD utility functions for each interface');
    suggestions.push('Add validation schemas using libraries like Zod or Yup');
    
    return suggestions;
  }
  
  private analyzeSchemaChanges(
    existingSchema: SchemaAnalysisResult,
    newSchema: SchemaAnalysisResult
  ): Array<{
    type: 'table_added' | 'table_removed' | 'table_modified';
    table_name: string;
    details?: string;
  }> {
    const changes: Array<{
      type: 'table_added' | 'table_removed' | 'table_modified';
      table_name: string;
      details?: string;
    }> = [];
    
    // Find new tables
    for (const newTable of newSchema.tables) {
      const exists = existingSchema.tables.some(t => t.table_name === newTable.table_name);
      if (!exists) {
        changes.push({ type: 'table_added', table_name: newTable.table_name });
      }
    }
    
    // Find removed tables
    for (const existingTable of existingSchema.tables) {
      const exists = newSchema.tables.some(t => t.table_name === existingTable.table_name);
      if (!exists) {
        changes.push({ type: 'table_removed', table_name: existingTable.table_name });
      }
    }
    
    // Find modified tables
    for (const newTable of newSchema.tables) {
      const existingTable = existingSchema.tables.find(t => t.table_name === newTable.table_name);
      if (existingTable) {
        const columnCountChanged = newTable.columns.length !== existingTable.columns.length;
        const columnsChanged = this.compareColumns(existingTable.columns, newTable.columns);
        
        if (columnCountChanged || columnsChanged) {
          changes.push({ 
            type: 'table_modified', 
            table_name: newTable.table_name,
            details: columnCountChanged ? 'Column count changed' : 'Column definitions changed'
          });
        }
      }
    }
    
    return changes;
  }
  
  private compareColumns(existing: DatabaseColumn[], updated: DatabaseColumn[]): boolean {
    if (existing.length !== updated.length) return true;
    
    for (let i = 0; i < existing.length; i++) {
      const existingCol = existing[i];
      const updatedCol = updated[i];
      
      if (existingCol.column_name !== updatedCol.column_name ||
          existingCol.data_type !== updatedCol.data_type ||
          existingCol.is_nullable !== updatedCol.is_nullable) {
        return true;
      }
    }
    
    return false;
  }
  
  private mapPostgresToTypeScript(postgresType: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'string',
      'text': 'string',
      'varchar': 'string',
      'character varying': 'string',
      'integer': 'number',
      'bigint': 'number',
      'smallint': 'number',
      'numeric': 'number',
      'decimal': 'number',
      'real': 'number',
      'double precision': 'number',
      'boolean': 'boolean',
      'jsonb': 'Record<string, any>',
      'json': 'Record<string, any>',
      'timestamp with time zone': 'string',
      'timestamp without time zone': 'string',
      'date': 'string',
      'time': 'string',
      'interval': 'string',
      'array': 'any[]'
    };
    
    return typeMap[postgresType.toLowerCase()] || 'any';
  }
  
  private extractTableNameFromSQL(sql: string): string {
    const match = sql.match(/CREATE TABLE (?:public\.)?(\w+)/i);
    return match ? match[1] : 'unknown_table';
  }
  
  private toPascalCase(str: string): string {
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
  
  private toCamelCase(str: string): string {
    const pascalCase = this.toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }
  
  private pluralize(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch')) {
      return word + 'es';
    }
    return word + 's';
  }
}

export const typeScriptGenerator = new TypeScriptGenerator();