
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Code, 
  CheckCircle, 
  XCircle, 
  FileText,
  Cpu,
  Clock,
  Target
} from 'lucide-react';

interface UnitTestingTabProps {
  testingData: any;
  runTestSuite?: (testType: string) => Promise<any>;
  isLoading?: boolean;
}

export const UnitTestingTab: React.FC<UnitTestingTabProps> = ({ 
  testingData, 
  runTestSuite,
  isLoading = false 
}) => {
  const { toast } = useToast();
  const unitTests = testingData.unitTests || { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 };

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
        title: "Running Unit Tests",
        description: "Executing unit test suite...",
      });
      
      const result = await runTestSuite('unit');
      
      toast({
        title: "Unit Tests Completed",
        description: `Status: ${result.status}. Coverage: ${result.coverage}%`,
      });
    } catch (error) {
      toast({
        title: "Test Execution Failed",
        description: "Failed to run unit tests. Please check the console for details.",
        variant: "destructive",
      });
      console.error('Unit test execution failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unit Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unitTests.total}</div>
            <p className="text-xs text-muted-foreground">Unit test cases</p>
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
            <div className="text-2xl font-bold text-green-600">{unitTests.passed}</div>
            <p className="text-xs text-muted-foreground">
              {unitTests.total > 0 ? ((unitTests.passed / unitTests.total) * 100).toFixed(1) : 0}% success rate
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
            <div className="text-2xl font-bold text-red-600">{unitTests.failed}</div>
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
            <div className="text-2xl font-bold text-purple-600">{unitTests.coverage}%</div>
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
              Unit Test Execution
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
                Run All Unit Tests
              </EnhancedButton>
              <EnhancedButton variant="outline" disabled>
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </EnhancedButton>
            </div>

            <div className="space-y-3">
              {unitTests.total > 0 ? (
                // Show real test categories based on actual data
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">All Unit Tests</span>
                    <Badge variant="default">{unitTests.total} tests</Badge>
                  </div>
                  <Progress value={unitTests.total > 0 ? (unitTests.passed / unitTests.total) * 100 : 0} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{unitTests.passed} passed, {unitTests.failed} failed</span>
                    <span>Coverage: {unitTests.coverage}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No unit tests found. Run tests to see results.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Test Categories Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unitTests.total > 0 ? (
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Unit Test Suite</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{unitTests.total} tests</Badge>
                    <div className={`h-2 w-2 rounded-full ${
                      unitTests.failed === 0 ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={unitTests.total > 0 ? (unitTests.passed / unitTests.total) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Success Rate: {unitTests.total > 0 ? ((unitTests.passed / unitTests.total) * 100).toFixed(1) : 0}%</span>
                    <span>{unitTests.failed === 0 ? 'All passing' : `${unitTests.failed} issues`}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Test categories will appear after running tests.</p>
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
          {unitTests.total > 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Real Data Active:</strong> Unit tests are now using real API data from your integration registry. 
                Test results reflect actual API configurations and statuses.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>No Tests Found:</strong> Run the unit test suite to execute tests against your real API integrations 
                and see detailed results here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
