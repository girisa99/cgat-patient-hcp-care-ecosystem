
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Shield,
  Zap,
  Target,
  GitBranch
} from 'lucide-react';

interface UnifiedTestingOverviewProps {
  testingData: any;
}

export const UnifiedTestingOverview: React.FC<UnifiedTestingOverviewProps> = ({ testingData }) => {
  const calculateOverallStats = () => {
    const allSuites = Object.values(testingData) as any[];
    const totals = allSuites.reduce((acc, suite) => ({
      total: acc.total + suite.total,
      passed: acc.passed + suite.passed,
      failed: acc.failed + suite.failed,
      skipped: acc.skipped + suite.skipped
    }), { total: 0, passed: 0, failed: 0, skipped: 0 });

    const passRate = (totals.passed / totals.total) * 100;
    const avgCoverage = allSuites.reduce((sum, suite) => sum + suite.coverage, 0) / allSuites.length;

    return { ...totals, passRate, avgCoverage };
  };

  const stats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all test suites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.passed.toLocaleString()} tests passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgCoverage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across suites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">94.2</div>
            <p className="text-xs text-muted-foreground">Stability index</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Suite Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Test Suite Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(testingData).map(([suiteName, suite]: [string, any]) => (
              <div key={suiteName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{suiteName.replace('Tests', ' Tests')}</span>
                    <Badge variant="outline">{suite.total} tests</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">{suite.passed}</span>
                    <span className="text-sm text-red-600">{suite.failed}</span>
                    <span className="text-sm text-yellow-600">{suite.skipped}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pass Rate: {((suite.passed / suite.total) * 100).toFixed(1)}%</span>
                    <span>Coverage: {suite.coverage}%</span>
                  </div>
                  <Progress value={(suite.passed / suite.total) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
              <Button variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Tests
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Unit Tests</span>
                <Button size="sm" variant="ghost">
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Integration Tests</span>
                <Button size="sm" variant="ghost">
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">E2E Tests</span>
                <Button size="sm" variant="ghost">
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Execution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { suite: 'Unit Tests', status: 'passed', duration: '2m 34s', timestamp: '5 minutes ago' },
              { suite: 'Integration Tests', status: 'passed', duration: '4m 12s', timestamp: '12 minutes ago' },
              { suite: 'E2E Tests', status: 'failed', duration: '8m 45s', timestamp: '23 minutes ago' },
              { suite: 'Regression Tests', status: 'passed', duration: '6m 18s', timestamp: '35 minutes ago' },
              { suite: 'System Tests', status: 'passed', duration: '3m 52s', timestamp: '48 minutes ago' }
            ].map((execution, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {execution.status === 'passed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{execution.suite}</span>
                  <Badge variant={execution.status === 'passed' ? 'default' : 'destructive'}>
                    {execution.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{execution.duration}</span>
                  <span>{execution.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
