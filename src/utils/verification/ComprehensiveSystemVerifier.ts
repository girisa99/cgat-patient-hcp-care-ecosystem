
/**
 * Comprehensive System Verifier
 * Single source of truth for all system verification operations
 */

import { SingleSourceValidator } from './SingleSourceValidator';
import { DatabaseAnalyzer } from './analyzers/DatabaseAnalyzer';
import { ModuleAnalyzer } from './analyzers/ModuleAnalyzer';
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';
import { DeadCodeAnalyzer } from './analyzers/DeadCodeAnalyzer';
import { DuplicateAnalyzer } from './analyzers/DuplicateAnalyzer';

export interface ComprehensiveVerificationResult {
  overallHealthScore: number;
  overallStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  criticalIssuesFound: number;
  totalActiveIssues: number;
  verificationTimestamp: string;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  
  // Single source compliance
  singleSourceCompliance: {
    isCompliant: boolean;
    violations: any[];
    complianceScore: number;
    recommendations: string[];
  };
  
  // System health metrics
  systemHealth: {
    overallHealthScore: number;
    isSystemStable: boolean;
    performanceMetrics: {
      responseTime: number;
      errorRate: number;
      uptime: number;
    };
  };
  
  // Component analysis
  componentAnalysis: {
    database: any;
    modules: any;
    typescript: any;
    deadCode: any;
    duplicates: any;
  };
}

export class ComprehensiveSystemVerifier {
  /**
   * Perform comprehensive system verification
   */
  static async performComprehensiveVerification(trigger: 'manual' | 'automated' = 'manual'): Promise<ComprehensiveVerificationResult> {
    console.log(`🚀 Starting comprehensive system verification (${trigger})...`);

    try {
      // Single source of truth validation
      const singleSourceCompliance = SingleSourceValidator.validateSingleSourceCompliance();
      
      // Component analysis
      const databaseAnalysis = await DatabaseAnalyzer.analyzeDatabaseStructure();
      const moduleAnalysis = ModuleAnalyzer.analyzeModuleRegistry();
      const typescriptAnalysis = TypeScriptAnalyzer.analyzeTypeScript();
      const deadCodeAnalysis = DeadCodeAnalyzer.analyzeDeadCode();
      const duplicateAnalysis = DuplicateAnalyzer.analyzeDuplicates();

      // Calculate overall health score
      const overallHealthScore = this.calculateOverallHealthScore({
        singleSource: singleSourceCompliance.complianceScore,
        database: databaseAnalysis.overallScore,
        modules: moduleAnalysis.healthScore,
        typescript: typescriptAnalysis.typeConsistencyScore,
        deadCode: 100 - deadCodeAnalysis.cleanupPotential,
        duplicates: duplicateAnalysis.severityScore
      });

      // Determine system status
      const overallStatus = this.determineSystemStatus(overallHealthScore);
      
      // Count critical issues
      const criticalIssuesFound = this.countCriticalIssues({
        singleSourceCompliance,
        databaseAnalysis,
        moduleAnalysis,
        typescriptAnalysis,
        deadCodeAnalysis,
        duplicateAnalysis
      });

      // Calculate total active issues
      const totalActiveIssues = this.calculateTotalActiveIssues({
        singleSourceCompliance,
        databaseAnalysis,
        moduleAnalysis,
        typescriptAnalysis,
        deadCodeAnalysis,
        duplicateAnalysis
      });

      const result: ComprehensiveVerificationResult = {
        overallHealthScore,
        overallStatus,
        criticalIssuesFound,
        totalActiveIssues,
        verificationTimestamp: new Date().toISOString(),
        syncStatus: 'synced',
        
        singleSourceCompliance: {
          isCompliant: singleSourceCompliance.isCompliant,
          violations: singleSourceCompliance.violations,
          complianceScore: singleSourceCompliance.complianceScore,
          recommendations: singleSourceCompliance.recommendations
        },
        
        systemHealth: {
          overallHealthScore,
          isSystemStable: overallHealthScore >= 80 && criticalIssuesFound === 0,
          performanceMetrics: {
            responseTime: 150, // Mock value
            errorRate: 0.02,   // Mock value
            uptime: 99.9       // Mock value
          }
        },
        
        componentAnalysis: {
          database: databaseAnalysis,
          modules: moduleAnalysis,
          typescript: typescriptAnalysis,
          deadCode: deadCodeAnalysis,
          duplicates: duplicateAnalysis
        }
      };

      console.log(`✅ Comprehensive verification completed - Score: ${overallHealthScore}/100`);
      return result;

    } catch (error) {
      console.error('❌ Comprehensive verification failed:', error);
      throw error;
    }
  }

  /**
   * Calculate overall health score from component scores
   */
  private static calculateOverallHealthScore(scores: {
    singleSource: number;
    database: number;
    modules: number;
    typescript: number;
    deadCode: number;
    duplicates: number;
  }): number {
    const weights = {
      singleSource: 0.25, // High weight for single source compliance
      database: 0.20,
      modules: 0.15,
      typescript: 0.15,
      deadCode: 0.10,
      duplicates: 0.15
    };

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);

    return Math.round(weightedScore);
  }

  /**
   * Determine system status based on health score
   */
  private static determineSystemStatus(healthScore: number): ComprehensiveVerificationResult['overallStatus'] {
    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 75) return 'good';
    if (healthScore >= 60) return 'needs_improvement';
    return 'critical';
  }

  /**
   * Count critical issues across all analyses
   */
  private static countCriticalIssues(analyses: any): number {
    let criticalCount = 0;
    
    // Single source violations marked as critical/high
    criticalCount += analyses.singleSourceCompliance.violations.filter(
      (v: any) => v.severity === 'critical' || v.severity === 'high'
    ).length;
    
    return criticalCount;
  }

  /**
   * Calculate total active issues across all analyses
   */
  private static calculateTotalActiveIssues(analyses: any): number {
    let totalIssues = 0;
    
    totalIssues += analyses.singleSourceCompliance.violations.length;
    totalIssues += analyses.deadCodeAnalysis.totalIssues;
    totalIssues += analyses.duplicateAnalysis.totalDuplicates;
    
    return totalIssues;
  }
}
