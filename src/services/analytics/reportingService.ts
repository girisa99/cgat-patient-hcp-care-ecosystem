/**
 * Reporting Service
 * P4-ANA: Exportable reports, scheduled reports, custom dashboards
 * 
 * Scenarios covered:
 * - P4-ANA-24: Exportable Reports (PDF/CSV)
 * - P4-ANA-25: Scheduled Report Emails
 * - P4-ANA-26: Custom Dashboard Builder
 */

export interface ReportConfig {
  reportId: string;
  name: string;
  type: 'summary' | 'detailed' | 'executive' | 'custom';
  sections: ReportSection[];
  dateRange: { start: string; end: string };
  filters?: Record<string, string>;
}

export interface ReportSection {
  sectionId: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text';
  dataSource: string;
  config?: Record<string, unknown>;
}

export interface GeneratedReport {
  reportId: string;
  name: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  size: number;
  downloadUrl: string;
  expiresAt: string;
}

export interface ScheduledReport {
  scheduleId: string;
  reportConfig: ReportConfig;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timeOfDay: string; // HH:MM
  isActive: boolean;
  lastSent?: string;
  nextScheduled: string;
}

export interface CustomDashboard {
  dashboardId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  widgets: DashboardWidget[];
  layout: WidgetLayout[];
}

export interface DashboardWidget {
  widgetId: string;
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'funnel' | 'heatmap' | 'goal_tracker';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  refreshInterval?: number; // seconds
}

export interface WidgetLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReportTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'executive' | 'marketing' | 'product' | 'finance' | 'operations';
  sections: ReportSection[];
  previewImage?: string;
}

class ReportingService {
  // ============================================================================
  // EXPORTABLE REPORTS (P4-ANA-24)
  // ============================================================================

