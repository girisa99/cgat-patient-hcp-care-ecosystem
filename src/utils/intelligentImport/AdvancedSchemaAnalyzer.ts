/**
 * Advanced Schema Analyzer - Business Logic Layer
 * Handles intelligent schema analysis, relationship detection, and dependency management
 */

import { supabase } from '@/integrations/supabase/client';

export interface DatabaseTable {
  table_name: string;
  table_schema: string;
  table_type: string;
  columns: DatabaseColumn[];
  foreign_keys: ForeignKeyConstraint[];
  indexes: DatabaseIndex[];
  constraints: TableConstraint[];
  rls_enabled: boolean;
  rls_policies: RLSPolicy[];
}

export interface DatabaseColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  character_maximum_length: number | null;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_table?: string;
  foreign_key_column?: string;
}

export interface ForeignKeyConstraint {
  constraint_name: string;
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
  on_delete: string;
  on_update: string;
}

export interface DatabaseIndex {
  index_name: string;
  table_name: string;
  columns: string[];
  is_unique: boolean;
  index_type: string;
}

export interface TableConstraint {
  constraint_name: string;
  constraint_type: string;
  table_name: string;
  column_names: string[];
}

export interface RLSPolicy {
  policy_name: string;
  table_name: string;
  command: string;
  permissive: boolean;
  using_expression: string | null;
  check_expression: string | null;
}

export interface SchemaAnalysisResult {
  tables: DatabaseTable[];
  relationships: RelationshipMap;
  dependencyGraph: DependencyNode[];
  namingConventions: NamingConventionAnalysis;
  potentialIssues: SchemaIssue[];
  enhancement_suggestions: EnhancementSuggestion[];
}

export interface RelationshipMap {
  [tableName: string]: {
    parent_tables: string[];
    child_tables: string[];
    many_to_many: string[];
    circular_dependencies: string[];
  };
}

export interface DependencyNode {
  table_name: string;
  depends_on: string[];
  dependents: string[];
  depth_level: number;
  circular_dependency: boolean;
}

export interface NamingConventionAnalysis {
  consistent_snake_case: boolean;
  consistent_table_naming: boolean;
  consistent_column_naming: boolean;
  typescript_compatible: boolean;
  issues: string[];
  suggestions: string[];
}

export interface SchemaIssue {
  type: 'circular_dependency' | 'naming_inconsistency' | 'missing_rls' | 'orphaned_table' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  table_name?: string;
  column_name?: string;
  description: string;
  suggestion: string;
  auto_fixable: boolean;
}

export interface EnhancementSuggestion {
  type: 'add_index' | 'add_constraint' | 'add_rls_policy' | 'normalize_table' | 'add_relationship';
  priority: 'low' | 'medium' | 'high';
  target_table: string;
  target_column?: string;
  description: string;
  sql_suggestion: string;
  impact_assessment: string;
}

export interface ImportDataPattern {
  potential_table_name: string;
  confidence_score: number;
  field_mappings: FieldMapping[];
  relationship_hints: RelationshipHint[];
  suggested_enhancements: string[];
}

export interface FieldMapping {
  import_field: string;
  suggested_column: string;
  data_type: string;
  constraints: string[];
  is_potential_fk: boolean;
  fk_target?: {
    table: string;
    column: string;
    confidence: number;
  };
}

export interface RelationshipHint {
  type: 'one_to_many' | 'many_to_one' | 'many_to_many';
  source_field: string;
  target_table: string;
  target_field: string;
  confidence: number;
}

export class AdvancedSchemaAnalyzer {
  
