
/**
 * Assessment Types
 * Shared type definitions for the assessment system
 */

import { ComprehensiveAssessment } from '../SystemAssessment';

export interface AssessmentReport {
  executiveSummary: string;
  criticalFindings: string[];
  actionableRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  impactAnalysis: {
    performance: string;
    security: string;
    maintainability: string;
    apiDocumentation: string;
  };
  detailedFindings: ComprehensiveAssessment;
}

export interface MigrationRecommendations {
  databaseMigrations: string[];
  codeRefactoring: string[];
  configurationChanges: string[];
}
