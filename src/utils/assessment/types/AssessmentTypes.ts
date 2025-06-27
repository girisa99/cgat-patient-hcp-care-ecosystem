
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

export interface TableUtilizationAssessment {
  essentialTables: {
    name: string;
    purpose: string;
    recordCount: number;
    lastActivity: string | null;
    isActive: boolean;
  }[];
  unnecessaryTables: {
    name: string;
    reason: string;
    recordCount: number;
    canDelete: boolean;
    dependencies: string[];
  }[];
  emptyTables: {
    name: string;
    purpose: string;
    shouldKeep: boolean;
    reason: string;
  }[];
}

export interface RealTimeSyncAssessment {
  apiIntegrations: {
    hasRealTimeSync: boolean;
    syncMechanisms: string[];
    issues: string[];
  };
  auditLogs: {
    isTracking: boolean;
    coverage: string[];
    gaps: string[];
  };
  userManagement: {
    syncStatus: string;
    realTimeUpdates: boolean;
    issues: string[];
  };
  facilities: {
    syncStatus: string;
    realTimeUpdates: boolean;
    issues: string[];
  };
  modules: {
    syncStatus: string;
    realTimeUpdates: boolean;
    issues: string[];
  };
  rbac: {
    syncStatus: string;
    realTimeUpdates: boolean;
    issues: string[];
  };
}

export interface SystemCleanupRecommendations {
  immediate: {
    priority: 'high';
    items: string[];
    impact: string;
  };
  shortTerm: {
    priority: 'medium';
    items: string[];
    impact: string;
  };
  longTerm: {
    priority: 'low';
    items: string[];
    impact: string;
  };
}