  /**
   * Analyze the complete database schema
   */
  async analyzeCompleteSchema(): Promise<SchemaAnalysisResult> {
    console.log('🔍 Starting advanced schema analysis...');
    
    try {
      const tables = await this.getAllTables();
      const relationships = await this.analyzeRelationships(tables);
      const dependencyGraph = await this.buildDependencyGraph(relationships);
      const namingConventions = await this.analyzeNamingConventions(tables);
      const potentialIssues = await this.identifySchemaIssues(tables, relationships, dependencyGraph);
      const enhancement_suggestions = await this.generateEnhancementSuggestions(tables, relationships);

      return {
        tables,
        relationships,
        dependencyGraph,
        namingConventions,
        potentialIssues,
        enhancement_suggestions
      };
    } catch (error) {
      console.error('❌ Schema analysis failed:', error);
      throw new Error(`Schema analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all tables with complete metadata
   */
  private async getAllTables(): Promise<DatabaseTable[]> {
    const { data: tables, error } = await supabase.rpc('get_complete_schema_info');
    
    if (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }

    return tables || [];
  }

  /**
   * Analyze relationships between tables
   */
  private async analyzeRelationships(tables: DatabaseTable[]): Promise<RelationshipMap> {
    const relationships: RelationshipMap = {};

    for (const table of tables) {
      relationships[table.table_name] = {
        parent_tables: [],
        child_tables: [],
        many_to_many: [],
        circular_dependencies: []
      };

      // Analyze foreign keys for parent relationships
      for (const fk of table.foreign_keys) {
        relationships[table.table_name].parent_tables.push(fk.target_table);
      }

      // Find child tables
      for (const otherTable of tables) {
        for (const fk of otherTable.foreign_keys) {
          if (fk.target_table === table.table_name) {
            relationships[table.table_name].child_tables.push(otherTable.table_name);
          }
        }
      }
    }

    // Detect circular dependencies
    this.detectCircularDependencies(relationships);
    
    return relationships;
  }

  /**
   * Build dependency graph with depth analysis
   */
  private async buildDependencyGraph(relationships: RelationshipMap): Promise<DependencyNode[]> {
    const nodes: DependencyNode[] = [];
    
    for (const [tableName, rels] of Object.entries(relationships)) {
      const node: DependencyNode = {
        table_name: tableName,
        depends_on: rels.parent_tables,
        dependents: rels.child_tables,
        depth_level: 0,
        circular_dependency: rels.circular_dependencies.length > 0
      };
      
      nodes.push(node);
    }

    // Calculate depth levels
    this.calculateDepthLevels(nodes);
    
    return nodes;
  }

  /**
   * Analyze naming conventions across the schema
   */
  private async analyzeNamingConventions(tables: DatabaseTable[]): Promise<NamingConventionAnalysis> {
    const analysis: NamingConventionAnalysis = {
      consistent_snake_case: true,
      consistent_table_naming: true,
      consistent_column_naming: true,
      typescript_compatible: true,
      issues: [],
      suggestions: []
    };

    const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;
    const reservedWords = ['class', 'interface', 'function', 'import', 'export', 'default'];

    for (const table of tables) {
      // Check table naming
      if (!snakeCaseRegex.test(table.table_name)) {
        analysis.consistent_snake_case = false;
        analysis.consistent_table_naming = false;
        analysis.issues.push(`Table '${table.table_name}' doesn't follow snake_case convention`);
      }

      // Check for TypeScript reserved words
      if (reservedWords.includes(table.table_name)) {
        analysis.typescript_compatible = false;
        analysis.issues.push(`Table '${table.table_name}' uses TypeScript reserved word`);
      }

      // Check column naming
      for (const column of table.columns) {
        if (!snakeCaseRegex.test(column.column_name)) {
          analysis.consistent_column_naming = false;
          analysis.issues.push(`Column '${table.table_name}.${column.column_name}' doesn't follow snake_case convention`);
        }
      }
    }

    return analysis;
  }

  /**
   * Identify potential schema issues
   */
  private async identifySchemaIssues(
    tables: DatabaseTable[],
    relationships: RelationshipMap,
    dependencyGraph: DependencyNode[]
  ): Promise<SchemaIssue[]> {
    const issues: SchemaIssue[] = [];

    // Check for circular dependencies
    for (const node of dependencyGraph) {
      if (node.circular_dependency) {
        issues.push({
          type: 'circular_dependency',
          severity: 'high',
          table_name: node.table_name,
          description: `Circular dependency detected in table '${node.table_name}'`,
          suggestion: 'Consider breaking the circular dependency by introducing a junction table or removing redundant relationships',
          auto_fixable: false
        });
      }
    }

    // Check for missing RLS policies
    for (const table of tables) {
      if (!table.rls_enabled && table.table_schema === 'public') {
        issues.push({
          type: 'missing_rls',
          severity: 'critical',
          table_name: table.table_name,
          description: `Table '${table.table_name}' has RLS disabled`,
          suggestion: 'Enable RLS and create appropriate policies for data security',
          auto_fixable: true
        });
      }
    }

    // Check for orphaned tables
    for (const table of tables) {
      const hasRelationships = relationships[table.table_name]?.parent_tables.length > 0 || 
                              relationships[table.table_name]?.child_tables.length > 0;
      
      if (!hasRelationships && table.table_schema === 'public') {
        issues.push({
          type: 'orphaned_table',
          severity: 'medium',
          table_name: table.table_name,
          description: `Table '${table.table_name}' has no relationships with other tables`,
          suggestion: 'Consider if this table should have relationships or if it can be consolidated',
          auto_fixable: false
        });
      }
    }

    return issues;
  }

