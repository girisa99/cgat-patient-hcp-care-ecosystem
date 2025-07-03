/**
 * Database Schema Analyzer
 * Analyzes database schema changes, foreign keys, constraints, and relationships
 * Integrates with Update First Gateway to prevent duplicate schema elements
 */

import { dbAdapter } from '@/utils/db';
import { ColumnInfo, TableInfo } from '@/utils/db/DatabaseAdapter';

export interface DatabaseSchemaAnalysis {
  tables: DatabaseTableInfo[];
  foreignKeys: DatabaseForeignKeyInfo[];
  constraints: DatabaseConstraintInfo[];
  indexes: DatabaseIndexInfo[];
  duplicateRisks: SchemaDuplicateRisk[];
  schemaQualityScore: number; // 0-100
  recommendations: string[];
}

export interface DatabaseTableInfo {
  tableName: string;
  columns: DatabaseColumnInfo[];
  rowCount: number;
  hasRLS: boolean;
  hasTriggers: boolean;
  relationships: string[];
  lastAnalyzed: string;
}

export interface DatabaseColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue: string | null;
  constraints: string[];
}

export interface DatabaseForeignKeyInfo {
  constraintName: string;
  tableName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  onUpdate: string;
  onDelete: string;
}

export interface DatabaseConstraintInfo {
  constraintName: string;
  tableName: string;
  constraintType: string;
  columnNames: string[];
  definition: string;
}

export interface DatabaseIndexInfo {
  indexName: string;
  tableName: string;
  columnNames: string[];
  isUnique: boolean;
  indexType: string;
}

export interface SchemaDuplicateRisk {
  riskType: 'duplicate_column' | 'duplicate_constraint' | 'duplicate_index' | 'redundant_relationship';
  description: string;
  affectedObjects: string[];
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface SchemaChangeRequest {
  type: 'add_column' | 'add_table' | 'add_constraint' | 'add_index' | 'add_foreign_key';
  tableName: string;
  details: any;
  reason: string;
}

export class DatabaseSchemaAnalyzer {
  /**
   * Comprehensive database schema analysis
   */
  static async analyzeCompleteSchema(): Promise<DatabaseSchemaAnalysis> {
    console.log('🗄️ Analyzing complete database schema...');

    const analysis: DatabaseSchemaAnalysis = {
      tables: [],
      foreignKeys: [],
      constraints: [],
      indexes: [],
      duplicateRisks: [],
      schemaQualityScore: 0,
      recommendations: []
    };

    try {
      // Get all tables information
      analysis.tables = await this.analyzeAllTables();
      
      // Get foreign key relationships
      analysis.foreignKeys = await this.analyzeForeignKeys();
      
      // Get constraints
      analysis.constraints = await this.analyzeConstraints();
      
      // Get indexes
      analysis.indexes = await this.analyzeIndexes();
      
      // Detect duplicate risks
      analysis.duplicateRisks = await this.detectSchemaDuplicateRisks(analysis);
      
      // Calculate quality score
      analysis.schemaQualityScore = this.calculateSchemaQualityScore(analysis);
      
      // Generate recommendations
      analysis.recommendations = this.generateSchemaRecommendations(analysis);

      console.log(`✅ Database schema analysis completed:
        - Tables: ${analysis.tables.length}
        - Foreign Keys: ${analysis.foreignKeys.length}
        - Constraints: ${analysis.constraints.length}
        - Indexes: ${analysis.indexes.length}
        - Duplicate Risks: ${analysis.duplicateRisks.length}
        - Quality Score: ${analysis.schemaQualityScore}/100`);

      return analysis;

    } catch (error) {
      console.error('❌ Database schema analysis failed:', error);
      return analysis;
    }
  }

