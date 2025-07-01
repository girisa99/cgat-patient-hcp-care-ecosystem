
/**
 * Report Generator
 * Generates comprehensive system verification reports
 */

import { ComprehensiveValidationResult } from './ComprehensiveSystemValidator';

export class ReportGenerator {
  /**
   * Generate comprehensive system verification report
   */
  static generateComprehensiveReport(result: ComprehensiveValidationResult): string {
    let report = '🔍 COMPREHENSIVE SYSTEM VERIFICATION REPORT\n';
    report += '='.repeat(60) + '\n\n';

    // Executive Summary
    report += this.generateExecutiveSummary(result);
    
    // Single Source Compliance
    report += this.generateSingleSourceSection(result);
    
    // Code Quality Analysis
    report += this.generateCodeQualitySection(result);
    
    // Database Analysis
    report += this.generateDatabaseSection(result);
    
    // Module Registry Analysis
    report += this.generateModuleRegistrySection(result);
    
    // TypeScript Analysis
    report += this.generateTypeScriptSection(result);
    
    // Action Plan
    report += this.generateActionPlanSection(result);

    return report;
  }

  /**
   * Generate executive summary
   */
  private static generateExecutiveSummary(result: ComprehensiveValidationResult): string {
    let section = '📊 EXECUTIVE SUMMARY\n';
    section += '-'.repeat(30) + '\n';
    section += `Overall Score: ${result.overallScore}/100 (${result.systemStatus})\n`;
    section += `Timestamp: ${new Date(result.timestamp).toLocaleString()}\n`;
    section += `Critical Issues: ${result.criticalIssues.length}\n`;
    section += `Estimated Cleanup Time: ${result.estimatedCleanupTime}\n\n`;
    return section;
  }

  /**
   * Generate single source compliance section
   */
  private static generateSingleSourceSection(result: ComprehensiveValidationResult): string {
    let section = '🎯 SINGLE SOURCE COMPLIANCE\n';
    section += '-'.repeat(30) + '\n';
    section += `Compliance Score: ${result.singleSourceCompliance.score}/100\n`;
    section += `Violations Found: ${result.singleSourceCompliance.violations.length}\n`;
    section += `Compliant Systems: ${result.singleSourceCompliance.compliantSystems.length}\n\n`;
    return section;
  }

  /**
   * Generate code quality section
   */
  private static generateCodeQualitySection(result: ComprehensiveValidationResult): string {
    let section = '📈 CODE QUALITY ANALYSIS\n';
    section += '-'.repeat(30) + '\n';
    section += `Mock Data Score: ${result.codeQuality.mockData.score}/100\n`;
    section += `Duplicate Components: ${result.codeQuality.duplicates.components.length}\n`;
    section += `Dead Code Files: ${result.codeQuality.deadCode.unusedFiles.length}\n`;
    section += `Naming Violations: ${result.codeQuality.namingConsistency.violations.length}\n\n`;
    return section;
  }

  /**
   * Generate database section
   */
  private static generateDatabaseSection(result: ComprehensiveValidationResult): string {
    let section = '🗄️ DATABASE ANALYSIS\n';
    section += '-'.repeat(30) + '\n';
    section += `Total Tables: ${result.database.tables.total}\n`;
    section += `Unused Tables: ${result.database.tables.unused.length}\n`;
    section += `Missing Indexes: ${result.database.tables.missingIndexes.length}\n`;
    section += `Broken Relationships: ${result.database.relationships.broken.length}\n\n`;
    return section;
  }

  /**
   * Generate module registry section
   */
  private static generateModuleRegistrySection(result: ComprehensiveValidationResult): string {
    let section = '📦 MODULE REGISTRY ANALYSIS\n';
    section += '-'.repeat(30) + '\n';
    section += `Total Modules: ${result.moduleRegistry.totalModules}\n`;
    section += `Duplicate Modules: ${result.moduleRegistry.duplicateModules.length}\n`;
    section += `Orphaned Components: ${result.moduleRegistry.orphanedComponents.length}\n`;
    section += `Naming Issues: ${result.moduleRegistry.inconsistentNaming.length}\n\n`;
    return section;
  }

  /**
   * Generate TypeScript section
   */
  private static generateTypeScriptSection(result: ComprehensiveValidationResult): string {
    let section = '📘 TYPESCRIPT ANALYSIS\n';
    section += '-'.repeat(30) + '\n';
    section += `Duplicate Types: ${result.typescript.duplicateTypes.length}\n`;
    section += `Unused Types: ${result.typescript.unusedTypes.length}\n`;
    section += `Inconsistent Interfaces: ${result.typescript.inconsistentInterfaces.length}\n`;
    section += `Missing Types: ${result.typescript.missingTypes.length}\n\n`;
    return section;
  }

  /**
   * Generate action plan section
   */
  private static generateActionPlanSection(result: ComprehensiveValidationResult): string {
    let section = '🎯 ACTION PLAN\n';
    section += '-'.repeat(30) + '\n';
    
    if (result.criticalIssues.length > 0) {
      section += 'CRITICAL ISSUES:\n';
      result.criticalIssues.forEach((issue, index) => {
        section += `${index + 1}. ${issue}\n`;
      });
      section += '\n';
    }

    section += 'RECOMMENDED ACTIONS:\n';
    result.actionPlan.forEach((action, index) => {
      section += `${index + 1}. ${action}\n`;
    });
    section += '\n';

    return section;
  }
}
