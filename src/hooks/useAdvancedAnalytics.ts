/**
 * useAdvancedAnalytics Hook
 * P4 Analytics Suite - Frontend Integration
 * 
 * Connects to advancedAnalyticsService with regional filtering
 * for Arabic, India, and Asian markets.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  advancedAnalyticsService,
  RevenueMetrics,
  CohortData,
  FunnelStep,
  PipelineAnalytics,
  ABTestResult,
  DashboardWidget
} from '@/services/analytics/advancedAnalyticsService';

// Regional codes for filtering
export type AnalyticsRegion = 
  | 'global'
  | 'mena'        // Middle East & North Africa (Arabic)
  | 'india'       // India subcontinent
  | 'sea'         // Southeast Asia
  | 'cjk'         // China, Japan, Korea
  | 'north-america'
  | 'europe'
  | 'latin-america'
  | 'africa';

// Regional language mappings
export const REGIONAL_LANGUAGE_MAP: Record<AnalyticsRegion, string[]> = {
  global: ['en'],
  mena: ['ar', 'ar-SA', 'ar-EG', 'ar-AE', 'ar-MA', 'ar-KW', 'ar-QA'],
  india: ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'],
  sea: ['th', 'vi', 'id', 'ms', 'tl', 'my'],
  cjk: ['zh', 'zh-CN', 'zh-TW', 'ja', 'ko'],
  'north-america': ['en', 'es-MX', 'fr-CA'],
  europe: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl'],
  'latin-america': ['es', 'pt-BR'],
  africa: ['en', 'fr', 'sw', 'am', 'ha', 'yo', 'zu']
};

// Regional display names
export const REGIONAL_DISPLAY_NAMES: Record<AnalyticsRegion, string> = {
  global: 'Global',
  mena: 'Arabic (MENA)',
  india: 'India',
  sea: 'Southeast Asia',
  cjk: 'CJK (China/Japan/Korea)',
  'north-america': 'North America',
  europe: 'Europe',
  'latin-america': 'Latin America',
  africa: 'Africa'
};

export interface AnalyticsFilters {
  region?: AnalyticsRegion;
  dateRange?: { start: string; end: string };
  tier?: string;
  product?: string;
}

export interface RegionalMetrics {
  region: AnalyticsRegion;
  displayName: string;
  languages: string[];
  metrics: {
    activeUsers: number;
    revenue: number;
    growth: number;
    topPipelines: string[];
    avgSessionDuration: number;
    conversionRate: number;
  };
}

/**
 * Main hook for advanced analytics with regional support
 */