  /**
   * Analyze all tables in the database
   */
  private static async analyzeAllTables(): Promise<DatabaseTableInfo[]> {
    const tables: DatabaseTableInfo[] = [];
    
    // Known framework tables
    const frameworkTables: string[] = [
      'profiles', 'facilities', 'modules', 'permissions', 'roles',
      'user_roles', 'user_permissions', 'user_facility_access',
      'audit_logs', 'api_keys', 'external_api_registry'
    ];

    for (const tableName of frameworkTables) {
      try {
        const tableInfo = await dbAdapter.getTableInfo(tableName);
        if (!tableInfo) {
          console.warn(`Failed to get info for table ${tableName}`);
          continue;
        }

        const rowCount = await dbAdapter.getTableRowCount(tableName);

        const tableAnalysis: DatabaseTableInfo = {
          tableName,
          columns: this.normalizeColumnInfo(tableInfo.columns || []),
          rowCount,
          hasRLS: (tableInfo.rls_policies || []).length > 0,
          hasTriggers: (tableInfo.triggers || []).length > 0,
          relationships: this.extractRelationships(tableInfo.foreign_keys || []),
          lastAnalyzed: new Date().toISOString()
        };

        tables.push(tableAnalysis);

      } catch (error) {
        console.warn(`Failed to analyze table ${tableName}:`, error);
      }
    }

    return tables;
  }

