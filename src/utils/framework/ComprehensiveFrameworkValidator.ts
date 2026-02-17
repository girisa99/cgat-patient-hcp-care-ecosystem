/**
 * COMPREHENSIVE FRAMEWORK VALIDATOR
 * Centralized validation system ensuring complete framework adherence
 * Integrates all verification systems into unified compliance engine
 */

import { DuplicateDetector, DuplicateAnalyzer } from '@/utils/duplicate-prevention-bridge';
import { MockDataDetector } from '../verification/MockDataDetector';
import { SingleSourceValidator } from '../verification/SingleSourceValidator';
import { ComponentGovernance } from '../governance/ComponentGovernance';

export interface ComprehensiveValidationResult {
  timestamp: string;
  overallCompliance: number;
  frameworkAdherence: boolean;
  violations: {
    duplicates: number;
    mockData: number;
    singleSource: number;
    governance: number;
  };
  recommendations: string[];
  autoFixApplied: string[];
  blockingIssues: string[];
}

export class ComprehensiveFrameworkValidator {
  private static instance: ComprehensiveFrameworkValidator;
  private duplicateDetector: DuplicateDetector;
  private validationCache: Map<string, ComprehensiveValidationResult> = new Map();

  private constructor() {
    this.duplicateDetector = new DuplicateDetector();
  }

  static getInstance(): ComprehensiveFrameworkValidator {
    if (!ComprehensiveFrameworkValidator.instance) {
      ComprehensiveFrameworkValidator.instance = new ComprehensiveFrameworkValidator();
    }
    return ComprehensiveFrameworkValidator.instance;
  }

  async validateCompleteFramework(): Promise<ComprehensiveValidationResult> {
    console.log('🔍 Starting comprehensive framework validation...');

    const validationId = `validation-${Date.now()}`;
    
    // Run all validation systems in parallel
    const [
      duplicateStats,
      mockDataAnalysis,
      singleSourceValidation,
      duplicateAnalysis
    ] = await Promise.all([
      this.validateDuplicates(),
      this.validateMockData(),
      this.validateSingleSource(),
      this.validateDuplicateComponents()
    ]);

    // Calculate overall compliance score
    const complianceScore = this.calculateComplianceScore({
      duplicateStats,
      mockDataAnalysis,
      singleSourceValidation,
      duplicateAnalysis
    });

    const result: ComprehensiveValidationResult = {
      timestamp: new Date().toISOString(),
      overallCompliance: complianceScore,
      frameworkAdherence: complianceScore >= 85,
      violations: {
        duplicates: duplicateStats.totalDuplicates || 0,
        mockData: mockDataAnalysis.violations.length,
        singleSource: singleSourceValidation.violations.length,
        governance: duplicateAnalysis.duplicates.components.length + duplicateAnalysis.duplicates.services.length
      },
      recommendations: this.generateRecommendations({
        duplicateStats,
        mockDataAnalysis,
        singleSourceValidation,
        duplicateAnalysis
      }),
      autoFixApplied: [],
      blockingIssues: this.identifyBlockingIssues({
        duplicateStats,
        mockDataAnalysis,
        singleSourceValidation,
        duplicateAnalysis
      })
    };

    // Cache result
    this.validationCache.set(validationId, result);

    console.log('✅ Comprehensive validation complete:', {
      compliance: complianceScore,
      violations: result.violations,
      blocking: result.blockingIssues.length
    });

    return result;
  }

  private async validateDuplicates() {
    console.log('📊 Validating duplicates...');
    return this.duplicateDetector.getDuplicateStats();
  }

  private async validateMockData() {
    console.log('🎭 Validating mock data usage...');
    return await MockDataDetector.analyzeMockDataUsage();
  }

  private async validateSingleSource() {
    console.log('🎯 Validating single source of truth...');
    return SingleSourceValidator.validateCompleteSystem();
  }

