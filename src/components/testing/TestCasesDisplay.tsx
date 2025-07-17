import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Play, 
  FileText, 
  Database, 
  Shield, 
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Activity,
  Info,
  RefreshCw,
  Zap,
  Settings,
  Users
} from 'lucide-react';
import useMasterTesting from '@/hooks/useMasterTesting';
import { TestExecutionStatus } from './TestExecutionStatus';
import { DatabaseIntegrationTestingFramework } from './DatabaseIntegrationTestingFramework';

const TestCasesDisplay: React.FC = () => {
  // Use the ultimate consolidated testing hook
  const testing = useMasterTesting();
  
  const {
    testCases,
    executions: testExecutions,
    executeTestSuite,
    generateTestCases,
    generateEnhancedTestCases,
    generateDocumentation,
    syncRealTime,
    testingStats,
    isLoading,
    isExecuting,
    isDocumenting,
    isGenerating,
    isSyncing,
    getTestsByModule,
    getTestsByStatus,
    realTimeEnabled,
    lastSync
  } = testing;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  // Get unique categories and topics for filters
  const uniqueCategories = useMemo(() => {
    const categories = new Set(testCases.map(tc => tc.coverage_area).filter(Boolean));
    return Array.from(categories);
  }, [testCases]);

  const uniqueTopics = useMemo(() => {
    const topics = new Set(testCases.map(tc => tc.topic).filter(Boolean));
    return Array.from(topics);
  }, [testCases]);

  // Filter test cases based on search and filters
  const filteredTestCases = useMemo(() => {
    return testCases.filter(testCase => {
      const matchesSearch = !searchTerm || 
        testCase.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.test_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || testCase.test_status === filterStatus;
      const matchesType = filterType === 'all' || testCase.test_suite_type === filterType;
      const matchesCategory = filterCategory === 'all' || testCase.coverage_area === filterCategory;
      const matchesTopic = filterTopic === 'all' || testCase.topic === filterTopic;
      
      return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesTopic;
    });
  }, [testCases, searchTerm, filterStatus, filterType, filterCategory, filterTopic]);

  // Group test cases by test suite type
  const groupedTestCases = useMemo(() => {
    const grouped = filteredTestCases.reduce((acc, testCase) => {
      const type = testCase.test_suite_type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(testCase);
      return acc;
    }, {} as Record<string, typeof testCases>);
    return grouped;
  }, [filteredTestCases]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Sample documentation content for demonstration
  const documentationSamples = {
    'High Level Architecture': {
      title: 'High Level Architecture Documentation',
      content: `## System Architecture Overview

### Core Components
- **Frontend Layer**: React-based user interface with role-based access control
- **API Gateway**: Centralized endpoint management with authentication
- **Business Logic Layer**: Core application services and workflows
- **Data Layer**: Supabase PostgreSQL with RLS policies
- **Integration Layer**: External API connections and data synchronization

### Architecture Principles
- **Single Source of Truth**: Consolidated data management
- **Security First**: Role-based access control at every layer
- **Scalability**: Microservices-ready architecture
- **Compliance**: 21 CFR Part 11 compliant design

### Data Flow
1. User authentication through Supabase Auth
2. Role validation and permission checks
3. API request routing through centralized gateway
4. Business logic processing with audit trails
5. Data persistence with automatic validation`,
      lastUpdated: new Date().toISOString()
    },
    'Business Requirements': {
      title: 'Business Requirements Specification',
      content: `## Functional Requirements

### User Management
- **BR-001**: System shall support role-based user authentication
- **BR-002**: Users shall be assigned specific permissions based on roles
- **BR-003**: System shall maintain audit trails for all user actions

### Testing Framework
- **BR-010**: System shall support automated test case generation
- **BR-011**: Test cases shall be categorized by module and type
- **BR-012**: System shall provide real-time test execution status

### Compliance Requirements
- **BR-020**: System shall comply with 21 CFR Part 11 regulations
- **BR-021**: All data changes shall be tracked with electronic signatures
- **BR-022**: System shall provide comprehensive audit reporting

### Performance Requirements
- **BR-030**: System response time shall not exceed 3 seconds
- **BR-031**: System shall support concurrent users up to 1000
- **BR-032**: Data backup shall occur every 24 hours`,
      lastUpdated: new Date().toISOString()
    }
  };

  const realTimeStatus = () => {
    if (!realTimeEnabled) {
      return <Badge variant="outline">Disconnected</Badge>;
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <Badge variant="default">Live Updates Active</Badge>
        {lastSync && (
          <span className="text-xs text-muted-foreground">
            Last sync: {new Date(lastSync).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return <TestTube className="h-4 w-4 text-blue-600" />;
      case 'integration': return <Database className="h-4 w-4 text-purple-600" />;
      case 'system': return <Shield className="h-4 w-4 text-green-600" />;
      case 'e2e': return <FileText className="h-4 w-4 text-orange-600" />;
      default: return <TestTube className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Alert */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Testing Suite Status</span>
          {realTimeStatus()}
        </AlertDescription>
      </Alert>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Cases & Scripts ({filteredTestCases.length} of {testCases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => generateDocumentation()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="unit">Unit Tests</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="e2e">E2E Tests</SelectItem>
                  <SelectItem value="uat">UAT Tests</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {uniqueTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterTopic('all');
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="test-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="test-scripts">Test Scripts</TabsTrigger>
          <TabsTrigger value="test-execution">Test Execution</TabsTrigger>
          <TabsTrigger value="db-integration">DB Integration</TabsTrigger>
        </TabsList>

        {/* Test Cases Tab */}
        <TabsContent value="test-cases" className="space-y-4">
          {filteredTestCases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No test cases found matching your criteria.</p>
                <Button className="mt-4" onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterTopic('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTestCases).map(([testType, testCasesInGroup]) => (
                <Card key={testType}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {testType === 'unit' && <TestTube className="h-5 w-5 text-blue-600" />}
                      {testType === 'integration' && <Database className="h-5 w-5 text-purple-600" />}
                      {testType === 'system' && <Shield className="h-5 w-5 text-green-600" />}
                      {testType === 'e2e' && <FileText className="h-5 w-5 text-orange-600" />}
                      {testType === 'uat' && <Users className="h-5 w-5 text-cyan-600" />}
                      {testType === 'regression' && <Zap className="h-5 w-5 text-yellow-600" />}
                      {!['unit', 'integration', 'system', 'e2e', 'uat', 'regression'].includes(testType) && <Settings className="h-5 w-5 text-gray-600" />}
                      
                      <span className="capitalize">{testType} Tests</span>
                      <Badge variant="outline">{testCasesInGroup.length}</Badge>
                      
                      <div className="ml-auto flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeTestSuite(testType)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run All
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {testCasesInGroup.map((testCase) => (
                        <Card key={testCase.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{testCase.test_name}</h4>
                                  {getStatusBadge(testCase.test_status || 'pending')}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedTestCase(
                                      expandedTestCase === testCase.id ? null : testCase.id
                                    )}
                                  >
                                    {expandedTestCase === testCase.id ? 
                                      <ChevronDown className="h-3 w-3" /> : 
                                      <ChevronRight className="h-3 w-3" />
                                    }
                                  </Button>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Module: {testCase.module_name || 'N/A'}</span>
                                  <span>•</span>
                                  <span>Coverage: {testCase.coverage_area || 'N/A'}</span>
                                  {testCase.validation_level && (
                                    <>
                                      <span>•</span>
                                      <span>Level: {testCase.validation_level}</span>
                                    </>
                                  )}
                                </div>
                                
                                {testCase.business_function && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{testCase.business_function}</Badge>
                                    {testCase.topic && <Badge variant="outline" className="text-xs">{testCase.topic}</Badge>}
                                  </div>
                                )}
                                
                                {testCase.last_executed_at && (
                                  <div className="text-xs text-muted-foreground">
                                    Last executed: {new Date(testCase.last_executed_at).toLocaleDateString()}
                                    {testCase.execution_duration_ms && (
                                      <span> • {testCase.execution_duration_ms}ms</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-1 ml-4">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => executeTestSuite(testCase.test_suite_type)}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setExpandedTestCase(
                                    expandedTestCase === testCase.id ? null : testCase.id
                                  )}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expanded Test Case Details */}
                            {expandedTestCase === testCase.id && (
                              <div className="mt-3 p-3 border-t bg-muted/30 rounded">
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Description</h5>
                                    <p className="text-xs text-muted-foreground">
                                      {testCase.test_description || 'No description available'}
                                    </p>
                                  </div>
                                  
                                  {testCase.test_steps && Array.isArray(testCase.test_steps) && testCase.test_steps.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Test Steps</h5>
                                      <div className="space-y-2">
                                        {testCase.test_steps.map((step: any, index: number) => (
                                          <div key={index} className="bg-background p-2 rounded border text-xs">
                                            <div className="flex items-center gap-2 font-medium mb-1">
                                              <Badge variant="secondary" className="text-xs px-1 py-0">Step {step.step || index + 1}</Badge>
                                              <span className="text-xs font-medium">{step.action}</span>
                                            </div>
                                            <p className="text-muted-foreground mb-1 text-xs">{step.description}</p>
                                            <div className="text-xs">
                                              <span className="font-medium text-green-700">Expected: </span>
                                              <span className="text-green-600">{step.expected}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testCase.expected_results && (
                                    <div>
                                      <h5 className="font-medium text-sm mb-1">Expected Results</h5>
                                      <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 p-2 rounded">
                                        {testCase.expected_results}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testCase.database_source && (
                                    <div>
                                      <h5 className="font-medium text-sm mb-1">Database Source</h5>
                                      <Badge variant="outline" className="text-xs">{testCase.database_source}</Badge>
                                    </div>
                                  )}
                                  
                                  {testCase.cfr_part11_metadata && (
                                    <div>
                                      <h5 className="font-medium text-sm mb-1">CFR Part 11 Compliance</h5>
                                      <div className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                                        <div className="grid grid-cols-2 gap-1">
                                          {Object.entries(testCase.cfr_part11_metadata).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                              <span>{typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Script
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Export
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Test Scripts Tab */}
        <TabsContent value="test-scripts" className="space-y-4">
          <div className="grid gap-4">
            {/* Sample Test Scripts with real test case data */}
            {filteredTestCases.slice(0, 10).map((testCase) => (
              <Card key={testCase.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {testCase.test_name} - Test Script
                    {getStatusBadge(testCase.test_status || 'pending')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Test Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Initialize test environment for {testCase.module_name || 'system'}</li>
                        <li>Verify {testCase.business_function || 'functionality'} prerequisites</li>
                        <li>Execute {testCase.test_suite_type} test for {testCase.related_functionality}</li>
                        <li>Validate expected results against {testCase.validation_level || 'IQ'} criteria</li>
                        <li>Log execution results and performance metrics</li>
                        <li>Generate compliance report for 21 CFR Part 11</li>
                      </ol>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-green-800">Expected Results:</h4>
                      <p className="text-sm text-green-700">
                        {testCase.expected_results || `${testCase.test_suite_type} test should complete successfully with all validations passing for ${testCase.module_name} module functionality.`}
                      </p>
                    </div>
                    
                    {testCase.actual_results && (
                      <div className={`p-4 rounded-lg ${
                        testCase.test_status === 'passed' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          testCase.test_status === 'passed' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Actual Results:
                        </h4>
                        <p className={`text-sm ${
                          testCase.test_status === 'passed' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {testCase.actual_results}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Execute Script
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download Script
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Execution Tab */}
        <TabsContent value="test-execution" className="space-y-4">
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
              <TestExecutionStatus 
                isExecuting={isExecuting}
                isGenerating={isGenerating}
                testingStats={testingStats}
              />
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => executeTestSuite('all')}
                    disabled={isExecuting}
                    className="h-12"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => executeTestSuite('integration')}
                    disabled={isExecuting}
                    className="h-12"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    API Integration Tests
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => executeTestSuite('security')}
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
                        onClick={() => executeTestSuite('unit')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        Unit Tests ({testingStats.suiteBreakdown.unit || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('integration')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        Integration Tests ({testingStats.suiteBreakdown.integration || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('e2e')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        E2E Tests ({testingStats.suiteBreakdown.e2e || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('system')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        System Tests ({testingStats.suiteBreakdown.system || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('uat')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        UAT Tests ({testingStats.suiteBreakdown.uat || 0})
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Advanced Test Suites</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('regression')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        Regression Tests ({testingStats.suiteBreakdown.regression || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => executeTestSuite('performance')}
                        disabled={isExecuting}
                        className="w-full justify-start"
                      >
                        Performance Tests ({testingStats.suiteBreakdown.performance || 0})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => generateEnhancedTestCases()}
                        disabled={isGenerating}
                        className="w-full justify-start"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Generate New Tests
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Executions */}
                {testingStats.recentExecutions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Test Executions</h4>
                    <div className="space-y-2">
                      {testingStats.recentExecutions.slice(0, 5).map((execution: any) => (
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

        {/* DB Integration Tab */}
        <TabsContent value="db-integration" className="space-y-4">
          <DatabaseIntegrationTestingFramework />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestCasesDisplay;