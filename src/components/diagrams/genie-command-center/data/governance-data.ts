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
    timestamp: '2026-01-16T18:00:00Z',
    action: 'UPDATE',
    area: 'Stage Gate Checklist',
    previousValue: 30,
    newValue: 80,
    performedBy: 'Dev Team',
    notes: 'Expanded stage gates: Added Testing (7), Monitoring (7), Security (9), Documentation (6), DevOps (8) categories for comprehensive production readiness',
  },
  {
    timestamp: '2026-01-16T16:00:00Z',
    action: 'SYNC',
    area: 'All Metrics & Documentation',
    performedBy: 'System',
    notes: 'Full consolidation: Updated all docs (OVERALL_ARCHITECTURE.md, SUITE_ARCHITECTURE_SUMMARY.md, implementation-data.ts) to match UnifiedMetrics.ts (403 scenarios)',
  },
  {
    timestamp: '2026-01-16T14:00:00Z',
    action: 'UPDATE',
    area: 'P3 Implemented Count',
    previousValue: 17,
    newValue: 32,
    performedBy: 'Dev Team',
    notes: 'Added Quick Wins (5) + Label Studio (10) to implemented count',
  },
  {
    timestamp: '2026-01-16T14:00:00Z',
    action: 'UPDATE',
    area: 'P3 Total Scenarios',
    previousValue: 130,
    newValue: 140,
    performedBy: 'System',
    notes: 'Added 10 Label Studio scenarios (not in original roadmap)',
  },
  {
    timestamp: '2026-01-16T14:00:00Z',
    action: 'UPDATE',
    area: 'Total Scenarios',
    previousValue: 393,
    newValue: 403,
    performedBy: 'System',
    notes: 'Updated total after Label Studio consolidation',
  },
  {
    timestamp: '2026-01-16T10:00:00Z',
    action: 'UPDATE',
    area: 'P3 Scenarios',
    previousValue: 72,
    newValue: 130,
    performedBy: 'Dev Team',
    notes: 'Consolidated 58 new P3 scenarios (Generation, Compliance, Analytics, Segment-Specific, Enterprise)',
  },
  {
    timestamp: '2026-01-15T12:00:00Z',
    action: 'SYNC',
    area: 'All Metrics',
    performedBy: 'System',
    notes: 'Consolidated all metrics into UnifiedMetrics.ts',
  },
];

// =============================================================================
// UPDATE CHECKLIST
// =============================================================================
export const updateChecklist = [
  { file: 'src/genie-studio/governance/UnifiedMetrics.ts', section: 'PHASES', priority: 1, description: 'Update phase totals and implemented counts (Single Source of Truth)' },
  { file: 'src/genie-studio/governance/GenieStudioRegistry.ts', section: 'Asset lists', priority: 2, description: 'Update Genie-specific asset lists (hooks, services, edge functions)' },
  { file: 'docs/GENIE_STUDIO_SCENARIO_MAP.md', section: 'All', priority: 3, description: 'Update documentation with scenario details' },
  { file: 'docs/architecture/GENIE_STUDIO_OVERALL_ARCHITECTURE.md', section: 'Cross-References', priority: 4, description: 'Keep scenario count synced with UnifiedMetrics.ts' },
  { file: 'docs/GENIE_SUITE_ARCHITECTURE_SUMMARY.md', section: 'Document Reference', priority: 4, description: 'Keep scenario count synced with UnifiedMetrics.ts' },
  { file: 'src/components/diagrams/genie-command-center/data/implementation-data.ts', section: 'scenarioCategories', priority: 2, description: 'Update P3 category breakdown' },
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
