import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Download,
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'api' | 'compliance' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration?: number;
  lastRun?: string;
  coverage?: number;
}

interface TestResult {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  suiteId: string;
}

const mockTestSuites: TestSuite[] = [
  {
    id: 'api-endpoints',
    name: 'API Endpoints',
    description: 'Test all API endpoints for functionality and compliance',
    type: 'api',
    status: 'passed',
    totalTests: 45,
    passedTests: 43,
    failedTests: 2,
    duration: 120,
    lastRun: new Date().toISOString(),
    coverage: 92
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Test user authentication, authorization, and CRUD operations',
    type: 'integration',
    status: 'failed',
    totalTests: 32,
    passedTests: 29,
    failedTests: 3,
    duration: 85,
    lastRun: new Date().toISOString(),
    coverage: 88
  },
  {
    id: 'data-import',
    name: 'Data Import Suite',
    description: 'Test CSV, JSON, and API data import functionality',
    type: 'integration',
    status: 'passed',
    totalTests: 28,
    passedTests: 28,
    failedTests: 0,
    duration: 95,
    lastRun: new Date().toISOString(),
    coverage: 95
  },
  {
    id: 'agent-workflow',
    name: 'Agent Workflow',
    description: 'Test agent creation, deployment, and management workflows',
    type: 'integration',
    status: 'running',
    totalTests: 38,
    passedTests: 22,
    failedTests: 1,
    duration: 0,
    coverage: 78
  },
  {
    id: 'compliance-checks',
    name: 'Compliance & Security',
    description: 'HIPAA, SOC2, and security compliance testing',
    type: 'compliance',
    status: 'passed',
    totalTests: 52,
    passedTests: 50,
    failedTests: 2,
    duration: 180,
    lastRun: new Date().toISOString(),
    coverage: 98
  }
];

export const TestingHub: React.FC = () => {
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testSuites, setTestSuites] = useState<TestSuite[]>(mockTestSuites);
  const queryClient = useQueryClient();

  // Fetch test execution results
  const { data: testResults = [] } = useQuery({
    queryKey: ['test-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('last_executed_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Execute test suite mutation
  const executeTestSuite = useMutation({
    mutationFn: async (suiteId: string) => {
      const { data, error } = await supabase.functions.invoke('execute-test-suite', {
        body: { suiteId, suiteType: 'comprehensive' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, suiteId) => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
      
      setTestSuites(prev =>
        prev.map(suite =>
          suite.id === suiteId
            ? {
                ...suite,
                status: data.passed > data.failed ? 'passed' : 'failed',
                passedTests: data.passed,
                failedTests: data.failed,
                duration: data.duration,
                lastRun: new Date().toISOString()
              }
            : suite
        )
      );
      
      toast({
        title: "Test Suite Completed",
        description: `Passed: ${data.passed}, Failed: ${data.failed}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['test-results'] });
    },
    onError: (error: any, suiteId) => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
      
      toast({
        title: "Test Execution Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleRunSuite = async (suiteId: string) => {
    setRunningTests(prev => new Set(prev.add(suiteId)));
    
    setTestSuites(prev =>
      prev.map(suite =>
        suite.id === suiteId
          ? { ...suite, status: 'running', passedTests: 0, failedTests: 0 }
          : suite
      )
    );
    
    executeTestSuite.mutate(suiteId);
  };

  const handleRunAllSuites = () => {
    testSuites.forEach(suite => {
      if (suite.status !== 'running') {
        handleRunSuite(suite.id);
      }
    });
  };

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: TestSuite['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
      skipped: 'secondary'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const exportTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSuites: testSuites.length,
        passedSuites: testSuites.filter(s => s.status === 'passed').length,
        failedSuites: testSuites.filter(s => s.status === 'failed').length,
        totalTests: testSuites.reduce((sum, s) => sum + s.totalTests, 0),
        totalPassed: testSuites.reduce((sum, s) => sum + s.passedTests, 0),
        totalFailed: testSuites.reduce((sum, s) => sum + s.failedTests, 0),
        averageCoverage: testSuites.reduce((sum, s) => sum + (s.coverage || 0), 0) / testSuites.length
      },
      suites: testSuites,
      results: testResults
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Test report has been downloaded as JSON file."
    });
  };

  const overallStats = {
    totalTests: testSuites.reduce((sum, s) => sum + s.totalTests, 0),
    totalPassed: testSuites.reduce((sum, s) => sum + s.passedTests, 0),
    totalFailed: testSuites.reduce((sum, s) => sum + s.failedTests, 0),
    averageCoverage: Math.round(testSuites.reduce((sum, s) => sum + (s.coverage || 0), 0) / testSuites.length),
    passRate: Math.round((testSuites.reduce((sum, s) => sum + s.passedTests, 0) / testSuites.reduce((sum, s) => sum + s.totalTests, 0)) * 100)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Testing Hub</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive testing suite for all application components
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTestReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleRunAllSuites}>
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TestTube className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalTests}</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalPassed}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.totalFailed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.passRate}%</p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{overallStats.averageCoverage}%</p>
                <p className="text-xs text-muted-foreground">Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <Tabs defaultValue="suites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(suite.status)}
                      <div>
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <CardDescription>{suite.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(suite.status)}
                      <Badge variant="outline">{suite.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tests</p>
                      <p className="text-lg font-semibold">{suite.totalTests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Passed</p>
                      <p className="text-lg font-semibold text-green-600">{suite.passedTests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-lg font-semibold text-red-600">{suite.failedTests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="text-lg font-semibold">{suite.coverage}%</p>
                    </div>
                  </div>
                  
                  {suite.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Running tests...</span>
                        <span className="text-sm">{suite.passedTests + suite.failedTests}/{suite.totalTests}</span>
                      </div>
                      <Progress value={(suite.passedTests + suite.failedTests) / suite.totalTests * 100} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {suite.lastRun && (
                        <>Last run: {new Date(suite.lastRun).toLocaleString()}</>
                      )}
                      {suite.duration && (
                        <> • Duration: {suite.duration}s</>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSuite(selectedSuite === suite.id ? null : suite.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRunSuite(suite.id)}
                        disabled={runningTests.has(suite.id)}
                      >
                        {runningTests.has(suite.id) ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {runningTests.has(suite.id) ? 'Running...' : 'Run Tests'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Latest test executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-2">
                  {testResults.slice(0, 10).map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{result.test_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.module_name} • {new Date(result.last_executed_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.test_status === 'passed' ? 'default' : 'destructive'}>
                          {result.test_status}
                        </Badge>
                        {result.execution_duration_ms && (
                          <span className="text-xs text-muted-foreground">
                            {result.execution_duration_ms}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test results available. Run some tests to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Coverage Report</CardTitle>
              <CardDescription>Test coverage across different modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testSuites.map((suite) => (
                  <div key={suite.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{suite.name}</p>
                      <p className="text-xs text-muted-foreground">{suite.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={suite.coverage || 0} />
                      </div>
                      <span className="text-sm font-medium">{suite.coverage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingHub;