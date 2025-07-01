
/**
 * Comprehensive System Validator
 * Performs deep analysis of the entire codebase for single source violations
 */

import { moduleRegistry } from '@/utils/moduleRegistry';
import { SingleSourceValidator } from '@/utils/validation/SingleSourceValidator';
import { MockDataDetector } from '@/utils/verification/MockDataDetector';
import { DuplicateAnalyzer } from './analyzers/DuplicateAnalyzer';
import { DeadCodeAnalyzer } from './analyzers/DeadCodeAnalyzer';
import { DatabaseAnalyzer } from './analyzers/DatabaseAnalyzer';
import { ModuleAnalyzer } from './analyzers/ModuleAnalyzer';
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';
import { ScoreCalculator } from './ScoreCalculator';
import { ReportGenerator } from './ReportGenerator';

export interface ComprehensiveValidationResult {
  overallScore: number;
  systemStatus: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  timestamp: string;
  
  // Core System Analysis
  singleSourceCompliance: {
    score: number;
    violations: any[];
    compliantSystems: string[];
    recommendations: string[];
  };
  
  // Code Quality Analysis
  codeQuality: {
    duplicates: {
      components: string[];
      hooks: string[];
      services: string[];
      utilities: string[];
      types: string[];
    };
    deadCode: {
      unusedFiles: string[];
      unusedFunctions: string[];
      unusedImports: string[];
      unusedComponents: string[];
    };
    mockData: {
      violations: any[];
      score: number;
      cleanFiles: string[];
    };
    namingConsistency: {
      violations: string[];
      score: number;
    };
  };
  
  // Database Analysis
  database: {
    tables: {
      total: number;
      unused: string[];
      redundant: string[];
      missingIndexes: string[];
    };
    relationships: {
      total: number;
      broken: string[];
      redundant: string[];
    };
    schemas: {
      inconsistencies: string[];
      missingConstraints: string[];
    };
  };
  
  // Module Registry Analysis
  moduleRegistry: {
    totalModules: number;
    duplicateModules: string[];
    orphanedComponents: string[];
    inconsistentNaming: string[];
  };
  
  // TypeScript Analysis
  typescript: {
    duplicateTypes: string[];
    unusedTypes: string[];
    inconsistentInterfaces: string[];
    missingTypes: string[];
  };
  
  // Final Recommendations
  criticalIssues: string[];
  actionPlan: string[];
  estimatedCleanupTime: string;
}

export class ComprehensiveSystemValidator {
  
  /**
   * Run complete system validation
   */
  static async runCompleteValidation(): Promise<ComprehensiveValidationResult> {
    console.log('🚀 Starting Comprehensive System Validation...');
    const startTime = Date.now();
    
    try {
      // Step 1: Single Source Compliance
      const singleSourceResult = await SingleSourceValidator.validateCompleteSystem();
      
      // Step 2: Mock Data Detection
      const mockDataResult = await MockDataDetector.analyzeMockDataUsage();
      
      // Step 3: Code Quality Analysis
      const codeQualityResult = await this.analyzeCodeQuality();
      
      // Step 4: Database Analysis
      const databaseResult = await DatabaseAnalyzer.analyzeDatabaseStructure();
      
      // Step 5: Module Registry Analysis
      const moduleRegistryResult = ModuleAnalyzer.analyzeModuleRegistry();
      
      // Step 6: TypeScript Analysis
      const typescriptResult = TypeScriptAnalyzer.analyzeTypeScript();
      
      // Step 7: Calculate Overall Score
      const overallScore = ScoreCalculator.calculateOverallScore({
        singleSourceResult,
        mockDataResult,
        codeQualityResult,
        databaseResult,
        moduleRegistryResult,
        typescriptResult
      });
      
      const systemStatus = ScoreCalculator.determineSystemStatus(overallScore);
      const criticalIssues = ScoreCalculator.identifyCriticalIssues({
        singleSourceResult,
        mockDataResult,
        codeQualityResult,
        databaseResult
      });
      
      const actionPlan = ScoreCalculator.generateActionPlan(criticalIssues);
      const executionTime = Date.now() - startTime;
      
      const result: ComprehensiveValidationResult = {
        overallScore,
        systemStatus,
        timestamp: new Date().toISOString(),
        
        singleSourceCompliance: {
          score: singleSourceResult.summary.complianceScore,
          violations: singleSourceResult.violations,
          compliantSystems: singleSourceResult.summary.systemsVerified,
          recommendations: singleSourceResult.recommendations
        },
        
        codeQuality: {
          duplicates: codeQualityResult.duplicates,
          deadCode: codeQualityResult.deadCode,
          mockData: {
            violations: mockDataResult.violations,
            score: mockDataResult.databaseUsageScore,
            cleanFiles: mockDataResult.cleanFiles
          },
          namingConsistency: codeQualityResult.namingConsistency
        },
        
        database: databaseResult,
        moduleRegistry: moduleRegistryResult,
        typescript: typescriptResult,
        
        criticalIssues,
        actionPlan,
        estimatedCleanupTime: ScoreCalculator.estimateCleanupTime(criticalIssues.length)
      };
      
      console.log(`✅ Comprehensive validation completed in ${executionTime}ms`);
      console.log(`📊 Overall Score: ${overallScore}/100 (${systemStatus})`);
      console.log(`🔍 Critical Issues: ${criticalIssues.length}`);
      console.log(`📝 Action Items: ${actionPlan.length}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Comprehensive validation failed:', error);
      throw new Error(`Validation failed: ${error}`);
    }
  }
  
  /**
   * Analyze code quality for duplicates and dead code
   */
  private static async analyzeCodeQuality(): Promise<{
    duplicates: any;
    deadCode: any;
    namingConsistency: any;
  }> {
    console.log('🔍 Analyzing code quality...');
    
    // Use the specialized analyzers
    const duplicates = DuplicateAnalyzer.analyzeDuplicates();
    const deadCodeResult = DeadCodeAnalyzer.analyzeDeadCode();
    
    return {
      duplicates: {
        components: duplicates.duplicateComponents,
        hooks: duplicates.duplicateHooks,
        services: duplicates.duplicateServices,
        utilities: duplicates.duplicateUtilities,
        types: duplicates.duplicateTypes
      },
      deadCode: {
        unusedFiles: deadCodeResult.unusedFiles,
        unusedFunctions: deadCodeResult.unusedFunctions,
        unusedImports: deadCodeResult.unusedImports,
        unusedComponents: deadCodeResult.unusedComponents
      },
      namingConsistency: deadCodeResult.namingConsistency
    };
  }
  
  /**
   * Generate comprehensive report
   */
  static generateComprehensiveReport(result: ComprehensiveValidationResult): string {
    return ReportGenerator.generateComprehensiveReport(result);
  }
}
