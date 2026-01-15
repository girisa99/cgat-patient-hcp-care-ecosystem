/**
 * Genie Studio Metrics - Single Source of Truth
 * 
 * These counts are derived from actual exports in each index file.
 * Update this file whenever you add/remove exports from:
 * - pages/index.ts
 * - components/index.ts  
 * - hooks/index.ts
 * - services/index.ts
 * 
 * Last verified: 2026-01-15
 */

// Actual export counts from each barrel file
export const GENIE_STUDIO_METRICS = {
  // From src/genie-studio/pages/index.ts (count: 10)
  pages: 10,
  
  // From src/genie-studio/components/index.ts (count: ~55 including re-exports)
  components: 55,
  
  // From src/genie-studio/hooks/index.ts (count: 24)
  // Note: Main index.ts has 26 additional hook exports for legacy compat
  hooksBarrel: 24,
  hooksLegacy: 26,
  hooksTotal: 50,
  
  // From src/genie-studio/services/index.ts (count: 18)
  // Note: Main index.ts has 14 additional service exports for legacy compat
  servicesBarrel: 18,
  servicesLegacy: 14,
  servicesTotal: 32,
  
  // Edge functions (verified via codebase search 2026-01-15)
  // Categories: TTS(10), AI/Agents(13), Script/Media(10), Publishing(10), Core(13), Misc(6)
  edgeFunctions: 62,
  
  // Database tables specific to Genie (scripts, recordings, bulk_jobs, social_*, etc.)
  databaseTables: 42,
  
  // AI Agents listed in GENIE_STUDIO_PRODUCT.agents
  aiAgents: 12,
  
  // Mobile components from src/components/mobile/index.ts
  mobileComponents: 18,
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
