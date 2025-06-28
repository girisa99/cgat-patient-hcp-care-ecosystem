import { VerificationRequest } from './types';
import { TemplateGenerator } from './TemplateGenerator';
import { VerificationRunner } from './VerificationRunner';
import { AutoFixHandler } from './AutoFixHandler';
import { CoreVerificationOrchestrator } from './CoreVerificationOrchestrator';
import { UIUXOrchestrator } from './UIUXOrchestrator';
import { DatabaseFixOrchestrator } from './DatabaseFixOrchestrator';
import { EnhancedAdminModuleVerificationRunner } from './EnhancedAdminModuleVerificationRunner';

export interface VerificationSummary {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issuesByCategory: Record<string, number>;
  autoFixesApplied: number;
  realFixesApplied?: number; // Add missing property
  backendFixesDetected?: Record<string, any>; // Add missing property
  manualReviewRequired: number;
  complianceScore: number;
  timestamp: string;
  scanDuration: number;
  recommendations: string[];
  criticalFindings: string[];
  performanceImpact: 'low' | 'medium' | 'high';
  nextScanRecommended: string;
}

export class AutomatedVerificationOrchestrator {

  static async runVerification(request: VerificationRequest): Promise<VerificationSummary> {
    console.log('Starting automated verification process...');

    // 1. Core Verification
    const coreVerificationResult = await CoreVerificationOrchestrator.verifyComponent(request);
    console.log('Core verification completed.');

    // 2. UI/UX Verification
    const uiuxVerificationResult = await UIUXOrchestrator.verifyUIUX(request);
    console.log('UI/UX verification completed.');

    // 3. Database Verification and Fix Orchestration
    const databaseVerificationResult = await DatabaseFixOrchestrator.validateAndFixDatabase(request);
    console.log('Database verification and fix orchestration completed.');

    // 4. Run Enhanced Admin Module Verification
    const enhancedAdminModuleResult = await EnhancedAdminModuleVerificationRunner.runEnhancedVerification(request);
    console.log('Enhanced Admin Module verification completed.');

    // 5. Template Enforcement
    let templateEnforcementResult = null;
    if (request.componentType === 'template') {
      templateEnforcementResult = await TemplateGenerator.enforceTemplate(request);
      console.log('Template enforcement completed.');
    }

    // 6. Automated Fixes
    const autoFixResult = await AutoFixHandler.applyAutomatedFixes(request);
    console.log('Automated fixes application completed.');

    // 7. Verification Runner (if needed)
    if (!request.skipValidation) {
      const verificationResult = await VerificationRunner.runVerificationTests(request);
      console.log('Verification tests completed.');
    }

    // 8. Summarize Results
    const summary = {
      totalIssues: coreVerificationResult.totalIssues + uiuxVerificationResult.totalIssues + databaseVerificationResult.totalIssues + enhancedAdminModuleResult.totalIssues,
      criticalIssues: coreVerificationResult.criticalIssues + uiuxVerificationResult.criticalIssues + databaseVerificationResult.criticalIssues + enhancedAdminModuleResult.criticalIssues,
      highIssues: coreVerificationResult.highIssues + uiuxVerificationResult.highIssues + databaseVerificationResult.highIssues + enhancedAdminModuleResult.highIssues,
      mediumIssues: coreVerificationResult.mediumIssues + uiuxVerificationResult.mediumIssues + databaseVerificationResult.mediumIssues + enhancedAdminModuleResult.mediumIssues,
      lowIssues: coreVerificationResult.lowIssues + uiuxVerificationResult.lowIssues + databaseVerificationResult.lowIssues + enhancedAdminModuleResult.lowIssues,
      issuesByCategory: {
        ...coreVerificationResult.issuesByCategory,
        ...uiuxVerificationResult.issuesByCategory,
        ...databaseVerificationResult.issuesByCategory,
        ...enhancedAdminModuleResult.issuesByCategory
      },
      autoFixesApplied: autoFixResult.fixesApplied,
      manualReviewRequired: coreVerificationResult.manualReviewRequired + uiuxVerificationResult.manualReviewRequired + databaseVerificationResult.manualReviewRequired + enhancedAdminModuleResult.manualReviewRequired,
      complianceScore: (coreVerificationResult.complianceScore + uiuxVerificationResult.complianceScore + databaseVerificationResult.complianceScore + enhancedAdminModuleResult.complianceScore) / 4,
      timestamp: new Date().toISOString(),
      scanDuration: coreVerificationResult.scanDuration + uiuxVerificationResult.scanDuration + databaseVerificationResult.scanDuration + enhancedAdminModuleResult.scanDuration,
      recommendations: [...coreVerificationResult.recommendations, ...uiuxVerificationResult.recommendations, ...databaseVerificationResult.recommendations, ...enhancedAdminModuleResult.recommendations],
      criticalFindings: [...coreVerificationResult.criticalFindings, ...uiuxVerificationResult.criticalFindings, ...databaseVerificationResult.criticalFindings, ...enhancedAdminModuleResult.criticalFindings],
      performanceImpact: 'medium',
      nextScanRecommended: 'Weekly',
    };

    console.log('Automated verification process completed.');
    return summary;
  }
}
