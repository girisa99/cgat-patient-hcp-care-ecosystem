/**
 * Regional Analytics Panel
 * P4 Analytics Suite - Regional Support for Arabic, India, and Asian markets
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Globe, TrendingUp, TrendingDown, Users, DollarSign, 
  Languages, MapPin, Activity 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  useAdvancedAnalytics, 
  AnalyticsRegion, 
  REGIONAL_DISPLAY_NAMES,
  REGIONAL_LANGUAGE_MAP,
  RegionalMetrics
} from '@/hooks/useAdvancedAnalytics';

// Regional colors for charts
const REGION_COLORS: Record<AnalyticsRegion, string> = {
  global: '#6366f1',
  mena: '#10b981',
  india: '#f59e0b',
  sea: '#06b6d4',
  cjk: '#ef4444',
  'north-america': '#3b82f6',
  europe: '#8b5cf6',
  'latin-america': '#ec4899',
  africa: '#14b8a6'
};

// Priority regions for this integration
const PRIORITY_REGIONS: AnalyticsRegion[] = ['mena', 'india', 'sea', 'cjk'];

interface RegionalAnalyticsPanelProps {
  className?: string;
}

export const RegionalAnalyticsPanel: React.FC<RegionalAnalyticsPanelProps> = ({ className }) => {
  const [selectedRegion, setSelectedRegion] = useState<AnalyticsRegion>('global');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

  const {
    revenue,
    revenueLoading,
    regionalBreakdown,
    regionalBreakdownLoading,
    mrrTrend,
    currentRegion,
    getRegionDisplayName
  } = useAdvancedAnalytics({ region: selectedRegion });

  // Filter to priority regions (Arabic, India, Asian)
  const priorityRegionalData = regionalBreakdown?.filter(r => 
    PRIORITY_REGIONS.includes(r.region)
  ) || [];

  // Format currency for different regions
  const formatCurrency = (amount: number, region: AnalyticsRegion): string => {
    const currencyMap: Record<AnalyticsRegion, string> = {
      global: 'USD',
      mena: 'AED',
      india: 'INR',
      sea: 'SGD',
      cjk: 'CNY',
      'north-america': 'USD',
      europe: 'EUR',
      'latin-america': 'BRL',
      africa: 'ZAR'
    };
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyMap[region] || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const RegionalCard: React.FC<{ data: RegionalMetrics }> = ({ data }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: REGION_COLORS[data.region] }}
              />
              <CardTitle className="text-lg">{data.displayName}</CardTitle>
            </div>
            <Badge variant={data.metrics.growth >= 0 ? 'default' : 'destructive'}>
              {data.metrics.growth >= 0 ? '+' : ''}{data.metrics.growth}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Languages className="w-3 h-3" />
            {data.languages.length} languages supported
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold">{data.metrics.activeUsers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(data.metrics.revenue, data.region)}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Conversion Rate</span>
              <span>{data.metrics.conversionRate}%</span>
            </div>
            <Progress value={data.metrics.conversionRate * 6.67} className="h-2" />
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-2">Top Pipelines</p>
            <div className="flex flex-wrap gap-1">
              {data.metrics.topPipelines.map((pipeline, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {pipeline}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Prepare pie chart data
  const pieData = priorityRegionalData.map(r => ({
    name: r.displayName,
    value: r.metrics.revenue,
    color: REGION_COLORS[r.region]
  }));

  // Prepare bar chart data for user comparison
  const barData = priorityRegionalData.map(r => ({
    region: r.displayName,
    users: r.metrics.activeUsers,
    conversion: r.metrics.conversionRate,
    fill: REGION_COLORS[r.region]
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Regional Analytics
          </h2>
          <p className="text-muted-foreground">
            Performance across Arabic, India, and Asian markets
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as AnalyticsRegion)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global (All)</SelectItem>
              {PRIORITY_REGIONS.map(region => (
                <SelectItem key={region} value={region}>
                  {REGIONAL_DISPLAY_NAMES[region]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-1">
            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
              <Badge
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Regions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalBreakdownLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-32 bg-muted/30" />
            </Card>
          ))
        ) : (
          priorityRegionalData.map((data) => (
            <RegionalCard key={data.region} data={data} />
          ))
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Distribution</TabsTrigger>
          <TabsTrigger value="users">User Comparison</TabsTrigger>
          <TabsTrigger value="languages">Language Moats</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Priority Region</CardTitle>
              <CardDescription>
                Distribution across Arabic, India, and Asian markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => `${name}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, 'global')}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Comparison</CardTitle>
              <CardDescription>
                Active users and conversion rates by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="users" 
                    name="Active Users"
                    radius={[4, 4, 0, 0]}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversion" 
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Conversion %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Language Moat Analytics</CardTitle>
              <CardDescription>
                Specialized language support by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PRIORITY_REGIONS.map(region => (
                  <div key={region} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: REGION_COLORS[region] }}
                      />
                      <h4 className="font-semibold">{REGIONAL_DISPLAY_NAMES[region]}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {REGIONAL_LANGUAGE_MAP[region].map((lang, idx) => (
                        <Badge key={idx} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {REGIONAL_LANGUAGE_MAP[region].length} languages • 
                      {region === 'mena' && ' 7 Arabic dialects supported'}
                      {region === 'india' && ' 10 Indian languages supported'}
                      {region === 'sea' && ' 6 SEA languages supported'}
                      {region === 'cjk' && ' CJK + variants supported'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionalAnalyticsPanel;
