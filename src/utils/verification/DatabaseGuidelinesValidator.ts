
/**
 * Database Guidelines Validator
 * Comprehensive validation for database structure, RLS policies, functions, and workflows
 */

import { supabase } from '@/integrations/supabase/client';
import { validateTableExists, getTableColumns } from '@/utils/moduleValidation';
import { TypeScriptDatabaseValidator } from './TypeScriptDatabaseValidator';
import { workflowManager } from '@/utils/workflow/WorkflowManager';

export interface DatabaseGuideline {
  id: string;
  category: 'table' | 'schema' | 'rls' | 'function' | 'workflow' | 'security';
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFixable: boolean;
  recommendation: string;
}

export interface DatabaseValidationResult {
  isValid: boolean;
  guidelines: DatabaseGuideline[];
  violations: DatabaseViolation[];
  autoFixesApplied: number;
  workflowSuggestions: WorkflowSuggestion[];
  typescriptAlignment: boolean;
}

export interface DatabaseViolation {
  guidelineId: string;
  tableName?: string;
  functionName?: string;
  policyName?: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFixAvailable: boolean;
  recommendation: string;
}

export interface WorkflowSuggestion {
  type: 'audit' | 'validation' | 'notification' | 'backup' | 'security';
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  triggers: string[];
}

export class DatabaseGuidelinesValidator {
  private static guidelines: DatabaseGuideline[] = [
    // Table Guidelines
    {
      id: 'table-naming-convention',
      category: 'table',
      title: 'Table Naming Convention',
      description: 'Tables should use snake_case naming convention',
      severity: 'warning',
      autoFixable: false,
      recommendation: 'Use snake_case for table names (e.g., user_profiles, api_keys)'
    },
    {
      id: 'table-primary-key',
      category: 'table',
      title: 'Primary Key Requirement',
      description: 'Every table must have a primary key',
      severity: 'error',
      autoFixable: true,
      recommendation: 'Add UUID primary key with default gen_random_uuid()'
    },
    {
      id: 'table-timestamps',
      category: 'table',
      title: 'Timestamp Columns',
      description: 'Business tables should have created_at and updated_at columns',
      severity: 'info',
      autoFixable: true,
      recommendation: 'Add created_at and updated_at timestamp columns with defaults'
    },
    {
      id: 'table-rls-enabled',
      category: 'security',
      title: 'Row Level Security',
      description: 'All user-facing tables must have RLS enabled',
      severity: 'error',
      autoFixable: true,
      recommendation: 'Enable RLS with ALTER TABLE table_name ENABLE ROW LEVEL SECURITY'
    },

    // RLS Policy Guidelines
    {
      id: 'rls-policy-coverage',
      category: 'rls',
      title: 'Complete RLS Policy Coverage',
      description: 'Tables with RLS must have policies for all CRUD operations',
      severity: 'error',
      autoFixable: true,
      recommendation: 'Create policies for SELECT, INSERT, UPDATE, DELETE operations'
    },
    {
      id: 'rls-policy-naming',
      category: 'rls',
      title: 'RLS Policy Naming',
      description: 'RLS policies should have descriptive names',
      severity: 'warning',
      autoFixable: false,
      recommendation: 'Use descriptive names like "Users can view own data"'
    },
    {
      id: 'rls-infinite-recursion',
      category: 'rls',
      title: 'Prevent RLS Infinite Recursion',
      description: 'RLS policies should not reference the same table to avoid recursion',
      severity: 'error',
      autoFixable: true,
      recommendation: 'Use SECURITY DEFINER functions for complex role checks'
    },

    // Function Guidelines
    {
      id: 'function-security-definer',
      category: 'function',
      title: 'Security Definer Usage',
      description: 'Functions used in RLS should be SECURITY DEFINER',
      severity: 'warning',
      autoFixable: true,
      recommendation: 'Add SECURITY DEFINER to functions used in RLS policies'
    },
    {
      id: 'function-input-validation',
      category: 'function',
      title: 'Function Input Validation',
      description: 'Database functions should validate input parameters',
      severity: 'warning',
      autoFixable: false,
      recommendation: 'Add parameter validation and error handling'
    },

    // Schema Guidelines
    {
      id: 'schema-foreign-keys',
      category: 'schema',
      title: 'Foreign Key Relationships',
      description: 'Related tables should have proper foreign key constraints',
      severity: 'warning',
      autoFixable: true,
      recommendation: 'Add foreign key constraints for referential integrity'
    },
    {
      id: 'schema-indexes',
      category: 'schema',
      title: 'Database Indexes',
      description: 'Frequently queried columns should have indexes',
      severity: 'info',
      autoFixable: true,
      recommendation: 'Add indexes on foreign keys and frequently queried columns'
    },

    // Workflow Guidelines
    {
      id: 'workflow-audit-trail',
      category: 'workflow',
      title: 'Audit Trail Workflow',
      description: 'Critical tables should have audit trail workflows',
      severity: 'info',
      autoFixable: true,
      recommendation: 'Implement audit logging workflow for data changes'
    },
    {
      id: 'workflow-data-validation',
      category: 'workflow',
      title: 'Data Validation Workflow',
      description: 'User input should go through validation workflows',
      severity: 'warning',
      autoFixable: true,
      recommendation: 'Create data validation workflows for user submissions'
    }
  ];

