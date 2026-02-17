import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabasePerformanceAnalyzer } from '@/components/DatabasePerformanceAnalyzer';
import { DatabasePerformanceOptimizer } from '@/utils/database/DatabasePerformanceOptimizer';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { Database, Activity, Zap } from 'lucide-react';

const DatabasePerformance = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Database Performance Center</h1>
          <p className="text-muted-foreground">
            Monitor, analyze, and optimize your database performance with real-time insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="monitor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time Monitor
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitor</CardTitle>
              <CardDescription>
                Real-time monitoring of database performance, memory usage, and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Analysis</CardTitle>
              <CardDescription>
                Comprehensive analysis of your database schema, performance, and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabasePerformanceAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimizer</CardTitle>
              <CardDescription>
                Advanced tools and recommendations to optimize your database performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Optimization tools are available in the Analysis tab above
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabasePerformance;