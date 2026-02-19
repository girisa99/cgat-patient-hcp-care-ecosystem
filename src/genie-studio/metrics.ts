/**
 * Genie Suite Metrics - Re-exports from Unified Metrics
 * 
 * This file now re-exports from the SINGLE SOURCE OF TRUTH:
 * src/genie-studio/governance/UnifiedMetrics.ts
 * 
 * Last verified: 2026-01-15
 */

export {
  GENIE_COUNTS as GENIE_STUDIO_METRICS,
  PLATFORM_TOTALS,
  INFRASTRUCTURE_METRICS,
  SCENARIO_METRICS,
  PHASES,
  GENIE_DYNAMIC_METRICS,
  getPhaseProgress,
  getPhaseDisplayString,
  getScenarioDisplayString,
  getCompletionDisplayString,
  validateMetrics,
} from './governance/UnifiedMetrics';

// For backward compatibility
export { calculateGenieMetrics } from './governance/GenieStudioRegistry';

// Percentage calculator
import { GENIE_COUNTS, PLATFORM_TOTALS } from './governance/UnifiedMetrics';

export const getGenieStudioPercentage = (metric: keyof typeof PLATFORM_TOTALS) => {
  const genieValue = GENIE_COUNTS[metric as keyof typeof GENIE_COUNTS] || 0;
  const total = PLATFORM_TOTALS[metric];
  return Math.round((Number(genieValue) / total) * 100);
};
