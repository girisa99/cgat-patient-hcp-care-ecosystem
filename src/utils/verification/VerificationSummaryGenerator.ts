
/**
 * Verification Summary Generator
 * Generates comprehensive verification summaries
 */

import { 
  VerificationSummary, 
  ComponentAuditResult,
  VerificationResult,
  AutomatedVerificationConfig,
  ValidationResult,
  AuditResult
} from './AutomatedVerificationTypes';
import { ComponentAuditor } from './ComponentAuditor';
import { ComponentPropValidator } from './ComponentPropValidator';
import { RoleBasedUIValidator } from './RoleBasedUIValidator';
import { AccessibilityComplianceChecker } from './AccessibilityComplianceChecker';
import { DuplicateDetector } from '@/utils/duplicate-prevention-bridge';
import { SimplifiedValidator } from './SimplifiedValidator';

export class VerificationSummaryGenerator {
  private componentAuditor: ComponentAuditor;
  private duplicateDetector: DuplicateDetector;

  constructor(private config: AutomatedVerificationConfig) {
    this.componentAuditor = new ComponentAuditor();
    this.duplicateDetector = new DuplicateDetector();
  }

  async generateComprehensiveSummary(): Promise<VerificationSummary> {
    console.log('📊 Generating comprehensive verification summary...');

    const timestamp = new Date().toISOString();
    
    // Run all validations
    const validationResult = SimplifiedValidator.validate({});
    const auditResults = this.componentAuditor.auditAllComponents();
    const propValidation = await ComponentPropValidator.validateComponentProps();
    const roleValidation = RoleBasedUIValidator.validateRoleBasedUI();
    const accessibilityValidation = await AccessibilityComplianceChecker.checkAccessibilityCompliance();
    const duplicateStats = this.duplicateDetector.getDuplicateStats();

    // Convert SimplifiedValidator result to match expected interface
    const standardizedValidationResult: ValidationResult = {
      success: validationResult.success,
      issues: validationResult.issues,
      fixes: validationResult.fixes,
      recommendations: validationResult.recommendations || []
    };

    // Convert ComponentAuditResult to AuditResult
    const standardizedAuditResults: AuditResult[] = auditResults.map(audit => ({
      component: audit.component,
      issues: audit.issues,
      recommendations: audit.recommendations || []
    }));

    // Count issues
    const totalIssues = standardizedValidationResult.issues.length + 
                       standardizedAuditResults.reduce((sum, audit) => sum + audit.issues.length, 0) +
                       propValidation.issues.length +
                       roleValidation.criticalIssues.length +
                       accessibilityValidation.criticalIssues.length +
                       duplicateStats.totalDuplicates;

    const criticalIssues = roleValidation.criticalIssues.length + 
                          accessibilityValidation.criticalIssues.length;

    // Collect recommendations
    const recommendations = [
      ...standardizedValidationResult.recommendations,
      ...standardizedAuditResults.flatMap(audit => audit.recommendations),
      ...propValidation.recommendations,
      ...roleValidation.recommendations,
      ...accessibilityValidation.recommendations
    ];

    return {
      totalIssues,
      criticalIssues,
      fixedIssues: 0,
      recommendations,
      timestamp,
      validationResult: standardizedValidationResult,
      auditResults: standardizedAuditResults
    };
  }

  async generateQuickSummary(): Promise<VerificationSummary> {
    console.log('⚡ Generating quick verification summary...');

    const timestamp = new Date().toISOString();
    const validationResult = SimplifiedValidator.validate({});
    const auditResults = this.componentAuditor.auditAllComponents();

    // Convert to standardized format
    const standardizedValidationResult: ValidationResult = {
      success: validationResult.success,
      issues: validationResult.issues,
      fixes: validationResult.fixes,
      recommendations: validationResult.recommendations || []
    };

    const standardizedAuditResults: AuditResult[] = auditResults.map(audit => ({
      component: audit.component,
      issues: audit.issues,
      recommendations: audit.recommendations || []
    }));

    return {
      totalIssues: standardizedValidationResult.issues.length,
      criticalIssues: 0,
      fixedIssues: 0,
      recommendations: standardizedValidationResult.recommendations,
      timestamp,
      validationResult: standardizedValidationResult,
      auditResults: standardizedAuditResults
    };
  }

  // Add the missing method that components are expecting
  static async getCompleteVerificationSummary(): Promise<VerificationSummary> {
    console.log('📊 Getting complete verification summary...');
    
    const generator = new VerificationSummaryGenerator({
      interval: 60000,
      enableAutoFix: false,
      criticalThreshold: 5
    });
    
    return await generator.generateComprehensiveSummary();
  }
}
