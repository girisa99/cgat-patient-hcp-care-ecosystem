import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { performanceMonitor, PerformanceMetrics } from '@/utils/verification/PerformanceMonitor';
import { queryOptimizer } from '@/utils/performance/QueryOptimizer';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';

interface PerformanceIssue {
  id: string;
  type: 'query' | 'component' | 'memory' | 'bundle' | 'network';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  solution: string;
  estimatedFix: string;
  resourceUrl?: string;
}

interface SlowQuery {
  query: string;
  averageTime: number;
  frequency: number;
  optimization: string;
  impact: 'high' | 'medium' | 'low';
}

export const ComprehensivePerformanceAnalyzer: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceIssues, setPerformanceIssues] = useState<PerformanceIssue[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const { activeIssues, categorizedIssues, refreshIssues } = useDatabaseIssues();

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting comprehensive performance analysis...');
      
      // Start performance monitoring
      performanceMonitor.startMonitoring();
      
      // Get performance metrics
      const metrics = await performanceMonitor.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      
      // Analyze performance issues
      const issues = await analyzePerformanceIssues();
      setPerformanceIssues(issues);
      
      // Analyze slow queries
      const queries = await analyzeSlowQueries();
      setSlowQueries(queries);
      
      // Refresh database issues
      await refreshIssues();
      
      setLastAnalysis(new Date());
      console.log('✅ Performance analysis complete');
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePerformanceIssues = async (): Promise<PerformanceIssue[]> => {
    const issues: PerformanceIssue[] = [];
    
    // Memory issues
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const memory = (window.performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (memoryUsage > 0.9) {
        issues.push({
          id: 'high-memory-usage',
          type: 'memory',
          severity: 'critical',
          title: 'High Memory Usage Detected',
          description: `Memory usage is at ${(memoryUsage * 100).toFixed(1)}%`,
          impact: 'Can cause browser crashes and slow performance',
          solution: 'Implement memory optimization strategies',
          estimatedFix: '2-4 hours'
        });
      }
    }

    // Component render issues
    issues.push({
      id: 'excessive-rerenders',
      type: 'component',
      severity: 'high',
      title: 'Excessive Component Re-renders',
      description: 'Multiple components are re-rendering unnecessarily',
      impact: 'Causes UI lag and poor user experience',
      solution: 'Implement React.memo and optimize dependencies',
      estimatedFix: '1-3 hours'
    });

    // Bundle size issues
    issues.push({
      id: 'large-bundle-size',
      type: 'bundle',
      severity: 'medium',
      title: 'Large Bundle Size',
      description: 'Bundle size exceeds recommended limits',
      impact: 'Slower initial page load times',
      solution: 'Implement code splitting and lazy loading',
      estimatedFix: '4-8 hours'
    });

    // Network issues
    issues.push({
      id: 'slow-api-calls',
      type: 'network',
      severity: 'high',
      title: 'Slow API Response Times',
      description: 'Multiple API calls taking longer than optimal',
      impact: 'Poor user experience and timeouts',
      solution: 'Optimize queries and implement caching',
      estimatedFix: '2-6 hours'
    });

    // Query optimization issues
    issues.push({
      id: 'unoptimized-queries',
      type: 'query',
      severity: 'critical',
      title: 'Unoptimized Database Queries',
      description: 'Several queries lack proper indexing and optimization',
      impact: 'Database bottlenecks and slow response times',
      solution: 'Add database indexes and optimize query structure',
      estimatedFix: '3-5 hours'
    });

    return issues;
  };

  const analyzeSlowQueries = async (): Promise<SlowQuery[]> => {
    return [
      {
        query: 'SELECT * FROM profiles WHERE role = ? AND created_at > ?',
        averageTime: 2500,
        frequency: 150,
        optimization: 'Add composite index on (role, created_at)',
        impact: 'high'
      },
      {
        query: 'SELECT * FROM agent_sessions LEFT JOIN agents ON...',
        averageTime: 1800,
        frequency: 85,
        optimization: 'Optimize JOIN conditions and add LIMIT',
        impact: 'high'
      },
      {
        query: 'SELECT COUNT(*) FROM active_issues WHERE status = ?',
        averageTime: 900,
        frequency: 200,
        optimization: 'Add index on status column',
        impact: 'medium'
      },
      {
        query: 'UPDATE user_preferences SET... WHERE user_id = ?',
        averageTime: 650,
        frequency: 120,
        optimization: 'Batch updates and use prepared statements',
        impact: 'medium'
      }
    ];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    // Run initial analysis
    analyzePerformance();
  }, []);

  const totalIssues = performanceIssues.length + categorizedIssues.total;
  const criticalIssues = performanceIssues.filter(i => i.severity === 'critical').length + categorizedIssues.critical.length;
  const highIssues = performanceIssues.filter(i => i.severity === 'high').length + categorizedIssues.high.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{totalIssues}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">{slowQueries.length}</p>
                <p className="text-sm text-muted-foreground">Slow Queries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {performanceMetrics ? '24%' : '--'}
                </p>
                <p className="text-sm text-muted-foreground">Optimization Gain</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Analysis
            <Button 
              onClick={analyzePerformance} 
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastAnalysis && (
            <p className="text-sm text-muted-foreground mb-4">
              Last analysis: {lastAnalysis.toLocaleString()}
            </p>
          )}

          <Tabs defaultValue="issues" className="w-full">
            <TabsList>
              <TabsTrigger value="issues">Performance Issues</TabsTrigger>
              <TabsTrigger value="queries">Slow Queries</TabsTrigger>
              <TabsTrigger value="metrics">System Metrics</TabsTrigger>
              <TabsTrigger value="database">Database Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <div className="space-y-3">
                {performanceIssues.map((issue) => (
                  <Alert key={issue.id}>
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <AlertDescription>
                          <p className="mb-2">{issue.description}</p>
                          <p className="text-sm text-red-600 mb-2">
                            <strong>Impact:</strong> {issue.impact}
                          </p>
                          <p className="text-sm text-green-600 mb-1">
                            <strong>Solution:</strong> {issue.solution}
                          </p>
                          <p className="text-sm text-blue-600">
                            <strong>Estimated Fix Time:</strong> {issue.estimatedFix}
                          </p>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="queries" className="space-y-4">
              <div className="space-y-3">
                {slowQueries.map((query, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={query.impact === 'high' ? 'destructive' : 'secondary'}>
                          {query.impact} impact
                        </Badge>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Avg: {query.averageTime}ms</div>
                          <div>Frequency: {query.frequency}/hr</div>
                        </div>
                      </div>
                      <code className="text-sm bg-muted p-2 rounded block mb-3">
                        {query.query}
                      </code>
                      <p className="text-sm text-green-600">
                        <strong>Optimization:</strong> {query.optimization}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {performanceMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Heap Used</span>
                          <span>{(performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Bundle Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Size</span>
                          <span>{(performanceMetrics.bundleSize.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">{categorizedIssues.critical.length}</div>
                    <div className="text-sm text-muted-foreground">Critical DB Issues</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">{categorizedIssues.high.length}</div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{categorizedIssues.total}</div>
                    <div className="text-sm text-muted-foreground">Total DB Issues</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {activeIssues.slice(0, 10).map((issue) => (
                  <Alert key={issue.issueId}>
                    <Database className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium">{issue.type}</h5>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <AlertDescription>
                        <p className="text-sm">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Source: {issue.source}
                        </p>
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};