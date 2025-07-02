
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code,
  Send,
  FileText,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const ApiTestingInterfaceTab: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);

  console.log('🚀 API Testing Interface Tab with comprehensive testing tools');

  return (
    <div className="space-y-6">
      {/* Testing Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Testing Interface</h3>
          <p className="text-sm text-muted-foreground">
            Test APIs, endpoints, and monitor performance in real-time
          </p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Run Test Suite
        </Button>
      </div>

      {/* Testing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Passed Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">847</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Failed Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">245ms</div>
            <p className="text-xs text-muted-foreground">Across all endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Testing Interface Tabs */}
      <Tabs defaultValue="endpoint-testing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoint-testing">Endpoint Testing</TabsTrigger>
          <TabsTrigger value="load-testing">Load Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="test-suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoint-testing">
          <EndpointTestingTab apis={apiServices.data} />
        </TabsContent>

        <TabsContent value="load-testing">
          <LoadTestingTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringTab />
        </TabsContent>

        <TabsContent value="test-suites">
          <TestSuitesTab />
        </TabsContent>

        <TabsContent value="results">
          <TestResultsTab testResults={testResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Endpoint Testing Tab
const EndpointTestingTab: React.FC<{ apis: any[] }> = ({ apis }) => {
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [requestMethod, setRequestMethod] = useState<string>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [requestHeaders, setRequestHeaders] = useState<string>('{"Content-Type": "application/json"}');
  const [testResponse, setTestResponse] = useState<any>(null);

  const handleTest = async () => {
    // Mock test execution
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      responseTime: Math.floor(Math.random() * 500) + 100,
      data: {
        message: 'Test successful',
        timestamp: new Date().toISOString(),
        data: { id: 1, name: 'Test Patient', status: 'active' }
      }
    };

    setTestResponse(mockResponse);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            API Request Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select API</label>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an API" />
              </SelectTrigger>
              <SelectContent>
                {apis.map((api) => (
                  <SelectItem key={api.id} value={api.id}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Method</label>
              <Select value={requestMethod} onValueChange={setRequestMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Endpoint</label>
              <Input placeholder="/api/v1/patients" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Headers</label>
            <Textarea
              placeholder="Enter request headers (JSON format)"
              value={requestHeaders}
              onChange={(e) => setRequestHeaders(e.target.value)}
              rows={3}
            />
          </div>

          {requestMethod !== 'GET' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Request Body</label>
              <Textarea
                placeholder="Enter request body (JSON format)"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={6}
              />
            </div>
          )}

          <Button onClick={handleTest} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Send Request
          </Button>
        </CardContent>
      </Card>

      {/* Response Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Response
            {testResponse && (
              <Badge variant={testResponse.status >= 200 && testResponse.status < 300 ? 'default' : 'destructive'}>
                {testResponse.status} {testResponse.statusText}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResponse ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {testResponse.responseTime}ms
                </span>
                <span className="flex items-center gap-1">
                  {testResponse.status >= 200 && testResponse.status < 300 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  Status: {testResponse.status}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Response Body</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto">
                  {JSON.stringify(testResponse.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Configure and send a request to see the response here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Load Testing Tab
const LoadTestingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Load Testing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Concurrent Users</label>
              <Input type="number" placeholder="100" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
              <Input type="number" placeholder="10" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ramp-up Time (minutes)</label>
              <Input type="number" placeholder="2" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Target Endpoints</label>
            <Textarea placeholder="List of endpoints to test (one per line)" rows={4} />
          </div>

          <Button className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Start Load Test
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Load Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Patient API Load Test</p>
                <p className="text-sm text-muted-foreground">100 users, 10 minutes</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Passed</Badge>
                <p className="text-sm text-muted-foreground">Avg: 234ms</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Billing API Stress Test</p>
                <p className="text-sm text-muted-foreground">500 users, 15 minutes</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive">Failed</Badge>
                <p className="text-sm text-muted-foreground">Timeout errors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Monitoring Tab
const MonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real-time Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Patient API</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Treatment API</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-600">Warning</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Billing API</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">High Response Time</p>
                  <p className="text-xs text-muted-foreground">Treatment API - 2m ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Endpoint Failure</p>
                  <p className="text-xs text-muted-foreground">Billing API - 5m ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Test Suites Tab
const TestSuitesTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Automated Test Suites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Patient API Test Suite</h4>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comprehensive tests for patient data operations
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last run: 2 hours ago</span>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run Suite
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Authentication Test Suite</h4>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Security and authentication flow tests
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last run: 30 minutes ago</span>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run Suite
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Test Results Tab
const TestResultsTab: React.FC<{ testResults: any[] }> = ({ testResults }) => {
  const mockResults = [
    { id: '1', suite: 'Patient API', status: 'passed', duration: '2.3s', timestamp: '2024-01-15 14:30' },
    { id: '2', suite: 'Authentication', status: 'failed', duration: '1.8s', timestamp: '2024-01-15 14:25' },
    { id: '3', suite: 'Billing API', status: 'passed', duration: '3.1s', timestamp: '2024-01-15 14:20' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Test Results History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockResults.map((result) => (
            <div key={result.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{result.suite}</p>
                <p className="text-sm text-muted-foreground">{result.timestamp}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{result.duration}</span>
                <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                  {result.status === 'passed' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
