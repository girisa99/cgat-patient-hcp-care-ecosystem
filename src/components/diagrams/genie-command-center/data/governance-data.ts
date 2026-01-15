/**
 * Genie Command Center - Data Governance System
 * SINGLE SOURCE OF TRUTH for all metrics, scenarios, and implementation tracking
 * 
 * PURPOSE: Ensures all tabs (Overview, Roadmap, Technical, Investor, etc.) 
 * stay synchronized automatically when updates are made.
 * 
 * LAST AUDITED: 2026-01-15
 * NEXT AUDIT DUE: 2026-02-01
 */

// =============================================================================
// VERSION CONTROL & AUDIT TRAIL
// =============================================================================
export const governanceMetadata = {
  version: '2.0.0',
  lastUpdated: '2026-01-15T10:30:00Z',
  lastAuditedBy: 'System Architect',
  nextAuditDue: '2026-02-01',
  changeLog: [
    { date: '2026-01-15', change: 'Added 16 editing scenarios (AE, AF categories)', by: 'Dev Team' },
    { date: '2026-01-14', change: 'Verified 185 implemented scenarios', by: 'QA Team' },
    { date: '2026-01-10', change: 'Added P2 cross-functional scenarios (V, W, X)', by: 'Dev Team' },
    { date: '2026-01-05', change: 'Initial governance system setup', by: 'Architecture' },
  ],
};

// =============================================================================
// MASTER SCENARIO COUNTS - SINGLE SOURCE OF TRUTH
// All tabs must derive their counts from these values
// =============================================================================
export interface PhaseData {
  total: number;
  implemented: number;
  status: 'completed' | 'planned' | 'in-progress';
}

export interface MasterScenarioCounts {
  phases: Record<string, PhaseData>;
}

const phases: Record<string, PhaseData> = {
  P0: { total: 35, implemented: 35, status: 'completed' },
  P1: { total: 32, implemented: 32, status: 'completed' },
  P2: { total: 118, implemented: 118, status: 'completed' }, // 50 original + 52 cross-functional + 16 editing
  P3: { total: 58, implemented: 0, status: 'planned' },
  P4: { total: 50, implemented: 0, status: 'planned' },
  P5: { total: 28, implemented: 0, status: 'planned' },
};

// Computed values from phases
const getTotalScenarios = (): number => 
  Object.values(phases).reduce((sum, p) => sum + p.total, 0);

const getImplementedScenarios = (): number => 
  Object.values(phases).reduce((sum, p) => sum + p.implemented, 0);

const getCompletionPercentage = (): number => 
  Math.round((getImplementedScenarios() / getTotalScenarios()) * 100);

const getCompletedPhases = (): string[] => 
  Object.entries(phases)
    .filter(([_, p]) => p.status === 'completed')
    .map(([key]) => key);

export const masterScenarioCounts = {
  phases,
  get totalScenarios() { return getTotalScenarios(); },
  get implementedScenarios() { return getImplementedScenarios(); },
  get completionPercentage() { return getCompletionPercentage(); },
  get completedPhases() { return getCompletedPhases(); },
};

// =============================================================================
// MASTER INFRASTRUCTURE COUNTS
// =============================================================================
export const masterInfrastructureCounts = {
  edgeFunctions: 140,
  customHooks: 280,
  databaseTables: 180,
  mobileComponents: 23,
  aiAgents: 15,
  ttsProviders: 5,
  products: 6,
  
  // Last verification dates
  verifiedAt: {
    edgeFunctions: '2026-01-15',
    customHooks: '2026-01-14',
    databaseTables: '2026-01-14',
    mobileComponents: '2026-01-15',
    aiAgents: '2026-01-15',
  },
};

// =============================================================================
// MASTER FINANCIAL METRICS
// =============================================================================
export const masterFinancialMetrics = {
  unitEconomics: {
    blendedLTV: 420,
    blendedCAC: 35,
    ltvCacRatio: 12,
    blendedARPU: 17.50,
    blendedChurn: 5,
    grossMargin: 85,
  },
  
  marketSize: {
    tam: '$500B+',
    sam: '$50B',
    som: '$5B',
    targetYear1ARR: '$2.4M',
    targetYear3ARR: '$50M',
  },
  
  lastUpdated: '2026-01-15',
};

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
// VALIDATION RULES
// =============================================================================
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lastChecked: string;
}

export const validateGovernanceData = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Calculate actual totals dynamically (no hardcoded values)
  const phaseTotals = Object.values(masterScenarioCounts.phases).reduce((sum, p) => sum + p.total, 0);
  const implementedTotals = Object.values(masterScenarioCounts.phases).reduce((sum, p) => sum + p.implemented, 0);
  
  // Validate: implemented cannot exceed total
  if (implementedTotals > phaseTotals) {
    errors.push(`Implementation count (${implementedTotals}) exceeds total scenarios (${phaseTotals})`);
  }
  
  // Check implemented doesn't exceed total per phase
  Object.entries(masterScenarioCounts.phases).forEach(([phase, data]) => {
    if (data.implemented > data.total) {
      errors.push(`${phase}: implemented (${data.implemented}) exceeds total (${data.total})`);
    }
  });
  
  // Check completion status matches actual implementation
  Object.entries(masterScenarioCounts.phases).forEach(([phase, data]) => {
    if (data.status === 'completed' && data.implemented !== data.total) {
      warnings.push(`${phase} marked complete but only ${data.implemented}/${data.total} implemented`);
    }
    if (data.status === 'planned' && data.implemented > 0) {
      warnings.push(`${phase} marked planned but has ${data.implemented} implemented scenarios`);
    }
  });
  
  // Check financial metrics are reasonable
  if (masterFinancialMetrics.unitEconomics.ltvCacRatio < 3) {
    warnings.push('LTV:CAC ratio below healthy threshold of 3x');
  }
  
  // Verify gross margin is healthy
  if (masterFinancialMetrics.unitEconomics.grossMargin < 70) {
    warnings.push('Gross margin below SaaS benchmark of 70%');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lastChecked: new Date().toISOString(),
  };
};

// =============================================================================
// DATA SYNC HELPERS
// These functions ensure all tabs use the same data source
// =============================================================================
export const getScenarioDisplayString = () => 
  `${masterScenarioCounts.implementedScenarios}/${masterScenarioCounts.totalScenarios}`;

export const getCompletionDisplayString = () => 
  `${masterScenarioCounts.completionPercentage}%`;

export const getPhaseProgressString = (phaseId: string) => {
  const phase = masterScenarioCounts.phases[phaseId as keyof typeof masterScenarioCounts.phases];
  if (!phase) return '0/0 (0%)';
  const pct = phase.total > 0 ? Math.round((phase.implemented / phase.total) * 100) : 0;
  return `${phase.implemented}/${phase.total} (${pct}%)`;
};

// =============================================================================
// AUDIT LOG FUNCTIONS
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

// In a real system, this would be stored in the database
export const recentAuditLog: AuditEntry[] = [
  {
    timestamp: '2026-01-15T10:30:00Z',
    action: 'UPDATE',
    area: 'Scenario Count',
    previousValue: 289,
    newValue: 305,
    performedBy: 'Dev Team',
    notes: 'Added 16 editing scenarios (AE, AF categories)',
  },
  {
    timestamp: '2026-01-15T10:00:00Z',
    action: 'VERIFY',
    area: 'Implementation Status',
    performedBy: 'QA Team',
    notes: 'Verified P0-P2 100% complete via codebase search',
  },
  {
    timestamp: '2026-01-14T15:00:00Z',
    action: 'SYNC',
    area: 'All Tabs',
    performedBy: 'System',
    notes: 'Synchronized TechnicalDocsTab, RoadmapTab, InvestorDashboard with new counts',
  },
];

// =============================================================================
// UPDATE CHECKLIST - What to update when scenarios change
// =============================================================================
export const updateChecklist = [
  { file: 'data/governance-data.ts', section: 'masterScenarioCounts.phases', priority: 1, description: 'Update phase totals and implemented counts' },
  { file: 'data/implementation-data.ts', section: 'scenarioCategories', priority: 2, description: 'Update category breakdown if new categories added' },
  { file: 'data/implementation-data.ts', section: 'implementationPhases', priority: 2, description: 'Update phase features and status' },
  { file: 'tabs/RoadmapTab.tsx', section: 'Auto-synced', priority: 3, description: 'Uses implementation-data.ts - auto-updates' },
  { file: 'tabs/TechnicalDocsTab.tsx', section: 'Stats section', priority: 3, description: 'Verify stats display matches' },
  { file: 'tabs/InvestorDashboardTab.tsx', section: 'Executive Summary', priority: 3, description: 'Verify projections match' },
  { file: 'tabs/OverviewTab.tsx', section: 'Header stats', priority: 3, description: 'Verify overview numbers' },
  { file: 'docs/GENIE_STUDIO_SCENARIO_MAP.md', section: 'All', priority: 4, description: 'Update documentation' },
  { file: 'docs/AI_Coverage_Summary.md', section: 'Totals', priority: 4, description: 'Update documentation' },
];

// =============================================================================
// EXPORTS FOR TAB CONSUMPTION
// =============================================================================
export const getGovernanceSummary = () => ({
  scenarios: {
    total: masterScenarioCounts.totalScenarios,
    implemented: masterScenarioCounts.implementedScenarios,
    percentage: masterScenarioCounts.completionPercentage,
    phases: masterScenarioCounts.phases,
    completedPhases: masterScenarioCounts.completedPhases,
  },
  infrastructure: masterInfrastructureCounts,
  financials: masterFinancialMetrics,
  gartner: masterGartnerPosition,
  metadata: governanceMetadata,
  validation: validateGovernanceData(),
});