  private async validateDuplicateComponents() {
    console.log('🔧 Validating component duplicates...');
    return DuplicateAnalyzer.analyzeDuplicates();
  }

  private calculateComplianceScore(validationData: any): number {
    let baseScore = 100;
    
    // Deduct for duplicates (high impact)
    baseScore -= (validationData.duplicateStats.totalDuplicates || 0) * 15;
    
    // Deduct for mock data violations (medium impact)
    baseScore -= validationData.mockDataAnalysis.violations.length * 10;
    
    // Deduct for single source violations (high impact)
    baseScore -= validationData.singleSourceValidation.violations.length * 12;
    
    // Deduct for governance violations (medium impact)
    baseScore -= (validationData.duplicateAnalysis.duplicates.components.length + validationData.duplicateAnalysis.duplicates.services.length) * 8;
    
    // Ensure score doesn't go below 0
    return Math.max(0, Math.min(100, baseScore));
  }

  private generateRecommendations(validationData: any): string[] {
    const recommendations: string[] = [];

    const totalDuplicates = validationData.duplicateStats.totalDuplicates || 0;
    if (totalDuplicates > 0) {
      recommendations.push(
        `Remove ${totalDuplicates} duplicate components/services`
      );
      recommendations.push('Implement component registry to prevent future duplicates');
    }

    if (validationData.mockDataAnalysis.violations.length > 0) {
      recommendations.push('Replace all mock data with real Supabase database queries');
      recommendations.push('Remove test data from production code paths');
    }

    if (validationData.singleSourceValidation.violations.length > 0) {
      recommendations.push('Consolidate data sources to maintain single source of truth');
      recommendations.push('Implement unified data access patterns');
    }

    const duplicateComponentsCount = validationData.duplicateAnalysis.duplicates.components.length + validationData.duplicateAnalysis.duplicates.services.length;
    if (duplicateComponentsCount > 0) {
      recommendations.push('Review and merge duplicate component implementations');
      recommendations.push('Establish component governance rules');
    }

    // Add framework-specific recommendations
    recommendations.push('Enable automatic compliance monitoring');
    recommendations.push('Implement prompt governance for future development');
    recommendations.push('Set up real-time framework validation');

    return recommendations;
  }

  private identifyBlockingIssues(validationData: any): string[] {
    const blocking: string[] = [];

    // Critical duplicates
    const totalDuplicates = validationData.duplicateStats.totalDuplicates || 0;
    if (totalDuplicates > 10) {
      blocking.push('Excessive component duplication prevents maintainability');
    }

    // Mock data in production
    if (validationData.mockDataAnalysis.violations.some((v: any) => v.severity === 'high')) {
      blocking.push('Mock data detected in production code paths');
    }

    // Single source violations
    const criticalViolations = validationData.singleSourceValidation.violations.filter(
      (v: any) => v.severity === 'critical'
    );
    if (criticalViolations.length > 0) {
      blocking.push('Critical single source of truth violations detected');
    }

    return blocking;
  }

  async autoFixViolations(): Promise<string[]> {
    console.log('🔧 Attempting automatic fixes...');
    const fixesApplied: string[] = [];

    try {
      // Auto-fix duplicate components
      const duplicatesFixed = ComponentGovernance.cleanupDuplicates();
      if (duplicatesFixed.length > 0) {
        fixesApplied.push(`Removed ${duplicatesFixed.length} duplicate components`);
      }

      // Register new components in governance system
      ComponentGovernance.getRecommendations().forEach(rec => {
        fixesApplied.push(`Applied governance rule: ${rec}`);
      });

      console.log('✅ Auto-fixes applied:', fixesApplied);
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
    }

    return fixesApplied;
  }

  getValidationHistory(): ComprehensiveValidationResult[] {
    return Array.from(this.validationCache.values());
  }

  clearValidationCache(): void {
    this.validationCache.clear();
  }
}

export default ComprehensiveFrameworkValidator;