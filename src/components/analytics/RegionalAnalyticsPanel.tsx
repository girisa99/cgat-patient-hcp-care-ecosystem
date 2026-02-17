/**
 * Regional Analytics Panel
 * P4 Analytics Suite - Full regional support including Africa, CJK, SEA, MENA, India
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
  Globe, Users, Languages, Shield, GitBranch, AlertTriangle,
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  useAdvancedAnalytics, 
  AnalyticsRegion, 
  REGIONAL_DISPLAY_NAMES,
  REGIONAL_LANGUAGE_MAP,
  PRIORITY_REGIONS,
  ALL_REGIONS,
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

interface RegionalAnalyticsPanelProps {
  className?: string;
  showAllRegions?: boolean;
}

export const RegionalAnalyticsPanel: React.FC<RegionalAnalyticsPanelProps> = ({ 
  className,
  showAllRegions = true 
}) => {
  const [selectedRegion, setSelectedRegion] = useState<AnalyticsRegion>('global');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

  const {
    revenue,
    revenueLoading,
    regionalBreakdown,
    regionalBreakdownLoading,
    mrrTrend,
    versioning,
    versioningLoading,
    collaboration,
    collaborationLoading,
    recovery,
    recoveryLoading,
    priorityRegions,
    allRegions,
    getRegionDisplayName
  } = useAdvancedAnalytics({ region: selectedRegion });

  // Show all regions or just priority ones
  const displayRegions = showAllRegions ? ALL_REGIONS : PRIORITY_REGIONS;
  const regionalData = regionalBreakdown?.filter(r => 
    displayRegions.includes(r.region)
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
  const pieData = regionalData.map(r => ({
    name: r.displayName,
    value: r.metrics.revenue,
    color: REGION_COLORS[r.region]
  }));

  // Prepare bar chart data for user comparison
  const barData = regionalData.map(r => ({
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
            Performance across MENA, India, CJK, SEA, and Africa markets
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as AnalyticsRegion)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">🌍 Global (All)</SelectItem>
              {ALL_REGIONS.map(region => (
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

      {/* All Regions Cards - Grid layout adjusts based on count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {regionalBreakdownLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-32 bg-muted/30" />
            </Card>
          ))
        ) : (
          regionalData.map((data) => (
            <RegionalCard key={data.region} data={data} />
          ))
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="languages">Language Moats</TabsTrigger>
          <TabsTrigger value="versioning">Versioning</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="recovery">Recovery & Error</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Region</CardTitle>
              <CardDescription>
                Distribution across all global markets
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
                Specialized language support by region - Full coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_REGIONS.map(region => (
                  <div key={region} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: REGION_COLORS[region] }}
                      />
                      <h4 className="font-semibold">{REGIONAL_DISPLAY_NAMES[region]}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {REGIONAL_LANGUAGE_MAP[region].slice(0, 6).map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {REGIONAL_LANGUAGE_MAP[region].length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{REGIONAL_LANGUAGE_MAP[region].length - 6} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {REGIONAL_LANGUAGE_MAP[region].length} languages • 
                      {region === 'mena' && ' 7 Arabic dialects'}
                      {region === 'india' && ' 12 Indian languages'}
                      {region === 'sea' && ' 8 SEA languages'}
                      {region === 'cjk' && ' CJK + variants'}
                      {region === 'africa' && ' 10 African languages'}
                      {region === 'europe' && ' 12 European languages'}
                      {region === 'latin-america' && ' 5 LatAm variants'}
                      {region === 'north-america' && ' EN/ES/FR'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versioning Tab */}
        <TabsContent value="versioning">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Version Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {versioningLoading ? (
                  <div className="h-24 bg-muted/50 animate-pulse rounded" />
                ) : versioning && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Versions</span>
                      <span className="font-bold">{versioning.totalVersions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created (24h)</span>
                      <span className="font-bold text-primary">{versioning.versionsCreated24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per Asset</span>
                      <span className="font-bold">{versioning.avgVersionsPerAsset}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  Rollbacks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {versioning && (
                  <>
                    <div className="text-3xl font-bold">{versioning.rollbacksToday}</div>
                    <p className="text-sm text-muted-foreground">Rollbacks today</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Snapshots</span>
                      <span className="font-bold">{versioning.snapshotsCreated}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Version Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Version Chain Integrity</span>
                      <span>98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sync Success Rate</span>
                      <span>99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaborationLoading ? (
                  <div className="h-16 bg-muted/50 animate-pulse rounded" />
                ) : collaboration && (
                  <div className="text-3xl font-bold">{collaboration.activeCollaborators}</div>
                )}
                <p className="text-sm text-muted-foreground">Active now</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaboration && (
                  <>
                    <div className="text-3xl font-bold text-amber-500">{collaboration.pendingApprovals}</div>
                    <p className="text-sm text-muted-foreground">Awaiting approval</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaboration && (
                  <>
                    <div className="text-3xl font-bold text-green-500">{collaboration.approvedToday}</div>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaboration && (
                  <>
                    <div className="text-3xl font-bold text-destructive">{collaboration.rejectedToday}</div>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          {collaboration && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Approval Time</p>
                    <p className="text-2xl font-bold">{collaboration.avgApprovalTime}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conflicts Resolved</p>
                    <p className="text-2xl font-bold">{collaboration.conflictsResolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recovery & Error Tab */}
        <TabsContent value="recovery">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Circuit Breaker
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recoveryLoading ? (
                  <div className="h-16 bg-muted/50 animate-pulse rounded" />
                ) : recovery && (
                  <>
                    <Badge 
                      variant={
                        recovery.circuitBreakerStatus === 'CLOSED' ? 'default' :
                        recovery.circuitBreakerStatus === 'HALF_OPEN' ? 'secondary' : 'destructive'
                      }
                      className="text-lg px-4 py-2"
                    >
                      {recovery.circuitBreakerStatus}
                    </Badge>
                    {recovery.failedProviders.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">Failed Providers:</p>
                        <div className="flex flex-wrap gap-1">
                          {recovery.failedProviders.map(p => (
                            <Badge key={p} variant="destructive" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Recovery Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recovery && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fallbacks (24h)</span>
                      <span className="font-bold">{recovery.fallbacksTriggered24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-bold text-green-500">{recovery.recoverySuccessRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Recovery Time</span>
                      <span className="font-bold">{recovery.avgRecoveryTime}s</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Errors Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recovery && (
                  <>
                    <div className="text-3xl font-bold">{recovery.errorsToday}</div>
                    <div className="mt-3 space-y-2">
                      {Object.entries(recovery.errorsByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionalAnalyticsPanel;