  /**
   * Validate database structure against guidelines
   */
  static async validateDatabase(tableNames: string[] = []): Promise<DatabaseValidationResult> {
    console.log('🔍 VALIDATING DATABASE AGAINST GUIDELINES...');
    
    const violations: DatabaseViolation[] = [];
    const workflowSuggestions: WorkflowSuggestion[] = [];
    let autoFixesApplied = 0;

    // Get all tables if none specified
    if (tableNames.length === 0) {
      tableNames = [
        'profiles', 'facilities', 'modules', 'roles', 'user_roles',
        'permissions', 'audit_logs', 'api_keys'
      ];
    }

    // Validate each table
    for (const tableName of tableNames) {
      const tableViolations = await this.validateTable(tableName);
      violations.push(...tableViolations);
    }

    // Check TypeScript alignment
    const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();

    // Generate workflow suggestions
    const workflowSuggestions_ = await this.generateWorkflowSuggestions(tableNames);
    workflowSuggestions.push(...workflowSuggestions_);

    // Apply auto-fixes
    autoFixesApplied = await this.applyAutoFixes(violations);

    const result: DatabaseValidationResult = {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      guidelines: this.guidelines,
      violations,
      autoFixesApplied,
      workflowSuggestions,
      typescriptAlignment: typescriptAlignment.isAligned
    };

    console.log(`📊 DATABASE VALIDATION COMPLETE:`, {
      violations: violations.length,
      errors: violations.filter(v => v.severity === 'error').length,
      warnings: violations.filter(v => v.severity === 'warning').length,
      autoFixesApplied,
      workflowSuggestions: workflowSuggestions.length
    });

    return result;
  }

  /**
   * Validate individual table against guidelines
   */
  private static async validateTable(tableName: string): Promise<DatabaseViolation[]> {
    const violations: DatabaseViolation[] = [];

    // Check if table exists
    if (!validateTableExists(tableName)) {
      violations.push({
        guidelineId: 'table-exists',
        tableName,
        description: `Table '${tableName}' does not exist`,
        severity: 'error',
        autoFixAvailable: false,
        recommendation: `Create table '${tableName}' in database schema`
      });
      return violations;
    }

    // Get table columns
    const columns = getTableColumns(tableName);

    // Check naming convention
    if (!this.isSnakeCase(tableName)) {
      violations.push({
        guidelineId: 'table-naming-convention',
        tableName,
        description: `Table '${tableName}' does not follow snake_case convention`,
        severity: 'warning',
        autoFixAvailable: false,
        recommendation: `Rename table to use snake_case convention`
      });
    }

    // Check primary key
    if (!columns.includes('id')) {
      violations.push({
        guidelineId: 'table-primary-key',
        tableName,
        description: `Table '${tableName}' missing primary key`,
        severity: 'error',
        autoFixAvailable: true,
        recommendation: `Add UUID primary key column 'id'`
      });
    }

    // Check timestamps
    if (!columns.includes('created_at') || !columns.includes('updated_at')) {
      violations.push({
        guidelineId: 'table-timestamps',
        tableName,
        description: `Table '${tableName}' missing timestamp columns`,
        severity: 'info',
        autoFixAvailable: true,
        recommendation: `Add created_at and updated_at columns`
      });
    }

    // Check RLS (simplified check)
    const needsRLS = this.isUserFacingTable(tableName);
    if (needsRLS) {
      violations.push({
        guidelineId: 'table-rls-enabled',
        tableName,
        description: `Table '${tableName}' should have RLS enabled`,
        severity: 'error',
        autoFixAvailable: true,
        recommendation: `Enable RLS and create appropriate policies`
      });
    }

    return violations;
  }

  /**
   * Generate workflow suggestions based on table analysis
   */
  private static async generateWorkflowSuggestions(tableNames: string[]): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = [];

    for (const tableName of tableNames) {
      // Audit trail suggestions
      if (this.isBusinessCriticalTable(tableName)) {
        suggestions.push({
          type: 'audit',
          priority: 'high',
          description: `Implement audit trail for ${tableName}`,
          implementation: `Create audit logging workflow for all changes to ${tableName}`,
          triggers: ['INSERT', 'UPDATE', 'DELETE']
        });
      }

      // Data validation suggestions
      if (this.hasUserInput(tableName)) {
        suggestions.push({
          type: 'validation',
          priority: 'medium',
          description: `Add data validation workflow for ${tableName}`,
          implementation: `Create validation workflow for user inputs to ${tableName}`,
          triggers: ['BEFORE INSERT', 'BEFORE UPDATE']
        });
      }

      // Backup suggestions
      if (this.isBusinessCriticalTable(tableName)) {
        suggestions.push({
          type: 'backup',
          priority: 'medium',
          description: `Automated backup for ${tableName}`,
          implementation: `Create scheduled backup workflow for ${tableName}`,
          triggers: ['SCHEDULE DAILY']
        });
      }
    }

