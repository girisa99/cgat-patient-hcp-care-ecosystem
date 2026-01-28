/**
 * Advanced Analytics Service
 * P4-ANA: Revenue dashboards, cohort analysis, funnel tracking
 * 
 * Provides:
 * - Revenue & MRR tracking
 * - User cohort analysis
 * - Conversion funnel metrics
 * - Pipeline usage analytics
 * - A/B test result aggregation
 */

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  mrrGrowth: number;
  churnRate: number;
  ltv: number;
  arpu: number;
  arppu: number;
  totalRevenue: number;
  revenueByTier: Record<string, number>;
  revenueByRegion: Record<string, number>;
}

export interface CohortData {
  cohortId: string;
  cohortName: string;
  startDate: string;
  userCount: number;
  retentionByWeek: number[];
  conversionRate: number;
  avgRevenuePerUser: number;
  topPipelines: string[];
}

export interface FunnelStep {
  stepId: string;
  stepName: string;
  userCount: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeSpent: number;
}

export interface PipelineAnalytics {
  pipelineId: string;
  pipelineName: string;
  category: string;
  usageCount: number;
  uniqueUsers: number;
  avgCompletionTime: number;
  successRate: number;
  creditCost: number;
  revenueGenerated: number;
  popularHours: number[];
  topRegions: string[];
}

export interface ABTestResult {
  testId: string;
  testName: string;
  status: 'running' | 'completed' | 'stopped';
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  winner?: string;
  statisticalSignificance: number;
}

export interface ABVariant {
  variantId: string;
  variantName: string;
  userCount: number;
  conversionRate: number;
  avgRevenue: number;
  engagement: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'cohort';
  title: string;
  data: unknown;
  config: Record<string, unknown>;
}

class AdvancedAnalyticsService {
  private metricsCache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // ============================================================================
  // REVENUE ANALYTICS
  // ============================================================================

