/**
 * Migration Generator - Business Logic Layer
 * Generates safe, non-breaking database migrations for import operations
 */

import type { 
  SchemaAnalysisResult, 
  ImportDataPattern, 
  EnhancementSuggestion,
  DatabaseTable,
  FieldMapping 
} from './AdvancedSchemaAnalyzer';

export interface MigrationOperation {
  id: string;
  type: 'create_table' | 'alter_table' | 'add_column' | 'add_constraint' | 'add_index' | 'add_rls_policy';
  priority: number;
  sql: string;
  rollback_sql: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  dependencies: string[];
  validation_checks: string[];
}

export interface MigrationPlan {
  id: string;
  title: string;
  description: string;
  operations: MigrationOperation[];
  estimated_duration: string;
  backup_required: boolean;
  rollback_plan: string[];
  pre_migration_checks: string[];
  post_migration_validations: string[];
}

export interface SafetyCheck {
  type: 'dependency' | 'data_integrity' | 'performance' | 'security';
  passed: boolean;
  description: string;
  warning?: string;
  blocking: boolean;
}

export class MigrationGenerator {
  
  /**
   * Generate a complete migration plan for import operation
   */
  async generateMigrationPlan(
    importPatterns: ImportDataPattern[],
    existingSchema: SchemaAnalysisResult,
    importData: Record<string, any>[]
  ): Promise<MigrationPlan> {
    console.log('🔧 Generating migration plan...');
    
    const operations: MigrationOperation[] = [];
    const migrationId = `import_migration_${Date.now()}`;
    
    // Process each import pattern
    for (const pattern of importPatterns) {
      const patternOps = await this.generatePatternOperations(pattern, existingSchema, importData);
      operations.push(...patternOps);
    }
    
    // Add enhancement operations
    const enhancementOps = await this.generateEnhancementOperations(existingSchema.enhancement_suggestions);
    operations.push(...enhancementOps);
    
    // Sort operations by priority and dependencies
    const sortedOperations = this.sortOperationsByDependencies(operations);
    
    return {
      id: migrationId,
      title: `Import Data Migration - ${new Date().toISOString()}`,
      description: `Migration to import ${importData.length} records with schema enhancements`,
      operations: sortedOperations,
      estimated_duration: this.estimateDuration(sortedOperations),
      backup_required: this.requiresBackup(sortedOperations),
      rollback_plan: sortedOperations.map(op => op.rollback_sql).reverse(),
      pre_migration_checks: this.generatePreMigrationChecks(sortedOperations),
      post_migration_validations: this.generatePostMigrationValidations(sortedOperations)
    };
  }
  
  /**
   * Perform comprehensive safety checks before migration
   */
  async performSafetyChecks(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<SafetyCheck[]> {
    const checks: SafetyCheck[] = [];
    
    // Check for circular dependencies
    checks.push(await this.checkCircularDependencies(migrationPlan, existingSchema));
    
    // Check data integrity impact
    checks.push(await this.checkDataIntegrityImpact(migrationPlan, existingSchema));
    
    // Check performance implications
    checks.push(await this.checkPerformanceImpact(migrationPlan, existingSchema));
    
    // Check security implications
    checks.push(await this.checkSecurityImpact(migrationPlan, existingSchema));
    
    return checks;
  }
  
  /**
   * Generate safe SQL with rollback capabilities
   */
  generateSafeSQL(operation: MigrationOperation): {
    forward_sql: string;
    rollback_sql: string;
    validation_sql: string;
  } {
    switch (operation.type) {
      case 'create_table':
        return this.generateCreateTableSQL(operation);
      case 'alter_table':
        return this.generateAlterTableSQL(operation);
      case 'add_column':
        return this.generateAddColumnSQL(operation);
      case 'add_constraint':
        return this.generateAddConstraintSQL(operation);
      case 'add_index':
        return this.generateAddIndexSQL(operation);
      case 'add_rls_policy':
        return this.generateAddRLSPolicySQL(operation);
      default:
        throw new Error(`Unsupported operation type: ${operation.type}`);
    }
  }
  
  /**
   * Private helper methods
   */
  private async generatePatternOperations(
    pattern: ImportDataPattern,
    existingSchema: SchemaAnalysisResult,
    importData: Record<string, any>[]
  ): Promise<MigrationOperation[]> {
    const operations: MigrationOperation[] = [];
    
    // Check if we need to create a new table
    const existingTable = existingSchema.tables.find(t => t.table_name === pattern.potential_table_name);
    
    if (!existingTable) {
      // Create new table
      operations.push(await this.createNewTableOperation(pattern, importData));
    } else {
      // Modify existing table if needed
      const alterOps = await this.generateAlterTableOperations(pattern, existingTable);
      operations.push(...alterOps);
    }
    
    return operations;
  }
  
  private async createNewTableOperation(
    pattern: ImportDataPattern,
    importData: Record<string, any>[]
  ): Promise<MigrationOperation> {
    const tableName = this.sanitizeTableName(pattern.potential_table_name);
    const columns = pattern.field_mappings.map(mapping => 
      this.generateColumnDefinition(mapping)
    ).join(',\n  ');
    
    const sql = `
      CREATE TABLE public.${tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${columns},
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can manage their own ${tableName}" 
      ON public.${tableName}
      FOR ALL 
      USING (auth.uid() = user_id);
    `;
    
    return {
      id: `create_table_${tableName}`,
      type: 'create_table',
      priority: 1,
      sql: sql.trim(),
      rollback_sql: `DROP TABLE IF EXISTS public.${tableName};`,
      description: `Create new table '${tableName}' for imported data`,
      risk_level: 'low',
      dependencies: [],
      validation_checks: [
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}');`
      ]
    };
  }
  
