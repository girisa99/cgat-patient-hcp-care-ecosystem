import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Info
} from 'lucide-react';
import { useMasterTestingSuite } from '@/hooks/useMasterTestingSuite';

const TestCasesDisplay: React.FC = () => {
  const { 
    testCases, 
    testExecutions, 
    executeTestSuite, 
    generateDocumentation, 
    realTimeEnabled, 
    lastSync,
    testingStats 
  } = useMasterTestingSuite();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  // Filter test cases based on search and filters
  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = !searchTerm || 
      testCase.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.test_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || testCase.test_status === filterStatus;
    const matchesType = filterType === 'all' || testCase.test_suite_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="unit">Unit Tests</option>
                <option value="integration">Integration</option>
                <option value="system">System</option>
                <option value="e2e">E2E Tests</option>
                <option value="uat">UAT Tests</option>
                <option value="performance">Performance</option>
              </select>
              <Button variant="outline" onClick={() => generateDocumentation()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="test-cases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="test-scripts">Test Scripts</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* Test Cases Tab */}
        <TabsContent value="test-cases" className="space-y-4">
          <div className="grid gap-4">
            {filteredTestCases.map((testCase) => (
              <Card key={testCase.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getTestTypeIcon(testCase.test_suite_type)}
                        <h3 className="font-semibold text-lg">{testCase.test_name}</h3>
                        {getStatusBadge(testCase.test_status || 'pending')}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTestCase(
                            expandedTestCase === testCase.id ? null : testCase.id
                          )}
                        >
                          {expandedTestCase === testCase.id ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Module: {testCase.module_name || 'N/A'}</span>
                        <span>•</span>
                        <span>Type: {testCase.test_suite_type}</span>
                        <span>•</span>
                        <span>Coverage: {testCase.coverage_area || 'N/A'}</span>
                        {testCase.validation_level && (
                          <>
                            <span>•</span>
                            <span>Level: {testCase.validation_level}</span>
                          </>
                        )}
                      </div>
                      
                      {testCase.test_description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {testCase.test_description}
                        </p>
                      )}
                      
                      {testCase.business_function && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{testCase.business_function}</Badge>
                          {testCase.topic && <Badge variant="outline">{testCase.topic}</Badge>}
                        </div>
                      )}
                      
                      {testCase.last_executed_at && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Last executed: {new Date(testCase.last_executed_at).toLocaleString()}
                          {testCase.execution_duration_ms && (
                            <span> • Duration: {testCase.execution_duration_ms}ms</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeTestSuite(testCase.test_suite_type)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setExpandedTestCase(
                          expandedTestCase === testCase.id ? null : testCase.id
                        )}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expanded Test Case Details */}
                  {expandedTestCase === testCase.id && (
                    <div className="mt-4 p-4 border-t bg-muted/50 rounded-b-lg">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Test Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {testCase.test_description || 'No description available'}
                          </p>
                        </div>
                        
                        {testCase.cfr_part11_metadata && (
                          <div>
                            <h4 className="font-medium mb-2">Compliance Metadata</h4>
                            <div className="bg-background p-3 rounded border">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(testCase.cfr_part11_metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        {testCase.database_source && (
                          <div>
                            <h4 className="font-medium mb-2">Database Source</h4>
                            <Badge variant="outline">{testCase.database_source}</Badge>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            View Test Script
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Export Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredTestCases.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No test cases found matching your criteria.</p>
                  <Button className="mt-4" onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
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

        {/* Execution History Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Showing recent test executions with detailed results and performance metrics.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {testExecutions.slice(0, 20).map((execution) => (
              <Card key={execution.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.execution_status)}
                        <span className="font-medium">Execution #{execution.id.slice(-8)}</span>
                        {getStatusBadge(execution.execution_status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(execution.executed_at).toLocaleString()}
                      </div>
                      {execution.performance_metrics && typeof execution.performance_metrics === 'object' && (
                        <div className="text-sm text-muted-foreground">
                          Duration: {(execution.performance_metrics as any)?.duration_ms || 'N/A'}ms
                        </div>
                      )}
                      {execution.execution_details && typeof execution.execution_details === 'object' && (
                        <div className="text-xs bg-muted p-2 rounded mt-2">
                          <strong>Details:</strong> {JSON.stringify(execution.execution_details, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Access comprehensive documentation including architecture, requirements, and compliance materials.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Documentation & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Architecture Documentation</h4>
                    <div className="space-y-2">
                      {Object.entries(documentationSamples).map(([key, doc]) => (
                        <div key={key} className="p-3 border rounded hover:bg-muted/50 cursor-pointer" 
                             onClick={() => setSelectedDocType(key)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{doc.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Low Level Architecture</div>
                            <div className="text-sm text-muted-foreground">Detailed technical specifications</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Reference Architecture</div>
                            <div className="text-sm text-muted-foreground">Standards and best practices</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Requirements Documentation</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Functional Requirements</div>
                            <div className="text-sm text-muted-foreground">System functional specifications</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Traceability Matrix</div>
                            <div className="text-sm text-muted-foreground">Requirements to test mapping</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Compliance Reports</div>
                            <div className="text-sm text-muted-foreground">21 CFR Part 11 validation reports</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Selected Documentation Viewer */}
                {selectedDocType && documentationSamples[selectedDocType as keyof typeof documentationSamples] && (
                  <div className="mt-6 p-4 border rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {documentationSamples[selectedDocType as keyof typeof documentationSamples].title}
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => setSelectedDocType(null)}>
                        Close
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {documentationSamples[selectedDocType as keyof typeof documentationSamples].content}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => generateDocumentation()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Full Documentation
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestCasesDisplay;