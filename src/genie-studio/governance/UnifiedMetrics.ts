/**
 * UNIFIED METRICS - SINGLE SOURCE OF TRUTH
 * 
 * This file consolidates ALL metrics for Genie Studio Command Center.
 * Every tab, component, and display MUST derive values from here.
 * 
 * DO NOT create hardcoded metrics elsewhere!
 * 
 * Last Audit: 2026-01-15
 */

import { GENIE_DYNAMIC_METRICS, GENIE_AI_AGENTS, GENIE_EDGE_FUNCTIONS, GENIE_DATABASE_TABLES, GENIE_HOOKS, GENIE_SERVICES, GENIE_PAGES } from './GenieStudioRegistry';

// =============================================================================
// PHASE DATA - SINGLE SOURCE OF TRUTH FOR P0-P5
// =============================================================================
export interface PhaseData {
  total: number;
  implemented: number;
  status: 'completed' | 'in-progress' | 'planned';
  weeks: string;
  name: string;
}

export const PHASES: Record<string, PhaseData> = {
  P0: { 
    total: 35, 
    implemented: 35, 
    status: 'completed', 
    weeks: '1-4',
    name: 'Core MVP Foundation'
  },
  P1: { 
    total: 32, 
    implemented: 32, 
    status: 'completed', 
    weeks: '5-8',
    name: 'Essential Production'
  },
  P2: { 
    total: 118, 
    implemented: 118, 
    status: 'completed', 
    weeks: '9-12',
    name: 'AI Agents & UX Polish'
  },
  P3: { 
    total: 72, 
    implemented: 16, 
    status: 'in-progress', 
    weeks: '13-18',
    name: 'Differentiators & Go-Live'
  },
  P4: { 
    total: 50, 
    implemented: 0, 
    status: 'planned', 
    weeks: '19-24',
    name: 'Advanced Features'
  },
  P5: { 
    total: 28, 
    implemented: 0, 
    status: 'planned', 
    weeks: '25+',
    name: 'Enterprise & Scale'
  },
} as const;

// =============================================================================
// COMPUTED SCENARIO METRICS
// =============================================================================
export const SCENARIO_METRICS = {
  get totalScenarios() {
    return Object.values(PHASES).reduce((sum, p) => sum + p.total, 0);
  },
  get implementedScenarios() {
    return Object.values(PHASES).reduce((sum, p) => sum + p.implemented, 0);
  },
  get completionPercentage() {
    return Math.round((this.implementedScenarios / this.totalScenarios) * 100);
  },
  get completedPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'completed')
      .map(([key]) => key);
  },
  get inProgressPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'in-progress')
      .map(([key]) => key);
  },
  get plannedPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'planned')
      .map(([key]) => key);
  },
};

// =============================================================================
// PLATFORM-WIDE INFRASTRUCTURE TOTALS
// =============================================================================
export const PLATFORM_TOTALS = {
  edgeFunctions: 140,
  hooks: 280,
  databaseTables: 180,
  aiAgents: 15,
  mobileComponents: 23,
  pages: 85,
  components: 500,
  services: 35,
  ttsProviders: 5,
  products: 6,
} as const;

// =============================================================================
// GENIE STUDIO SPECIFIC COUNTS (from registry)
// =============================================================================
export const GENIE_COUNTS = {
  edgeFunctions: GENIE_DYNAMIC_METRICS.edgeFunctions,
  hooks: GENIE_DYNAMIC_METRICS.hooks,
  databaseTables: GENIE_DYNAMIC_METRICS.databaseTables,
  aiAgents: GENIE_DYNAMIC_METRICS.aiAgents,
  pages: GENIE_DYNAMIC_METRICS.pages,
  services: GENIE_DYNAMIC_METRICS.services,
  mobileComponents: 18, // Verified from mobile/index.ts
  components: 55, // Verified from genie-studio/components barrel exports
} as const;

// =============================================================================
// HEALTHCARE SPECIFIC COUNTS
// =============================================================================
export const HEALTHCARE_COUNTS = {
  edgeFunctions: 28,
  hooks: 65,
  databaseTables: 55,
  aiAgents: 3,
  mobileComponents: 5,
  pages: 25,
  components: 120,
  services: 3,
} as const;

// =============================================================================
// CALCULATED SHARED COUNTS (Platform - Genie - Healthcare)
// =============================================================================
export const SHARED_COUNTS = {
  get edgeFunctions() {
    return PLATFORM_TOTALS.edgeFunctions - GENIE_COUNTS.edgeFunctions - HEALTHCARE_COUNTS.edgeFunctions;
  },
  get hooks() {
    return PLATFORM_TOTALS.hooks - GENIE_COUNTS.hooks - HEALTHCARE_COUNTS.hooks;
  },
  get databaseTables() {
    return PLATFORM_TOTALS.databaseTables - GENIE_COUNTS.databaseTables - HEALTHCARE_COUNTS.databaseTables;
  },
  get aiAgents() {
    return PLATFORM_TOTALS.aiAgents - GENIE_COUNTS.aiAgents - HEALTHCARE_COUNTS.aiAgents;
  },
  get mobileComponents() {
    return PLATFORM_TOTALS.mobileComponents - GENIE_COUNTS.mobileComponents - HEALTHCARE_COUNTS.mobileComponents;
  },
  get pages() {
    return PLATFORM_TOTALS.pages - GENIE_COUNTS.pages - HEALTHCARE_COUNTS.pages;
  },
  get components() {
    return PLATFORM_TOTALS.components - GENIE_COUNTS.components - HEALTHCARE_COUNTS.components;
  },
  get services() {
    return PLATFORM_TOTALS.services - GENIE_COUNTS.services - HEALTHCARE_COUNTS.services;
  },
};