  private async generateAlterTableOperations(
    pattern: ImportDataPattern,
    existingTable: DatabaseTable
  ): Promise<MigrationOperation[]> {
    const operations: MigrationOperation[] = [];
    
    // Check for missing columns
    for (const mapping of pattern.field_mappings) {
      const columnExists = existingTable.columns.some(col => 
        col.column_name === mapping.suggested_column
      );
      
      if (!columnExists) {
        operations.push(await this.createAddColumnOperation(existingTable.table_name, mapping));
      }
    }
    
    return operations;
  }
  
  private async createAddColumnOperation(
    tableName: string,
    mapping: FieldMapping
  ): Promise<MigrationOperation> {
    const columnDef = this.generateColumnDefinition(mapping);
    
    return {
      id: `add_column_${tableName}_${mapping.suggested_column}`,
      type: 'add_column',
      priority: 2,
      sql: `ALTER TABLE public.${tableName} ADD COLUMN ${columnDef};`,
      rollback_sql: `ALTER TABLE public.${tableName} DROP COLUMN IF EXISTS ${mapping.suggested_column};`,
      description: `Add column '${mapping.suggested_column}' to table '${tableName}'`,
      risk_level: 'low',
      dependencies: [`create_table_${tableName}`],
      validation_checks: [
        `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = '${mapping.suggested_column}');`
      ]
    };
  }
  
  private generateColumnDefinition(mapping: FieldMapping): string {
    let definition = `${mapping.suggested_column} ${mapping.data_type.toUpperCase()}`;
    
    // Add constraints
    if (mapping.constraints.includes('NOT NULL')) {
      definition += ' NOT NULL';
    }
    
    if (mapping.is_potential_fk && mapping.fk_target) {
      definition += ` REFERENCES public.${mapping.fk_target.table}(${mapping.fk_target.column})`;
    }
    
    return definition;
  }
  
  private async generateEnhancementOperations(
    suggestions: EnhancementSuggestion[]
  ): Promise<MigrationOperation[]> {
    const operations: MigrationOperation[] = [];
    
    for (const suggestion of suggestions) {
      if (suggestion.type === 'add_index') {
        operations.push({
          id: `add_index_${suggestion.target_table}_${suggestion.target_column}`,
          type: 'add_index',
          priority: 3,
          sql: suggestion.sql_suggestion,
          rollback_sql: `DROP INDEX IF EXISTS idx_${suggestion.target_table}_${suggestion.target_column};`,
          description: suggestion.description,
          risk_level: 'low',
          dependencies: [],
          validation_checks: [
            `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_${suggestion.target_table}_${suggestion.target_column}');`
          ]
        });
      }
      
      if (suggestion.type === 'add_rls_policy') {
        operations.push({
          id: `add_rls_${suggestion.target_table}`,
          type: 'add_rls_policy',
          priority: 4,
          sql: suggestion.sql_suggestion,
          rollback_sql: `ALTER TABLE ${suggestion.target_table} DISABLE ROW LEVEL SECURITY;`,
          description: suggestion.description,
          risk_level: 'medium',
          dependencies: [`create_table_${suggestion.target_table}`],
          validation_checks: [
            `SELECT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${suggestion.target_table}');`
          ]
        });
      }
    }
    
    return operations;
  }
  
