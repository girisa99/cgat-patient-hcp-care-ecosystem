// Distribution & Mobile Analytics (P4-ANA-32 to P4-ANA-35)
export { distributionAnalyticsService } from './distributionAnalyticsService';
export type {
  MobileDownloadMetrics,
  PublishingPlatformMetrics,
  CrossPlatformSyncMetrics,
  OfflineQueueMetrics,
} from './distributionAnalyticsService';

/**
 * Analytics Services Index
 * P4 Advanced Analytics (31/31 scenarios) ✅ COMPLETE
 * 
 * Exports:
 * - Advanced Analytics: Revenue, cohorts, funnels, pipelines
 * - Predictive Analytics: Trends, churn, engagement prediction
 * - Performance Analytics: Heatmaps, costs, quality, real-time
 * - Business Analytics: ROI, goals, anomalies, competitor analysis
 * - Reporting: Exportable reports, scheduled reports, custom dashboards
 * - UI Components: Regional, Funnel, Cohort, Revenue, Churn, Goals, Alerts
 */

// Core Analytics Service
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

// Predictive Analytics (P4-ANA-12, 14, 18)
export {
  predictiveAnalyticsService,
  type TrendPrediction,
  type EngagementPrediction,
  type ChurnRiskUser,
  type ChurnMetrics,
} from './predictiveAnalyticsService';

// Performance Analytics (P4-ANA-15, 17, 19, 20, 21, 27)
export {
  performanceAnalyticsService,
  type AudienceInsights,
  type RetentionMetrics,
  type ContentHeatmapCell,
  type ProviderCostAnalysis,
  type QualityScoreTrend,
  type RealTimeMetric,
} from './performanceAnalyticsService';

// Business Analytics (P4-ANA-11, 13, 16, 22, 23, 28, 29, 30, 31)
export {
  businessAnalyticsService,
  type CompetitorInsight,
  type PlatformOptimization,
  type RevenueAttribution,
  type UserJourneyStep,
  type FeatureUsageMetric,
  type IndustryBenchmark,
  type ROICalculation,
  type Goal,
  type AnomalyAlert,
} from './businessAnalyticsService';

// Reporting Service (P4-ANA-24, 25, 26)
export {
  reportingService,
  type ReportConfig,
  type ReportSection,
  type GeneratedReport,
  type ScheduledReport,
  type CustomDashboard,
  type DashboardWidget as CustomDashboardWidget,
  type WidgetLayout,
  type ReportTemplate,
} from './reportingService';

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

// UI Components - Core
export { RegionalAnalyticsPanel } from '@/components/analytics/RegionalAnalyticsPanel';
export { FunnelVisualization } from '@/components/analytics/FunnelVisualization';
export { CohortRetentionHeatmap } from '@/components/analytics/CohortRetentionHeatmap';
export { RevenueMetricsPanel } from '@/components/analytics/RevenueMetricsPanel';
export { TieredAnalyticsDashboard, type AnalyticsAccessLevel } from '@/components/analytics/TieredAnalyticsDashboard';
export { AnalyticsWidget } from '@/components/analytics/AnalyticsWidget';

// UI Components - P4 Advanced (NEW)
export { ChurnPredictionDashboard } from '@/components/analytics/ChurnPredictionDashboard';
export { ProviderCostAnalysisPanel } from '@/components/analytics/ProviderCostAnalysisPanel';
export { GoalTrackingPanel } from '@/components/analytics/GoalTrackingPanel';
export { AnomalyDetectionAlerts } from '@/components/analytics/AnomalyDetectionAlerts';
export { RealTimeMetricsPanel } from '@/components/analytics/RealTimeMetricsPanel';
export { FeatureUsagePanel } from '@/components/analytics/FeatureUsagePanel';
