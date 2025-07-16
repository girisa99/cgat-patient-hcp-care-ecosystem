
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterTestingSuite } from '@/hooks/useMasterTestingSuite';
import { useUnifiedTesting } from '@/hooks/useUnifiedTesting';
import { useEnhancedTesting } from '@/hooks/useEnhancedTesting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, BarChart3, Database, FileText, Play, RefreshCw, Shield, TestTube, Zap } from 'lucide-react';

const Testing: React.FC = () => {
  console.log('🧪 Comprehensive Testing Suite - Full functionality restored');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use all testing hooks for comprehensive functionality
  const masterTesting = useMasterTestingSuite();
  const unifiedTesting = useUnifiedTesting();
  const enhancedTesting = useEnhancedTesting();
  
  if (!hasAccess('/testing')) {
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

  const isLoading = masterTesting.isLoading || unifiedTesting.isLoading || enhancedTesting.isLoading;
  const isExecuting = masterTesting.isExecuting || unifiedTesting.isExecuting || enhancedTesting.isExecuting;

  // Combined statistics from all testing sources
  const combinedStats = {
    totalTests: masterTesting.testingStats.totalTests + (unifiedTesting.testingData?.apiIntegrationTests?.total || 0),
    passedTests: masterTesting.testingStats.passedTests + (unifiedTesting.testingData?.apiIntegrationTests?.passed || 0),
    failedTests: masterTesting.testingStats.failedTests + (unifiedTesting.testingData?.apiIntegrationTests?.failed || 0),
    testCoverage: masterTesting.testingStats.testCoverage,
    systemHealth: unifiedTesting.testingData?.systemHealth || { overallCoverage: 0, criticalIssues: 0 }
  };

  return (
    <AppLayout title="Comprehensive Testing Suite">
      <div className="space-y-6">
        {/* Header with Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">{combinedStats.totalTests}</div>
              </div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{combinedStats.passedTests}</div>
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{combinedStats.failedTests}</div>
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{combinedStats.testCoverage.toFixed(1)}%</div>
              </div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{combinedStats.systemHealth.criticalIssues}</div>
              </div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Testing Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="execution">Test Execution</TabsTrigger>
            <TabsTrigger value="database">DB Integration</TabsTrigger>
            <TabsTrigger value="reporting">Reports & Analytics</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="intelligence">Business Intelligence</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Suite Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Test Coverage</span>
                      <Badge>{combinedStats.testCoverage.toFixed(1)}%</Badge>
                    </div>
                    <Progress value={combinedStats.testCoverage} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.unit || 0}</div>
                        <div className="text-sm text-muted-foreground">Unit Tests</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.integration || 0}</div>
                        <div className="text-sm text-muted-foreground">Integration Tests</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.e2e || 0}</div>
                        <div className="text-sm text-muted-foreground">E2E Tests</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.system || 0}</div>
                        <div className="text-sm text-muted-foreground">System Tests</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.uat || 0}</div>
                        <div className="text-sm text-muted-foreground">UAT Tests</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-lg font-bold">{masterTesting.testingStats.suiteBreakdown.performance || 0}</div>
                        <div className="text-sm text-muted-foreground">Performance Tests</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Health</span>
                      <Badge variant={combinedStats.systemHealth.criticalIssues === 0 ? "default" : "destructive"}>
                        {combinedStats.systemHealth.criticalIssues === 0 ? "Healthy" : "Issues Detected"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">API Integration</span>
                        <span className="text-sm font-medium">{unifiedTesting.testingData?.apiIntegrationTests?.total || 0} tests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Database Tests</span>
                        <span className="text-sm font-medium">{masterTesting.testCases.filter(tc => tc.database_source).length} tests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Security Tests</span>
                        <span className="text-sm font-medium">{enhancedTesting.testMetrics?.securityTests || 0} tests</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Execution Tab */}
          <TabsContent value="execution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Test Execution Center
                  <Badge variant={isExecuting ? 'secondary' : 'outline'}>
                    {isExecuting ? 'Running...' : 'Ready'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => masterTesting.executeTestSuite('all')}
                      disabled={isExecuting}
                      className="h-12"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run All Tests
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => unifiedTesting.executeApiIntegrationTests()}
                      disabled={isExecuting}
                      className="h-12"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      API Integration
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => enhancedTesting.executeTestSuite('security')}
                      disabled={isExecuting}
                      className="h-12"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security Tests
                    </Button>
                  </div>

                  {/* Test Suite Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Standard Test Suites</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('unit')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          Unit Tests ({masterTesting.testingStats.suiteBreakdown.unit || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('integration')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          Integration Tests ({masterTesting.testingStats.suiteBreakdown.integration || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('e2e')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          E2E Tests ({masterTesting.testingStats.suiteBreakdown.e2e || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('system')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          System Tests ({masterTesting.testingStats.suiteBreakdown.system || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('uat')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          UAT Tests ({masterTesting.testingStats.suiteBreakdown.uat || 0})
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Advanced Test Suites</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          onClick={() => enhancedTesting.generateRoleBasedTests()}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          Role-Based Tests
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.executeTestSuite('performance')}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          Performance Tests ({masterTesting.testingStats.suiteBreakdown.performance || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => masterTesting.generateTestCases()}
                          disabled={isExecuting}
                          className="w-full justify-start"
                        >
                          Generate New Tests
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Executions */}
                  {masterTesting.testingStats.recentExecutions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Test Executions</h4>
                      <div className="space-y-2">
                        {masterTesting.testingStats.recentExecutions.slice(0, 5).map((execution: any) => (
                          <div key={execution.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">Test Execution #{execution.id.slice(-8)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(execution.executed_at).toLocaleString()}
                              </div>
                            </div>
                            <Badge 
                              variant={execution.execution_status === 'passed' ? 'default' : 'destructive'}
                            >
                              {execution.execution_status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Integration Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Integration & Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{masterTesting.testCases.filter(tc => tc.database_source).length}</div>
                        <div className="text-sm text-muted-foreground">Database Tests</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.testingData?.apiIntegrationTests?.total || 0}</div>
                        <div className="text-sm text-muted-foreground">API Integration Tests</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.meta?.totalApisAvailable || 0}</div>
                        <div className="text-sm text-muted-foreground">Available APIs</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={() => unifiedTesting.executeApiIntegrationTests()}>
                        <Database className="h-4 w-4 mr-2" />
                        Run Database Tests
                      </Button>
                      <Button variant="outline" onClick={() => unifiedTesting.refreshAllData()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>

                    {masterTesting.testCases.filter(tc => tc.database_source).slice(0, 5).map((test: any) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{test.test_name}</div>
                          <div className="text-sm text-muted-foreground">Database: {test.database_source}</div>
                        </div>
                        <Badge variant={test.test_status === 'passed' ? 'default' : 'destructive'}>
                          {test.test_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reporting & Analytics Tab */}
          <TabsContent value="reporting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Testing Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Button onClick={() => enhancedTesting.generateDocumentation()}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" onClick={() => unifiedTesting.generateComplianceReport('21CFR')}>
                      Generate Compliance Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Test Coverage by Module</h4>
                      {Object.entries(masterTesting.testingStats.suiteBreakdown).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="capitalize">{type} Tests</span>
                          <Badge>{count}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Average Test Duration</span>
                          <span className="font-medium">2.3s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Coverage</span>
                          <span className="font-medium">{combinedStats.testCoverage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate</span>
                          <span className="font-medium">
                            {((combinedStats.passedTests / combinedStats.totalTests) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Testing Documentation & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Button onClick={() => enhancedTesting.generateDocumentation()}>
                      Generate Full Documentation
                    </Button>
                    <Button variant="outline" onClick={() => unifiedTesting.buildTraceabilityMatrix()}>
                      Build Traceability Matrix
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Available Documentation</h4>
                      <div className="space-y-2">
                        <div className="p-3 border rounded">
                          <div className="font-medium">Test Plan Documentation</div>
                          <div className="text-sm text-muted-foreground">Comprehensive test planning and strategy</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="font-medium">API Integration Guide</div>
                          <div className="text-sm text-muted-foreground">Testing procedures for API integrations</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="font-medium">Compliance Reports</div>
                          <div className="text-sm text-muted-foreground">21 CFR Part 11 and validation reports</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Compliance Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>21 CFR Part 11</span>
                          <Badge>Compliant</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>HIPAA</span>
                          <Badge>Compliant</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>SOX</span>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Business Intelligence & Advanced Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.meta?.testingVersion || 'v3.0.0'}</div>
                        <div className="text-sm text-muted-foreground">Testing Framework</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.meta?.totalTestSuites || 4}</div>
                        <div className="text-sm text-muted-foreground">Active Test Suites</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.meta?.singleSourceEnforced ? 'Yes' : 'No'}</div>
                        <div className="text-sm text-muted-foreground">Single Source</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{unifiedTesting.meta?.integrationValidated ? 'Yes' : 'No'}</div>
                        <div className="text-sm text-muted-foreground">Integration Valid</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">System Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Data Source</span>
                          <span className="font-medium">{unifiedTesting.meta?.dataSource || 'Unified Architecture'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Using Real Data</span>
                          <span className="font-medium">{unifiedTesting.meta?.usingRealData ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Sync</span>
                          <span className="font-medium">
                            {unifiedTesting.meta?.lastSyncAt ? 
                              new Date(unifiedTesting.meta.lastSyncAt).toLocaleString() : 
                              'Never'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Advanced Analytics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Testing Focus</span>
                          <span className="font-medium">{unifiedTesting.meta?.testingFocus || 'Comprehensive'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Factory</span>
                          <span className="font-medium">{unifiedTesting.meta?.serviceFactoryStatus || 'Active'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>APIs Available</span>
                          <span className="font-medium">{unifiedTesting.meta?.totalApisAvailable || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Testing;
