
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield
} from 'lucide-react';

export const ComprehensiveTestingTab: React.FC = () => {
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
    refreshTestCases,
    refreshFunctionality
  } = useComprehensiveTesting();

  const [selectedSuiteType, setSelectedSuiteType] = useState<string>('all');

  const handleExecuteTests = async (suiteType?: string) => {
    try {
      await executeTestSuite(suiteType === 'all' ? undefined : suiteType);
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
    { key: 'integration', label: 'Integration', icon: Database },
    { key: 'system', label: 'System Tests', icon: Shield },
    { key: 'regression', label: 'Regression', icon: RefreshCw },
    { key: 'api_integration', label: 'API Integration', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Comprehensive Testing Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-purple-900">Comprehensive Testing Suite</h3>
              <p className="text-purple-700">Full system validation with 21 CFR Part 11 compliance</p>
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
              <div className="text-sm text-gray-600">Issues</div>
              <div className="text-2xl font-bold text-red-600">{systemHealth.criticalIssues}</div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="execution">Test Execution</TabsTrigger>
          <TabsTrigger value="functionality">System Functions</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          <TabsTrigger value="compliance">CFR Part 11</TabsTrigger>
        </TabsList>

        <TabsContent value="execution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Initialization */}
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

            {/* Test Execution */}
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

                {/* Overall Progress */}
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

          {/* Test Results Summary */}
          {testStatistics.testsByStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {testStatistics.testsByStatus.passed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {testStatistics.testsByStatus.failed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {testStatistics.testsByStatus.skipped || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {testStatistics.testsByStatus.pending || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="functionality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Functionality Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemFunctionality.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(testStatistics.coverageByFunctionality || {}).map(([type, count]) => (
                      <div key={type} className="p-4 border rounded-lg">
                        <h4 className="font-medium capitalize">{type}s</h4>
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {systemFunctionality.slice(0, 20).map((func) => (
                      <div key={func.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{func.functionality_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {func.functionality_type} • {func.schema_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            func.test_coverage_status === 'full' ? 'default' :
                            func.test_coverage_status === 'partial' ? 'secondary' : 'destructive'
                          }>
                            {func.test_coverage_status}
                          </Badge>
                          <Badge variant={
                            func.risk_level === 'low' ? 'default' :
                            func.risk_level === 'medium' ? 'secondary' :
                            func.risk_level === 'high' ? 'destructive' : 'destructive'
                          }>
                            {func.risk_level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No system functionality detected.</p>
                  <p className="text-sm">Run detection to analyze your system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <CardTitle>Test Coverage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Coverage by Test Type</h4>
                    <div className="space-y-3">
                      {Object.entries(testStatistics.testsByType || {}).map(([type, count]) => {
                        const percentage = testStatistics.totalTestCases > 0 
                          ? (count / testStatistics.totalTestCases) * 100 
                          : 0;
                        
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{type.replace('_', ' ')}</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Coverage by Status</h4>
                    <div className="space-y-3">
                      {Object.entries(testStatistics.testsByStatus || {}).map(([status, count]) => {
                        const percentage = testStatistics.totalTestCases > 0 
                          ? (count / testStatistics.totalTestCases) * 100 
                          : 0;
                        
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{status}</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
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
                    Electronic signatures and audit trails are maintained for critical validations.
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
                    <h5 className="font-medium">Documentation</h5>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• Validation plans</div>
                      <div>• Test summary reports</div>
                      <div>• Deviation reports</div>
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
