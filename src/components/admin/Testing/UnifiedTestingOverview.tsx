
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
  AlertTriangle, 
  Globe,
  Database,
  Activity,
  Info
} from 'lucide-react';
import { TestResult } from '@/services/testingService';

interface UnifiedTestingOverviewProps {
  testingData: any;
  isLoading?: boolean;
  runTestSuite?: (testType: string) => Promise<any>;
  runAllTests?: () => Promise<TestResult[]>;
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
  
  const apiIntegrationTests = testingData.apiIntegrationTests || { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 };

  useEffect(() => {
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
    loadRecentResults();
  }, [getRecentTestResults]);

  const handleRunIntegrationTests = async () => {
    if (!runTestSuite) {
      toast({
        title: "Feature Unavailable",
        description: "Test execution is not available in this context.",
        variant: "destructive",
      });
      return;
    }

    try {
      await runTestSuite('integration');
      // Refresh recent results after test run
      if (getRecentTestResults) {
        const results = await getRecentTestResults();
        setRecentResults(results);
      }
    } catch (error) {
      console.error('Failed to run integration tests:', error);
    }
  };

  const getHealthStatus = () => {
    if (apiIntegrationTests.total === 0) return { status: 'No Tests', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    const passRate = (apiIntegrationTests.passed / apiIntegrationTests.total) * 100;
    
    if (passRate >= 90) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (passRate >= 70) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (passRate >= 50) return { status: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* API Integration Testing Focus Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">API Integration Testing Suite</h3>
          </div>
          <p className="text-blue-700 mb-4">
            This testing suite focuses exclusively on API integration testing. It validates connectivity, 
            authentication, data synchronization, and error handling for APIs in your integration registry.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Info className="h-4 w-4" />
            <span>System functionality testing is handled by separate specialized tools.</span>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{apiIntegrationTests.total}</div>
            <p className="text-xs text-muted-foreground">API integration scenarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{apiIntegrationTests.passed}</div>
            <p className="text-xs text-muted-foreground">Successful integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{apiIntegrationTests.failed}</div>
            <p className="text-xs text-muted-foreground">Integration issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className={`h-4 w-4 ${healthStatus.color}`} />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.status}</div>
            <p className="text-xs text-muted-foreground">{apiIntegrationTests.coverage}% coverage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              API Integration Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedButton 
              onClick={handleRunIntegrationTests} 
              loading={isLoading}
              loadingText="Running Integration Tests..."
              className="w-full"
              disabled={!runTestSuite}
            >
              <Play className="h-4 w-4 mr-2" />
              Run API Integration Tests
            </EnhancedButton>

            {apiIntegrationTests.total > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Overall Pass Rate:</span>
                  <span className="font-medium">
                    {apiIntegrationTests.total > 0 ? ((apiIntegrationTests.passed / apiIntegrationTests.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={apiIntegrationTests.total > 0 ? (apiIntegrationTests.passed / apiIntegrationTests.total) * 100 : 0} 
                  className="h-3" 
                />
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-bold text-green-600">{apiIntegrationTests.passed}</div>
                    <div className="text-muted-foreground">Passed</div>
                  </div>
                  <div>
                    <div className="font-bold text-red-600">{apiIntegrationTests.failed}</div>
                    <div className="text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-600">{apiIntegrationTests.skipped}</div>
                    <div className="text-muted-foreground">Skipped</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent API Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentResults.slice(0, 5).map((result, index) => (
                  <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{result.testName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.executedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        result.status === 'passed' ? 'default' : 
                        result.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {result.status}
                      </Badge>
                      {result.coverage && (
                        <span className="text-xs text-muted-foreground">{result.coverage}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent API integration test results.</p>
                <p className="text-sm">Run tests to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
