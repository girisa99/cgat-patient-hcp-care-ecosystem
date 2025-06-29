
/**
 * Verification Summary Generator
 * Generates comprehensive verification summaries
 */

import { 
  VerificationSummary, 
  ComponentAuditResult,
  VerificationResult,
  AutomatedVerificationConfig
} from './AutomatedVerificationTypes';
import { ComponentAuditor } from './ComponentAuditor';
import { ComponentPropValidator } from './ComponentPropValidator';
import { RoleBasedUIValidator } from './RoleBasedUIValidator';
import { AccessibilityComplianceChecker } from './AccessibilityComplianceChecker';
import { DuplicateDetector } from './DuplicateDetector';
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

    // Count issues
    const totalIssues = validationResult.issues.length + 
                       auditResults.reduce((sum, audit) => sum + audit.issues.length, 0) +
                       propValidation.issues.length +
                       roleValidation.criticalIssues.length +
                       accessibilityValidation.criticalIssues.length +
                       duplicateStats.totalDuplicates;

    const criticalIssues = roleValidation.criticalIssues.length + 
                          accessibilityValidation.criticalIssues.length;

    // Collect recommendations
    const recommendations = [
      ...validationResult.recommendations || [],
      ...auditResults.flatMap(audit => audit.recommendations || []),
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
      validationResult,
      auditResults
    };
  }

  async generateQuickSummary(): Promise<VerificationSummary> {
    console.log('⚡ Generating quick verification summary...');

    const timestamp = new Date().toISOString();
    const validationResult = SimplifiedValidator.validate({});
    const auditResults = this.componentAuditor.auditAllComponents();

    return {
      totalIssues: validationResult.issues.length,
      criticalIssues: 0,
      fixedIssues: 0,
      recommendations: validationResult.recommendations || [],
      timestamp,
      validationResult,
      auditResults
    };
  }
}
