import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterTesting } from '@/hooks/useMasterTesting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TestingSuite: React.FC = () => {
  console.log('🧪 Testing Suite page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { testCases, testSuites, testingStats, isLoading, executeTests, isExecutingTests } = useMasterTesting();
  
  if (!hasAccess('/testing-suite')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Testing Suite.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Testing Suite">
      <div className="space-y-6">
        {/* Testing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{testingStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{testingStats.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{testingStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{testingStats.passRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Suite Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Testing Suite Management
              <Badge variant={isExecutingTests ? 'secondary' : 'outline'}>
                {isExecutingTests ? 'Running...' : `${testCases.length} tests`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading test suites...</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {testCases.length} automated tests across {testSuites.length} test suites.</p>
                
                {/* Test Execution Controls */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => executeTests('all')}
                    disabled={isExecutingTests}
                  >
                    {isExecutingTests ? 'Executing...' : 'Run All Tests'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => executeTests('unit')}
                    disabled={isExecutingTests}
                  >
                    Run Unit Tests
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => executeTests('integration')}
                    disabled={isExecutingTests}
                  >
                    Run Integration Tests
                  </Button>
                </div>

                {/* Test Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Unit Tests</h3>
                    <p className="text-sm text-muted-foreground">Component and function-level testing</p>
                    <Badge variant="outline" className="mt-2">
                      {testCases.filter((tc: any) => tc.test_suite_type === 'unit').length} tests
                    </Badge>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Integration Tests</h3>
                    <p className="text-sm text-muted-foreground">API and database integration testing</p>
                    <Badge variant="outline" className="mt-2">
                      {testCases.filter((tc: any) => tc.test_suite_type === 'integration').length} tests
                    </Badge>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">End-to-End Tests</h3>
                    <p className="text-sm text-muted-foreground">Complete user workflow testing</p>
                    <Badge variant="outline" className="mt-2">
                      {testCases.filter((tc: any) => tc.test_suite_type === 'e2e').length} tests
                    </Badge>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-semibold">Performance Tests</h3>
                    <p className="text-sm text-muted-foreground">Load and performance testing</p>
                    <Badge variant="outline" className="mt-2">
                      {testCases.filter((tc: any) => tc.test_suite_type === 'performance').length} tests
                    </Badge>
                  </div>
                </div>

                {/* Recent Test Cases */}
                {testCases.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Test Cases</h4>
                    {testCases.slice(0, 5).map((testCase: any) => (
                      <div key={testCase.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{testCase.test_name}</div>
                          <div className="text-sm text-muted-foreground">{testCase.test_suite_type}</div>
                        </div>
                        <Badge 
                          variant={
                            testCase.test_status === 'passed' ? 'default' : 
                            testCase.test_status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {testCase.test_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TestingSuite;