/**
 * DEPLOYMENT ANALYTICS HISTORY
 * Time-series charts for deployment metrics over time.
 * Uses existing genie_deployments table data.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, Calendar, MessageSquare, Zap, Target, BarChart3,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeploymentSnapshot {
  id: string;
  name: string;
  total_conversations: number;
  total_tokens_used: number;
  avg_confidence_score: number;
  created_at: string;
  deployment_status: string;
  is_active: boolean;
}

interface TimeSeriesPoint {
  date: string;
  conversations: number;
  tokens: number;
  confidence: number;
  deployments: number;
}

export const DeploymentAnalyticsHistory: React.FC = () => {
  const [snapshots, setSnapshots] = useState<DeploymentSnapshot[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
      const since = new Date();
      since.setDate(since.getDate() - daysMap[timeRange]);

      const { data, error } = await supabase
        .from('genie_deployments')
        .select('id, name, total_conversations, total_tokens_used, avg_confidence_score, created_at, deployment_status, is_active')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      const deployments = (data || []) as DeploymentSnapshot[];
      setSnapshots(deployments);

      // Build time-series by grouping by date
      const byDate: Record<string, TimeSeriesPoint> = {};
      deployments.forEach(d => {
        const date = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!byDate[date]) {
          byDate[date] = { date, conversations: 0, tokens: 0, confidence: 0, deployments: 0 };
        }
        byDate[date].conversations += d.total_conversations || 0;
        byDate[date].tokens += d.total_tokens_used || 0;
        byDate[date].confidence += d.avg_confidence_score || 0;
        byDate[date].deployments += 1;
      });

      // Normalize confidence to average
      Object.values(byDate).forEach(p => {
        if (p.deployments > 0) p.confidence = Math.round((p.confidence / p.deployments) * 100);
      });

      setTimeSeries(Object.values(byDate));
    } catch (err) {
      console.error('Failed to fetch deployment analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = snapshots.reduce(
    (acc, s) => ({
      conversations: acc.conversations + (s.total_conversations || 0),
      tokens: acc.tokens + (s.total_tokens_used || 0),
      active: acc.active + (s.is_active ? 1 : 0),
    }),
    { conversations: 0, tokens: 0, active: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Deployment Analytics History
        </h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
          <div className="text-xl font-bold">{totals.conversations.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Conversations</div>
        </Card>
        <Card className="p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
          <div className="text-xl font-bold">{totals.tokens.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Tokens</div>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <div className="text-xl font-bold">{snapshots.length}</div>
          <div className="text-xs text-muted-foreground">Deployments</div>
        </Card>
        <Card className="p-3 text-center">
          <Target className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <div className="text-xl font-bold">{totals.active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
      </div>

      {/* Conversations Over Time */}
      {timeSeries.length > 0 ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conversations Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="conversations" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tokens Over Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="tokens" stroke="hsl(40,90%,55%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Over Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Confidence Score (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="confidence" stroke="hsl(160,60%,45%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center text-muted-foreground py-8">
            {loading ? 'Loading analytics...' : 'No deployment data in selected time range.'}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeploymentAnalyticsHistory;
