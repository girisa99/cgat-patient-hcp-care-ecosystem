import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  action: 'get_overview' | 'get_content_metrics' | 'get_engagement' | 'get_performance' | 'get_trends' | 'export_report' | 'get_realtime';
  date_range?: { start: string; end: string };
  content_type?: string;
  workspace_id?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  export_format?: 'json' | 'csv' | 'pdf';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, date_range, content_type, workspace_id, granularity = 'day', export_format } = await req.json() as AnalyticsRequest;

    console.log(`📊 Analytics Dashboard: ${action}`, { date_range, content_type, granularity });

    const defaultRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };
    const range = date_range || defaultRange;

    switch (action) {
      case 'get_overview': {
        // Aggregate overview metrics
        const [contentStats, userStats, engagementStats] = await Promise.all([
          getContentStats(supabase, range, workspace_id),
          getUserStats(supabase, range, workspace_id),
          getEngagementStats(supabase, range, workspace_id)
        ]);

        return new Response(JSON.stringify({
          success: true,
          overview: {
            content: contentStats,
            users: userStats,
            engagement: engagementStats,
            period: range
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_content_metrics': {
        const { data: videos } = await supabase
          .from('video_presentations')
          .select('id, title, created_at, status')
          .gte('created_at', range.start)
          .lte('created_at', range.end)
          .order('created_at', { ascending: false });

        const { data: scripts } = await supabase
          .from('presentation_scripts')
          .select('id, title, created_at, status')
          .gte('created_at', range.start)
          .lte('created_at', range.end);

        const contentByType = {
          videos: videos?.length || 0,
          scripts: scripts?.length || 0,
          total: (videos?.length || 0) + (scripts?.length || 0)
        };

        const contentByStatus = {
          published: videos?.filter(v => v.status === 'published').length || 0,
          draft: videos?.filter(v => v.status === 'draft').length || 0,
          processing: videos?.filter(v => v.status === 'processing').length || 0
        };

        // Generate time series
        const timeSeries = generateTimeSeries(videos || [], range, granularity);

        return new Response(JSON.stringify({
          success: true,
          metrics: {
            by_type: contentByType,
            by_status: contentByStatus,
            time_series: timeSeries,
            top_content: videos?.slice(0, 10) || []
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_engagement': {
        // Get conversation and interaction metrics
        const { data: conversations } = await supabase
          .from('agent_conversations')
          .select('id, agent_id, created_at, status, conversation_data')
          .gte('created_at', range.start)
          .lte('created_at', range.end);

        const totalConversations = conversations?.length || 0;
        const completedConversations = conversations?.filter(c => c.status === 'completed').length || 0;
        
        // Calculate average messages per conversation
        const avgMessages = (conversations ?? []).reduce((acc, c) => {
          const messages = (c.conversation_data as any)?.messages?.length || 0;
          return acc + messages;
        }, 0) / Math.max(totalConversations, 1);

        const engagementMetrics = {
          total_conversations: totalConversations,
          completed_conversations: completedConversations,
          completion_rate: totalConversations > 0 ? (completedConversations / totalConversations * 100).toFixed(1) : 0,
          avg_messages_per_conversation: avgMessages.toFixed(1),
          conversations_by_agent: groupByAgent(conversations || [])
        };

        return new Response(JSON.stringify({
          success: true,
          engagement: engagementMetrics
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_performance': {
        // System performance metrics
        const { data: actionLogs } = await supabase
          .from('action_execution_logs')
          .select('id, status, duration_ms, started_at, action_id')
          .gte('started_at', range.start)
          .lte('started_at', range.end);

        const totalActions = actionLogs?.length || 0;
        const successfulActions = actionLogs?.filter(a => a.status === 'completed').length || 0;
        const avgDuration = (actionLogs ?? []).reduce((acc, a) => acc + (a.duration_ms || 0), 0) / Math.max(totalActions, 1);

        const performanceMetrics = {
          total_actions: totalActions,
          successful_actions: successfulActions,
          success_rate: totalActions > 0 ? (successfulActions / totalActions * 100).toFixed(1) : 100,
          avg_duration_ms: Math.round(avgDuration),
          actions_by_status: {
            completed: successfulActions,
            failed: actionLogs?.filter(a => a.status === 'failed').length || 0,
            pending: actionLogs?.filter(a => a.status === 'pending').length || 0
          }
        };

        return new Response(JSON.stringify({
          success: true,
          performance: performanceMetrics
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_trends': {
        // Calculate trends compared to previous period
        const periodLength = new Date(range.end).getTime() - new Date(range.start).getTime();
        const previousRange = {
          start: new Date(new Date(range.start).getTime() - periodLength).toISOString(),
          end: range.start
        };

        const [currentStats, previousStats] = await Promise.all([
          getContentStats(supabase, range, workspace_id),
          getContentStats(supabase, previousRange, workspace_id)
        ]);

        const trends = {
          content_growth: calculateGrowth(currentStats.total, previousStats.total),
          video_growth: calculateGrowth(currentStats.videos, previousStats.videos),
          script_growth: calculateGrowth(currentStats.scripts, previousStats.scripts),
          period_comparison: {
            current: currentStats,
            previous: previousStats
          }
        };

        return new Response(JSON.stringify({
          success: true,
          trends
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_realtime': {
        // Get real-time metrics (last 24 hours with hourly breakdown)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: recentContent } = await supabase
          .from('video_presentations')
          .select('id, created_at')
          .gte('created_at', last24Hours);

        const { data: recentConversations } = await supabase
          .from('agent_conversations')
          .select('id, created_at')
          .gte('created_at', last24Hours);

        const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => {
          const hourStart = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
          
          const contentCount = recentContent?.filter(c => {
            const created = new Date(c.created_at);
            return created >= hourStart && created < hourEnd;
          }).length || 0;

          const conversationCount = recentConversations?.filter(c => {
            const created = new Date(c.created_at);
            return created >= hourStart && created < hourEnd;
          }).length || 0;

          return {
            hour: hourStart.toISOString(),
            content: contentCount,
            conversations: conversationCount
          };
        });

        return new Response(JSON.stringify({
          success: true,
          realtime: {
            last_24h_content: recentContent?.length || 0,
            last_24h_conversations: recentConversations?.length || 0,
            hourly_breakdown: hourlyBreakdown,
            updated_at: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'export_report': {
        const [overview, content, engagement] = await Promise.all([
          getContentStats(supabase, range, workspace_id),
          getContentStats(supabase, range, workspace_id),
          getEngagementStats(supabase, range, workspace_id)
        ]);

        const report = {
          generated_at: new Date().toISOString(),
          period: range,
          summary: {
            overview,
            content,
            engagement
          }
        };

        if (export_format === 'csv') {
          const csv = convertToCSV(report);
          return new Response(csv, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename=analytics-report-${new Date().toISOString().split('T')[0]}.csv`
            }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          report,
          download_url: null // Would be storage URL in production
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Analytics Dashboard error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getContentStats(supabase: any, range: { start: string; end: string }, workspaceId?: string) {
  const { data: videos, count: videoCount } = await supabase
    .from('video_presentations')
    .select('id', { count: 'exact' })
    .gte('created_at', range.start)
    .lte('created_at', range.end);

  const { data: scripts, count: scriptCount } = await supabase
    .from('presentation_scripts')
    .select('id', { count: 'exact' })
    .gte('created_at', range.start)
    .lte('created_at', range.end);

  return {
    videos: videoCount || 0,
    scripts: scriptCount || 0,
    total: (videoCount || 0) + (scriptCount || 0)
  };
}

async function getUserStats(supabase: any, range: { start: string; end: string }, workspaceId?: string) {
  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .gte('updated_at', range.start);

  return {
    active_users: activeUsers || 0
  };
}

async function getEngagementStats(supabase: any, range: { start: string; end: string }, workspaceId?: string) {
  const { count: conversations } = await supabase
    .from('agent_conversations')
    .select('id', { count: 'exact' })
    .gte('created_at', range.start)
    .lte('created_at', range.end);

  return {
    total_conversations: conversations || 0
  };
}

function generateTimeSeries(data: any[], range: { start: string; end: string }, granularity: string): any[] {
  const series: Record<string, number> = {};
  
  data.forEach(item => {
    const date = new Date(item.created_at);
    let key: string;
    
    switch (granularity) {
      case 'hour':
        key = date.toISOString().slice(0, 13);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }
    
    series[key] = (series[key] || 0) + 1;
  });

  return Object.entries(series).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

function groupByAgent(conversations: any[]): Record<string, number> {
  return conversations.reduce((acc, c) => {
    acc[c.agent_id] = (acc[c.agent_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateGrowth(current: number, previous: number): { value: number; percentage: string; direction: string } {
  if (previous === 0) {
    return { value: current, percentage: current > 0 ? '+100%' : '0%', direction: 'up' };
  }
  const growth = ((current - previous) / previous) * 100;
  return {
    value: current - previous,
    percentage: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
    direction: growth >= 0 ? 'up' : 'down'
  };
}

function convertToCSV(data: any): string {
  const rows: string[] = ['Metric,Value'];
  rows.push(`Generated At,${data.generated_at}`);
  rows.push(`Period Start,${data.period.start}`);
  rows.push(`Period End,${data.period.end}`);
  rows.push(`Total Videos,${data.summary.overview.videos}`);
  rows.push(`Total Scripts,${data.summary.overview.scripts}`);
  rows.push(`Total Content,${data.summary.overview.total}`);
  rows.push(`Total Conversations,${data.summary.engagement.total_conversations}`);
  return rows.join('\n');
}
