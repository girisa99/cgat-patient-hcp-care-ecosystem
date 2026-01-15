/**
 * Genie Studio Governance - Index
 * 
 * Central governance module for tracking all Genie Studio assets.
 * This provides a SINGLE SOURCE OF TRUTH for:
 * - What belongs to Genie Studio
 * - Current counts and metrics
 * - Validation utilities
 */

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
