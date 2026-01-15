/**
 * Genie Command Center - Data Governance System
 * 
 * NOW IMPORTS FROM UNIFIED METRICS - Single Source of Truth
 * 
 * All values are derived from: src/genie-studio/governance/UnifiedMetrics.ts
 * 
 * LAST AUDITED: 2026-01-15
 */

import {
  PHASES,
  SCENARIO_METRICS,
  PLATFORM_TOTALS,
  INFRASTRUCTURE_METRICS,
  FINANCIAL_METRICS,
  METRICS_METADATA,
  getPhaseProgress,
  getPhaseDisplayString,
  getScenarioDisplayString,
  getCompletionDisplayString,
  getCompletedPhasesString,
  validateMetrics,
  type PhaseData,
} from '@/genie-studio/governance';

// =============================================================================
// RE-EXPORT METADATA
// =============================================================================
export const governanceMetadata = {
  version: METRICS_METADATA.version,
  lastUpdated: METRICS_METADATA.lastUpdated,
  lastAuditedBy: METRICS_METADATA.lastAuditedBy,
  nextAuditDue: METRICS_METADATA.nextAuditDue,
  changeLog: METRICS_METADATA.changeLog,
};

// =============================================================================
// MASTER SCENARIO COUNTS - DERIVED FROM UNIFIED METRICS
// =============================================================================
export interface MasterScenarioCounts {
  phases: Record<string, PhaseData>;
}

export const masterScenarioCounts = {
  phases: PHASES,
  get totalScenarios() { return SCENARIO_METRICS.totalScenarios; },
  get implementedScenarios() { return SCENARIO_METRICS.implementedScenarios; },
  get completionPercentage() { return SCENARIO_METRICS.completionPercentage; },
  get completedPhases() { return SCENARIO_METRICS.completedPhases; },
};

// =============================================================================
// MASTER INFRASTRUCTURE COUNTS - DERIVED FROM UNIFIED METRICS
// =============================================================================
/**
 * Master Infrastructure Counts now include both platform totals and Genie-specific counts.
 * Use genieSpecific for Genie-focused views, platform for overall views.
 */
export const masterInfrastructureCounts = {
  // Platform-wide totals
  edgeFunctions: PLATFORM_TOTALS.edgeFunctions,
  customHooks: PLATFORM_TOTALS.hooks,
  databaseTables: PLATFORM_TOTALS.databaseTables,
  mobileComponents: PLATFORM_TOTALS.mobileComponents,
  aiAgents: PLATFORM_TOTALS.aiAgents,
  ttsProviders: PLATFORM_TOTALS.ttsProviders,
  products: PLATFORM_TOTALS.products,
  
  // Genie-specific counts (for product-focused views)
  genieSpecific: INFRASTRUCTURE_METRICS,
  
  // Last verification dates
  verifiedAt: {
    edgeFunctions: '2026-01-15',
    customHooks: '2026-01-15',
    databaseTables: '2026-01-15',
    mobileComponents: '2026-01-15',
    aiAgents: '2026-01-15',
  },
};

// =============================================================================
// MASTER FINANCIAL METRICS - DERIVED FROM UNIFIED METRICS
// =============================================================================
export const masterFinancialMetrics = FINANCIAL_METRICS;

// =============================================================================
// GARTNER POSITIONING DATA
// =============================================================================
export const masterGartnerPosition = {
  currentQuadrant: 'Visionaries' as const,
  visionScore: 78,
  executionScore: 52,
  targetQuadrant: 'Leaders' as const,
  targetVisionScore: 85,
  targetExecutionScore: 75,
  timelineToTarget: 'Q4 2027',
  
  competitors: [
    { name: 'Adobe Premiere', quadrant: 'Leaders', vision: 80, execution: 90 },
    { name: 'Canva', quadrant: 'Challengers', vision: 65, execution: 85 },
    { name: 'CapCut', quadrant: 'Challengers', vision: 60, execution: 80 },
    { name: 'Synthesia', quadrant: 'Visionaries', vision: 85, execution: 55 },
    { name: 'Descript', quadrant: 'Visionaries', vision: 82, execution: 60 },
    { name: 'InVideo', quadrant: 'Niche Players', vision: 50, execution: 55 },
    { name: 'Genie Suite', quadrant: 'Visionaries', vision: 78, execution: 52 },
  ],
};

// =============================================================================
// VALIDATION - USE UNIFIED VALIDATOR
// =============================================================================
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lastChecked: string;
}

export const validateGovernanceData = (): ValidationResult => validateMetrics();

// =============================================================================
// DATA SYNC HELPERS - USE UNIFIED FUNCTIONS
// =============================================================================
export { 
  getPhaseProgress,
  getPhaseDisplayString as getPhaseProgressString,
  getScenarioDisplayString,
  getCompletionDisplayString,
};

// =============================================================================
// AUDIT LOG
// =============================================================================
export interface AuditEntry {
  timestamp: string;
  action: 'UPDATE' | 'VERIFY' | 'AUDIT' | 'SYNC';
  area: string;
  previousValue?: string | number;
  newValue?: string | number;
  performedBy: string;
  notes?: string;
}

export const recentAuditLog: AuditEntry[] = [
  {
    timestamp: '2026-01-15T12:00:00Z',
    action: 'SYNC',
    area: 'All Metrics',
    performedBy: 'System',
    notes: 'Consolidated all metrics into UnifiedMetrics.ts',
  },
  {
    timestamp: '2026-01-15T10:30:00Z',
    action: 'UPDATE',
    area: 'Scenario Count',
    previousValue: 289,
    newValue: 335,
    performedBy: 'Dev Team',
    notes: 'Updated P3 with 16 implemented scenarios',
  },
];

// =============================================================================
// UPDATE CHECKLIST
// =============================================================================
export const updateChecklist = [
  { file: 'src/genie-studio/governance/UnifiedMetrics.ts', section: 'PHASES', priority: 1, description: 'Update phase totals and implemented counts' },
  { file: 'src/genie-studio/governance/GenieStudioRegistry.ts', section: 'Asset lists', priority: 2, description: 'Update Genie-specific asset lists' },
  { file: 'docs/GENIE_STUDIO_SCENARIO_MAP.md', section: 'All', priority: 3, description: 'Update documentation' },
];

// =============================================================================
// GOVERNANCE SUMMARY - DERIVED FROM UNIFIED METRICS
// =============================================================================
export const getGovernanceSummary = () => ({
  scenarios: {
    total: SCENARIO_METRICS.totalScenarios,
    implemented: SCENARIO_METRICS.implementedScenarios,
    percentage: SCENARIO_METRICS.completionPercentage,
    phases: PHASES,
    completedPhases: SCENARIO_METRICS.completedPhases,
  },
  infrastructure: {
    ...masterInfrastructureCounts,
    breakdown: INFRASTRUCTURE_METRICS,
  },
  financials: masterFinancialMetrics,
  gartner: masterGartnerPosition,
  metadata: governanceMetadata,
  validation: validateGovernanceData(),
});

// Re-export types
export type { PhaseData };