// =============================================================================
// INFRASTRUCTURE METRICS (for UI display)
// =============================================================================
export const INFRASTRUCTURE_METRICS = {
  edgeFunctions: {
    total: PLATFORM_TOTALS.edgeFunctions,
    genieStudio: GENIE_COUNTS.edgeFunctions,
    healthcare: HEALTHCARE_COUNTS.edgeFunctions,
    get shared() { return SHARED_COUNTS.edgeFunctions; },
  },
  hooks: {
    total: PLATFORM_TOTALS.hooks,
    genieStudio: GENIE_COUNTS.hooks,
    healthcare: HEALTHCARE_COUNTS.hooks,
    get shared() { return SHARED_COUNTS.hooks; },
  },
  databaseTables: {
    total: PLATFORM_TOTALS.databaseTables,
    genieStudio: GENIE_COUNTS.databaseTables,
    healthcare: HEALTHCARE_COUNTS.databaseTables,
    get shared() { return SHARED_COUNTS.databaseTables; },
  },
  aiAgents: {
    total: PLATFORM_TOTALS.aiAgents,
    genieStudio: GENIE_COUNTS.aiAgents,
    healthcare: HEALTHCARE_COUNTS.aiAgents,
    get shared() { return SHARED_COUNTS.aiAgents; },
  },
  mobileComponents: {
    total: PLATFORM_TOTALS.mobileComponents,
    genieStudio: GENIE_COUNTS.mobileComponents,
    healthcare: HEALTHCARE_COUNTS.mobileComponents,
    get shared() { return SHARED_COUNTS.mobileComponents; },
  },
  pages: {
    total: PLATFORM_TOTALS.pages,
    genieStudio: GENIE_COUNTS.pages,
    healthcare: HEALTHCARE_COUNTS.pages,
    get shared() { return SHARED_COUNTS.pages; },
  },
  components: {
    total: PLATFORM_TOTALS.components,
    genieStudio: GENIE_COUNTS.components,
    healthcare: HEALTHCARE_COUNTS.components,
    get shared() { return SHARED_COUNTS.components; },
  },
  services: {
    total: PLATFORM_TOTALS.services,
    genieStudio: GENIE_COUNTS.services,
    healthcare: HEALTHCARE_COUNTS.services,
    get shared() { return SHARED_COUNTS.services; },
  },
};

// =============================================================================
// FINANCIAL METRICS
// =============================================================================
export const FINANCIAL_METRICS = {
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
} as const;

// =============================================================================
// HELPER FUNCTIONS FOR UI
// =============================================================================
export const getPhaseProgress = (phaseId: string) => {
  const phase = PHASES[phaseId];
  if (!phase) return { implemented: 0, total: 0, percentage: 0 };
  return {
    implemented: phase.implemented,
    total: phase.total,
    percentage: phase.total > 0 ? Math.round((phase.implemented / phase.total) * 100) : 0,
  };
};

export const getPhaseDisplayString = (phaseId: string) => {
  const { implemented, total, percentage } = getPhaseProgress(phaseId);
  return `${implemented}/${total} (${percentage}%)`;
};

export const getScenarioDisplayString = () => 
  `${SCENARIO_METRICS.implementedScenarios}/${SCENARIO_METRICS.totalScenarios}`;

export const getCompletionDisplayString = () => 
  `${SCENARIO_METRICS.completionPercentage}%`;

export const getCompletedPhasesString = () => 
  SCENARIO_METRICS.completedPhases.join(', ');

// =============================================================================
// VALIDATION
// =============================================================================
export const validateMetrics = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate phase data
  Object.entries(PHASES).forEach(([phaseId, phase]) => {
    if (phase.implemented > phase.total) {
      errors.push(`${phaseId}: implemented (${phase.implemented}) exceeds total (${phase.total})`);
    }
    if (phase.status === 'completed' && phase.implemented !== phase.total) {
      warnings.push(`${phaseId} marked complete but only ${phase.implemented}/${phase.total} implemented`);
    }
    if (phase.status === 'planned' && phase.implemented > 0) {
      warnings.push(`${phaseId} marked planned but has ${phase.implemented} implemented scenarios`);
    }
  });

  // Validate Genie counts don't exceed totals
  Object.keys(GENIE_COUNTS).forEach((key) => {
    const genieVal = GENIE_COUNTS[key as keyof typeof GENIE_COUNTS];
    const totalVal = PLATFORM_TOTALS[key as keyof typeof PLATFORM_TOTALS];
    if (totalVal && genieVal > totalVal) {
      errors.push(`Genie ${key} (${genieVal}) exceeds platform total (${totalVal})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lastChecked: new Date().toISOString(),
  };
};

// =============================================================================
// METADATA
// =============================================================================
export const METRICS_METADATA = {
  version: '3.0.0',
  lastUpdated: '2026-01-15T12:00:00Z',
  lastAuditedBy: 'System Architect',
  nextAuditDue: '2026-02-01',
  changeLog: [
    { date: '2026-01-15', change: 'Consolidated all metrics into UnifiedMetrics.ts', by: 'Architecture' },
    { date: '2026-01-15', change: 'Added P3 in-progress status with 16/72 implemented', by: 'Dev Team' },
  ],
};

// Re-export registry items for convenience
export { 
  GENIE_AI_AGENTS, 
  GENIE_EDGE_FUNCTIONS, 
  GENIE_DATABASE_TABLES,
  GENIE_HOOKS,
  GENIE_SERVICES,
  GENIE_PAGES,
  GENIE_DYNAMIC_METRICS,
};
