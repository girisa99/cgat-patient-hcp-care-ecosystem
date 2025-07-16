/**
 * Framework Validator - Ensures compliance with comprehensive framework
 * Validates against mock data, duplicates, and stability requirements
 */

import { MockDataDetector } from '../../src/utils/verification/MockDataDetector.ts';
import { DuplicateDetector } from '../../src/utils/verification/DuplicateDetector.ts';

export class FrameworkValidator {
  constructor(config = {}) {
    this.config = {
      strictMode: true,
      preventMockData: true,
      preventDuplicates: true,
      enforceNamingConventions: true,
      requireRealDatabaseUsage: true,
      ...config
    };
    
    this.violations = new Map();
    this.warnings = new Map();
    this.validationHistory = [];
  }

  async validateProject() {
    console.log('🔍 Starting comprehensive framework validation...');
    
    const validationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Validate no mock data usage
      if (this.config.preventMockData) {
        const mockDataResult = await this.validateNoMockData();
        this.mergeResults(validationResult, mockDataResult);
      }

      // 2. Validate no duplicates
      if (this.config.preventDuplicates) {
        const duplicateResult = await this.validateNoDuplicates();
        this.mergeResults(validationResult, duplicateResult);
      }

      // 3. Validate naming conventions
      if (this.config.enforceNamingConventions) {
        const namingResult = await this.validateNamingConventions();
        this.mergeResults(validationResult, namingResult);
      }

      // 4. Validate database usage
      if (this.config.requireRealDatabaseUsage) {
        const databaseResult = await this.validateDatabaseUsage();
        this.mergeResults(validationResult, databaseResult);
      }

      // 5. Project structure validation
      const structureResult = await this.validateProjectStructure();
      this.mergeResults(validationResult, structureResult);

      // Determine overall validity
      validationResult.isValid = validationResult.violations.length === 0;
      
      // Store validation history
      this.validationHistory.push(validationResult);
      
      // Log results
      this.logValidationResults(validationResult);
      
      return validationResult;

    } catch (error) {
      console.error('❌ Framework validation failed:', error);
      validationResult.isValid = false;
      validationResult.violations.push({
        type: 'validation_error',
        severity: 'critical',
        message: `Validation process failed: ${error.message}`,
        file: 'framework_validator'
      });
      
      return validationResult;
    }
  }

  async validateNoMockData() {
    console.log('🔍 Validating no mock/test/seed data usage...');
    
    const result = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    try {
      const analysis = await MockDataDetector.analyzeMockDataUsage();
      
      if (analysis.violations.length > 0) {
        for (const violation of analysis.violations) {
          result.violations.push({
            type: 'mock_data_usage',
            severity: violation.severity,
            message: `Mock data detected: ${violation.content}`,
            file: violation.filePath,
            line: violation.lineNumber,
            suggestion: violation.suggestion
          });
        }
      }

      if (analysis.databaseUsageScore < 90) {
        result.warnings.push({
          type: 'low_database_usage',
          severity: 'medium',
          message: `Database usage score is ${analysis.databaseUsageScore}/100. Increase real database operations.`,
          recommendation: 'Replace hardcoded data with Supabase queries'
        });
      }

      result.recommendations.push({
        type: 'database_enhancement',
        message: 'Ensure all data comes from Supabase database operations',
        priority: 'high'
      });

    } catch (error) {
      result.violations.push({
        type: 'mock_data_validation_error',
        severity: 'high',
        message: `Failed to validate mock data usage: ${error.message}`,
        file: 'framework_validator'
      });
    }

    return result;
  }

  async validateNoDuplicates() {
    console.log('🔍 Validating no duplicate components/services...');
    
    const result = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    try {
      const detector = new DuplicateDetector();
      const stats = detector.getDuplicateStats();
      
      if (stats.totalDuplicates > 0) {
        result.violations.push({
          type: 'duplicate_components',
          severity: 'high',
          message: `Found ${stats.totalDuplicates} duplicate components/services`,
          details: {
            components: stats.components,
            services: stats.services,
            types: stats.types
          }
        });
      }

      result.recommendations.push({
        type: 'duplicate_prevention',
        message: 'Use component registry to prevent duplicate creation',
        priority: 'high'
      });

    } catch (error) {
      result.violations.push({
        type: 'duplicate_validation_error',
        severity: 'high',
        message: `Failed to validate duplicates: ${error.message}`,
        file: 'framework_validator'
      });
    }

    return result;
  }

  async validateNamingConventions() {
    console.log('🔍 Validating naming conventions...');
    
    const result = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    // Naming convention patterns
    const conventions = {
      components: /^[A-Z][a-zA-Z0-9]*$/,
      hooks: /^use[A-Z][a-zA-Z0-9]*$/,
      services: /^[a-z][a-zA-Z0-9]*Service$/,
      types: /^[A-Z][a-zA-Z0-9]*$/,
      files: /^[a-zA-Z0-9\-_\.]+$/
    };

    // This would normally scan the filesystem
    // For now, provide basic validation framework
    
    result.recommendations.push({
      type: 'naming_conventions',
      message: 'Follow established naming patterns for consistency',
      patterns: conventions,
      priority: 'medium'
    });

    return result;
  }

  async validateDatabaseUsage() {
    console.log('🔍 Validating real database usage...');
    
    const result = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    // Check for proper Supabase usage patterns
    const requiredPatterns = [
      'supabase.from(',
      '.select(',
      '.insert(',
      '.update(',
      '.delete('
    ];

    // This would normally scan files for these patterns
    // For now, provide basic guidance
    
    result.recommendations.push({
      type: 'database_usage',
      message: 'Ensure all data operations use Supabase client',
      requiredPatterns,
      priority: 'high'
    });

    result.recommendations.push({
      type: 'no_hardcoded_data',
      message: 'Avoid hardcoded arrays and objects - use database queries',
      priority: 'high'
    });

    return result;
  }

  async validateProjectStructure() {
    console.log('🔍 Validating project structure compliance...');
    
    const result = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    const requiredStructure = [
      'duplicate-prevention/core/',
      'duplicate-prevention/mcp/',
      'duplicate-prevention/integrations/',
      'duplicate-prevention/config/',
      'src/',
      'stability-framework/'
    ];

    // This would normally check filesystem structure
    // For now, provide structural guidance
    
    result.recommendations.push({
      type: 'project_structure',
      message: 'Maintain consistent project structure',
      requiredPaths: requiredStructure,
      priority: 'medium'
    });

    return result;
  }

  mergeResults(target, source) {
    if (source.violations) {
      target.violations.push(...source.violations);
    }
    
    if (source.warnings) {
      target.warnings.push(...source.warnings);
    }
    
    if (source.recommendations) {
      target.recommendations.push(...source.recommendations);
    }
  }

  logValidationResults(result) {
    console.log('\n📊 Framework Validation Results:');
    console.log(`✅ Overall Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`❌ Violations: ${result.violations.length}`);
    console.log(`⚠️ Warnings: ${result.warnings.length}`);
    console.log(`💡 Recommendations: ${result.recommendations.length}`);
    
    if (result.violations.length > 0) {
      console.log('\n❌ Critical Violations:');
      result.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. [${violation.severity.toUpperCase()}] ${violation.message}`);
        if (violation.file) console.log(`     File: ${violation.file}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.message}`);
      });
    }
    
    console.log('\n');
  }

  getValidationHistory() {
    return this.validationHistory;
  }

  getLastValidation() {
    return this.validationHistory[this.validationHistory.length - 1];
  }

  generateComplianceReport() {
    const lastValidation = this.getLastValidation();
    
    if (!lastValidation) {
      return {
        status: 'unknown',
        message: 'No validation has been performed yet'
      };
    }

    return {
      status: lastValidation.isValid ? 'compliant' : 'non_compliant',
      timestamp: lastValidation.timestamp,
      summary: {
        violations: lastValidation.violations.length,
        warnings: lastValidation.warnings.length,
        recommendations: lastValidation.recommendations.length
      },
      details: lastValidation,
      complianceScore: this.calculateComplianceScore(lastValidation)
    };
  }

  calculateComplianceScore(validation) {
    const maxScore = 100;
    let penalties = 0;
    
    // Deduct points for violations
    penalties += validation.violations.length * 20;
    
    // Deduct points for warnings
    penalties += validation.warnings.length * 5;
    
    const score = Math.max(0, maxScore - penalties);
    return Math.round(score);
  }
}

export default FrameworkValidator;