  /**
   * Generate enhancement suggestions
   */
  private async generateEnhancementSuggestions(
    tables: DatabaseTable[],
    relationships: RelationshipMap
  ): Promise<EnhancementSuggestion[]> {
    const suggestions: EnhancementSuggestion[] = [];

    for (const table of tables) {
      // Suggest indexes for foreign key columns
      for (const column of table.columns) {
        if (column.is_foreign_key) {
          const hasIndex = table.indexes.some(idx => 
            idx.columns.includes(column.column_name)
          );
          
          if (!hasIndex) {
            suggestions.push({
              type: 'add_index',
              priority: 'medium',
              target_table: table.table_name,
              target_column: column.column_name,
              description: `Add index on foreign key column '${column.column_name}'`,
              sql_suggestion: `CREATE INDEX idx_${table.table_name}_${column.column_name} ON ${table.table_name}(${column.column_name});`,
              impact_assessment: 'Improves query performance for joins and lookups'
            });
          }
        }
      }

      // Suggest RLS policies for tables without them
      if (!table.rls_enabled && table.table_schema === 'public') {
        suggestions.push({
          type: 'add_rls_policy',
          priority: 'high',
          target_table: table.table_name,
          description: `Enable RLS and add security policies for '${table.table_name}'`,
          sql_suggestion: `
            ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Users can manage their own data" ON ${table.table_name}
            FOR ALL USING (auth.uid() = user_id);
          `,
          impact_assessment: 'Critical for data security and user isolation'
        });
      }
    }

    return suggestions;
  }