  async generateReport(
    config: ReportConfig,
    format: 'pdf' | 'csv' | 'xlsx' | 'json'
  ): Promise<GeneratedReport> {
    // Simulate report generation
    const reportId = `report_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      reportId,
      name: config.name,
      generatedAt: now.toISOString(),
      format,
      size: Math.floor(50000 + Math.random() * 500000), // bytes
      downloadUrl: `/api/reports/${reportId}.${format}`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    return [
      {
        templateId: 'exec_summary',
        name: 'Executive Summary',
        description: 'High-level overview of key business metrics',
        category: 'executive',
        sections: [
          { sectionId: 's1', title: 'Revenue Overview', type: 'metrics', dataSource: 'revenue' },
          { sectionId: 's2', title: 'User Growth', type: 'chart', dataSource: 'users' },
          { sectionId: 's3', title: 'Key Highlights', type: 'text', dataSource: 'highlights' },
        ],
      },
      {
        templateId: 'marketing_performance',
        name: 'Marketing Performance',
        description: 'Campaign metrics and conversion analysis',
        category: 'marketing',
        sections: [
          { sectionId: 's1', title: 'Campaign Metrics', type: 'table', dataSource: 'campaigns' },
          { sectionId: 's2', title: 'Conversion Funnel', type: 'chart', dataSource: 'funnel' },
          { sectionId: 's3', title: 'Attribution', type: 'chart', dataSource: 'attribution' },
        ],
      },
      {
        templateId: 'product_usage',
        name: 'Product Usage Report',
        description: 'Feature adoption and usage patterns',
        category: 'product',
        sections: [
          { sectionId: 's1', title: 'Feature Usage', type: 'table', dataSource: 'features' },
          { sectionId: 's2', title: 'User Journeys', type: 'chart', dataSource: 'journeys' },
          { sectionId: 's3', title: 'Quality Metrics', type: 'metrics', dataSource: 'quality' },
        ],
      },
      {
        templateId: 'financial_monthly',
        name: 'Monthly Financial Report',
        description: 'Revenue, costs, and profitability analysis',
        category: 'finance',
        sections: [
          { sectionId: 's1', title: 'Revenue Breakdown', type: 'chart', dataSource: 'revenue' },
          { sectionId: 's2', title: 'Provider Costs', type: 'table', dataSource: 'costs' },
          { sectionId: 's3', title: 'Margin Analysis', type: 'metrics', dataSource: 'margins' },
        ],
      },
    ];
  }

  async getGeneratedReports(limit: number = 10): Promise<GeneratedReport[]> {
    const reports: GeneratedReport[] = [];
    const formats: Array<'pdf' | 'csv' | 'xlsx' | 'json'> = ['pdf', 'csv', 'xlsx', 'json'];

    for (let i = 0; i < limit; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const generatedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const format = formats[Math.floor(Math.random() * formats.length)];

      reports.push({
        reportId: `report_${i}`,
        name: `Analytics Report ${i + 1}`,
        generatedAt: generatedAt.toISOString(),
        format,
        size: Math.floor(50000 + Math.random() * 500000),
        downloadUrl: `/api/reports/report_${i}.${format}`,
        expiresAt: new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  // ============================================================================
  // SCHEDULED REPORTS (P4-ANA-25)
  // ============================================================================

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const now = new Date();
    return [
      {
        scheduleId: 'sched_1',
        reportConfig: {
          reportId: 'r1',
          name: 'Weekly Executive Summary',
          type: 'executive',
          sections: [],
          dateRange: { start: '', end: '' },
        },
        frequency: 'weekly',
        recipients: ['exec@company.com', 'ceo@company.com'],
        dayOfWeek: 1, // Monday
        timeOfDay: '08:00',
        isActive: true,
        lastSent: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        scheduleId: 'sched_2',
        reportConfig: {
          reportId: 'r2',
          name: 'Daily Operations Report',
          type: 'detailed',
          sections: [],
          dateRange: { start: '', end: '' },
        },
        frequency: 'daily',
        recipients: ['ops@company.com'],
        timeOfDay: '06:00',
        isActive: true,
        lastSent: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        scheduleId: 'sched_3',
        reportConfig: {
          reportId: 'r3',
          name: 'Monthly Financial Report',
          type: 'summary',
          sections: [],
          dateRange: { start: '', end: '' },
        },
        frequency: 'monthly',
        recipients: ['finance@company.com', 'cfo@company.com'],
        dayOfMonth: 1,
        timeOfDay: '09:00',
        isActive: true,
        lastSent: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
        nextScheduled: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      },
    ];
  }

  async createScheduledReport(schedule: Omit<ScheduledReport, 'scheduleId' | 'lastSent' | 'nextScheduled'>): Promise<ScheduledReport> {
    const scheduleId = `sched_${Date.now()}`;
    const now = new Date();
    let nextScheduled: Date;

    switch (schedule.frequency) {
      case 'daily':
        nextScheduled = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextScheduled = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextScheduled = new Date(now.getFullYear(), now.getMonth() + 1, schedule.dayOfMonth || 1);
        break;
      default:
        nextScheduled = now;
    }

    return {
      ...schedule,
      scheduleId,
      nextScheduled: nextScheduled.toISOString(),
    };
  }

  async updateScheduledReport(scheduleId: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const schedules = await this.getScheduledReports();
    const schedule = schedules.find(s => s.scheduleId === scheduleId);
    if (!schedule) throw new Error('Schedule not found');
    return { ...schedule, ...updates };
  }

  async deleteScheduledReport(scheduleId: string): Promise<void> {
    // Would delete from database
    console.log(`Deleted schedule: ${scheduleId}`);
  }

  // ============================================================================
  // CUSTOM DASHBOARDS (P4-ANA-26)
  // ============================================================================

  async getCustomDashboards(): Promise<CustomDashboard[]> {
    return [
      {
        dashboardId: 'dash_1',
        name: 'My Analytics Overview',
        description: 'Personal overview of key metrics',
        createdBy: 'user_1',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-28T14:30:00Z',
        isPublic: false,
        widgets: [
          { widgetId: 'w1', type: 'metric_card', title: 'Total Users', dataSource: 'users.total', config: {} },
          { widgetId: 'w2', type: 'line_chart', title: 'Revenue Trend', dataSource: 'revenue.trend', config: { period: '30d' } },
          { widgetId: 'w3', type: 'pie_chart', title: 'Tier Distribution', dataSource: 'users.byTier', config: {} },
        ],
        layout: [
          { widgetId: 'w1', x: 0, y: 0, width: 4, height: 2 },
          { widgetId: 'w2', x: 4, y: 0, width: 8, height: 4 },
          { widgetId: 'w3', x: 0, y: 2, width: 4, height: 4 },
        ],
      },
      {
        dashboardId: 'dash_2',
        name: 'Team Performance',
        description: 'Shared dashboard for team metrics',
        createdBy: 'user_1',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: '2026-01-27T16:00:00Z',
        isPublic: true,
        widgets: [
          { widgetId: 'w1', type: 'funnel', title: 'Conversion Funnel', dataSource: 'funnel.signup', config: {} },
          { widgetId: 'w2', type: 'table', title: 'Top Pipelines', dataSource: 'pipelines.top10', config: {} },
          { widgetId: 'w3', type: 'goal_tracker', title: 'Q1 Goals', dataSource: 'goals.q1', config: {} },
        ],
        layout: [
          { widgetId: 'w1', x: 0, y: 0, width: 6, height: 4 },
          { widgetId: 'w2', x: 6, y: 0, width: 6, height: 4 },
          { widgetId: 'w3', x: 0, y: 4, width: 12, height: 3 },
        ],
      },
    ];
  }

  async createDashboard(dashboard: Omit<CustomDashboard, 'dashboardId' | 'createdAt' | 'updatedAt'>): Promise<CustomDashboard> {
    const now = new Date().toISOString();
    return {
      ...dashboard,
      dashboardId: `dash_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateDashboard(dashboardId: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> {
    const dashboards = await this.getCustomDashboards();
    const dashboard = dashboards.find(d => d.dashboardId === dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');
    return {
      ...dashboard,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    console.log(`Deleted dashboard: ${dashboardId}`);
  }

  async addWidgetToDashboard(dashboardId: string, widget: DashboardWidget, layout: WidgetLayout): Promise<CustomDashboard> {
    const dashboards = await this.getCustomDashboards();
    const dashboard = dashboards.find(d => d.dashboardId === dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    return {
      ...dashboard,
      widgets: [...dashboard.widgets, widget],
      layout: [...dashboard.layout, layout],
      updatedAt: new Date().toISOString(),
    };
  }

  async removeWidgetFromDashboard(dashboardId: string, widgetId: string): Promise<CustomDashboard> {
    const dashboards = await this.getCustomDashboards();
    const dashboard = dashboards.find(d => d.dashboardId === dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    return {
      ...dashboard,
      widgets: dashboard.widgets.filter(w => w.widgetId !== widgetId),
      layout: dashboard.layout.filter(l => l.widgetId !== widgetId),
      updatedAt: new Date().toISOString(),
    };
  }

  getAvailableWidgetTypes(): { type: DashboardWidget['type']; name: string; description: string }[] {
    return [
      { type: 'metric_card', name: 'Metric Card', description: 'Display a single key metric with trend' },
      { type: 'line_chart', name: 'Line Chart', description: 'Show trends over time' },
      { type: 'bar_chart', name: 'Bar Chart', description: 'Compare categories or periods' },
      { type: 'pie_chart', name: 'Pie Chart', description: 'Show distribution breakdown' },
      { type: 'table', name: 'Data Table', description: 'Display tabular data' },
      { type: 'funnel', name: 'Funnel Chart', description: 'Visualize conversion funnels' },
      { type: 'heatmap', name: 'Heatmap', description: 'Show density patterns' },
      { type: 'goal_tracker', name: 'Goal Tracker', description: 'Track progress toward goals' },
    ];
  }
}

export const reportingService = new ReportingService();
