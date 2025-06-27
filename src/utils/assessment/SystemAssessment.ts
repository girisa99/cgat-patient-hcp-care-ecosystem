
/**
 * System Assessment Tool
 * Main orchestrator for comprehensive system analysis
 */

import { TableUtilizationAssessor } from './assessors/TableUtilizationAssessor';
import { RealTimeSyncAssessor } from './assessors/RealTimeSyncAssessor';
import { CleanupRecommendationsGenerator } from './assessors/CleanupRecommendationsGenerator';
import { PublishedApiImpactAssessor } from './assessors/PublishedApiImpactAssessor';
import { AdminPortalOptimizationAssessor } from './assessors/AdminPortalOptimizationAssessor';
import { 
  TableUtilizationAssessment, 
  RealTimeSyncAssessment, 
  SystemCleanupRecommendations 
} from './types/AssessmentTypes';

export interface ComprehensiveAssessment {
  tableUtilization: TableUtilizationAssessment;
  realTimeSyncStatus: RealTimeSyncAssessment;
  cleanupRecommendations: SystemCleanupRecommendations;
  publishedApiImpact: {
    tablesToKeep: string[];
    tablesToRemove: string[];
    schemaChangesNeeded: string[];
    apiDocumentationImpact: string[];
  };
  adminPortalOptimization: {
    currentState: string;
    redundantFeatures: string[];
    missingFeatures: string[];
    performanceIssues: string[];
  };
}

class SystemAssessmentClass {
  /**
   * Run comprehensive system assessment
   */
  async runComprehensiveAssessment(): Promise<ComprehensiveAssessment> {
    console.log('🔍 Starting Comprehensive System Assessment...');

    const [
      tableUtilization,
      realTimeSyncStatus,
      cleanupRecommendations,
      publishedApiImpact,
      adminPortalOptimization
    ] = await Promise.all([
      TableUtilizationAssessor.assessTableUtilization(),
      RealTimeSyncAssessor.assessRealTimeSyncStatus(),
      CleanupRecommendationsGenerator.generateCleanupRecommendations(),
      PublishedApiImpactAssessor.assessPublishedApiImpact(),
      AdminPortalOptimizationAssessor.assessAdminPortalOptimization()
    ]);

    console.log('✅ Comprehensive assessment completed');

    return {
      tableUtilization,
      realTimeSyncStatus,
      cleanupRecommendations,
      publishedApiImpact,
      adminPortalOptimization
    };
  }
}

export const systemAssessment = new SystemAssessmentClass();

// Re-export types for backwards compatibility
export type { 
  TableUtilizationAssessment, 
  RealTimeSyncAssessment, 
  SystemCleanupRecommendations 
} from './types/AssessmentTypes';