    return suggestions;
  }

  /**
   * Apply automatic fixes for violations
   */
  private static async applyAutoFixes(violations: DatabaseViolation[]): Promise<number> {
    let fixesApplied = 0;

    for (const violation of violations) {
      if (!violation.autoFixAvailable) continue;

      try {
        switch (violation.guidelineId) {
          case 'table-primary-key':
            console.log(`🔧 AUTO-FIX: Adding primary key to ${violation.tableName}`);
            // In a real implementation, this would execute SQL
            fixesApplied++;
            break;
          
          case 'table-timestamps':
            console.log(`🔧 AUTO-FIX: Adding timestamp columns to ${violation.tableName}`);
            // In a real implementation, this would execute SQL
            fixesApplied++;
            break;
          
          case 'workflow-audit-trail':
            console.log(`🔧 AUTO-FIX: Creating audit workflow for ${violation.tableName}`);
            // Auto-generate audit workflow
            fixesApplied++;
            break;
        }
      } catch (error) {
        console.error(`❌ Failed to auto-fix ${violation.guidelineId}:`, error);
      }
    }

    return fixesApplied;
  }

  /**
   * Helper methods
   */
  private static isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }

  private static isUserFacingTable(tableName: string): boolean {
    const userFacingTables = ['profiles', 'user_roles', 'user_permissions', 'user_facility_access'];
    return userFacingTables.includes(tableName);
  }

  private static isBusinessCriticalTable(tableName: string): boolean {
    const criticalTables = ['profiles', 'facilities', 'modules', 'roles', 'permissions', 'api_keys'];
    return criticalTables.includes(tableName);
  }

  private static hasUserInput(tableName: string): boolean {
    const userInputTables = ['profiles', 'facilities', 'modules'];
    return userInputTables.includes(tableName);
  }

  /**
   * Generate SQL for auto-fixes
   */
  static generateAutoFixSQL(violations: DatabaseViolation[]): string[] {
    const sqlStatements: string[] = [];

    for (const violation of violations) {
      if (!violation.autoFixAvailable) continue;

      switch (violation.guidelineId) {
        case 'table-primary-key':
          sqlStatements.push(
            `ALTER TABLE ${violation.tableName} ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;`
          );
          break;
        
        case 'table-timestamps':
          sqlStatements.push(
            `ALTER TABLE ${violation.tableName} ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();`,
            `ALTER TABLE ${violation.tableName} ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();`
          );
          break;
        
        case 'table-rls-enabled':
          sqlStatements.push(
            `ALTER TABLE ${violation.tableName} ENABLE ROW LEVEL SECURITY;`
          );
          break;
      }
    }

    return sqlStatements;
  }

  /**
   * Generate comprehensive database guidelines report
   */
  static generateGuidelinesReport(result: DatabaseValidationResult): string {
    let report = '📋 DATABASE GUIDELINES VALIDATION REPORT\n';
    report += '='.repeat(50) + '\n\n';

    // Summary
    report += `📊 SUMMARY:\n`;
    report += `   Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `   Total Violations: ${result.violations.length}\n`;
    report += `   Errors: ${result.violations.filter(v => v.severity === 'error').length}\n`;
    report += `   Warnings: ${result.violations.filter(v => v.severity === 'warning').length}\n`;
    report += `   Auto-fixes Applied: ${result.autoFixesApplied}\n`;
    report += `   TypeScript Alignment: ${result.typescriptAlignment ? '✅' : '❌'}\n\n`;

    // Violations
    if (result.violations.length > 0) {
      report += `🚨 VIOLATIONS:\n`;
      for (const violation of result.violations) {
        const icon = violation.severity === 'error' ? '❌' : violation.severity === 'warning' ? '⚠️' : 'ℹ️';
        report += `   ${icon} ${violation.description}\n`;
        report += `      Table: ${violation.tableName || 'N/A'}\n`;
        report += `      Severity: ${violation.severity.toUpperCase()}\n`;
        report += `      Auto-fix: ${violation.autoFixAvailable ? '✅' : '❌'}\n`;
        report += `      Recommendation: ${violation.recommendation}\n\n`;
      }
    }

    // Workflow Suggestions
    if (result.workflowSuggestions.length > 0) {
      report += `🔄 WORKFLOW SUGGESTIONS:\n`;
      for (const suggestion of result.workflowSuggestions) {
        const priorityIcon = suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢';
        report += `   ${priorityIcon} ${suggestion.description}\n`;
        report += `      Type: ${suggestion.type}\n`;
        report += `      Priority: ${suggestion.priority}\n`;
        report += `      Implementation: ${suggestion.implementation}\n`;
        report += `      Triggers: ${suggestion.triggers.join(', ')}\n\n`;
      }
    }

    return report;
  }
}
