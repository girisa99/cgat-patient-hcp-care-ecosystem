import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, XCircle, Activity, FileText, Code, Zap } from 'lucide-react';

interface StabilityMetrics {
  duplicates: {
    total: number;
    components: number;
    services: number;
    types: number;
  };
  naming: {
    violations: number;
    warnings: number;
    compliance: number;
  };
  complexity: {
    average: number;
    highest: number;
    violations: number;
  };
  updateFirst: {
    violations: number;
    recommendations: number;
  };
}

interface ViolationItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  file?: string;
  line?: number;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export const StabilityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<StabilityMetrics>({
    duplicates: { total: 0, components: 0, services: 0, types: 0 },
    naming: { violations: 0, warnings: 0, compliance: 100 },
    complexity: { average: 3, highest: 8, violations: 0 },
    updateFirst: { violations: 0, recommendations: 2 }
  });
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastScan, setLastScan] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    startRealTimeMonitoring();
    return () => stopRealTimeMonitoring();
  }, []);

  const startRealTimeMonitoring = () => {
    setIsMonitoring(true);
    
    // Simulate real-time monitoring
    const interval = setInterval(() => {
      performStabilityCheck();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const stopRealTimeMonitoring = () => {
    setIsMonitoring(false);
  };

  const performStabilityCheck = async () => {
    try {
      // Simulate stability check results
      const newMetrics: StabilityMetrics = {
        duplicates: {
          total: Math.floor(Math.random() * 5),
          components: Math.floor(Math.random() * 3),
          services: Math.floor(Math.random() * 2),
          types: Math.floor(Math.random() * 2)
        },
        naming: {
          violations: Math.floor(Math.random() * 3),
          warnings: Math.floor(Math.random() * 5),
          compliance: Math.max(85, 100 - Math.floor(Math.random() * 15))
        },
        complexity: {
          average: 3 + Math.random() * 4,
          highest: 8 + Math.floor(Math.random() * 7),
          violations: Math.floor(Math.random() * 2)
        },
        updateFirst: {
          violations: Math.floor(Math.random() * 2),
          recommendations: Math.floor(Math.random() * 5)
        }
      };

      setMetrics(newMetrics);
      setLastScan(new Date());

      // Generate sample violations
      const newViolations: ViolationItem[] = [];
      
      if (newMetrics.duplicates.total > 0) {
        newViolations.push({
          id: 'dup-1',
          type: 'warning',
          category: 'Duplicates',
          message: `${newMetrics.duplicates.total} duplicate code blocks detected`,
          severity: 'medium',
          timestamp: new Date()
        });
      }

      if (newMetrics.naming.violations > 0) {
        newViolations.push({
          id: 'naming-1',
          type: 'error',
          category: 'Naming',
          message: `${newMetrics.naming.violations} naming convention violations`,
          file: 'src/components/ExampleComponent.tsx',
          line: 15,
          severity: 'high',
          timestamp: new Date()
        });
      }

      if (newMetrics.complexity.violations > 0) {
        newViolations.push({
          id: 'complex-1',
          type: 'warning',
          category: 'Complexity',
          message: `High complexity detected (${newMetrics.complexity.highest} > 10)`,
          file: 'src/services/complexService.ts',
          line: 45,
          severity: 'medium',
          timestamp: new Date()
        });
      }

      setViolations(newViolations);

      // Show toast for new violations
      if (newViolations.length > 0) {
        toast({
          title: "Stability Issues Detected",
          description: `${newViolations.length} new violations found`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Stability check failed:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to perform stability check",
        variant: "destructive"
      });
    }
  };

  const getOverallHealth = () => {
    const totalViolations = metrics.duplicates.total + metrics.naming.violations + metrics.complexity.violations;
    if (totalViolations === 0) return { status: 'excellent', score: 100, color: 'text-green-600' };
    if (totalViolations <= 3) return { status: 'good', score: 85, color: 'text-yellow-600' };
    if (totalViolations <= 6) return { status: 'fair', score: 70, color: 'text-orange-600' };
    return { status: 'poor', score: 50, color: 'text-red-600' };
  };

  const health = getOverallHealth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stability Framework Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of code quality and framework compliance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="gap-1">
            <Activity className="w-3 h-3" />
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Last scan: {lastScan.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Overall Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className={`w-5 h-5 ${health.color}`} />
            Overall Framework Health
          </CardTitle>
          <CardDescription>
            Current stability score: {health.score}% ({health.status})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={health.score} className="w-full" />
          <div className="mt-2 text-sm text-muted-foreground">
            Based on naming compliance, duplicate detection, and complexity metrics
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.duplicates.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.duplicates.components} components, {metrics.duplicates.services} services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Naming Compliance</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.naming.compliance}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.naming.violations} violations, {metrics.naming.warnings} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complexity.average.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Highest: {metrics.complexity.highest}, {metrics.complexity.violations} violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Update First</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.updateFirst.violations}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.updateFirst.recommendations} recommendations pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Violations */}
      <Tabs defaultValue="violations" className="w-full">
        <TabsList>
          <TabsTrigger value="violations">Active Violations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          {violations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">No active violations detected</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            violations.map((violation) => (
              <Alert key={violation.id} variant={violation.type === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {violation.category}
                  <Badge variant={violation.severity === 'high' ? 'destructive' : violation.severity === 'medium' ? 'default' : 'secondary'}>
                    {violation.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {violation.message}
                  {violation.file && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {violation.file}{violation.line && `:${violation.line}`}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    Detected at {violation.timestamp.toLocaleTimeString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Framework Compliance Trends</CardTitle>
              <CardDescription>Historical data and improvement suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Trend analysis coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>Configure stability framework monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time Monitoring</p>
                    <p className="text-sm text-muted-foreground">Continuously scan for violations</p>
                  </div>
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Scan Interval</p>
                    <p className="text-sm text-muted-foreground">How often to check for violations</p>
                  </div>
                  <Badge variant="outline">30 seconds</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};