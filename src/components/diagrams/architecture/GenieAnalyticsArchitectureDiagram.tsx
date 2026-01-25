/**
 * Genie Analytics Architecture Diagram
 * Platform Analytics & Insights Engine
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, TrendingUp, Users, Globe, Zap, Database,
  Download, Maximize2, PieChart, Activity, Target, Clock
} from 'lucide-react';

const analyticsModules = [
  { name: 'Usage Analytics', description: 'Pipeline usage, user activity, sessions', status: 'active', icon: Activity },
  { name: 'Performance Metrics', description: 'Latency, success rates, throughput', status: 'active', icon: Zap },
  { name: 'Content Analytics', description: 'Generation stats, quality scores', status: 'active', icon: BarChart3 },
  { name: 'Regional Insights', description: 'Geographic distribution, language trends', status: 'active', icon: Globe },
  { name: 'Cost Analytics', description: 'Provider costs, credit usage', status: 'active', icon: TrendingUp },
  { name: 'User Behavior', description: 'Funnels, retention, engagement', status: 'beta', icon: Users },
];

const dashboards = [
  { name: 'Executive Overview', metrics: ['Total Users', 'Revenue', 'Growth Rate', 'NPS'] },
  { name: 'Operations', metrics: ['API Latency', 'Error Rate', 'Uptime', 'Queue Depth'] },
  { name: 'Product Usage', metrics: ['Pipeline Usage', 'Feature Adoption', 'Session Length'] },
  { name: 'Financial', metrics: ['Provider Costs', 'Credit Consumption', 'ARPU', 'LTV'] },
];

const dataArchitecture = [
  { layer: 'Collection', components: ['Event Tracking', 'API Logs', 'User Sessions'] },
  { layer: 'Processing', components: ['Real-time Stream', 'Batch ETL', 'Aggregation'] },
  { layer: 'Storage', components: ['PostgreSQL', 'TimescaleDB', 'Redis Cache'] },
  { layer: 'Visualization', components: ['Dashboards', 'Reports', 'Alerts'] },
];

export const GenieAnalyticsArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Genie Analytics
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Insights</Badge>
            </h2>
            <p className="text-slate-400">Platform-Wide Analytics & Business Intelligence</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-rose-400">6</div>
            <div className="text-sm text-slate-400">Analytics Modules</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-pink-400">4</div>
            <div className="text-sm text-slate-400">Dashboards</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-violet-400">Real-time</div>
            <div className="text-sm text-slate-400">Data Processing</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">70%</div>
            <div className="text-sm text-slate-400">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Modules */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="h-5 w-5 text-rose-400" />
            Analytics Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsModules.map((module, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <module.icon className="h-5 w-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{module.name}</span>
                    <Badge className={module.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {module.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">{module.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboards */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-400" />
            Dashboard Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboards.map((dashboard, i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="font-semibold text-white mb-3">{dashboard.name}</div>
                  <div className="space-y-1">
                    {dashboard.metrics.map((metric, j) => (
                      <div key={j} className="text-sm text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                        {metric}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Architecture */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-rose-400" />
            Data Architecture Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {dataArchitecture.map((layer, i) => (
              <div key={i} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="font-semibold text-white mb-3">{layer.layer}</div>
                <div className="space-y-2">
                  {layer.components.map((comp, j) => (
                    <Badge key={j} variant="outline" className="mr-1 mb-1">{comp}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Implementation Progress</span>
            <span className="text-rose-400">70%</span>
          </div>
          <Progress value={70} className="h-2" />
          <div className="mt-2 text-sm text-slate-400">Phase: P2-P3 (Advanced Analytics)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieAnalyticsArchitectureDiagram;
