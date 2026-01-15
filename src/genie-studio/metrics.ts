/**
 * Genie Studio Metrics - Single Source of Truth
 * 
 * IMPORTANT: Metrics are now DYNAMICALLY CALCULATED from the registry!
 * To update counts, modify: src/genie-studio/governance/GenieStudioRegistry.ts
 * 
 * This file re-exports the calculated metrics for backward compatibility.
 * 
 * Last verified: 2026-01-15
 */

import { GENIE_DYNAMIC_METRICS, calculateGenieMetrics } from './governance/GenieStudioRegistry';

// Re-export dynamic metrics
export const GENIE_STUDIO_METRICS = {
  // Dynamically calculated from registry
  pages: GENIE_DYNAMIC_METRICS.pages,
  components: 55, // Components require manual count (barrel exports complex)
  hooksBarrel: 24,
  hooksLegacy: GENIE_DYNAMIC_METRICS.hooks - 24,
  hooksTotal: GENIE_DYNAMIC_METRICS.hooks,
  servicesBarrel: 18,
  servicesLegacy: GENIE_DYNAMIC_METRICS.services - 18,
  servicesTotal: GENIE_DYNAMIC_METRICS.services,
  edgeFunctions: GENIE_DYNAMIC_METRICS.edgeFunctions,
  databaseTables: GENIE_DYNAMIC_METRICS.databaseTables,
  aiAgents: GENIE_DYNAMIC_METRICS.aiAgents,
  mobileComponents: 18, // From mobile/index.ts - manual count
} as const;

// Platform totals (Genie + Healthcare + Shared)
export const PLATFORM_TOTALS = {
  edgeFunctions: 140,
  hooks: 280,
  databaseTables: 180,
  aiAgents: 15,
  mobileComponents: 23,
  pages: 85,
  components: 500,
  services: 35,
} as const;

// Calculated percentages
export const getGenieStudioPercentage = (metric: keyof typeof PLATFORM_TOTALS) => {
  const genieValue = metric === 'hooks' ? GENIE_STUDIO_METRICS.hooksTotal :
                     metric === 'services' ? GENIE_STUDIO_METRICS.servicesTotal :
                     GENIE_STUDIO_METRICS[metric as keyof typeof GENIE_STUDIO_METRICS] || 0;
  const total = PLATFORM_TOTALS[metric];
  return Math.round((Number(genieValue) / total) * 100);
};

// Re-export for convenience
export { calculateGenieMetrics, GENIE_DYNAMIC_METRICS } from './governance/GenieStudioRegistry';
