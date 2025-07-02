import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestCaseSearchFilter } from './TestCaseSearchFilter';
import { useComprehensiveTesting } from '@/hooks/useComprehensiveTesting';
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
  Tag
} from 'lucide-react';

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

  const [testFilters, setTestFilters] = useState({});

  const handleExecuteTests = async (suiteType?: string) => {
    try {
      await executeTestSuite(suiteType === 'all' ? undefined : suiteType);
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  };

  const handleFiltersChange = async (filters: any) => {
    setTestFilters(filters);
    await refreshTestCases(filters);
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
      {/* Enhanced Header with Module Coverage */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-purple-900">Enhanced Comprehensive Testing Suite</h3>
              <p className="text-purple-700">Module-organized testing with topic-based categorization</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Total Functionality</div>
              <div className="text-2xl font-bold text-purple-600">{systemHealth.totalFunctionality}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Test Cases</div>
              <div className="text-2xl font-bold text-blue-600">{systemHealth.totalTestCases}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Coverage</div>
              <div className={`text-2xl font-bold ${getHealthStatusColor(systemHealth.overallCoverage)}`}>
                {systemHealth.overallCoverage}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Modules</div>
              <div className="text-2xl font-bold text-indigo-600">
                {Object.keys(testStatistics.testsByModule || {}).length}
              </div>
            </div>
          </div>
          
          {lastInitialized && (
            <div className="mt-4 text-sm text-purple-600">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="execution">Test Execution</TabsTrigger>
          <TabsTrigger value="browse">Browse Tests</TabsTrigger>
          <TabsTrigger value="modules">Module Coverage</TabsTrigger>
          <TabsTrigger value="topics">Topic Analysis</TabsTrigger>
          <TabsTrigger value="compliance">CFR Part 11</TabsTrigger>
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

        <TabsContent value="browse">
          <div className="space-y-6">
            <TestCaseSearchFilter
              filters={testFilters}
              onFiltersChange={handleFiltersChange}
              testStatistics={testStatistics}
            />

            <Card>
              <CardHeader>
                <CardTitle>Test Cases ({testCases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {testCases.length > 0 ? (
                  <div className="space-y-3">
                    {testCases.slice(0, 20).map((testCase) => (
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
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            {testCase.test_suite_type}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {testCase.validation_level}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test cases found matching your filters.</p>
                    <p className="text-sm">Try adjusting your search criteria or initialize the testing system.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Topic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Test Cases by Topic</h4>
                  <div className="space-y-3">
                    {Object.entries(testStatistics.testsByTopic || {}).map(([topic, count]) => {
                      const percentage = testStatistics.totalTestCases > 0 
                        ? (Number(count) / testStatistics.totalTestCases) * 100 
                        : 0;
                      
                      return (
                        <div key={topic}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{topic}</span>
                            <span>{String(count)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Coverage Areas</h4>
                  <div className="space-y-3">
                    {Object.entries(testStatistics.testsByCoverageArea || {}).map(([area, count]) => {
                      const percentage = testStatistics.totalTestCases > 0 
                        ? (Number(count) / testStatistics.totalTestCases) * 100 
                        : 0;
                      
                      return (
                        <div key={area}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{area}</span>
                            <span>{String(count)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          {/* Keep existing compliance content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                21 CFR Part 11 Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Compliance Status: Active</h4>
                  <p className="text-sm text-green-700">
                    All test cases include 21 CFR Part 11 metadata and validation requirements.
                    Module-based organization ensures comprehensive coverage across all business functions.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium">Validation Levels</h5>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• IQ: Installation Qualification</div>
                      <div>• OQ: Operational Qualification</div>
                      <div>• PQ: Performance Qualification</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium">Electronic Records</h5>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• Digital signatures required</div>
                      <div>• Audit trail maintained</div>
                      <div>• Change control active</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium">Module Coverage</h5>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• {Object.keys(testStatistics.testsByModule || {}).length} modules covered</div>
                      <div>• {Object.keys(testStatistics.testsByTopic || {}).length} topics validated</div>
                      <div>• Full traceability maintained</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
