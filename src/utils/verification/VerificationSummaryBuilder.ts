
/**
 * Verification Summary Builder
 * Mock implementation for building verification summaries
 */

import { VerificationSummary, ValidationResult, AuditResult } from './AutomatedVerificationTypes';

export class VerificationSummaryBuilder {
  private issues: string[] = [];
  private fixes: string[] = [];
  private recommendations: string[] = [];

  addValidationResult(result: ValidationResult): this {
    this.issues.push(...result.issues);
    this.fixes.push(...result.fixes);
    this.recommendations.push(...(result.recommendations || []));
    return this;
  }

  addAuditResult(result: AuditResult): this {
    this.issues.push(...result.issues);
    this.recommendations.push(...(result.recommendations || []));
    return this;
  }

  build(): VerificationSummary {
    const criticalIssues = this.issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('security')
    ).length;

    return {
      totalIssues: this.issues.length,
      criticalIssues,
      fixedIssues: this.fixes.length,
      recommendations: this.recommendations,
      timestamp: new Date().toISOString()
    };
  }

  buildQuick(): VerificationSummary {
    return {
      totalIssues: this.issues.length,
      criticalIssues: 0,
      fixedIssues: 0,
      recommendations: this.recommendations,
      timestamp: new Date().toISOString()
    };
  }
}