  /**
   * Analyze foreign key relationships
   */
  private static async analyzeForeignKeys(): Promise<DatabaseForeignKeyInfo[]> {
    const foreignKeys: DatabaseForeignKeyInfo[] = [];
    
    try {
      // This would normally query information_schema, but we'll use a simplified approach
      // In a real implementation, this would use edge functions to query system tables
      
      // Mock implementation for demonstration
      const mockForeignKeys = [
        {
          constraintName: 'profiles_facility_id_fkey',
          tableName: 'profiles',
          columnName: 'facility_id',
          referencedTable: 'facilities',
          referencedColumn: 'id',
          onUpdate: 'NO ACTION',
          onDelete: 'NO ACTION'
        },
        {
          constraintName: 'user_roles_user_id_fkey',
          tableName: 'user_roles',
          columnName: 'user_id',
          referencedTable: 'profiles',
          referencedColumn: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ];

      foreignKeys.push(...mockForeignKeys);

    } catch (error) {
      console.warn('Failed to analyze foreign keys:', error);
    }

    return foreignKeys;
  }

  /**
   * Analyze database constraints
   */
  private static async analyzeConstraints(): Promise<DatabaseConstraintInfo[]> {
    const constraints: DatabaseConstraintInfo[] = [];
    
    try {
      // Mock implementation - in real scenario, query information_schema
      const mockConstraints = [
        {
          constraintName: 'profiles_email_key',
          tableName: 'profiles',
          constraintType: 'UNIQUE',
          columnNames: ['email'],
          definition: 'UNIQUE (email)'
        },
        {
          constraintName: 'api_keys_rate_limit_check',
          tableName: 'api_keys',
          constraintType: 'CHECK',
          columnNames: ['rate_limit_requests'],
          definition: 'CHECK (rate_limit_requests > 0)'
        }
      ];

      constraints.push(...mockConstraints);

    } catch (error) {
      console.warn('Failed to analyze constraints:', error);
    }

    return constraints;
  }

  /**
   * Analyze database indexes
   */
  private static async analyzeIndexes(): Promise<DatabaseIndexInfo[]> {
    const indexes: DatabaseIndexInfo[] = [];
    
    try {
      // Mock implementation - in real scenario, query pg_indexes
      const mockIndexes = [
        {
          indexName: 'profiles_email_idx',
          tableName: 'profiles',
          columnNames: ['email'],
          isUnique: true,
          indexType: 'btree'
        },
        {
          indexName: 'audit_logs_user_id_idx',
          tableName: 'audit_logs',
          columnNames: ['user_id'],
          isUnique: false,
          indexType: 'btree'
        }
      ];

      indexes.push(...mockIndexes);

    } catch (error) {
      console.warn('Failed to analyze indexes:', error);
    }

    return indexes;
  }

  /**
   * Detect schema duplicate risks
   */
  private static async detectSchemaDuplicateRisks(analysis: DatabaseSchemaAnalysis): Promise<SchemaDuplicateRisk[]> {
    const risks: SchemaDuplicateRisk[] = [];

    // Check for duplicate column patterns
    const columnPatterns = new Map<string, string[]>();
    analysis.tables.forEach(table => {
      table.columns.forEach(column => {
        const pattern = `${column.dataType}_${column.isNullable ? 'nullable' : 'not_null'}`;
        if (!columnPatterns.has(pattern)) {
          columnPatterns.set(pattern, []);
        }
        columnPatterns.get(pattern)!.push(`${table.tableName}.${column.columnName}`);
      });
    });

    // Find potential duplicate columns
    columnPatterns.forEach((columns, pattern) => {
      if (columns.length > 5) { // If same pattern appears in many places
        const similarColumns = columns.filter(col => 
          col.includes('_id') || col.includes('email') || col.includes('name')
        );
        
        if (similarColumns.length > 2) {
          risks.push({
            riskType: 'duplicate_column',
            description: `Similar column pattern found across multiple tables: ${pattern}`,
            affectedObjects: similarColumns,
            severity: 'medium',
            recommendation: 'Consider normalizing or creating a shared reference table'
          });
        }
      }
    });

    // Check for redundant foreign key relationships
    const relationships = new Map<string, string[]>();
    analysis.foreignKeys.forEach(fk => {
      const key = `${fk.referencedTable}.${fk.referencedColumn}`;
      if (!relationships.has(key)) {
        relationships.set(key, []);
      }
      relationships.get(key)!.push(`${fk.tableName}.${fk.columnName}`);
    });

    relationships.forEach((refs, target) => {
      if (refs.length > 10) { // Many tables referencing the same target
        risks.push({
          riskType: 'redundant_relationship',
          description: `Many tables reference ${target}`,
          affectedObjects: refs,
          severity: 'low',
          recommendation: 'Consider if all these relationships are necessary'
        });
      }
    });

    // Check for duplicate constraints
    const constraintPatterns = new Map<string, string[]>();
    analysis.constraints.forEach(constraint => {
      const pattern = `${constraint.constraintType}_${constraint.columnNames.join('_')}`;
      if (!constraintPatterns.has(pattern)) {
        constraintPatterns.set(pattern, []);
      }
      constraintPatterns.get(pattern)!.push(`${constraint.tableName}.${constraint.constraintName}`);
    });

    constraintPatterns.forEach((constraints, pattern) => {
      if (constraints.length > 3) {
        risks.push({
          riskType: 'duplicate_constraint',
          description: `Similar constraint pattern: ${pattern}`,
          affectedObjects: constraints,
          severity: 'low',
          recommendation: 'Review if all constraints are needed or can be consolidated'
        });
      }
    });

    return risks;
  }

  /**
   * Validate schema change request against existing schema
   */
  static async validateSchemaChangeRequest(request: SchemaChangeRequest): Promise<{
    isValid: boolean;
    conflicts: string[];
    recommendations: string[];
    duplicateRisk: number; // 0-100
  }> {
    console.log('🔍 Validating schema change request:', request);

    const conflicts: string[] = [];
    const recommendations: string[] = [];
    let duplicateRisk = 0;

    try {
      const analysis = await this.analyzeCompleteSchema();

      switch (request.type) {
        case 'add_column':
          const existingTable = analysis.tables.find(t => t.tableName === request.tableName);
          if (existingTable) {
            const existingColumn = existingTable.columns.find(c => 
              c.columnName === request.details.columnName
            );
            if (existingColumn) {
              conflicts.push(`Column '${request.details.columnName}' already exists in table '${request.tableName}'`);
              duplicateRisk += 50;
            }

            // Check for similar columns across tables
            const similarColumns = analysis.tables
              .flatMap(t => t.columns)
              .filter(c => c.columnName === request.details.columnName);
            
            if (similarColumns.length > 0) {
              duplicateRisk += 20;
              recommendations.push(`Similar column '${request.details.columnName}' exists in other tables`);
            }
          }
          break;

        case 'add_constraint':
          const existingConstraint = analysis.constraints.find(c => 
            c.tableName === request.tableName && 
            c.constraintName === request.details.constraintName
          );
          if (existingConstraint) {
            conflicts.push(`Constraint '${request.details.constraintName}' already exists`);
            duplicateRisk += 40;
          }
          break;

        case 'add_foreign_key':
          const existingFk = analysis.foreignKeys.find(fk => 
            fk.tableName === request.tableName && 
            fk.columnName === request.details.columnName &&
            fk.referencedTable === request.details.referencedTable
          );
          if (existingFk) {
            conflicts.push(`Foreign key relationship already exists`);
            duplicateRisk += 60;
          }
          break;

        case 'add_index':
          const existingIndex = analysis.indexes.find(idx => 
            idx.tableName === request.tableName && 
            JSON.stringify(idx.columnNames.sort()) === JSON.stringify(request.details.columnNames.sort())
          );
          if (existingIndex) {
            conflicts.push(`Index on columns ${request.details.columnNames.join(', ')} already exists`);
            duplicateRisk += 30;
          }
          break;
      }

      return {
        isValid: conflicts.length === 0,
        conflicts,
        recommendations,
        duplicateRisk: Math.min(duplicateRisk, 100)
      };

    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      return {
        isValid: false,
        conflicts: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: [],
        duplicateRisk: 0
      };
    }
  }

  /**
   * Helper methods
   */
  private static normalizeColumnInfo(columns: any[]): DatabaseColumnInfo[] {
    return columns.map(col => ({
      columnName: col.column_name || col.name,
      dataType: col.data_type || col.type,
      isNullable: col.is_nullable === 'YES' || col.nullable === true,
      isPrimaryKey: col.constraint_type === 'PRIMARY KEY' || col.is_primary_key === true,
      isForeignKey: col.constraint_type === 'FOREIGN KEY' || col.is_foreign_key === true,
      defaultValue: col.column_default || col.default || null,
      constraints: col.constraints || []
    }));
  }

  private static extractRelationships(foreignKeys: any[]): string[] {
    return foreignKeys.map(fk => 
      `${fk.foreign_table_name || fk.references_table}.${fk.foreign_column_name || fk.references_column}`
    );
  }

  private static calculateSchemaQualityScore(analysis: DatabaseSchemaAnalysis): number {
    let score = 100;

    // Penalize for high-severity duplicate risks
    const highSeverityRisks = analysis.duplicateRisks.filter(r => r.severity === 'high').length;
    score -= highSeverityRisks * 15;

    // Penalize for medium-severity duplicate risks
    const mediumSeverityRisks = analysis.duplicateRisks.filter(r => r.severity === 'medium').length;
    score -= mediumSeverityRisks * 10;

    // Penalize for tables without RLS
    const tablesWithoutRLS = analysis.tables.filter(t => !t.hasRLS).length;
    score -= tablesWithoutRLS * 5;

    // Reward for proper indexing
    const indexedTables = analysis.tables.filter(t => 
      analysis.indexes.some(idx => idx.tableName === t.tableName)
    ).length;
    if (analysis.tables.length > 0) {
      score += (indexedTables / analysis.tables.length) * 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static generateSchemaRecommendations(analysis: DatabaseSchemaAnalysis): string[] {
    const recommendations: string[] = [];

    // RLS recommendations
    const tablesWithoutRLS = analysis.tables.filter(t => !t.hasRLS);
    if (tablesWithoutRLS.length > 0) {
      recommendations.push(`Enable RLS on ${tablesWithoutRLS.length} tables: ${tablesWithoutRLS.map(t => t.tableName).join(', ')}`);
    }

    // Indexing recommendations
    const tablesWithoutIndexes = analysis.tables.filter(t => 
      !analysis.indexes.some(idx => idx.tableName === t.tableName)
    );
    if (tablesWithoutIndexes.length > 0) {
      recommendations.push(`Consider adding indexes to frequently queried tables: ${tablesWithoutIndexes.map(t => t.tableName).join(', ')}`);
    }

    // Duplicate risk recommendations
    if (analysis.duplicateRisks.length > 0) {
      recommendations.push(`Review ${analysis.duplicateRisks.length} potential duplicate schema elements`);
    }

    // Foreign key recommendations
    const tablesWithoutForeignKeys = analysis.tables.filter(t => 
      !analysis.foreignKeys.some(fk => fk.tableName === t.tableName) &&
      t.columns.some(c => c.columnName.endsWith('_id'))
    );
    if (tablesWithoutForeignKeys.length > 0) {
      recommendations.push(`Consider adding foreign key constraints to tables with ID columns: ${tablesWithoutForeignKeys.map(t => t.tableName).join(', ')}`);
    }

    return recommendations;
  }
}
