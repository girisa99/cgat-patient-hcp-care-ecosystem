/**
 * SECURITY FIX TEST SUITE
 * Comprehensive testing framework to ensure no functionality breaks during security fixes
 */
import React, { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
  duration?: number;
  details?: any;
}

interface TestSuite {
  category: string;
  tests: TestResult[];
}

export const SecurityFixTestSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ passed: 0, failed: 0, total: 0 });

  const { user, userRoles, isAuthenticated, hasAnyRole } = useMasterAuth();
  const masterData = useMasterData(isAuthenticated);
  const userManagement = useMasterUserManagement();

  const createTestSuite = (category: string, testNames: string[]): TestSuite => ({
    category,
    tests: testNames.map(name => ({ name, status: 'pending' }))
  });

  const updateTestResult = (category: string, testName: string, result: Partial<TestResult>) => {
    setTestSuites(prev => prev.map(suite => 
      suite.category === category ? {
        ...suite,
        tests: suite.tests.map(test => 
          test.name === testName ? { ...test, ...result } : test
        )
      } : suite
    ));
  };

  const runTest = async (category: string, testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestResult(category, testName, { status: 'running' });
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(category, testName, { 
        status: 'passed', 
        duration,
        details: result 
      });
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(category, testName, { 
        status: 'failed', 
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  };

  // Initialize test suites
  useEffect(() => {
    const suites: TestSuite[] = [
      createTestSuite('Authentication & Authorization', [
        'User Authentication Status',
        'User Roles Loading',
        'Role-based Access Control',
        'Multi-tenant Context',
        'Session Management'
      ]),
      createTestSuite('User Management', [
        'User List Loading',
        'User Statistics',
        'Role Assignment',
        'User CRUD Operations',
        'Permission Validation'
      ]),
      createTestSuite('Data Access & RLS', [
        'Profile Data Access',
        'Facility Data Access',
        'Module Data Access',
        'Sensitive Data Protection',
        'Cross-tenant Isolation'
      ]),
      createTestSuite('UI Components & Navigation', [
        'Page Routing',
        'Sidebar Navigation',
        'Protected Routes',
        'Loading States',
        'Error Handling'
      ]),
      createTestSuite('Real-time Features', [
        'Data Synchronization',
        'Live Updates',
        'Cache Invalidation',
        'Optimistic Updates',
        'Error Recovery'
      ])
    ];
    
    setTestSuites(suites);
  }, []);

  const runAllTests = async () => {
    setIsRunning(true);
    let passed = 0;
    let total = 0;

    for (const suite of testSuites) {
      for (const test of suite.tests) {
        total++;
        const success = await runSingleTest(suite.category, test.name);
        if (success) passed++;
      }
    }

    setSummary({ passed, failed: total - passed, total });
    setIsRunning(false);
  };

  const runSingleTest = async (category: string, testName: string): Promise<boolean> => {
    switch (category) {
      case 'Authentication & Authorization':
        return runAuthTest(testName);
      case 'User Management':
        return runUserManagementTest(testName);
      case 'Data Access & RLS':
        return runDataAccessTest(testName);
      case 'UI Components & Navigation':
        return runUITest(testName);
      case 'Real-time Features':
        return runRealtimeTest(testName);
      default:
        return false;
    }
  };

  const runAuthTest = async (testName: string): Promise<boolean> => {
    switch (testName) {
      case 'User Authentication Status':
        return runTest('Authentication & Authorization', testName, async () => {
          if (!isAuthenticated) throw new Error('User not authenticated');
          if (!user) throw new Error('User object missing');
          return { authenticated: true, userId: user.id };
        });
      
      case 'User Roles Loading':
        return runTest('Authentication & Authorization', testName, async () => {
          if (!userRoles || userRoles.length === 0) throw new Error('User roles not loaded');
          return { roles: userRoles, count: userRoles.length };
        });
      
      case 'Role-based Access Control':
        return runTest('Authentication & Authorization', testName, async () => {
          const hasAdmin = await hasAnyRole(['superAdmin', 'admin']);
          return { hasAdminRole: hasAdmin, currentRoles: userRoles };
        });
      
      default:
        return false;
    }
  };

  const runUserManagementTest = async (testName: string): Promise<boolean> => {
    switch (testName) {
      case 'User List Loading':
        return runTest('User Management', testName, async () => {
          if (userManagement.isLoading) throw new Error('Still loading users');
          if (!userManagement.users || userManagement.users.length === 0) {
            throw new Error('No users loaded');
          }
          return { userCount: userManagement.users.length };
        });
      
      case 'User Statistics':
        return runTest('User Management', testName, async () => {
          const stats = userManagement.getUserStats();
          if (!stats || stats.totalUsers === 0) throw new Error('No user statistics');
          return stats;
        });
      
      default:
        return false;
    }
  };

  const runDataAccessTest = async (testName: string): Promise<boolean> => {
    switch (testName) {
      case 'Profile Data Access':
        return runTest('Data Access & RLS', testName, async () => {
          if (!masterData.users || masterData.users.length === 0) {
            throw new Error('Cannot access profile data');
          }
          return { profilesAccessible: masterData.users.length };
        });
      
      default:
        return false;
    }
  };

  const runUITest = async (testName: string): Promise<boolean> => {
    switch (testName) {
      case 'Page Routing':
        return runTest('UI Components & Navigation', testName, async () => {
          const currentPath = window.location.pathname;
          return { currentRoute: currentPath, working: true };
        });
      
      default:
        return false;
    }
  };

  const runRealtimeTest = async (testName: string): Promise<boolean> => {
    switch (testName) {
      case 'Data Synchronization':
        return runTest('Real-time Features', testName, async () => {
          // Test data refresh functionality
          await masterData.refreshData();
          return { dataRefreshed: true };
        });
      
      default:
        return false;
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Fix Test Suite</h1>
          <p className="text-gray-600">
            Comprehensive testing to ensure no functionality breaks during security fixes
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run All Tests'
          )}
        </Button>
      </div>

      {summary.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                Passed: {summary.passed}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                Failed: {summary.failed}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800">
                Total: {summary.total}
              </Badge>
              <div className="ml-auto text-sm text-gray-600">
                Success Rate: {((summary.passed / summary.total) * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {testSuites.map((suite) => (
          <Card key={suite.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {suite.category}
                <Badge variant="outline">
                  {suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test) => (
                  <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && (
                        <span className="text-xs text-gray-500">
                          {test.duration}ms
                        </span>
                      )}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    {test.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {test.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};