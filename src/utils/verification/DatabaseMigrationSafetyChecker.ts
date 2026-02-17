
/**
 * Database Migration Safety Checker
 * Analyzes database migrations for potential data loss and performance issues
 */

export interface MigrationSafetyResult {
  safetyScore: number;
  dataLossRisks: DataLossRisk[];
  performanceImpacts: PerformanceImpact[];
  compatibilityIssues: CompatibilityIssue[];
  safetyRecommendations: string[];
}

export interface DataLossRisk {
  type: 'column_drop' | 'table_drop' | 'data_truncation' | 'constraint_violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedData: string;
  mitigation: string;
}

export interface PerformanceImpact {
  operation: string;
  estimatedDuration: number;
  lockingBehavior: 'table_lock' | 'row_lock' | 'no_lock';
  recommendedTime: string;
}

export interface CompatibilityIssue {
  type: 'version' | 'feature' | 'syntax';
  description: string;
  affectedVersions: string[];
  workaround: string;
}

export class DatabaseMigrationSafetyChecker {
  /**
   * Analyze migration safety with real duplicate detection
   */
  static async analyzeMigrationSafety(migrationScript?: string): Promise<MigrationSafetyResult> {
    console.log('🗄️ Analyzing migration safety...');

    const dataLossRisks: DataLossRisk[] = [];
    const performanceImpacts: PerformanceImpact[] = [];
    const compatibilityIssues: CompatibilityIssue[] = [];
    
    if (migrationScript) {
      // Analyze for duplicate schema elements
      const duplicateRisks = await this.detectSchemaDuplicates(migrationScript);
      dataLossRisks.push(...duplicateRisks);
      
      // Analyze for performance impact
      const perfRisks = await this.analyzePerformanceImpact(migrationScript);
      performanceImpacts.push(...perfRisks);
      
      // Check for naming conflicts
      const nameConflicts = await this.checkNamingConflicts(migrationScript);
      compatibilityIssues.push(...nameConflicts);
    }
    
    const safetyScore = this.calculateSafetyScore(dataLossRisks, performanceImpacts);
    const safetyRecommendations = this.generateSafetyRecommendations(
      dataLossRisks, performanceImpacts, compatibilityIssues
    );

    return {
      safetyScore,
      dataLossRisks,
      performanceImpacts,
      compatibilityIssues,
      safetyRecommendations
    };
  }

  /**
   * Detect schema duplicates in migration script
   */
  private static async detectSchemaDuplicates(migrationScript: string): Promise<DataLossRisk[]> {
    const risks: DataLossRisk[] = [];
    
    // Extract table names from CREATE TABLE statements
    const tableMatches = migrationScript.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi);
    if (tableMatches) {
      const tableNames = tableMatches.map(match => 
        match.replace(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?/i, '').trim()
      );
      
      // Check for duplicate table names
      const duplicateTables = tableNames.filter((name, index) => 
        tableNames.indexOf(name) !== index
      );
      
      duplicateTables.forEach(tableName => {
        risks.push({
          type: 'table_drop',
          severity: 'high',
          description: `Duplicate table definition: ${tableName}`,
          affectedData: `Table: ${tableName}`,
          mitigation: 'Remove duplicate CREATE TABLE statement or use IF NOT EXISTS clause'
        });
      });
    }
    
    // Extract column definitions
    const columnMatches = migrationScript.match(/ADD\s+COLUMN\s+(\w+)/gi);
    if (columnMatches) {
      const columnNames = columnMatches.map(match => 
        match.replace(/ADD\s+COLUMN\s+/i, '').trim().split(/\s+/)[0]
      );
      
      const duplicateColumns = columnNames.filter((name, index) => 
        columnNames.indexOf(name) !== index
      );
      
      duplicateColumns.forEach(columnName => {
        risks.push({
          type: 'column_drop',
          severity: 'medium',
          description: `Duplicate column addition: ${columnName}`,
          affectedData: `Column: ${columnName}`,
          mitigation: 'Remove duplicate ADD COLUMN statement or use IF NOT EXISTS clause'
        });
      });
    }
    
    return risks;
  }

  /**
   * Analyze performance impact of migration
   */
  private static async analyzePerformanceImpact(migrationScript: string): Promise<PerformanceImpact[]> {
    const impacts: PerformanceImpact[] = [];
    
    // Check for operations that require table locks
    if (migrationScript.includes('ALTER TABLE') && !migrationScript.includes('ADD COLUMN')) {
      impacts.push({
        operation: 'ALTER TABLE (structure change)',
        estimatedDuration: 30000, // 30 seconds estimate
        lockingBehavior: 'table_lock',
        recommendedTime: 'During maintenance window'
      });
    }
    
    // Check for index creation
    if (migrationScript.includes('CREATE INDEX')) {
      impacts.push({
        operation: 'CREATE INDEX',
        estimatedDuration: 60000, // 1 minute estimate
        lockingBehavior: 'no_lock',
        recommendedTime: 'Can run during normal operations'
      });
    }
    
    return impacts;
  }

  /**
   * Check for naming conflicts
   */
  private static async checkNamingConflicts(migrationScript: string): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];
    
    // Check for reserved keywords
    const reservedKeywords = ['user', 'order', 'group', 'table', 'index', 'database'];
    const words = migrationScript.match(/\b\w+\b/g) || [];
    
    reservedKeywords.forEach(keyword => {
      if (words.some(word => word.toLowerCase() === keyword)) {
        issues.push({
          type: 'syntax',
          description: `Using reserved keyword: ${keyword}`,
          affectedVersions: ['PostgreSQL 12+'],
          workaround: `Quote the identifier or use a different name`
        });
      }
    });
    
    return issues;
  }

  private static calculateSafetyScore(
    risks: DataLossRisk[],
    impacts: PerformanceImpact[]
  ): number {
    let score = 100;
    risks.forEach(risk => {
      const deduction = {
        critical: 40,
        high: 25,
        medium: 15,
        low: 5
      }[risk.severity];
      score -= deduction;
    });
    score -= impacts.length * 5;
    return Math.max(0, score);
  }

  private static generateSafetyRecommendations(
    risks: DataLossRisk[],
    impacts: PerformanceImpact[],
    compatibility: CompatibilityIssue[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (risks.length > 0) {
      recommendations.push('Review data loss risks and create backups');
    }
    if (impacts.length > 0) {
      recommendations.push('Schedule migrations during low-traffic periods');
    }
    if (compatibility.length > 0) {
      recommendations.push('Test migrations in staging environment');
    }
    
    return recommendations;
  }
}

export const databaseMigrationSafetyChecker = DatabaseMigrationSafetyChecker;
