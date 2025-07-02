
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
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
import { TestResult } from '@/services/testingService';

interface UnifiedTestingOverviewProps {
  testingData: any;
  isLoading?: boolean;
  runTestSuite?: (testType: string) => Promise<any>;
  runAllTests?: () => Promise<any>;
  getRecentTestResults?: () => Promise<TestResult[]>;
}

export const UnifiedTestingOverview: React.FC<UnifiedTestingOverviewProps> = ({ 
  testingData, 
  isLoading = false,
  runTestSuite,
  runAllTests,
  getRecentTestResults
}) => {
  const { toast } = useToast();
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadRecentResults();
  }, [testingData]);

  const loadRecentResults = async () => {
    if (getRecentTestResults) {
      try {
        const results = await getRecentTestResults();
        setRecentResults(results);
      } catch (error) {
        console.error('Failed to load recent results:', error);
      }
    }
  };

  const calculateOverallStats = () => {
    const allSuites = Object.values(testingData) as any[];
    if (allSuites.length === 0) {
      return { total: 0, passed: 0, failed: 0, skipped: 0, passRate: 0, avgCoverage: 0 };
    }

    const totals = allSuites.reduce((acc, suite) => ({
      total: acc.total + (suite.total || 0),
      passed: acc.passed + (suite.passed || 0),
      failed: acc.failed + (suite.failed || 0),
      skipped: acc.skipped + (suite.skipped || 0)
    }), { total: 0, passed: 0, failed: 0, skipped: 0 });

    const passRate = totals.total > 0 ? (totals.passed / totals.total) * 100 : 0;
    const avgCoverage = allSuites.reduce((sum, suite) => sum + (suite.coverage || 0), 0) / allSuites.length;

    return { ...totals, passRate, avgCoverage };
  };

  const stats = calculateOverallStats();

  const handleRunAllTests = async () => {
    if (!runAllTests) return;
    
    try {
      setLoadingResults(true);
      toast({
        title: "Running All Tests",
        description: "Executing all test suites... This may take a few minutes.",
      });
      
      const results = await runAllTests();
      
      toast({
        title: "Tests Completed",
        description: `All test suites completed. ${results.filter((r: any) => r.status === 'passed').length}/${results.length} suites passed.`,
      });
      
      await loadRecentResults();
    } catch (error) {
      toast({
        title: "Test Execution Failed",
        description: "Failed to run test suites. Please check the console for details.",
        variant: "destructive",
      });
      console.error('Test execution failed:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRunSuite = async (testType: string) => {
    if (!runTestSuite) return;
    
    try {
      toast({
        title: `Running ${testType} Tests`,
        description: "Executing test suite...",
      });
      
      const result = await runTestSuite(testType);
      
      toast({
        title: "Tests Completed",
        description: `${testType} tests completed. Status: ${result.status}`,
      });
      
      await loadRecentResults();
    } catch (error) {
      toast({
        title: "Test Execution Failed",
        description: `Failed to run ${testType} tests. Please check the console for details.`,
        variant: "destructive",
      });
      console.error(`${testType} test execution failed:`, error);
    }
  };

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
            <div className="text-2xl font-bold text-orange-600">
              {stats.total > 0 ? Math.round(stats.passRate) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Based on pass rate</p>
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
                    <Badge variant="outline">{suite.total || 0} tests</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">{suite.passed || 0}</span>
                    <span className="text-sm text-red-600">{suite.failed || 0}</span>
                    <span className="text-sm text-yellow-600">{suite.skipped || 0}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pass Rate: {suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : 0}%</span>
                    <span>Coverage: {suite.coverage || 0}%</span>
                  </div>
                  <Progress value={suite.total > 0 ? (suite.passed / suite.total) * 100 : 0} className="h-2" />
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
              <EnhancedButton 
                className="w-full" 
                onClick={handleRunAllTests}
                loading={isLoading || loadingResults}
                loadingText="Running..."
                disabled={!runAllTests}
              >
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </EnhancedButton>
              <EnhancedButton variant="outline" className="w-full" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Tests
              </EnhancedButton>
            </div>
            
            <div className="space-y-3">
              {Object.keys(testingData).map((suiteName) => {
                const testType = suiteName.replace('Tests', '');
                return (
                  <div key={suiteName} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium capitalize">{testType} Tests</span>
                    <EnhancedButton 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRunSuite(testType)}
                      loading={isLoading}
                      disabled={!runTestSuite}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </EnhancedButton>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.slice(0, 5).map((result, index) => (
                <div key={result.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'passed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{result.testName}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.testType} • {result.apiId ? `API: ${result.apiId}` : 'System Test'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                    <span>{result.duration}ms</span>
                    <span>{new Date(result.executedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No test results yet. Run some tests to see results here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
