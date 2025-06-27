
/**
 * Assessment Reporter
 * Main orchestrator for generating comprehensive reports and actionable insights
 */

import { systemAssessment, ComprehensiveAssessment } from './SystemAssessment';
import { AssessmentReport } from './types/AssessmentTypes';
import { ExecutiveSummaryGenerator } from './generators/ExecutiveSummaryGenerator';
import { CriticalFindingsExtractor } from './generators/CriticalFindingsExtractor';
import { RecommendationsGenerator } from './generators/RecommendationsGenerator';
import { ImpactAnalyzer } from './generators/ImpactAnalyzer';
import { ScriptGenerator } from './generators/ScriptGenerator';

class AssessmentReporterClass {
  /**
   * Generate comprehensive assessment report
   */
  async generateAssessmentReport(): Promise<AssessmentReport> {
    console.log('📊 Generating comprehensive assessment report...');

    const detailedFindings = await systemAssessment.runComprehensiveAssessment();

    const executiveSummary = ExecutiveSummaryGenerator.generate(detailedFindings);
    const criticalFindings = CriticalFindingsExtractor.extract(detailedFindings);
    const actionableRecommendations = RecommendationsGenerator.generate(detailedFindings);
    const impactAnalysis = ImpactAnalyzer.analyze(detailedFindings);

    return {
      executiveSummary,
      criticalFindings,
      actionableRecommendations,
      impactAnalysis,
      detailedFindings
    };
  }

  /**
   * Generate cleanup script recommendations
   */
  generateCleanupScript(): string[] {
    return ScriptGenerator.generateCleanupScript();
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationRecommendations() {
    return ScriptGenerator.generateMigrationRecommendations();
  }
}

export const assessmentReporter = new AssessmentReporterClass();
export type { AssessmentReport } from './types/AssessmentTypes';