  /**
   * Analyze imported data patterns against existing schema
   */
  async analyzeImportDataPatterns(
    importData: Record<string, any>[],
    existingSchema: SchemaAnalysisResult
  ): Promise<ImportDataPattern[]> {
    const patterns: ImportDataPattern[] = [];
    
    if (importData.length === 0) return patterns;

    // Analyze the structure of imported data
    const sampleRecord = importData[0];
    const fieldNames = Object.keys(sampleRecord);

    // Try to match against existing tables
    for (const table of existingSchema.tables) {
      const matchScore = this.calculateTableMatchScore(fieldNames, table);
      
      if (matchScore > 0.5) {
        const pattern: ImportDataPattern = {
          potential_table_name: table.table_name,
          confidence_score: matchScore,
          field_mappings: await this.generateFieldMappings(fieldNames, table, importData),
          relationship_hints: await this.detectRelationshipHints(importData, existingSchema),
          suggested_enhancements: []
        };
        
        patterns.push(pattern);
      }
    }

    // If no good matches, suggest new table creation
    if (patterns.length === 0) {
      patterns.push(await this.suggestNewTablePattern(importData, existingSchema));
    }

    return patterns.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Private helper methods
   */
  private detectCircularDependencies(relationships: RelationshipMap): void {
    for (const [tableName, rels] of Object.entries(relationships)) {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      if (this.hasCycle(tableName, relationships, visited, recursionStack)) {
        rels.circular_dependencies.push(tableName);
      }
    }
  }

  private hasCycle(
    table: string,
    relationships: RelationshipMap,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(table);
    recursionStack.add(table);

    const parents = relationships[table]?.parent_tables || [];
    for (const parent of parents) {
      if (!visited.has(parent)) {
        if (this.hasCycle(parent, relationships, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(parent)) {
        return true;
      }
    }

    recursionStack.delete(table);
    return false;
  }

  private calculateDepthLevels(nodes: DependencyNode[]): void {
    const processed = new Set<string>();
    
    const calculateDepth = (node: DependencyNode): number => {
      if (processed.has(node.table_name)) {
        return node.depth_level;
      }
      
      if (node.depends_on.length === 0) {
        node.depth_level = 0;
      } else {
        const parentDepths = node.depends_on.map(parentTable => {
          const parentNode = nodes.find(n => n.table_name === parentTable);
          return parentNode ? calculateDepth(parentNode) : 0;
        });
        node.depth_level = Math.max(...parentDepths) + 1;
      }
      
      processed.add(node.table_name);
      return node.depth_level;
    };

    for (const node of nodes) {
      calculateDepth(node);
    }
  }

  private calculateTableMatchScore(fieldNames: string[], table: DatabaseTable): number {
    const tableColumns = table.columns.map(col => col.column_name);
    const matches = fieldNames.filter(field => 
      tableColumns.some(col => 
        col.toLowerCase() === field.toLowerCase() ||
        col.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(col.toLowerCase())
      )
    );
    
    return matches.length / Math.max(fieldNames.length, tableColumns.length);
  }

  private async generateFieldMappings(
    fieldNames: string[],
    table: DatabaseTable,
    importData: Record<string, any>[]
  ): Promise<FieldMapping[]> {
    const mappings: FieldMapping[] = [];
    
    for (const fieldName of fieldNames) {
      const sampleValue = importData[0][fieldName];
      const suggestedColumn = this.findBestColumnMatch(fieldName, table);
      
      mappings.push({
        import_field: fieldName,
        suggested_column: suggestedColumn || fieldName,
        data_type: this.inferDataType(sampleValue),
        constraints: [],
        is_potential_fk: this.isPotentialForeignKey(fieldName, sampleValue),
        fk_target: await this.suggestForeignKeyTarget(fieldName, sampleValue)
      });
    }
    
    return mappings;
  }

  private findBestColumnMatch(fieldName: string, table: DatabaseTable): string | null {
    const exactMatch = table.columns.find(col => 
      col.column_name.toLowerCase() === fieldName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch.column_name;
    
    const partialMatch = table.columns.find(col =>
      col.column_name.toLowerCase().includes(fieldName.toLowerCase()) ||
      fieldName.toLowerCase().includes(col.column_name.toLowerCase())
    );
    
    return partialMatch?.column_name || null;
  }

  private inferDataType(value: any): string {
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'numeric';
    }
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'text'; // email
      if (value.length > 255) return 'text';
      return 'varchar';
    }
    if (typeof value === 'object') return 'jsonb';
    return 'text';
  }

  private isPotentialForeignKey(fieldName: string, value: any): boolean {
    const fkPatterns = ['_id', 'id', '_ref', '_key'];
    return fkPatterns.some(pattern => 
      fieldName.toLowerCase().includes(pattern)
    ) && (typeof value === 'string' || typeof value === 'number');
  }

  private async suggestForeignKeyTarget(
    fieldName: string,
    value: any
  ): Promise<{ table: string; column: string; confidence: number } | undefined> {
    // This would analyze existing data to suggest FK targets
    // For now, return simple heuristics
    
    if (fieldName.toLowerCase().includes('user')) {
      return { table: 'profiles', column: 'id', confidence: 0.8 };
    }
    
    if (fieldName.toLowerCase().includes('facility')) {
      return { table: 'facilities', column: 'id', confidence: 0.8 };
    }
    
    return undefined;
  }

  private async detectRelationshipHints(
    importData: Record<string, any>[],
    existingSchema: SchemaAnalysisResult
  ): Promise<RelationshipHint[]> {
    const hints: RelationshipHint[] = [];
    
    // Analyze data patterns to suggest relationships
    // This is a simplified implementation
    
    return hints;
  }

  private async suggestNewTablePattern(
    importData: Record<string, any>[],
    existingSchema: SchemaAnalysisResult
  ): Promise<ImportDataPattern> {
    const sampleRecord = importData[0];
    const fieldNames = Object.keys(sampleRecord);
    
    return {
      potential_table_name: 'imported_data_table',
      confidence_score: 1.0,
      field_mappings: await this.generateFieldMappings(fieldNames, {
        table_name: 'new_table',
        table_schema: 'public',
        table_type: 'BASE TABLE',
        columns: [],
        foreign_keys: [],
        indexes: [],
        constraints: [],
        rls_enabled: false,
        rls_policies: []
      }, importData),
      relationship_hints: [],
      suggested_enhancements: [
        'Add RLS policies for data security',
        'Create appropriate indexes for performance',
        'Consider relationships with existing tables'
      ]
    };
  }
}

export const advancedSchemaAnalyzer = new AdvancedSchemaAnalyzer();