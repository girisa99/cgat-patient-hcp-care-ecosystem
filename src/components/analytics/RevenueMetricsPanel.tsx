/**
 * Revenue Metrics Panel
 * P4 Analytics Suite - MRR/ARR/LTV visualization
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  CreditCard, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdvancedAnalytics, AnalyticsRegion } from '@/hooks/useAdvancedAnalytics';

interface RevenueMetricsPanelProps {
  region?: AnalyticsRegion;
  showTrend?: boolean;
}

export const RevenueMetricsPanel: React.FC<RevenueMetricsPanelProps> = ({
  region = 'global',
  showTrend = true
}) => {
  const { 
    revenue, 
    revenueLoading, 
    mrrTrend, 
    mrrTrendLoading 
  } = useAdvancedAnalytics({ region });

  // Generate mock MRR trend data
  const generateMockTrend = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const baseMRR = 50000 + (11 - i) * 5000;
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        mrr: baseMRR + Math.floor(Math.random() * 10000),
        growth: Math.round((Math.random() * 20 - 5) * 10) / 10
      });
    }
    return months;
  };

  const trendData = mrrTrend || generateMockTrend();

  // Mock revenue data
  const revenueData = revenue || {
    mrr: 125000,
    arr: 1500000,
    mrrGrowth: 12.5,
    churnRate: 2.3,
    ltv: 850,
    arpu: 45,
    arppu: 125,
    totalRevenue: 1250000,
    revenueByTier: {
      free: 0,
      starter: 15000,
      creator: 35000,
      pro: 45000,
      business: 25000,
      enterprise: 5000
    },
    revenueByRegion: {}
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    description?: string;
  }> = ({ title, value, change, icon, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            {change !== undefined && (
              <Badge variant={change >= 0 ? 'default' : 'destructive'} className="gap-1">
                {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(change)}%
              </Badge>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Revenue by tier data
  const tierData = Object.entries(revenueData.revenueByTier).map(([tier, value]) => ({
    tier: tier.charAt(0).toUpperCase() + tier.slice(1),
    revenue: value
  }));

  if (revenueLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-32 bg-muted/50" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(revenueData.mrr)}
          change={revenueData.mrrGrowth}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          description="vs last month"
        />
        <MetricCard
          title="Annual Recurring Revenue"
          value={formatCurrency(revenueData.arr)}
          change={15.2}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          description="Annualized"
        />
        <MetricCard
          title="Lifetime Value"
          value={formatCurrency(revenueData.ltv)}
          change={8.5}
          icon={<Users className="w-5 h-5 text-primary" />}
          description="Avg per customer"
        />
        <MetricCard
          title="Churn Rate"
          value={`${revenueData.churnRate}%`}
          change={-0.3}
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          description="Monthly"
        />
      </div>

      {/* Charts */}
      {showTrend && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRR Trend */}
          <Card>
            <CardHeader>
              <CardTitle>MRR Trend</CardTitle>
              <CardDescription>Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    tickFormatter={(v) => formatCurrency(v)} 
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'MRR']}
                    labelClassName="font-medium"
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#mrrGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Subscription Tier</CardTitle>
              <CardDescription>Distribution across pricing tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => formatCurrency(v)}
                    className="text-xs"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="tier" 
                    className="text-xs"
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">ARPU (Avg Revenue Per User)</p>
            <p className="text-3xl font-bold mt-2">${revenueData.arpu}</p>
            <p className="text-xs text-muted-foreground mt-1">All users including free</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">ARPPU (Paying Users)</p>
            <p className="text-3xl font-bold mt-2">${revenueData.arppu}</p>
            <p className="text-xs text-muted-foreground mt-1">Only paid subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(revenueData.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueMetricsPanel;
