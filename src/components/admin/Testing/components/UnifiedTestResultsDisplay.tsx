
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult } from '@/services/testingService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface UnifiedTestResultsDisplayProps {
  testResults: TestResult[];
  isLoading?: boolean;
  title?: string;
  showTrends?: boolean;
}

export const UnifiedTestResultsDisplay: React.FC<UnifiedTestResultsDisplayProps> = ({
  testResults,
  isLoading = false,
  title = "Test Results",
  showTrends = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'skipped': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return CheckCircle;
      case 'failed': return XCircle;
      case 'skipped': return AlertTriangle;
      default: return Clock;
    }
  };

  const calculateMetrics = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const skipped = testResults.filter(r => r.status === 'skipped').length;
    const avgCoverage = total > 0 ? 
      testResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / total : 0;

    return { total, passed, failed, skipped, avgCoverage };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 animate-spin" />
            Loading {title}...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      {showTrends && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Total Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">Test executions</p>
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
              <div className="text-2xl font-bold text-green-600">
                {metrics.total > 0 ? ((metrics.passed / metrics.total) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{metrics.passed} passed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Failures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failed}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Avg Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.avgCoverage)}%</div>
              <p className="text-xs text-muted-foreground">Code coverage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No test results found. Run some tests to see results here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => {
                const StatusIcon = getStatusIcon(result.status);
                return (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(result.status)}`} />
                        <div>
                          <h4 className="font-medium">{result.testName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.testType} • {new Date(result.executedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          result.status === 'passed' ? 'default' :
                          result.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {result.status}
                        </Badge>
                        {result.coverage !== undefined && (
                          <Badge variant="outline">{result.coverage}% coverage</Badge>
                        )}
                      </div>
                    </div>
                    
                    {result.coverage !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Coverage</span>
                          <span>{result.coverage}%</span>
                        </div>
                        <Progress value={result.coverage} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Duration: {result.duration}ms</span>
                      {result.errorMessage && (
                        <span className="text-red-600 truncate max-w-md">
                          Error: {result.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
