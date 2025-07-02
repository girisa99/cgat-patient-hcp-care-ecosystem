
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedTestCaseFilter } from './AdvancedTestCaseFilter';
import { RoleBasedTestingTab } from './RoleBasedTestingTab';
import { useComprehensiveTesting } from '@/hooks/useComprehensiveTesting';
import { enhancedTestingService, AdvancedTestFilters, TestExecutionMetrics } from '@/services/enhancedTestingService';
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
  Layers,
  Tag,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EnhancedComprehensiveTestingTab: React.FC = () => {
  const {
    testCases,
    systemFunctionality,
    testStatistics,
    isLoading,
    isInitializing,
    isExecuting,
    error,
    systemHealth,
    lastInitialized,
    initializeSystem,
    detectFunctionality,
    generateTestCases,
    executeTestSuite,
    refreshTestCases
  } = useComprehensiveTesting();

  const [testFilters, setTestFilters] = useState<AdvancedTestFilters>({});
  const [filteredTestCases, setFilteredTestCases] = useState(testCases);
  const [executionMetrics, setExecutionMetrics] = useState<TestExecutionMetrics>({
    totalTests: 0,
    executedTests: 0,
    pendingTests: 0,
    failedTests: 0,
    newTests: 0,
    staleTests: 0,
    securityTests: 0,
    complianceTests: 0,
    technicalTests: 0,
    businessTests: 0
  });

  const { toast } = useToast();

  // Load execution metrics on mount
  useEffect(() => {
    loadExecutionMetrics();
  }, []);

  // Update filtered test cases when filters change
  useEffect(() => {
    if (Object.keys(testFilters).length === 0) {
      setFilteredTestCases(testCases);
    } else {
      applyAdvancedFilters();
    }
  }, [testFilters, testCases]);

  const loadExecutionMetrics = async () => {
    try {
      const metrics = await enhancedTestingService.getTestExecutionMetrics();
      setExecutionMetrics(metrics);
    } catch (error) {
      console.error('Failed to load execution metrics:', error);
    }
  };

  const applyAdvancedFilters = async () => {
    try {
      const filtered = await enhancedTestingService.getAdvancedTestCases(testFilters);
      setFilteredTestCases(filtered);
    } catch (error) {
      console.error('Failed to apply advanced filters:', error);
      toast({
        title: "❌ Filter Error",
        description: "Failed to apply advanced filters",
        variant: "destructive",
      });
    }
  };

  const handleFiltersChange = async (filters: AdvancedTestFilters) => {
    setTestFilters(filters);
    await loadExecutionMetrics(); // Refresh metrics when filters change
  };

  const handleExecuteTests = async (suiteType?: string) => {
    try {
      await executeTestSuite(suiteType === 'all' ? undefined : suiteType);
      await loadExecutionMetrics(); // Refresh metrics after execution
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  };

  const getHealthStatusColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-600';
    if (coverage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const suiteTypes = [
    { key: 'all', label: 'All Tests', icon: TestTube },
    { key: 'unit', label: 'Unit Tests', icon: Settings },
    { key: 'integration', label: 'Integration Tests', icon: Database },
    { key: 'system', label: 'System Tests', icon: Shield },
    { key: 'regression', label: 'Regression', icon: RefreshCw },
    { key: 'api_integration', label: 'API Integration', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Execution Metrics */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-purple-900">Enhanced Comprehensive Testing Suite</h3>
              <p className="text-purple-700">Advanced filtering, role-based testing, and comprehensive security coverage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Total Tests</div>
              <div className="text-2xl font-bold text-purple-600">{executionMetrics.totalTests}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Executed</div>
              <div className="text-2xl font-bold text-green-600">{executionMetrics.executedTests}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{executionMetrics.pendingTests}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{executionMetrics.failedTests}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Security</div>
              <div className="text-2xl font-bold text-indigo-600">{executionMetrics.securityTests}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Compliance</div>
              <div className="text-2xl font-bold text-blue-600">{executionMetrics.complianceTests}</div>
            </div>
          </div>
          
          {lastInitialized && (
            <div className="mt-4 text-sm text-purple-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last initialized: {lastInitialized.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="execution">Test Execution</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Filtering</TabsTrigger>
          <TabsTrigger value="role-based">Role-Based Testing</TabsTrigger>
          <TabsTrigger value="modules">Module Coverage</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="execution">
          {/* System Management and Test Execution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedButton 
                  onClick={initializeSystem}
                  loading={isInitializing}
                  loadingText="Initializing System..."
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Initialize Comprehensive Testing
                </EnhancedButton>

                <div className="grid grid-cols-2 gap-2">
                  <EnhancedButton 
                    onClick={detectFunctionality}
                    loading={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Detect Functions
                  </EnhancedButton>
                  
                  <EnhancedButton 
                    onClick={() => generateTestCases()}
                    loading={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Generate Tests
                  </EnhancedButton>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Test Suite Execution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {suiteTypes.slice(0, 4).map(suite => {
                    const Icon = suite.icon;
                    const count = testStatistics.testsByType?.[suite.key] || 0;
                    
                    return (
                      <EnhancedButton
                        key={suite.key}
                        onClick={() => handleExecuteTests(suite.key)}
                        loading={isExecuting}
                        size="sm"
                        variant={suite.key === 'all' ? 'default' : 'outline'}
                        className="flex flex-col h-16 p-2"
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{suite.label}</span>
                        {count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
                      </EnhancedButton>
                    );
                  })}
                </div>

                {testStatistics.totalTestCases > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress:</span>
                      <span>{Math.round(systemHealth.overallCoverage)}%</span>
                    </div>
                    <Progress value={systemHealth.overallCoverage} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-6">
            <AdvancedTestCaseFilter
              filters={testFilters}
              onFiltersChange={handleFiltersChange}
              metrics={executionMetrics}
            />

            <Card>
              <CardHeader>
                <CardTitle>Filtered Test Cases ({filteredTestCases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTestCases.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTestCases.slice(0, 20).map((testCase) => (
                      <div key={testCase.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{testCase.test_name}</h4>
                            <Badge variant={
                              testCase.test_status === 'passed' ? 'default' :
                              testCase.test_status === 'failed' ? 'destructive' :
                              testCase.test_status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {testCase.test_status}
                            </Badge>
                            {testCase.last_executed_at && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Last run: {new Date(testCase.last_executed_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {testCase.test_description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {testCase.module_name && (
                              <Badge variant="outline" className="text-xs">
                                <Layers className="h-3 w-3 mr-1" />
                                {testCase.module_name}
                              </Badge>
                            )}
                            {testCase.topic && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {testCase.topic}
                              </Badge>
                            )}
                            {testCase.coverage_area && (
                              <Badge variant="outline" className="text-xs">
                                {testCase.coverage_area}
                              </Badge>
                            )}
                            {testCase.validation_level && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {testCase.validation_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test cases found matching your filters.</p>
                    <p className="text-sm">Try adjusting your search criteria or clear all filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="role-based">
          <RoleBasedTestingTab />
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Module Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(testStatistics.testsByModule || {}).map(([module, count]) => {
                  const totalTests = testStatistics.totalTestCases;
                  const percentage = totalTests > 0 ? (Number(count) / totalTests) * 100 : 0;
                  
                  return (
                    <div key={module} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{module}</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{String(count)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {percentage.toFixed(1)}% of total tests
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Test Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Security Tests</span>
                    <Badge variant="secondary">{executionMetrics.securityTests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Compliance Tests</span>
                    <Badge variant="secondary">{executionMetrics.complianceTests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Authentication Tests</span>
                    <Badge variant="secondary">
                      {filteredTestCases.filter(tc => tc.topic?.includes('Authentication')).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Privacy Tests</span>
                    <Badge variant="secondary">
                      {filteredTestCases.filter(tc => tc.topic?.includes('Privacy')).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  21 CFR Part 11 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Compliance Status: Active</h4>
                    <p className="text-sm text-green-700">
                      All test cases include 21 CFR Part 11 metadata and validation requirements.
                      Enhanced security and compliance testing is now integrated.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">Validation Levels Coverage</h5>
                      <div className="text-sm text-muted-foreground mt-2">
                        <div>• IQ: Installation Qualification Tests</div>
                        <div>• OQ: Operational Qualification Tests</div>
                        <div>• PQ: Performance Qualification Tests</div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">Security Categories</h5>
                      <div className="text-sm text-muted-foreground mt-2">
                        <div>• Authentication & Authorization</div>
                        <div>• Data Privacy & Protection</div>
                        <div>• Vulnerability Testing</div>
                        <div>• Database Security</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Technical</span>
                    <span className="text-sm font-medium">{executionMetrics.technicalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Business</span>
                    <span className="text-sm font-medium">{executionMetrics.businessTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Security</span>
                    <span className="text-sm font-medium">{executionMetrics.securityTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Compliance</span>
                    <span className="text-sm font-medium">{executionMetrics.complianceTests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">New Tests</span>
                    <span className="text-sm font-medium text-blue-600">{executionMetrics.newTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stale Tests</span>
                    <span className="text-sm font-medium text-orange-600">{executionMetrics.staleTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Never Executed</span>
                    <span className="text-sm font-medium text-gray-600">
                      {executionMetrics.totalTests - executionMetrics.executedTests}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {executionMetrics.executedTests > 0 
                      ? Math.round(((executionMetrics.executedTests - executionMetrics.failedTests) / executionMetrics.executedTests) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                  <Progress 
                    value={executionMetrics.executedTests > 0 
                      ? ((executionMetrics.executedTests - executionMetrics.failedTests) / executionMetrics.executedTests) * 100
                      : 0} 
                    className="mt-2 h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Coverage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{systemHealth.overallCoverage}%</div>
                  <div className="text-sm text-muted-foreground">Overall Coverage</div>
                  <Progress value={systemHealth.overallCoverage} className="mt-2 h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {systemHealth.totalFunctionality} functions detected
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
