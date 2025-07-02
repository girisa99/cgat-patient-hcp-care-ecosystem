
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  FileText,
  Download,
  Target,
  TrendingUp
} from 'lucide-react';
import { TestResult } from '@/services/testingService';
import { testResultsAnalyzer, ComprehensiveTestReport } from '@/services/testResultsAnalyzer';

interface TestResultsDashboardProps {
  testResults: TestResult[];
  isLoading?: boolean;
}

export const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({ 
  testResults, 
  isLoading = false 
}) => {
  const [report, setReport] = useState<ComprehensiveTestReport | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string>('all');

  useEffect(() => {
    if (testResults.length > 0) {
      const analysisReport = testResultsAnalyzer.analyzeTestResults(testResults);
      setReport(analysisReport);
    }
  }, [testResults]);

  const downloadReport = () => {
    if (!report) return;
    
    const reportText = testResultsAnalyzer.getDetailedTestReport(testResults);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Analyzing test results...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No test results to analyze. Run some tests first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {report.overallSummary.totalExecutions}
            </div>
            <p className="text-xs text-muted-foreground">Executed in last run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {report.overallSummary.overallPassRate.toFixed(1)}%
            </div>
            <Progress value={report.overallSummary.overallPassRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(report.overallSummary.totalDuration / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">Total execution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(report.overallSummary.systemHealth)}`}>
              {report.overallSummary.systemHealth.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">Based on test results</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="suites">Test Suites</TabsTrigger>
            <TabsTrigger value="failures">Failed Tests</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <EnhancedButton onClick={downloadReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </EnhancedButton>
        </div>

        <TabsContent value="suites">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.suiteReports.map((suite, index) => (
              <Card key={suite.suiteType}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{suite.suiteType} Tests</span>
                    <Badge variant="outline">{suite.totalTests} tests</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{suite.passedTests}</div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{suite.failedTests}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{suite.skippedTests}</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate:</span>
                      <span className="font-medium">
                        {suite.totalTests > 0 ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={suite.totalTests > 0 ? (suite.passedTests / suite.totalTests) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg Duration:</span>
                      <div className="font-medium">{suite.avgDuration.toFixed(0)}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Coverage:</span>
                      <div className="font-medium">{suite.avgCoverage.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Failed Functionalities - Manual Testing Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.failedFunctionalities.length > 0 ? (
                <div className="space-y-4">
                  {report.failedFunctionalities.map((failure, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{failure.functionality}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getImpactColor(failure.impact)}>{failure.impact}</Badge>
                          <Badge variant="outline">{failure.testType}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-red-600">{failure.errorMessage}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Recommended Action:</strong> {failure.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-green-600 font-medium">All tests passed! No manual testing required.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-green-600 font-medium">All good! No recommendations at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
