/**
 * Analytics Services Index
 * P4 Advanced Analytics (5→31 scenarios)
 * 
 * Exports:
 * - Advanced Analytics: Revenue, cohorts, funnels, pipelines
 * - UI Components: Regional, Funnel, Cohort, Revenue panels
 * - Tiered Dashboard: Access-level based analytics
 */

export {
  advancedAnalyticsService,
  type RevenueMetrics,
  type CohortData,
  type FunnelStep,
  type PipelineAnalytics,
  type ABTestResult,
  type ABVariant,
  type DashboardWidget,
} from './advancedAnalyticsService';

// React Hooks
export {
  useAdvancedAnalytics,
  useFunnelMetrics,
  useCohortAnalysis,
  usePipelineAnalytics,
  useABTestResults,
  useDashboardWidgets,
  type AnalyticsRegion,
  type AnalyticsFilters,
  type RegionalMetrics,
  type VersioningMetrics,
  type CollaborationMetrics,
  type RecoveryMetrics,
  REGIONAL_LANGUAGE_MAP,
  REGIONAL_DISPLAY_NAMES,
  PRIORITY_REGIONS,
  ALL_REGIONS,
} from '@/hooks/useAdvancedAnalytics';

// UI Components
export { RegionalAnalyticsPanel } from '@/components/analytics/RegionalAnalyticsPanel';
export { FunnelVisualization } from '@/components/analytics/FunnelVisualization';
export { CohortRetentionHeatmap } from '@/components/analytics/CohortRetentionHeatmap';
export { RevenueMetricsPanel } from '@/components/analytics/RevenueMetricsPanel';
export { TieredAnalyticsDashboard, type AnalyticsAccessLevel } from '@/components/analytics/TieredAnalyticsDashboard';
export { AnalyticsWidget } from '@/components/analytics/AnalyticsWidget';
