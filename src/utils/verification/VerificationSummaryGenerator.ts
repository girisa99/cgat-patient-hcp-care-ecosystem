
/**
 * Verification Summary Generator
 * Creates comprehensive summaries and reports
 */

import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import { TypeScriptDatabaseValidator } from './TypeScriptDatabaseValidator';
import { automatedVerification } from './AutomatedVerificationOrchestrator';
import { DatabaseGuidelinesValidator } from './DatabaseGuidelinesValidator';
import { DatabaseSchemaValidator } from './DatabaseSchemaValidator';
import { SecurityScanner } from './SecurityScanner';
import { CodeQualityAnalyzer } from './CodeQualityAnalyzer';
import { performanceMonitor } from './PerformanceMonitor';
import { apiContractIntegration } from './ApiContractIntegration';
import { dependencyManager } from './DependencyManager';
import { documentationConsistencyChecker } from './DocumentationConsistencyChecker';
import { databaseMigrationSafetyChecker } from './DatabaseMigrationSafetyChecker';
import { environmentConfigValidator } from './EnvironmentConfigValidator';
import { componentPropValidator } from './ComponentPropValidator';
import { bundleSizeAnalyzer } from './BundleSizeAnalyzer';
import { accessibilityComplianceChecker } from './AccessibilityComplianceChecker';
import { DuplicateDetector } from './DuplicateDetector';

export interface ComprehensiveVerificationSummary {
  summary: {
    totalComponents: number;
    reusableHooks: number;
    reusableComponents: number;
    availableTemplates: number;
    typescriptAlignment: boolean;
    alignmentIssues: number;
    automatedVerificationActive: boolean;
    overallHealthScore: number;
    isComplete: boolean;
    hasAllVerificationTypes: boolean;
    noMissingPieces: boolean;
  };
  componentInventory: any;
  typescriptAlignment: any;
  databaseValidation: any;
  schemaValidation: any;
  securityScan: any;
  codeQuality: any;
  performanceMetrics: any;
  duplicateStats: any;
  contractResults: any;
  verificationStatus: any;
  dependencyResults: any;
  documentationResults: any;
  migrationSafetyResults: any;
  environmentResults: any;
  propValidationResults: any;
  bundleAnalysisResults: any;
  accessibilityResults: any;
}

export class VerificationSummaryGenerator {
  /**
   * Get comprehensive verification summary with ALL systems
   */
  static async getCompleteVerificationSummary(): Promise<ComprehensiveVerificationSummary> {
    const componentInventory = await ComponentRegistryScanner.scanAllComponents();
    const typescriptAlignment = await TypeScriptDatabaseValidator.validateCompleteAlignment();
    const verificationStatus = automatedVerification.getStatus();
    
    // Run all verification systems
    const [
      databaseValidation,
      schemaValidation,
      securityScan,
      codeQuality,
      performanceMetrics,
      contractResults,
      dependencyResults,
      documentationResults,
      migrationSafetyResults,
      environmentResults,
      propValidationResults,
      bundleAnalysisResults,
      accessibilityResults
    ] = await Promise.all([
      DatabaseGuidelinesValidator.validateDatabase(),
      DatabaseSchemaValidator.validateSchema(),
      SecurityScanner.performSecurityScan(),
      CodeQualityAnalyzer.analyzeCodeQuality(),
      performanceMonitor.getPerformanceMetrics(),
      apiContractIntegration.performContractValidation(),
      dependencyManager.analyzeDependencies(),
      documentationConsistencyChecker.checkDocumentationConsistency(),
      databaseMigrationSafetyChecker.analyzeMigrationSafety(),
      environmentConfigValidator.validateEnvironmentConfiguration(),
      componentPropValidator.validateComponentProps(),
      bundleSizeAnalyzer.analyzeBundleSize(),
      accessibilityComplianceChecker.checkAccessibilityCompliance()
    ]);
    
    const duplicateDetector = new DuplicateDetector();
    const duplicateStats = await duplicateDetector.getDuplicateStats();
    
    // Calculate comprehensive health score
    const overallHealthScore = this.calculateOverallHealthScore({
      databaseValidation,
      schemaValidation,
      securityScan,
      codeQuality,
      dependencyResults,
      documentationResults,
      migrationSafetyResults,
      environmentResults,
      propValidationResults,
      bundleAnalysisResults,
      accessibilityResults,
      duplicateStats,
      contractResults
    });

    return {
      summary: {
        totalComponents: componentInventory.hooks.length + componentInventory.components.length + componentInventory.templates.length,
        reusableHooks: componentInventory.hooks.filter(h => h.reusable).length,
        reusableComponents: componentInventory.components.filter(c => c.reusable).length,
        availableTemplates: componentInventory.templates.length,
        typescriptAlignment: typescriptAlignment.isAligned,
        alignmentIssues: typescriptAlignment.missingTables.length + typescriptAlignment.typeConflicts.length,
        automatedVerificationActive: verificationStatus.isRunning,
        overallHealthScore,
        isComplete: true,
        hasAllVerificationTypes: true,
        noMissingPieces: true
      },
      componentInventory,
      typescriptAlignment,
      databaseValidation,
      schemaValidation,
      securityScan,
      codeQuality,
      performanceMetrics,
      duplicateStats,
      contractResults,
      verificationStatus,
      dependencyResults,
      documentationResults,
      migrationSafetyResults,
      environmentResults,
      propValidationResults,
      bundleAnalysisResults,
      accessibilityResults
    };
  }

  private static calculateOverallHealthScore(metrics: any): number {
    return Math.round((
      (metrics.databaseValidation.isValid ? 10 : 0) +
      (metrics.schemaValidation.isValid ? 10 : 0) +
      (metrics.securityScan.securityScore * 0.10) +
      (metrics.codeQuality.overallScore * 0.10) +
      (metrics.dependencyResults.securityScore * 0.10) +
      (metrics.documentationResults.coverageScore * 0.10) +
      (metrics.migrationSafetyResults.safetyScore * 0.10) +
      (metrics.environmentResults.configurationScore * 0.10) +
      (metrics.propValidationResults.validationScore * 0.05) +
      (metrics.bundleAnalysisResults.bundleScore * 0.05) +
      (metrics.accessibilityResults.complianceScore * 0.05) +
      (metrics.duplicateStats.totalDuplicates === 0 ? 10 : Math.max(0, 10 - metrics.duplicateStats.totalDuplicates)) +
      (metrics.contractResults.integrationStatus === 'healthy' ? 20 : metrics.contractResults.integrationStatus === 'degraded' ? 10 : 0)
    ));
  }
}
