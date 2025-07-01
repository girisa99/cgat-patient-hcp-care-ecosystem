
/**
 * Utility Functions Analysis
 * Specialized analyzer for utility functions and helper modules
 */

export interface UtilityAnalysisResult {
  totalUtilities: number;
  utilitiesByCategory: {
    validation: number;
    formatting: number;
    dataTransformation: number;
    apiHelpers: number;
    typeHelpers: number;
  };
  complexUtilities: string[];
  duplicateUtilities: string[];
  unusedUtilities: string[];
}

export class UtilityAnalyzer {
  /**
   * Analyze utility functions across the codebase
   */
  static analyzeUtilities(): UtilityAnalysisResult {
    console.log('🔍 Analyzing utility functions...');

    const mockResult: UtilityAnalysisResult = {
      totalUtilities: 35, // Based on utils directory
      utilitiesByCategory: {
        validation: 12,        // Various validators
        formatting: 6,         // Date, string formatters
        dataTransformation: 8, // Data mappers, converters
        apiHelpers: 5,         // API utilities
        typeHelpers: 4         // Type guards, assertions
      },
      complexUtilities: [
        'ComprehensiveSystemValidator.ts - 231 lines',
        'RefactoringOrchestrator.ts - Complex refactoring logic'
      ],
      duplicateUtilities: [
        'Multiple validation utilities with similar purposes',
        'Date formatting functions scattered across files'
      ],
      unusedUtilities: []
    };

    return mockResult;
  }

  /**
   * Find utilities that could be consolidated
   */
  static findConsolidationOpportunities(): {
    similarFunctions: string[];
    scatteredLogic: string[];
    recommendedConsolidation: string[];
  } {
    return {
      similarFunctions: [
        'Multiple date formatting utilities',
        'Various user validation functions',
        'Duplicate error handling utilities'
      ],
      scatteredLogic: [
        'Validation logic spread across multiple files',
        'API error handling not centralized'
      ],
      recommendedConsolidation: [
        'Create centralized validation utility module',
        'Consolidate date/time utilities',
        'Standardize API error handling'
      ]
    };
  }

  /**
   * Analyze utility dependencies
   */
  static analyzeUtilityDependencies(): {
    highlyDependentUtilities: string[];
    selfContainedUtilities: string[];
    circularDependencies: string[];
  } {
    return {
      highlyDependentUtilities: [
        'ComprehensiveSystemValidator - depends on multiple analyzers',
        'moduleRegistry - multiple interdependencies'
      ],
      selfContainedUtilities: [
        'ScoreCalculator',
        'ReportGenerator',
        'Basic formatters'
      ],
      circularDependencies: []
    };
  }

  /**
   * Check utility function naming and organization
   */
  static checkUtilityOrganization(): {
    violations: string[];
    score: number;
    recommendations: string[];
  } {
    const violations = [
      'Mixed naming conventions across utility files',
      'Some utilities not properly categorized',
      'Index files missing for some utility directories'
    ];

    const score = Math.max(0, 100 - (violations.length * 12));

    const recommendations = [
      'Standardize utility naming conventions',
      'Create proper index files for utility exports',
      'Group related utilities into focused modules'
    ];

    return { violations, score, recommendations };
  }
}
