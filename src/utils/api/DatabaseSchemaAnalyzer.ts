/**
 * Enhanced Database Schema Analyzer with Automatic Triggering Integration
 * Aligned with framework TypeScript types and knowledge base
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleRegistry } from '../moduleRegistry';
import type { Database } from '@/integrations/supabase/types';

// Align with framework TypeScript types
type DatabaseTables = keyof Database['public']['Tables'];
type TableRow<T extends DatabaseTables> = Database['public']['Tables'][T]['Row'];

export interface DatabaseTableAnalysis {
  table_name: string;
  columns: DatabaseColumnInfo[];
  foreign_keys: DatabaseForeignKey[];
  rls_policies: DatabaseRLSPolicy[];
  indexes: DatabaseIndex[];
  constraints: DatabaseConstraint[];
  row_count: number;
  last_analyzed: string;
  framework_alignment: FrameworkAlignment;
}

export interface DatabaseColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  column_default: string | null;
  character_maximum_length: number | null;
  is_generated: boolean;
  generation_expression: string | null;
}

export interface DatabaseForeignKey {
  constraint_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  update_rule: string;
  delete_rule: string;
}

export interface DatabaseRLSPolicy {
  policy_name: string;
  table_name: string;
  command: string;
  permissive: string;
  roles: string[];
  expression: string;
}

export interface DatabaseIndex {
  index_name: string;
  column_names: string[];
  is_unique: boolean;
  index_type: string;
}

export interface DatabaseConstraint {
  constraint_name: string;
  constraint_type: string;
  column_names: string[];
  check_clause: string | null;
}

export interface FrameworkAlignment {
  hasTypeScriptDefinition: boolean;
  isInModuleRegistry: boolean;
  hasRLSPolicies: boolean;
  hasApiEndpoints: boolean;
  hasDataMappings: boolean;
  alignmentScore: number;
  missingComponents: string[];
  autoTriggerSuggestions: string[];
}

export interface EndpointSuggestion {
  method: string;
  external_path: string;
  summary: string;
  description: string;
  requires_authentication: boolean;
  request_schema: any;
  response_schema: any;
}

class DatabaseSchemaAnalyzerClass {
  private cachedAnalysis: Map<string, DatabaseTableAnalysis> = new Map();
  private lastScanTimestamp: string | null = null;

  /**
   * Get all tables with enhanced analysis and framework alignment
   */
  async getAllTables(): Promise<DatabaseTableAnalysis[]> {
    console.log('🔍 Analyzing all database tables with framework alignment...');
    
    try {
      // Get known framework tables aligned with TypeScript definitions
      const frameworkTables: DatabaseTables[] = [
        'profiles', 'facilities', 'modules', 'permissions', 'roles',
        'user_roles', 'user_permissions', 'user_facility_access',
        'user_module_assignments', 'role_permissions', 'role_module_assignments',
        'module_permissions', 'audit_logs', 'api_keys', 'api_usage_logs',
        'api_integration_registry', 'external_api_registry', 
        'external_api_endpoints', 'api_consumption_logs',
        'developer_applications', 'developer_notifications',
        'developer_portal_applications', 'marketplace_listings'
      ];

      const analyses: DatabaseTableAnalysis[] = [];

      for (const tableName of frameworkTables) {
        // Check cache first
        if (this.cachedAnalysis.has(tableName)) {
          const cached = this.cachedAnalysis.get(tableName)!;
          // Use cached if less than 5 minutes old
          if (new Date().getTime() - new Date(cached.last_analyzed).getTime() < 300000) {
            analyses.push(cached);
            continue;
          }
        }

        const analysis = await this.analyzeTable(tableName);
        if (analysis) {
          // Cache the analysis
          this.cachedAnalysis.set(tableName, analysis);
          analyses.push(analysis);
        }
      }

      this.lastScanTimestamp = new Date().toISOString();
      console.log(`📊 Analyzed ${analyses.length} tables with framework alignment`);
      
      return analyses;
    } catch (error) {
      console.error('❌ Failed to analyze database tables:', error);
      return [];
    }
  }

  /**
   * Analyze individual table with framework alignment
   */
  async analyzeTable(tableName: string): Promise<DatabaseTableAnalysis | null> {
    try {
      console.log(`🔍 Analyzing table: ${tableName}`);

      // Get table structure using edge function
      const { data: tableInfo, error } = await supabase.functions.invoke('get-table-info', {
        body: { tableName }
      });

      if (error || !tableInfo) {
        console.error(`❌ Failed to get table info for ${tableName}:`, error);
        return null;
      }

      // Get row count
      const { count } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true });

      // Analyze framework alignment
      const frameworkAlignment = await this.analyzeFrameworkAlignment(tableName, tableInfo);

      const analysis: DatabaseTableAnalysis = {
        table_name: tableName,
        columns: this.normalizeColumnInfo(tableInfo.columns || []),
        foreign_keys: this.normalizeForeignKeys(tableInfo.foreign_keys || []),
        rls_policies: this.normalizeRLSPolicies(tableInfo.rls_policies || []),
        indexes: this.normalizeIndexes(tableInfo.indexes || []),
        constraints: this.normalizeConstraints(tableInfo.constraints || []),
        row_count: count || 0,
        last_analyzed: new Date().toISOString(),
        framework_alignment: frameworkAlignment
      };

      // Trigger automatic components if alignment score is low
      if (frameworkAlignment.alignmentScore < 0.7) {
        console.log(`⚠️ Table ${tableName} has low alignment score (${Math.round(frameworkAlignment.alignmentScore * 100)}%) - triggering auto-generation`);
        this.triggerAutoGeneration(tableName, analysis);
      }

      return analysis;
    } catch (error) {
      console.error(`❌ Failed to analyze table ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Analyze framework alignment for a table
   */
  private async analyzeFrameworkAlignment(tableName: string, tableInfo: any): Promise<FrameworkAlignment> {
    const alignment: FrameworkAlignment = {
      hasTypeScriptDefinition: false,
      isInModuleRegistry: false,
      hasRLSPolicies: false,
      hasApiEndpoints: false,
      hasDataMappings: false,
      alignmentScore: 0,
      missingComponents: [],
      autoTriggerSuggestions: []
    };

    // Check TypeScript definition alignment
    alignment.hasTypeScriptDefinition = this.checkTypeScriptDefinition(tableName);
    if (!alignment.hasTypeScriptDefinition) {
      alignment.missingComponents.push('TypeScript types');
      alignment.autoTriggerSuggestions.push('Generate TypeScript interface definitions');
    }

    // Check module registry alignment
    alignment.isInModuleRegistry = this.checkModuleRegistry(tableName);
    if (!alignment.isInModuleRegistry) {
      alignment.missingComponents.push('Module registration');
      alignment.autoTriggerSuggestions.push('Auto-register module with hooks and components');
    }

    // Check RLS policies
    alignment.hasRLSPolicies = (tableInfo.rls_policies || []).length > 0;
    if (!alignment.hasRLSPolicies) {
      alignment.missingComponents.push('RLS policies');
      alignment.autoTriggerSuggestions.push('Generate security policies for data access');
    }

    // Check API endpoints
    alignment.hasApiEndpoints = await this.checkApiEndpoints(tableName);
    if (!alignment.hasApiEndpoints) {
      alignment.missingComponents.push('API endpoints');
      alignment.autoTriggerSuggestions.push('Generate REST API endpoints');
    }

    // Check data mappings
    alignment.hasDataMappings = await this.checkDataMappings(tableName);
    if (!alignment.hasDataMappings) {
      alignment.missingComponents.push('Data mappings');
      alignment.autoTriggerSuggestions.push('Create external API data mappings');
    }

    // Calculate alignment score
    const components = [
      alignment.hasTypeScriptDefinition,
      alignment.isInModuleRegistry,
      alignment.hasRLSPolicies,
      alignment.hasApiEndpoints,
      alignment.hasDataMappings
    ];
    alignment.alignmentScore = components.filter(Boolean).length / components.length;

    return alignment;
  }

  /**
   * Generate endpoints from table analysis (aligned with framework)
   */
  generateEndpointsFromTables(tables: DatabaseTableAnalysis[]): EndpointSuggestion[] {
    const endpoints: EndpointSuggestion[] = [];

    for (const table of tables) {
      // Skip system tables
      if (table.table_name.startsWith('_') || 
          ['audit_logs', 'api_usage_logs', 'api_consumption_logs'].includes(table.table_name)) {
        continue;
      }

      const baseEntityName = table.table_name.replace(/s$/, ''); // Remove plural 's'
      const hasIdColumn = table.columns.some(col => col.column_name === 'id');
      const requiresAuth = table.rls_policies.length > 0;

      // Generate standard CRUD endpoints
      endpoints.push(
        {
          method: 'GET',
          external_path: `/api/v1/${table.table_name}`,
          summary: `List ${table.table_name}`,
          description: `Retrieve all ${table.table_name} records with pagination and filtering`,
          requires_authentication: requiresAuth,
          request_schema: {
            type: 'object',
            properties: {
              page: { type: 'integer', default: 1 },
              limit: { type: 'integer', default: 20 },
              filter: { type: 'object' }
            }
          },
          response_schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: this.generateSchemaFromColumns(table.columns)
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' }
                }
              }
            }
          }
        },
        {
          method: 'POST',
          external_path: `/api/v1/${table.table_name}`,
          summary: `Create ${baseEntityName}`,
          description: `Create a new ${baseEntityName} record`,
          requires_authentication: requiresAuth,
          request_schema: this.generateSchemaFromColumns(table.columns, true),
          response_schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: this.generateSchemaFromColumns(table.columns),
              message: { type: 'string' }
            }
          }
        }
      );

      // Add ID-based endpoints if table has ID column
      if (hasIdColumn) {
        endpoints.push(
          {
            method: 'GET',
            external_path: `/api/v1/${table.table_name}/{id}`,
            summary: `Get ${baseEntityName} by ID`,
            description: `Retrieve a specific ${baseEntityName} record by ID`,
            requires_authentication: requiresAuth,
            request_schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' }
              },
              required: ['id']
            },
            response_schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: this.generateSchemaFromColumns(table.columns)
              }
            }
          },
          {
            method: 'PUT',
            external_path: `/api/v1/${table.table_name}/{id}`,
            summary: `Update ${baseEntityName}`,
            description: `Update a specific ${baseEntityName} record`,
            requires_authentication: requiresAuth,
            request_schema: this.generateSchemaFromColumns(table.columns, true),
            response_schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: this.generateSchemaFromColumns(table.columns),
                message: { type: 'string' }
              }
            }
          },
          {
            method: 'DELETE',
            external_path: `/api/v1/${table.table_name}/{id}`,
            summary: `Delete ${baseEntityName}`,
            description: `Delete a specific ${baseEntityName} record`,
            requires_authentication: requiresAuth,
            request_schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' }
              },
              required: ['id']
            },
            response_schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
              }
            }
          }
        );
      }
    }

    console.log(`🚀 Generated ${endpoints.length} framework-aligned endpoints from ${tables.length} tables`);
    return endpoints;
  }

  /**
   * Trigger automatic generation of missing components
   */
  private async triggerAutoGeneration(tableName: string, analysis: DatabaseTableAnalysis) {
    console.log(`🤖 Auto-triggering component generation for table: ${tableName}`);
    
    // Access framework_alignment correctly
    const { framework_alignment } = analysis;
    
    // Auto-trigger suggestions based on missing components
    for (const suggestion of framework_alignment.autoTriggerSuggestions) {
      console.log(`💡 Auto-trigger suggestion for ${tableName}: ${suggestion}`);
      
      // In a real implementation, this would dispatch events or call specific generators
      // For now, we'll log the suggestions for manual follow-up
    }
  }

  // Helper methods for normalization and analysis
  private normalizeColumnInfo(columns: any[]): DatabaseColumnInfo[] {
    return columns.map(col => ({
      column_name: col.column_name || col.name,
      data_type: col.data_type || col.type,
      is_nullable: col.is_nullable === 'YES' || col.nullable === true,
      is_primary_key: col.constraint_type === 'PRIMARY KEY' || col.is_primary_key === true,
      column_default: col.column_default || col.default,
      character_maximum_length: col.character_maximum_length || null,
      is_generated: col.is_generated === 'ALWAYS' || false,
      generation_expression: col.generation_expression || null
    }));
  }

  private normalizeForeignKeys(foreignKeys: any[]): DatabaseForeignKey[] {
    return foreignKeys.map(fk => ({
      constraint_name: fk.constraint_name || fk.name,
      column_name: fk.column_name || fk.column,
      foreign_table_name: fk.foreign_table_name || fk.references_table,
      foreign_column_name: fk.foreign_column_name || fk.references_column,
      update_rule: fk.update_rule || 'NO ACTION',
      delete_rule: fk.delete_rule || 'NO ACTION'
    }));
  }

  private normalizeRLSPolicies(policies: any[]): DatabaseRLSPolicy[] {
    return policies.map(policy => ({
      policy_name: policy.policy_name || policy.name,
      table_name: policy.table_name || policy.table,
      command: policy.command || policy.operation,
      permissive: policy.permissive || 'PERMISSIVE',
      roles: policy.roles || ['authenticated'],
      expression: policy.expression || policy.condition
    }));
  }

  private normalizeIndexes(indexes: any[]): DatabaseIndex[] {
    return indexes.map(idx => ({
      index_name: idx.index_name || idx.name,
      column_names: Array.isArray(idx.columns) ? idx.columns : [idx.column_names],
      is_unique: idx.is_unique === true,
      index_type: idx.index_type || 'btree'
    }));
  }

  private normalizeConstraints(constraints: any[]): DatabaseConstraint[] {
    return constraints.map(constraint => ({
      constraint_name: constraint.constraint_name || constraint.name,
      constraint_type: constraint.constraint_type || constraint.type,
      column_names: Array.isArray(constraint.columns) ? constraint.columns : [constraint.column_names],
      check_clause: constraint.check_clause || null
    }));
  }

  private checkTypeScriptDefinition(tableName: string): boolean {
    const frameworkTables = ['profiles', 'facilities', 'modules', 'permissions', 'roles'];
    return frameworkTables.includes(tableName);
  }

  private checkModuleRegistry(tableName: string): boolean {
    const registeredModules = moduleRegistry.getAll();
    return registeredModules.some(module => module.tableName === tableName);
  }

  private async checkApiEndpoints(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('external_api_endpoints')
        .select('id')
        .ilike('external_path', `%${tableName}%`)
        .limit(1);
      
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }

  private async checkDataMappings(tableName: string): Promise<boolean> {
    return false;
  }

  private generateSchemaFromColumns(columns: DatabaseColumnInfo[], forInput: boolean = false): any {
    const schema: any = {
      type: 'object',
      properties: {},
      required: []
    };

    for (const column of columns) {
      if (forInput && column.column_name === 'id') continue;
      if (forInput && ['created_at', 'updated_at'].includes(column.column_name)) continue;

      let propType = 'string';
      if (column.data_type.includes('integer') || column.data_type.includes('numeric')) {
        propType = 'number';
      } else if (column.data_type.includes('boolean')) {
        propType = 'boolean';
      } else if (column.data_type.includes('json')) {
        propType = 'object';
      } else if (column.data_type.includes('timestamp')) {
        propType = 'string';
        schema.properties[column.column_name] = { type: propType, format: 'date-time' };
        continue;
      } else if (column.data_type.includes('uuid')) {
        propType = 'string';
        schema.properties[column.column_name] = { type: propType, format: 'uuid' };
        continue;
      }

      schema.properties[column.column_name] = { type: propType };

      if (!column.is_nullable && !forInput) {
        schema.required.push(column.column_name);
      }
    }

    return schema;
  }
}

export const databaseSchemaAnalyzer = new DatabaseSchemaAnalyzerClass();
