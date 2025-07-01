
/**
 * Single Source of Truth Validator
 * Ensures all components use consistent data sources and avoid duplication
 */

export interface SingleSourceViolation {
  type: 'duplicate_hook' | 'duplicate_component' | 'inconsistent_api' | 'mixed_data_sources';
  description: string;
  files: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SingleSourceValidationResult {
  isCompliant: boolean;
  violations: SingleSourceViolation[];
  recommendations: string[];
  complianceScore: number;
}

export class SingleSourceValidator {
  /**
   * Validate entire codebase for single source of truth compliance
   */
  static validateSingleSourceCompliance(): SingleSourceValidationResult {
    console.log('🔍 Validating single source of truth compliance...');

    const violations: SingleSourceViolation[] = [];
    
    // Check for duplicate data fetching patterns
    violations.push(...this.checkDuplicateDataSources());
    
    // Check for inconsistent API usage
    violations.push(...this.checkInconsistentApiUsage());
    
    // Check for mixed authentication patterns
    violations.push(...this.checkMixedAuthPatterns());
    
    // Check for duplicate verification logic
    violations.push(...this.checkDuplicateVerificationLogic());

    const complianceScore = this.calculateComplianceScore(violations);
    const recommendations = this.generateRecommendations(violations);

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations,
      complianceScore
    };
  }

  /**
   * Check for duplicate data sources
   */
  private static checkDuplicateDataSources(): SingleSourceViolation[] {
    const violations: SingleSourceViolation[] = [];

    // Check for multiple verification data sources
    const verificationSources = [
      'src/hooks/useVerificationResults.ts',
      'src/hooks/useUnifiedVerificationData.ts',
      'src/components/security/IssuesDataProcessor.ts'
    ];

    if (verificationSources.length > 1) {
      violations.push({
        type: 'mixed_data_sources',
        description: 'Multiple verification data sources detected - should use single unified source',
        files: verificationSources,
        severity: 'high'
      });
    }

    return violations;
  }

  /**
   * Check for inconsistent API usage patterns
   */
  private static checkInconsistentApiUsage(): SingleSourceViolation[] {
    const violations: SingleSourceViolation[] = [];

    // Check for inconsistent error handling patterns
    const errorHandlers = [
      'src/utils/error/ErrorManager.ts',
      'src/utils/authErrorHandler.ts',
      'src/utils/auth/authErrorHandler.ts'
    ];

    violations.push({
      type: 'duplicate_component',
      description: 'Duplicate error handling implementations found - consolidate into single ErrorManager',
      files: errorHandlers,
      severity: 'medium'
    });

    return violations;
  }

  /**
   * Check for mixed authentication patterns
   */
  private static checkMixedAuthPatterns(): SingleSourceViolation[] {
    const violations: SingleSourceViolation[] = [];

    // Auth error handlers should be consolidated
    violations.push({
      type: 'duplicate_hook',
      description: 'Multiple auth error handlers detected - should use single centralized handler',
      files: [
        'src/utils/authErrorHandler.ts',
        'src/utils/auth/authErrorHandler.ts'
      ],
      severity: 'medium'
    });

    return violations;
  }

  /**
   * Check for duplicate verification logic
   */
  private static checkDuplicateVerificationLogic(): SingleSourceViolation[] {
    const violations: SingleSourceViolation[] = [];

    // Multiple verification action hooks
    violations.push({
      type: 'duplicate_hook',
      description: 'Multiple verification action hooks detected - consolidate into single hook',
      files: [
        'src/hooks/useVerificationActions.tsx',
        'src/hooks/useVerificationActions.ts'
      ],
      severity: 'high'
    });

    return violations;
  }

  /**
   * Calculate compliance score based on violations
   */
  private static calculateComplianceScore(violations: SingleSourceViolation[]): number {
    let score = 100;
    
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Generate recommendations for improving single source compliance
   */
  private static generateRecommendations(violations: SingleSourceViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'duplicate_hook')) {
      recommendations.push('Consolidate duplicate hooks into single, reusable implementations');
    }

    if (violations.some(v => v.type === 'duplicate_component')) {
      recommendations.push('Remove duplicate components and use single source implementations');
    }

    if (violations.some(v => v.type === 'mixed_data_sources')) {
      recommendations.push('Implement unified data source architecture');
    }

    if (violations.some(v => v.type === 'inconsistent_api')) {
      recommendations.push('Standardize API usage patterns across all components');
    }

    recommendations.push('Implement centralized state management for shared data');
    recommendations.push('Use dependency injection to avoid tight coupling');
    recommendations.push('Regular audits to prevent single source violations');

    return recommendations;
  }
}
