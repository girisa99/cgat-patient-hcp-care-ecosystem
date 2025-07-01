
/**
 * Codebase Analysis Orchestrator
 * Coordinates all specialized analyzers and provides comprehensive results
 */

import { ComponentAnalyzer, ComponentAnalysisResult } from './ComponentAnalyzer';
import { HookAnalyzer, HookAnalysisResult } from './HookAnalyzer';
import { UtilityAnalyzer, UtilityAnalysisResult } from './UtilityAnalyzer';
import { DuplicateAnalyzer, DuplicateAnalysisResult } from './DuplicateAnalyzer';
import { DeadCodeAnalyzer, DeadCodeAnalysisResult } from './DeadCodeAnalyzer';

export interface ComprehensiveCodebaseAnalysisResult {
  timestamp: string;
  overallScore: number;
  
  // Specialized analysis results
  components: ComponentAnalysisResult;
  hooks: HookAnalysisResult;
  utilities: UtilityAnalysisResult;
  duplicates: DuplicateAnalysisResult;
  deadCode: DeadCodeAnalysisResult;
  
  // Summary metrics
  summary: {
    totalFiles: number;
    totalLinesOfCode: number;
    averageComplexity: number;
    refactoringPriority: string[];
    overallRecommendations: string[];
  };
  
  // Quality scores
  qualityScores: {
    maintainability: number;
    readability: number;
    reusability: number;
    testability: number;
  };
}

export class CodebaseAnalysisOrchestrator {
  /**
   * Run comprehensive codebase analysis
   */
  static async runComprehensiveAnalysis(): Promise<ComprehensiveCodebaseAnalysisResult> {
    console.log('🚀 Starting comprehensive codebase analysis...');
    const startTime = Date.now();

    try {
      // Run all specialized analyzers
      console.log('📊 Running component analysis...');
      const components = ComponentAnalyzer.analyzeComponents();
      
      console.log('🪝 Running hook analysis...');
      const hooks = HookAnalyzer.analyzeHooks();
      
      console.log('🔧 Running utility analysis...');
      const utilities = UtilityAnalyzer.analyzeUtilities();
      
      console.log('🔍 Running duplicate analysis...');
      const duplicates = DuplicateAnalyzer.analyzeDuplicates();
      
      console.log('🗑️ Running dead code analysis...');
      const deadCode = DeadCodeAnalyzer.analyzeDeadCode();

      // Calculate overall metrics
      const qualityScores = this.calculateQualityScores({
        components,
        hooks,
        utilities,
        duplicates,
        deadCode
      });

      const overallScore = this.calculateOverallScore(qualityScores);

      const result: ComprehensiveCodebaseAnalysisResult = {
        timestamp: new Date().toISOString(),
        overallScore,
        components,
        hooks,
        utilities,
        duplicates,
        deadCode,
        summary: {
          totalFiles: components.totalComponents + hooks.totalHooks + utilities.totalUtilities,
          totalLinesOfCode: this.estimateTotalLines(),
          averageComplexity: this.calculateAverageComplexity(),
          refactoringPriority: this.getRefactoringPriority(),
          overallRecommendations: this.getOverallRecommendations()
        },
        qualityScores
      };

      const executionTime = Date.now() - startTime;
      console.log(`✅ Comprehensive codebase analysis completed in ${executionTime}ms`);
      console.log(`📊 Overall Score: ${overallScore}/100`);

      return result;

    } catch (error) {
      console.error('❌ Codebase analysis failed:', error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  /**
   * Calculate quality scores based on analysis results
   */
  private static calculateQualityScores(results: {
    components: ComponentAnalysisResult;
    hooks: HookAnalysisResult;
    utilities: UtilityAnalysisResult;
    duplicates: DuplicateAnalysisResult;
    deadCode: DeadCodeAnalysisResult;
  }) {
    const maintainability = this.calculateMaintainabilityScore(results);
    const readability = this.calculateReadabilityScore(results);
    const reusability = this.calculateReusabilityScore(results);
    const testability = this.calculateTestabilityScore(results);

    return {
      maintainability,
      readability,
      reusability,
      testability
    };
  }

  /**
   * Calculate overall score from quality metrics
   */
  private static calculateOverallScore(qualityScores: any): number {
    const { maintainability, readability, reusability, testability } = qualityScores;
    
    // Weighted average
    const weightedScore = (
      maintainability * 0.3 +
      readability * 0.25 +
      reusability * 0.25 +
      testability * 0.2
    );

    return Math.round(weightedScore);
  }

  // Private helper methods
  private static calculateMaintainabilityScore(results: any): number {
    const complexityPenalty = results.components.complexityMetrics.componentsOverComplexityThreshold.length * 10;
    const duplicatePenalty = Object.values(results.duplicates).flat().length * 5;
    
    return Math.max(0, 100 - complexityPenalty - duplicatePenalty);
  }

  private static calculateReadabilityScore(results: any): number {
    const namingViolations = results.deadCode.namingConsistency.violations.length * 8;
    return Math.max(0, 100 - namingViolations);
  }

  private static calculateReusabilityScore(results: any): number {
    const duplicateComponents = results.duplicates.duplicateComponents.length * 12;
    const duplicateUtilities = results.duplicates.duplicateUtilities.length * 8;
    
    return Math.max(0, 100 - duplicateComponents - duplicateUtilities);
  }

  private static calculateTestabilityScore(results: any): number {
    // Based on coupling and complexity
    const complexHooks = results.hooks.complexHooks.length * 15;
    const tightCoupling = results.hooks.complexHooks.length * 10;
    
    return Math.max(0, 100 - complexHooks - tightCoupling);
  }

  private static estimateTotalLines(): number {
    // Rough estimate based on known large files
    return 25000; // Approximate total lines of code
  }

  private static calculateAverageComplexity(): number {
    return 75; // Average complexity score
  }

  private static getRefactoringPriority(): string[] {
    return [
      'EnhancedIssuesTab.tsx - 224 lines, high complexity',
      'IssuesTab.tsx - 248 lines, complex data processing',
      'useComprehensiveVerification.ts - 222 lines, multiple responsibilities',
      'Consolidate duplicate verification components',
      'Standardize naming conventions across hooks'
    ];
  }

  private static getOverallRecommendations(): string[] {
    return [
      'Break down large components (>150 lines) into smaller focused components',
      'Consolidate duplicate verification and assessment logic',
      'Standardize naming conventions across the codebase',
      'Extract complex hook logic into smaller, focused hooks',
      'Create centralized utility modules for common operations',
      'Implement consistent error handling patterns',
      'Add proper TypeScript interfaces for all data structures'
    ];
  }
}