  private sortOperationsByDependencies(operations: MigrationOperation[]): MigrationOperation[] {
    const sorted: MigrationOperation[] = [];
    const processed = new Set<string>();
    
    const addOperation = (op: MigrationOperation) => {
      if (processed.has(op.id)) return;
      
      // Add dependencies first
      for (const depId of op.dependencies) {
        const dep = operations.find(o => o.id === depId);
        if (dep && !processed.has(dep.id)) {
          addOperation(dep);
        }
      }
      
      sorted.push(op);
      processed.add(op.id);
    };
    
    // Sort by priority first
    const prioritySort = [...operations].sort((a, b) => a.priority - b.priority);
    
    for (const operation of prioritySort) {
      addOperation(operation);
    }
    
    return sorted;
  }
  
  private estimateDuration(operations: MigrationOperation[]): string {
    const baseTime = 30; // 30 seconds base
    const operationTime = operations.length * 15; // 15 seconds per operation
    const totalSeconds = baseTime + operationTime;
    
    if (totalSeconds < 60) return `${totalSeconds} seconds`;
    if (totalSeconds < 3600) return `${Math.ceil(totalSeconds / 60)} minutes`;
    return `${Math.ceil(totalSeconds / 3600)} hours`;
  }
  
  private requiresBackup(operations: MigrationOperation[]): boolean {
    return operations.some(op => 
      op.risk_level === 'high' || 
      op.type === 'alter_table' ||
      operations.length > 5
    );
  }
  
  private generatePreMigrationChecks(operations: MigrationOperation[]): string[] {
    const checks = [
      'VERIFY database connection and permissions',
      'CHECK available disk space',
      'CONFIRM no active connections to target tables'
    ];
    
    if (this.requiresBackup(operations)) {
      checks.push('CREATE database backup');
    }
    
    return checks;
  }
  
  private generatePostMigrationValidations(operations: MigrationOperation[]): string[] {
    const validations = [
      'VERIFY all tables created successfully',
      'CHECK all constraints are valid',
      'VALIDATE RLS policies are active',
      'TEST import data functionality'
    ];
    
    for (const op of operations) {
      validations.push(...op.validation_checks);
    }
    
    return validations;
  }
  
  private sanitizeTableName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, 't$&')
      .substring(0, 63); // PostgreSQL limit
  }
  
  // Safety check methods
  private async checkCircularDependencies(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<SafetyCheck> {
    const hasCircular = existingSchema.dependencyGraph.some(node => node.circular_dependency);
    
    return {
      type: 'dependency',
      passed: !hasCircular,
      description: 'Check for circular dependencies in schema',
      warning: hasCircular ? 'Circular dependencies detected in existing schema' : undefined,
      blocking: false
    };
  }
  
  private async checkDataIntegrityImpact(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<SafetyCheck> {
    const hasHighRisk = migrationPlan.operations.some(op => op.risk_level === 'high');
    
    return {
      type: 'data_integrity',
      passed: !hasHighRisk,
      description: 'Assess data integrity impact',
      warning: hasHighRisk ? 'Some operations have high risk impact' : undefined,
      blocking: hasHighRisk
    };
  }
  
  private async checkPerformanceImpact(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<SafetyCheck> {
    const tableCount = existingSchema.tables.length;
    const newOperations = migrationPlan.operations.length;
    const impactScore = (newOperations / tableCount) * 100;
    
    return {
      type: 'performance',
      passed: impactScore < 50,
      description: 'Evaluate performance impact of migration',
      warning: impactScore >= 50 ? 'Migration may impact database performance' : undefined,
      blocking: false
    };
  }
  
  private async checkSecurityImpact(
    migrationPlan: MigrationPlan,
    existingSchema: SchemaAnalysisResult
  ): Promise<SafetyCheck> {
    const hasRLSOperations = migrationPlan.operations.some(op => op.type === 'add_rls_policy');
    const missingRLSTables = existingSchema.tables.filter(t => !t.rls_enabled).length;
    
    return {
      type: 'security',
      passed: hasRLSOperations || missingRLSTables === 0,
      description: 'Verify security policies are in place',
      warning: !hasRLSOperations && missingRLSTables > 0 ? 'Some tables missing RLS policies' : undefined,
      blocking: false
    };
  }
  
  // SQL generation methods
  private generateCreateTableSQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
  
  private generateAlterTableSQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
  
  private generateAddColumnSQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
  
  private generateAddConstraintSQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
  
  private generateAddIndexSQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
  
  private generateAddRLSPolicySQL(operation: MigrationOperation) {
    return {
      forward_sql: operation.sql,
      rollback_sql: operation.rollback_sql,
      validation_sql: operation.validation_checks[0] || ''
    };
  }
}

export const migrationGenerator = new MigrationGenerator();