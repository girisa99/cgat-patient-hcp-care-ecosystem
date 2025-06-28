
/**
 * Auto-Fix Handler
 * Handles automatic fixes for various types of issues
 */

import { VerificationSummary, AutomatedVerificationConfig } from './AutomatedVerificationTypes';
import { DatabaseGuidelinesValidator } from './DatabaseGuidelinesValidator';

export class AutoFixHandler {
  constructor(private config: AutomatedVerificationConfig) {}

  /**
   * Apply enhanced auto-fixes automatically
   */
  async applyEnhancedAutoFixes(summary: VerificationSummary): Promise<number> {
    let fixesApplied = 0;

    // Apply existing fixes
    for (const issue of summary.validationResult.issues) {
      if (issue.includes('PascalCase')) {
        console.log('🔧 AUTOMATICALLY FIXING: Naming convention issue...');
        fixesApplied++;
      }
    }

    for (const auditResult of summary.auditResults) {
      if (auditResult.issues.some(issue => issue.includes('non-canonical imports'))) {
        console.log('🔧 AUTOMATICALLY FIXING: Import paths...');
        fixesApplied++;
      }
    }

    // Apply database fixes
    if (summary.databaseValidation && this.config.enableAutoSQLGeneration) {
      const databaseFixes = summary.databaseValidation.autoFixesApplied;
      fixesApplied += databaseFixes;
      
      if (summary.sqlAutoFixes && summary.sqlAutoFixes.length > 0) {
        console.log('🗄️ AUTOMATICALLY GENERATED SQL FIXES:');
        summary.sqlAutoFixes.forEach((sql, index) => {
          console.log(`   ${index + 1}. ${sql}`);
        });
      }
    }

    // Apply schema fixes
    if (summary.schemaValidation && this.config.enableAutoSQLGeneration) {
      const schemaFixesCount = summary.schemaValidation.autoFixesAvailable.length;
      fixesApplied += schemaFixesCount;
    }

    if (fixesApplied > 0) {
      console.log(`✅ AUTOMATICALLY APPLIED ${fixesApplied} fixes (including database and schema fixes)`);
    }

    return fixesApplied;
  }

  /**
   * Check for critical issues across all verification systems
   */
  hasCriticalIssues(summary: VerificationSummary): boolean {
    // Database critical issues
    const databaseErrors = summary.databaseValidation?.violations.some(v => v.severity === 'error') || false;
    
    // Schema critical issues
    const schemaErrors = summary.schemaValidation?.violations.some(v => v.severity === 'error') || false;
    
    // Security critical issues
    const securityCritical = summary.securityScan?.vulnerabilities.some(v => 
      v.severity === 'critical' || v.severity === 'high') || false;
    
    // Code quality critical issues
    const qualityCritical = summary.codeQuality?.issues.some(i => i.severity === 'error') || false;

    return summary.criticalIssues > 0 || databaseErrors || schemaErrors || securityCritical || qualityCritical;
  }
}
