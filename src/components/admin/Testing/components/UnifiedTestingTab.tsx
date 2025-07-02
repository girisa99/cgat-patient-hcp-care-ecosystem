
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  FileText,
  Cpu,
  Target,
  Shield,
  Database,
  TestTube
} from 'lucide-react';

interface TestMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
}

interface UnifiedTestingTabProps {
  title: string;
  description: string;
  testType: string;
  icon: React.ComponentType<{ className?: string }>;
  testMetrics: TestMetrics;
  runTestSuite?: (testType: string) => Promise<any>;
  isLoading?: boolean;
  additionalActions?: React.ReactNode;
  customContent?: React.ReactNode;
  showCategories?: boolean;
  categories?: Array<{
    name: string;
    count: number;
    status: 'passed' | 'failed' | 'pending';
  }>;
}

export const UnifiedTestingTab: React.FC<UnifiedTestingTabProps> = ({
  title,
  description,
  testType,
  icon: Icon,
  testMetrics,
  runTestSuite,
  isLoading = false,
  additionalActions,
  customContent,
  showCategories = false,
  categories = []
}) => {
  const { toast } = useToast();

  const handleRunTests = async () => {
    if (!runTestSuite) {
      toast({
        title: "Feature Unavailable",
        description: "Test execution is not available in this context.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: `Running ${title}`,
        description: `Executing ${testType} test suite...`,
      });
      
      const result = await runTestSuite(testType);
      
      toast({
        title: `${title} Completed`,
        description: `Status: ${result.status}. Coverage: ${result.coverage}%`,
      });
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
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-blue-900">{title}</h3>
              <p className="text-blue-700">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{testMetrics.total}</div>
            <p className="text-xs text-muted-foreground">Test cases</p>
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
            <div className="text-2xl font-bold text-green-600">{testMetrics.passed}</div>
            <p className="text-xs text-muted-foreground">
              {testMetrics.total > 0 ? ((testMetrics.passed / testMetrics.total) * 100).toFixed(1) : 0}% success rate
            </p>
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
            <div className="text-2xl font-bold text-red-600">{testMetrics.failed}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{testMetrics.coverage}%</div>
            <p className="text-xs text-muted-foreground">Code coverage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Test Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <EnhancedButton 
                onClick={handleRunTests} 
                loading={isLoading}
                loadingText="Running Tests..."
                className="flex-1"
                disabled={!runTestSuite}
              >
                <Play className="h-4 w-4 mr-2" />
                Run All {title}
              </EnhancedButton>
              {additionalActions}
            </div>

            <div className="space-y-3">
              {testMetrics.total > 0 ? (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">All {title}</span>
                    <Badge variant="default">{testMetrics.total} tests</Badge>
                  </div>
                  <Progress value={testMetrics.total > 0 ? (testMetrics.passed / testMetrics.total) * 100 : 0} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{testMetrics.passed} passed, {testMetrics.failed} failed</span>
                    <span>Coverage: {testMetrics.coverage}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {testType} tests found. Run tests to see results.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Categories or Custom Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              {showCategories ? 'Test Categories Status' : 'Test Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customContent ? (
              customContent
            ) : showCategories && categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category.count} tests</Badge>
                        <div className={`h-2 w-2 rounded-full ${
                          category.status === 'passed' ? 'bg-green-500' : 
                          category.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : testMetrics.total > 0 ? (
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{title} Suite</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{testMetrics.total} tests</Badge>
                    <div className={`h-2 w-2 rounded-full ${
                      testMetrics.failed === 0 ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={testMetrics.total > 0 ? (testMetrics.passed / testMetrics.total) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Success Rate: {testMetrics.total > 0 ? ((testMetrics.passed / testMetrics.total) * 100).toFixed(1) : 0}%</span>
                    <span>{testMetrics.failed === 0 ? 'All passing' : `${testMetrics.failed} issues`}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Test details will appear after running tests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
        </CardHeader>
        <CardContent>
          {testMetrics.total > 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Real Data Active:</strong> {title} are now using real data from your integration registry. 
                Test results reflect actual configurations and statuses.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>No Tests Found:</strong> Run the {testType} test suite to execute tests against your real integrations 
                and see detailed results here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
