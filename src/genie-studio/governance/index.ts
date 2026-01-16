/**
 * Genie Studio Governance - Index
 * 
 * Central governance module for tracking all Genie Studio assets.
 * This provides a SINGLE SOURCE OF TRUTH for:
 * - What belongs to Genie Studio
 * - Current counts and metrics
 * - Phase progress (P0-P5)
 * - Validation utilities
 */

// Registry exports (asset lists)
export {
  GENIE_EDGE_FUNCTIONS,
  GENIE_HOOKS,
  GENIE_SERVICES,
  GENIE_DATABASE_TABLES,
  GENIE_AI_AGENTS,
  GENIE_PAGES,
  calculateGenieMetrics,
  isGenieAsset,
  GENIE_DYNAMIC_METRICS,
} from './GenieStudioRegistry';

// API Production Configuration (dev→prod tracking)
export {
  API_CONFIGURATIONS,
  API_STAGE_GATE_CHECKLIST,
  API_CONFIG_METADATA,
  getApisByStatus,
  getApisNeedingUpgrade,
  getTotalEstimatedMonthlyCost,
  getApiProductionReadiness,
  getStageGateProgress,
} from './ApiProductionConfig';
export type { ApiConfig, ApiStageGateItem, ApiEnvironment } from './ApiProductionConfig';

// Unified Metrics (SINGLE SOURCE OF TRUTH for all tabs)
export {
  PHASES,
  SCENARIO_METRICS,
  PLATFORM_TOTALS,
  GENIE_COUNTS,
  HEALTHCARE_COUNTS,
  SHARED_COUNTS,
  INFRASTRUCTURE_METRICS,
  FINANCIAL_METRICS,
  METRICS_METADATA,
  P3_SCENARIO_BREAKDOWN,
  getPhaseProgress,
  getPhaseDisplayString,
  getScenarioDisplayString,
  getCompletionDisplayString,
  getCompletedPhasesString,
  validateMetrics,
} from './UnifiedMetrics';

export type { PhaseData } from './UnifiedMetrics';
