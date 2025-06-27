
/**
 * Database Schema Validator
 * Validates database schema consistency and best practices
 */

export interface SchemaValidationResult {
  isValid: boolean;
  violations: SchemaViolation[];
  recommendations: string[];
  autoFixesAvailable: SchemaAutoFix[];
}

export interface SchemaViolation {
  table: string;
  column?: string;
  violationType: 'naming_convention' | 'missing_constraint' | 'data_type_mismatch' | 'missing_index' | 'security_issue';
  severity: 'error' | 'warning' | 'info';
  description: string;
  recommendation: string;
}

export interface SchemaAutoFix {
  id: string;
  description: string;
  sql: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class DatabaseSchemaValidator {
  /**
   * Validate complete database schema
   */
  static async validateSchema(tableNames: string[] = []): Promise<SchemaValidationResult> {
    console.log('🗄️ VALIDATING DATABASE SCHEMA...');
    
    const violations: SchemaViolation[] = [];
    const recommendations: string[] = [];
    const autoFixesAvailable: SchemaAutoFix[] = [];

    // Mock validation for demonstration
    const mockTables = tableNames.length > 0 ? tableNames : [
      'profiles', 'facilities', 'modules', 'api_keys', 'audit_logs'
    ];

    for (const table of mockTables) {
      // Check naming conventions
      if (!this.isValidTableName(table)) {
        violations.push({
          table,
          violationType: 'naming_convention',
          severity: 'warning',
          description: `Table '${table}' doesn't follow snake_case convention`,
          recommendation: 'Use snake_case for table names'
        });
      }

      // Check for required audit columns
      if (!this.hasAuditColumns(table)) {
        violations.push({
          table,
          violationType: 'missing_constraint',
          severity: 'info',
          description: `Table '${table}' missing standard audit columns`,
          recommendation: 'Add created_at, updated_at columns for audit trails'
        });

        autoFixesAvailable.push({
          id: `add_audit_${table}`,
          description: `Add audit columns to ${table}`,
          sql: `ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();`,
          riskLevel: 'low'
        });
      }

      // Check for RLS policies
      if (!this.hasRLSPolicies(table)) {
        violations.push({
          table,
          violationType: 'security_issue',
          severity: 'error',
          description: `Table '${table}' missing Row Level Security policies`,
          recommendation: 'Enable RLS and create appropriate policies'
        });
      }
    }

    recommendations.push(
      'Follow consistent naming conventions across all tables',
      'Ensure all user-related tables have proper RLS policies',
      'Add audit columns (created_at, updated_at) to all tables',
      'Create indexes on frequently queried columns'
    );

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      recommendations,
      autoFixesAvailable
    };
  }

  private static isValidTableName(table: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(table);
  }

  private static hasAuditColumns(table: string): boolean {
    // Mock check - in real implementation, query actual schema
    const auditTables = ['profiles', 'facilities', 'modules'];
    return auditTables.includes(table);
  }

  private static hasRLSPolicies(table: string): boolean {
    // Mock check - in real implementation, query pg_policies
    const rlsTables = ['profiles', 'api_keys'];
    return rlsTables.includes(table);
  }

  /**
   * Generate SQL for auto-fixes
   */
  static generateAutoFixSQL(fixes: SchemaAutoFix[]): string[] {
    return fixes.map(fix => fix.sql);
  }
}
