
/**
 * Core Verification Orchestrator
 * Main coordination hub for all verification systems
 */

import { ValidationRequest, ValidationResult } from './SimplifiedValidator';
import { enhancedIntegrationOrchestrator, EnhancedIntegrationResult } from './EnhancedIntegrationOrchestrator';
import { apiContractIntegration, ContractIntegrationResult } from './ApiContractIntegration';
import { unusedCodeDetector, UnusedCodeResult } from './UnusedCodeDetector';
import { dependencyManager, DependencyManagementResult } from './DependencyManager';
import { documentationConsistencyChecker, DocumentationConsistencyResult } from './DocumentationConsistencyChecker';
import { databaseMigrationSafetyChecker, MigrationSafetyResult } from './DatabaseMigrationSafetyChecker';
import { environmentConfigValidator, EnvironmentValidationResult } from './EnvironmentConfigValidator';
import { componentPropValidator, PropValidationResult } from './ComponentPropValidator';
import { bundleSizeAnalyzer, BundleAnalysisResult } from './BundleSizeAnalyzer';
import { accessibilityComplianceChecker, AccessibilityComplianceResult } from './AccessibilityComplianceChecker';

export interface CompleteVerificationResult {
  validationSummary: EnhancedIntegrationResult;
  contractValidation: ContractIntegrationResult;
  unusedCodeAnalysis: UnusedCodeResult;
  dependencyManagement: DependencyManagementResult;
  documentationConsistency: DocumentationConsistencyResult;
  migrationSafety: MigrationSafetyResult;
  environmentValidation: EnvironmentValidationResult;
  propValidation: PropValidationResult;
  bundleAnalysis: BundleAnalysisResult;
  accessibilityCompliance: AccessibilityComplianceResult;
  overallStatus: 'approved' | 'blocked' | 'warning';
  canProceed: boolean;
  implementationPlan: string[];
}

export class CoreVerificationOrchestrator {
  private static instance: CoreVerificationOrchestrator;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CoreVerificationOrchestrator();
    }
    return this.instance;
  }

  /**
   * Complete automatic validation with all verification systems
   */
  async validateBeforeImplementation(request: ValidationRequest): Promise<CompleteVerificationResult> {
    console.log('🚀 COMPLETE AUTOMATIC PRE-IMPLEMENTATION VALIDATION...');
    
    // Initialize all validation systems
    await apiContractIntegration.initializeContractValidation();
    
    // Run comprehensive verification with all systems
    const [
      baseResult,
      contractResults,
      unusedCodeResults,
      dependencyResults,
      documentationResults,
      migrationSafetyResults,
      environmentResults,
      propValidationResults,
      bundleAnalysisResults,
      accessibilityResults
    ] = await Promise.all([
      enhancedIntegrationOrchestrator.performIntegratedVerification(request),
      apiContractIntegration.performContractValidation(),
      unusedCodeDetector.scanForUnusedCode(),
      dependencyManager.analyzeDependencies(),
      documentationConsistencyChecker.checkDocumentationConsistency(),
      databaseMigrationSafetyChecker.analyzeMigrationSafety(),
      environmentConfigValidator.validateEnvironmentConfiguration(),
      componentPropValidator.validateComponentProps(),
      bundleSizeAnalyzer.analyzeBundleSize(),
      accessibilityComplianceChecker.checkAccessibilityCompliance()
    ]);
    
    const canProceed = this.canProceedWithImplementation(baseResult, contractResults, environmentResults);
    const overallStatus = baseResult.overallStatus;
    
    console.log('📋 COMPLETE AUTOMATIC VALIDATION SUMMARY:');
    console.log(`   Overall Implementation Ready: ${canProceed}`);
    
    return {
      validationSummary: baseResult,
      contractValidation: contractResults,
      unusedCodeAnalysis: unusedCodeResults,
      dependencyManagement: dependencyResults,
      documentationConsistency: documentationResults,
      migrationSafety: migrationSafetyResults,
      environmentValidation: environmentResults,
      propValidation: propValidationResults,
      bundleAnalysis: bundleAnalysisResults,
      accessibilityCompliance: accessibilityResults,
      implementationPlan: baseResult.recommendations,
      overallStatus,
      canProceed
    };
  }

  private canProceedWithImplementation(
    baseResult: EnhancedIntegrationResult,
    contractResults: ContractIntegrationResult,
    environmentResults: EnvironmentValidationResult
  ): boolean {
    if (baseResult.overallStatus === 'blocked') return false;
    if (contractResults.integrationStatus === 'critical') return false;
    if (!environmentResults.deploymentReadiness.ready) return false;
    return true;
  }
}

export const coreVerificationOrchestrator = CoreVerificationOrchestrator.getInstance();