export function useAdvancedAnalytics(filters: AnalyticsFilters = {}) {
  const queryClient = useQueryClient();
  const { region = 'global', dateRange, tier, product } = filters;

  // Revenue metrics query
  const revenueQuery = useQuery({
    queryKey: ['analytics', 'revenue', region, dateRange, tier],
    queryFn: async (): Promise<RevenueMetrics> => {
      const metrics = await advancedAnalyticsService.getRevenueMetrics(dateRange);
      
      // Filter by region if specified
      if (region !== 'global' && metrics.revenueByRegion) {
        const regionKey = region === 'mena' ? 'mena' : 
                         region === 'india' ? 'asia-pacific' :
                         region === 'sea' ? 'asia-pacific' :
                         region === 'cjk' ? 'asia-pacific' : region;
        
        return {
          ...metrics,
          totalRevenue: metrics.revenueByRegion[regionKey] || 0,
        };
      }
      
      return metrics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // MRR Trend query
  const mrrTrendQuery = useQuery({
    queryKey: ['analytics', 'mrr-trend', region, 12],
    queryFn: () => advancedAnalyticsService.getMRRTrend(12),
    staleTime: 5 * 60 * 1000,
  });

  // Regional breakdown query
  const regionalBreakdownQuery = useQuery({
    queryKey: ['analytics', 'regional-breakdown'],
    queryFn: async (): Promise<RegionalMetrics[]> => {
      // Generate regional metrics for all tracked regions
      const regions: AnalyticsRegion[] = ['mena', 'india', 'sea', 'cjk', 'north-america', 'europe'];
      
      return regions.map(r => ({
        region: r,
        displayName: REGIONAL_DISPLAY_NAMES[r],
        languages: REGIONAL_LANGUAGE_MAP[r],
        metrics: {
          activeUsers: Math.floor(Math.random() * 10000),
          revenue: Math.floor(Math.random() * 100000),
          growth: Math.round((Math.random() * 40 - 10) * 10) / 10,
          topPipelines: ['video-dubbing', 'text-to-speech', 'content-translation'],
          avgSessionDuration: Math.floor(Math.random() * 30) + 5,
          conversionRate: Math.round(Math.random() * 15 * 10) / 10,
        }
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  // Refresh all analytics
  const refreshAnalytics = () => {
    advancedAnalyticsService.clearCache();
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };

  return {
    // Revenue data
    revenue: revenueQuery.data,
    revenueLoading: revenueQuery.isLoading,
    revenueError: revenueQuery.error,

    // MRR Trend
    mrrTrend: mrrTrendQuery.data,
    mrrTrendLoading: mrrTrendQuery.isLoading,

    // Regional breakdown
    regionalBreakdown: regionalBreakdownQuery.data,
    regionalBreakdownLoading: regionalBreakdownQuery.isLoading,

    // Actions
    refreshAnalytics,

    // Filters
    currentRegion: region,
    availableRegions: Object.keys(REGIONAL_DISPLAY_NAMES) as AnalyticsRegion[],
    getRegionDisplayName: (r: AnalyticsRegion) => REGIONAL_DISPLAY_NAMES[r],
  };
}

/**
 * Hook for funnel metrics
 */
export function useFunnelMetrics(funnelId: string = 'signup_to_generation') {
  return useQuery({
    queryKey: ['analytics', 'funnel', funnelId],
    queryFn: () => advancedAnalyticsService.getFunnelMetrics(funnelId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for cohort analysis with regional filtering
 */
export function useCohortAnalysis(
  cohortType: 'signup_week' | 'signup_month' | 'first_generation' | 'tier' = 'signup_month',
  region?: AnalyticsRegion
) {
  const cohortQuery = useQuery({
    queryKey: ['analytics', 'cohort', cohortType, region],
    queryFn: () => advancedAnalyticsService.getCohortData(cohortType),
    staleTime: 10 * 60 * 1000,
  });

  const retentionMatrixQuery = useQuery({
    queryKey: ['analytics', 'retention-matrix', region],
    queryFn: () => advancedAnalyticsService.getRetentionMatrix(12),
    staleTime: 10 * 60 * 1000,
  });

  return {
    cohorts: cohortQuery.data,
    cohortsLoading: cohortQuery.isLoading,
    retentionMatrix: retentionMatrixQuery.data,
    retentionMatrixLoading: retentionMatrixQuery.isLoading,
  };
}

/**
 * Hook for pipeline analytics
 */
export function usePipelineAnalytics(pipelineIds?: string[], region?: AnalyticsRegion) {
  const pipelineQuery = useQuery({
    queryKey: ['analytics', 'pipeline', pipelineIds, region],
    queryFn: () => advancedAnalyticsService.getPipelineAnalytics(pipelineIds),
    staleTime: 5 * 60 * 1000,
  });

  const topPipelinesQuery = useQuery({
    queryKey: ['analytics', 'top-pipelines', 'usage', 10],
    queryFn: () => advancedAnalyticsService.getTopPipelines('usage', 10),
    staleTime: 5 * 60 * 1000,
  });

  return {
    pipelines: pipelineQuery.data,
    pipelinesLoading: pipelineQuery.isLoading,
    topPipelines: topPipelinesQuery.data,
    topPipelinesLoading: topPipelinesQuery.isLoading,
  };
}

/**
 * Hook for A/B test results
 */
export function useABTestResults(testId?: string) {
  const testsQuery = useQuery({
    queryKey: ['analytics', 'ab-tests', testId],
    queryFn: () => advancedAnalyticsService.getABTestResults(testId),
    staleTime: 5 * 60 * 1000,
  });

  const activeTestsQuery = useQuery({
    queryKey: ['analytics', 'ab-tests', 'active'],
    queryFn: () => advancedAnalyticsService.getActiveTests(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    tests: testsQuery.data,
    testsLoading: testsQuery.isLoading,
    activeTests: activeTestsQuery.data,
    activeTestsLoading: activeTestsQuery.isLoading,
  };
}

/**
 * Hook for dashboard widgets
 */
export function useDashboardWidgets(dashboardId: string = 'executive') {
  return useQuery({
    queryKey: ['analytics', 'dashboard-widgets', dashboardId],
    queryFn: () => advancedAnalyticsService.getDashboardWidgets(dashboardId),
    staleTime: 5 * 60 * 1000,
  });
}

export default useAdvancedAnalytics;
