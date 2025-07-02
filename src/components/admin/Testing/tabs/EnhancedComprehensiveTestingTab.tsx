
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedTesting } from '@/hooks/useEnhancedTesting';
import { 
  Play, 
  RefreshCw, 
  Database, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';

export const EnhancedComprehensiveTestingTab: React.FC = () => {
  const {
    testCases,
    testMetrics,
    isLoading,
    isExecuting,
    error,
    executeTestSuite,
    generateDocumentation,
    generateRoleBasedTests,
    refetchTestCases,
    refetchMetrics
  } = useEnhancedTesting();

  const [selectedFilters, setSelectedFilters] = useState({
    suite_type: 'all',
    test_category: 'all'
  });

  const handleExecuteTests = async () => {
    try {
      executeTestSuite();
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  };

  const handleGenerateDocumentation = async () => {
    try {
      await generateDocumentation();
    } catch (error) {
      console.error('Documentation generation failed:', error);
    }
  };

  const handleGenerateRoleTests = async () => {
    try {
      await generateRoleBasedTests();
    } catch (error) {
      console.error('Role-based test generation failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading enhanced testing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Testing Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-indigo-600" />
            <div>
              <h3 className="text-xl font-semibold text-indigo-900">Enhanced Testing Suite</h3>
              <p className="text-indigo-700">Advanced testing capabilities with comprehensive analytics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Total Test Cases</div>
              <div className="text-2xl font-bold text-indigo-600">{testCases?.length || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Security Tests</div>
              <div className="text-2xl font-bold text-red-600">{testMetrics?.securityTests || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Compliance Tests</div>
              <div className="text-2xl font-bold text-green-600">{testMetrics?.complianceTests || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Failed Tests</div>
              <div className="text-2xl font-bold text-orange-600">{testMetrics?.failedTests || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error instanceof Error ? error.message : 'Unknown error occurred'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="execution">Test Execution</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Test Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testMetrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Total: {testMetrics.totalTests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Executed: {testMetrics.executedTests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Pending: {testMetrics.pendingTests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Failed: {testMetrics.failedTests}</span>
                      </div>
                    </div>
                    
                    {testMetrics.totalTests > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Execution Progress:</span>
                          <span>{Math.round((testMetrics.executedTests / testMetrics.totalTests) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(testMetrics.executedTests / testMetrics.totalTests) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Test Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Recent Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {testCases?.slice(0, 10).map((testCase) => (
                    <div key={testCase.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{testCase.test_name}</p>
                        <p className="text-xs text-muted-foreground">{testCase.module_name}</p>
                      </div>
                      <Badge variant={
                        testCase.test_status === 'passed' ? 'default' :
                        testCase.test_status === 'failed' ? 'destructive' :
                        testCase.test_status === 'skipped' ? 'secondary' : 'outline'
                      }>
                        {testCase.test_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Test Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleExecuteTests}
                  disabled={isExecuting}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executing Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Security Tests
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleGenerateRoleTests}
                  variant="outline"
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Generate Role Tests
                </Button>

                <Button 
                  onClick={() => {
                    refetchTestCases();
                    refetchMetrics();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Technical Tests</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {testMetrics?.technicalTests || 0}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Business Tests</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {testMetrics?.businessTests || 0}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">New Tests</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {testMetrics?.newTests || 0}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Stale Tests</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {testMetrics?.staleTests || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Generate comprehensive testing documentation including user requirements, 
                functional requirements, and traceability matrices.
              </p>
              
              <Button 
                onClick={handleGenerateDocumentation}
                className="w-full md:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