  async getRevenueMetrics(dateRange?: { start: string; end: string }): Promise<RevenueMetrics> {
    const cacheKey = `revenue_${dateRange?.start}_${dateRange?.end}`;
    const cached = this.getFromCache<RevenueMetrics>(cacheKey);
    if (cached) return cached;

    // In production, this would query Stripe/Supabase
    const metrics: RevenueMetrics = {
      mrr: 0,
      arr: 0,
      mrrGrowth: 0,
      churnRate: 0,
      ltv: 0,
      arpu: 0,
      arppu: 0,
      totalRevenue: 0,
      revenueByTier: {
        free: 0,
        starter: 0,
        creator: 0,
        pro: 0,
        business: 0,
        enterprise: 0,
      },
      revenueByRegion: {
        'north-america': 0,
        'europe': 0,
        'asia-pacific': 0,
        'latin-america': 0,
        'mena': 0,
        'africa': 0,
      },
    };

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  async getMRRTrend(months: number = 12): Promise<{ month: string; mrr: number; growth: number }[]> {
    const trend: { month: string; mrr: number; growth: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trend.push({
        month: date.toISOString().slice(0, 7),
        mrr: 0, // Would be populated from real data
        growth: 0,
      });
    }

    return trend;
  }

  // ============================================================================
  // COHORT ANALYSIS
  // ============================================================================

  async getCohortData(
    cohortType: 'signup_week' | 'signup_month' | 'first_generation' | 'tier',
    dateRange?: { start: string; end: string }
  ): Promise<CohortData[]> {
    const cacheKey = `cohort_${cohortType}_${dateRange?.start}_${dateRange?.end}`;
    const cached = this.getFromCache<CohortData[]>(cacheKey);
    if (cached) return cached;

    // Mock cohort data - would query user_events in production
    const cohorts: CohortData[] = [];
    
    this.setCache(cacheKey, cohorts);
    return cohorts;
  }

  async getRetentionMatrix(weeks: number = 12): Promise<number[][]> {
    // Returns NxN matrix where [i][j] = retention of cohort i in week j
    return Array(weeks).fill(null).map(() => Array(weeks).fill(0));
  }

  // ============================================================================
  // FUNNEL ANALYTICS
  // ============================================================================

  async getFunnelMetrics(funnelId: string): Promise<FunnelStep[]> {
    const cacheKey = `funnel_${funnelId}`;
    const cached = this.getFromCache<FunnelStep[]>(cacheKey);
    if (cached) return cached;

    // Define standard funnels
    const funnels: Record<string, FunnelStep[]> = {
      signup_to_generation: [
        { stepId: 'landing', stepName: 'Landing Page', userCount: 0, conversionRate: 100, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'signup', stepName: 'Signup Started', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'verified', stepName: 'Email Verified', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'onboarding', stepName: 'Onboarding Complete', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'first_gen', stepName: 'First Generation', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
      ],
      free_to_paid: [
        { stepId: 'active_free', stepName: 'Active Free User', userCount: 0, conversionRate: 100, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'pricing_view', stepName: 'Viewed Pricing', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'checkout', stepName: 'Started Checkout', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'paid', stepName: 'Completed Payment', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
      ],
      generation_workflow: [
        { stepId: 'wizard_start', stepName: 'Wizard Started', userCount: 0, conversionRate: 100, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'input_complete', stepName: 'Input Provided', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'config_complete', stepName: 'Configured', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'generated', stepName: 'Generated', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
        { stepId: 'exported', stepName: 'Exported/Published', userCount: 0, conversionRate: 0, dropoffRate: 0, avgTimeSpent: 0 },
      ],
    };

    const steps = funnels[funnelId] || [];
    this.setCache(cacheKey, steps);
    return steps;
  }

  // ============================================================================
  // PIPELINE ANALYTICS
  // ============================================================================

  async getPipelineAnalytics(
    pipelineIds?: string[],
    dateRange?: { start: string; end: string }
  ): Promise<PipelineAnalytics[]> {
    const cacheKey = `pipeline_${pipelineIds?.join(',')}_${dateRange?.start}`;
    const cached = this.getFromCache<PipelineAnalytics[]>(cacheKey);
    if (cached) return cached;

    // Would query pipeline_usage table
    const analytics: PipelineAnalytics[] = [];
    
    this.setCache(cacheKey, analytics);
    return analytics;
  }

  async getTopPipelines(
    metric: 'usage' | 'revenue' | 'success_rate',
    limit: number = 10
  ): Promise<PipelineAnalytics[]> {
    const all = await this.getPipelineAnalytics();
    
    return all.sort((a, b) => {
      switch (metric) {
        case 'usage': return b.usageCount - a.usageCount;
        case 'revenue': return b.revenueGenerated - a.revenueGenerated;
        case 'success_rate': return b.successRate - a.successRate;
        default: return 0;
      }
    }).slice(0, limit);
  }

  // ============================================================================
  // A/B TESTING
  // ============================================================================

  async getABTestResults(testId?: string): Promise<ABTestResult[]> {
    const cacheKey = `abtest_${testId || 'all'}`;
    const cached = this.getFromCache<ABTestResult[]>(cacheKey);
    if (cached) return cached;

    // Would query ab_tests table
    const results: ABTestResult[] = [];
    
    this.setCache(cacheKey, results);
    return results;
  }

  async getActiveTests(): Promise<ABTestResult[]> {
    const all = await this.getABTestResults();
    return all.filter(t => t.status === 'running');
  }

  // ============================================================================
  // DASHBOARD WIDGETS
  // ============================================================================

  async getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    // Standard dashboard configurations
    const dashboards: Record<string, DashboardWidget[]> = {
      executive: [
        { id: 'mrr_card', type: 'metric', title: 'Monthly Recurring Revenue', data: null, config: { format: 'currency' } },
        { id: 'growth_card', type: 'metric', title: 'MRR Growth', data: null, config: { format: 'percentage' } },
        { id: 'users_card', type: 'metric', title: 'Active Users', data: null, config: { format: 'number' } },
        { id: 'revenue_chart', type: 'chart', title: 'Revenue Trend', data: null, config: { chartType: 'line' } },
        { id: 'cohort_table', type: 'cohort', title: 'Retention by Cohort', data: null, config: {} },
      ],
      product: [
        { id: 'pipeline_usage', type: 'chart', title: 'Pipeline Usage', data: null, config: { chartType: 'bar' } },
        { id: 'success_rate', type: 'metric', title: 'Generation Success Rate', data: null, config: { format: 'percentage' } },
        { id: 'top_pipelines', type: 'table', title: 'Top Pipelines', data: null, config: {} },
        { id: 'user_funnel', type: 'funnel', title: 'User Journey', data: null, config: {} },
      ],
      growth: [
        { id: 'signups', type: 'metric', title: 'New Signups', data: null, config: { format: 'number' } },
        { id: 'conversion', type: 'metric', title: 'Free→Paid Conversion', data: null, config: { format: 'percentage' } },
        { id: 'ab_tests', type: 'table', title: 'Active A/B Tests', data: null, config: {} },
        { id: 'regional_growth', type: 'chart', title: 'Growth by Region', data: null, config: { chartType: 'pie' } },
      ],
    };

    return dashboards[dashboardId] || [];
  }

  // ============================================================================
  // CACHING
  // ============================================================================

  private getFromCache<T>(key: string): T | null {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.metricsCache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.metricsCache.clear();
  }
}

// Singleton
export const advancedAnalyticsService = new AdvancedAnalyticsService();
