
/**
 * Verification Summary Builder
 * Handles creation of comprehensive verification summaries
 */

import { 
  VerificationSummary, 
  PerformanceMetrics 
} from './AutomatedVerificationTypes';
import { ValidationResult } from './SimplifiedValidator';
import { AuditResult } from './ComponentAuditor';
import { DatabaseValidationResult, DatabaseGuidelinesValidator } from './DatabaseGuidelinesValidator';
import { SchemaValidationResult, DatabaseSchemaValidator } from './DatabaseSchemaValidator';
import { SecurityScanResult } from './SecurityScanner';
import { CodeQualityResult } from './CodeQualityAnalyzer';

export class VerificationSummaryBuilder {
  /**
   * Create enhanced verification summary with all validation results
   */
  createEnhancedSummary(
    timestamp: string,
    validationResult: ValidationResult,
    auditResults: AuditResult[],
    duplicateReport: string,
    canonicalValidation: string,
    databaseValidation: DatabaseValidationResult | null,
    schemaValidation: SchemaValidationResult | null,
    performanceMetrics: PerformanceMetrics | null,
    securityScan: SecurityScanResult | null,
    codeQuality: CodeQualityResult | null
  ): VerificationSummary {
    const baseIssuesFound = validationResult.issues.length + 
                          auditResults.reduce((sum, audit) => sum + audit.issues.length, 0);
    
    const databaseIssuesFound = databaseValidation?.violations.length || 0;
    const schemaIssuesFound = schemaValidation?.violations.length || 0;
    const securityIssuesFound = securityScan?.vulnerabilities.length || 0;
    const qualityIssuesFound = codeQuality?.issues.length || 0;
    
    const issuesFound = baseIssuesFound + databaseIssuesFound + schemaIssuesFound + securityIssuesFound + qualityIssuesFound;
    
    const baseCriticalIssues = validationResult.issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('blocked')
    ).length;
    
    const databaseCriticalIssues = databaseValidation?.violations.filter(v => v.severity === 'error').length || 0;
    const schemaCriticalIssues = schemaValidation?.violations.filter(v => v.severity === 'error').length || 0;
    const securityCriticalIssues = securityScan?.vulnerabilities.filter(v => 
      v.severity === 'critical' || v.severity === 'high').length || 0;
    const qualityCriticalIssues = codeQuality?.issues.filter(i => i.severity === 'error').length || 0;
    
    const criticalIssues = baseCriticalIssues + databaseCriticalIssues + schemaCriticalIssues + 
                          securityCriticalIssues + qualityCriticalIssues;

    const allRecommendations = [
      ...validationResult.recommendations,
      ...auditResults.flatMap(audit => audit.recommendations)
    ];

    // Add enhanced system recommendations
    if (databaseValidation) {
      allRecommendations.push(...databaseValidation.violations.map(v => v.recommendation));
    }
    if (schemaValidation) {
      allRecommendations.push(...schemaValidation.recommendations);
    }
    if (securityScan) {
      // Convert SecurityRecommendation objects to strings by extracting title
      allRecommendations.push(...securityScan.recommendations.map(r => 
        typeof r === 'string' ? r : r.title || r.description || 'Security recommendation'
      ));
    }
    if (codeQuality) {
      allRecommendations.push(...codeQuality.recommendations);
    }

    // Generate SQL auto-fixes
    const sqlAutoFixes: string[] = [];
    if (databaseValidation) {
      sqlAutoFixes.push(...DatabaseGuidelinesValidator.generateAutoFixSQL(databaseValidation.violations));
    }
    if (schemaValidation) {
      sqlAutoFixes.push(...DatabaseSchemaValidator.generateAutoFixSQL(schemaValidation.autoFixesAvailable));
    }

    // Generate workflow suggestions
    const workflowSuggestions = databaseValidation
      ? databaseValidation.workflowSuggestions.map(ws => ws.description)
      : [];

    // Calculate health scores
    const overallHealthScore = this.calculateOverallHealthScore({
      validationScore: issuesFound === 0 ? 100 : Math.max(0, 100 - (issuesFound * 5)),
      securityScore: securityScan?.securityScore || 100,
      qualityScore: codeQuality?.overallScore || 100,
      performanceScore: this.calculatePerformanceScore(performanceMetrics)
    });

    return {
      timestamp,
      validationResult,
      auditResults,
      duplicateReport,
      canonicalValidation,
      databaseValidation,
      schemaValidation,
      performanceMetrics,
      securityScan,
      codeQuality,
      issuesFound,
      criticalIssues,
      autoFixesApplied: 0,
      recommendations: allRecommendations,
      sqlAutoFixes,
      workflowSuggestions,
      overallHealthScore,
      securityScore: securityScan?.securityScore || 100,
      qualityScore: codeQuality?.overallScore || 100,
      performanceScore: this.calculatePerformanceScore(performanceMetrics)
    };
  }

  /**
   * Create empty summary for disabled checks
   */
  createEmptySummary(): VerificationSummary {
    return {
      timestamp: new Date().toISOString(),
      validationResult: {
        canProceed: true,
        issues: [],
        warnings: [],
        recommendations: [],
        shouldUseTemplate: false
      },
      auditResults: [],
      duplicateReport: 'No verification data available',
      canonicalValidation: 'No verification data available',
      databaseValidation: null,
      schemaValidation: null,
      performanceMetrics: null,
      securityScan: null,
      codeQuality: null,
      issuesFound: 0,
      criticalIssues: 0,
      autoFixesApplied: 0,
      recommendations: [],
      sqlAutoFixes: [],
      workflowSuggestions: [],
      overallHealthScore: 100,
      securityScore: 100,
      qualityScore: 100,
      performanceScore: 100
    };
  }

  private calculateOverallHealthScore(scores: {
    validationScore: number;
    securityScore: number;
    qualityScore: number;
    performanceScore: number;
  }): number {
    const weights = {
      validation: 0.25,
      security: 0.35,
      quality: 0.25,
      performance: 0.15
    };

    return Math.round(
      scores.validationScore * weights.validation +
      scores.securityScore * weights.security +
      scores.qualityScore * weights.quality +
      scores.performanceScore * weights.performance
    );
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics | null): number {
    if (!metrics) return 100;

    let score = 100;
    
    // Deduct for slow components
    const slowComponents = metrics.componentRenderTimes.filter(c => c.averageRenderTime > 16);
    score -= slowComponents.length * 10;

    // Deduct for bundle size
    if (metrics.bundleSize.totalSize > 3 * 1024 * 1024) { // 3MB
      score -= 20;
    }

    return Math.max(0, score);
  }
}
