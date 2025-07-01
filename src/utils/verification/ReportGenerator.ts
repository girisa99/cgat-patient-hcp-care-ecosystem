
/**
 * Report Generator
 * Utilities for generating comprehensive reports
 */

import { ComprehensiveValidationResult } from './ComprehensiveSystemValidator';

export class ReportGenerator {
  /**
   * Generate comprehensive report
   */
  static generateComprehensiveReport(result: ComprehensiveValidationResult): string {
    return `
# Comprehensive System Validation Report
Generated: ${result.timestamp}

## Executive Summary
- **Overall Score**: ${result.overallScore}/100
- **System Status**: ${result.systemStatus}
- **Critical Issues**: ${result.criticalIssues.length}
- **Estimated Cleanup Time**: ${result.estimatedCleanupTime}

## Single Source Compliance
- **Score**: ${result.singleSourceCompliance.score}/100
- **Violations**: ${result.singleSourceCompliance.violations.length}
- **Compliant Systems**: ${result.singleSourceCompliance.compliantSystems.length}

## Code Quality Analysis
- **Mock Data Score**: ${result.codeQuality.mockData.score}/100
- **Naming Consistency**: ${result.codeQuality.namingConsistency.score}/100
- **Duplicate Components**: ${result.codeQuality.duplicates.components.length}
- **Dead Code Items**: ${Object.values(result.codeQuality.deadCode).flat().length}

## Database Analysis
- **Total Tables**: ${result.database.tables.total}
- **Unused Tables**: ${result.database.tables.unused.length}
- **Broken Relationships**: ${result.database.relationships.broken.length}

## Module Registry
- **Total Modules**: ${result.moduleRegistry.totalModules}
- **Duplicate Modules**: ${result.moduleRegistry.duplicateModules.length}
- **Orphaned Components**: ${result.moduleRegistry.orphanedComponents.length}

## TypeScript Analysis
- **Duplicate Types**: ${result.typescript.duplicateTypes.length}
- **Unused Types**: ${result.typescript.unusedTypes.length}

## Critical Issues
${result.criticalIssues.map(issue => `❌ ${issue}`).join('\n')}

## Action Plan
${result.actionPlan.map(action => `${action}`).join('\n')}

## Recommendations
${result.singleSourceCompliance.recommendations.map(rec => `✅ ${rec}`).join('\n')}
    `.trim();
  }
}
