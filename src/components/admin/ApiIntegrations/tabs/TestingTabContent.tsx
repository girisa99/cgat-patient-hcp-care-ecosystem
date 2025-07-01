
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  TestTube, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Server, 
  Code,
  Shield,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface TestingTabContentProps {
  integrations: any[];
  onTestEndpoint: (integrationId: string, endpointId?: string) => Promise<void>;
}

interface TestResult {
  id: string;
  integrationId: string;
  endpointId?: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  timestamp: Date;
  success: boolean;
  response?: any;
  error?: string;
}

export const TestingTabContent: React.FC<TestingTabContentProps> = ({
  integrations,
  onTestEndpoint
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [testMethod, setTestMethod] = useState<string>('GET');
  const [testUrl, setTestUrl] = useState<string>('');
  const [testHeaders, setTestHeaders] = useState<string>('{"Content-Type": "application/json"}');
  const [testBody, setTestBody] = useState<string>('{}');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const { toast } = useToast();
  const { apiEndpoints, getDetailedApiStats } = useApiServiceDetails();

  // Get detailed stats for testing metrics
  const detailedStats = React.useMemo(() => {
    return getDetailedApiStats(integrations);
  }, [integrations, getDetailedApiStats]);

  // Get endpoints for selected integration
  const selectedIntegrationEndpoints = React.useMemo(() => {
    if (!selectedIntegration) return [];
    return apiEndpoints.filter(endpoint => endpoint.external_api_id === selectedIntegration);
  }, [selectedIntegration, apiEndpoints]);

  // Calculate testing metrics
  const testingMetrics = React.useMemo(() => {
    const recent = testResults.filter(result => 
      Date.now() - result.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    return {
      totalTests: testResults.length,
      recentTests: recent.length,
      successfulTests: recent.filter(r => r.success).length,
      failedTests: recent.filter(r => !r.success).length,
      averageResponseTime: recent.length > 0 
        ? Math.round(recent.reduce((sum, r) => sum + r.responseTime, 0) / recent.length)
        : 0,
      successRate: recent.length > 0 
        ? Math.round((recent.filter(r => r.success).length / recent.length) * 100)
        : 0
    };
  }, [testResults]);

  const handleSingleTest = async () => {
    if (!selectedIntegration) {
      toast({
        title: "❌ Test Error",
        description: "Please select an integration to test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    const startTime = Date.now();

    try {
      const integration = integrations.find(i => i.id === selectedIntegration);
      const endpoint = selectedIntegrationEndpoints.find(e => e.id === selectedEndpoint);
      
      let url = testUrl;
      if (!url && integration) {
        url = integration.base_url || `${window.location.origin}/api/v1/${selectedIntegration}`;
        if (endpoint) {
          url += endpoint.external_path;
        }
      }

      console.log('🧪 Testing endpoint:', { url, method: testMethod });

      // Parse headers
      let headers = {};
      try {
        headers = JSON.parse(testHeaders);
      } catch (e) {
        console.warn('Invalid headers JSON, using default');
        headers = { 'Content-Type': 'application/json' };
      }

      // Parse body
      let body;
      if (testMethod !== 'GET' && testMethod !== 'HEAD') {
        try {
          body = testBody ? JSON.stringify(JSON.parse(testBody)) : undefined;
        } catch (e) {
          body = testBody;
        }
      }

      const response = await fetch(url, {
        method: testMethod,
        headers,
        body
      });

      const responseTime = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }

      const testResult: TestResult = {
        id: `test_${Date.now()}`,
        integrationId: selectedIntegration,
        endpointId: selectedEndpoint,
        method: testMethod,
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        timestamp: new Date(),
        success: response.ok,
        response: responseData
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 49)]); // Keep last 50 results

      await onTestEndpoint(selectedIntegration, selectedEndpoint);

      toast({
        title: "🧪 Test Complete",
        description: `${testMethod} ${url}: ${response.status} ${response.statusText} (${responseTime}ms)`,
        variant: response.ok ? "default" : "destructive"
      });

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      const testResult: TestResult = {
        id: `test_${Date.now()}`,
        integrationId: selectedIntegration,
        endpointId: selectedEndpoint,
        method: testMethod,
        url: testUrl,
        status: 0,
        statusText: 'Network Error',
        responseTime,
        timestamp: new Date(),
        success: false,
        error: error.message
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 49)]);

      toast({
        title: "❌ Test Failed",
        description: error.message || "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestAllEndpoints = async () => {
    if (!selectedIntegration) {
      toast({
        title: "❌ Test Error",
        description: "Please select an integration to test",
        variant: "destructive",
      });
      return;
    }

    setIsTestingAll(true);
    const integration = integrations.find(i => i.id === selectedIntegration);
    const endpoints = selectedIntegrationEndpoints;

    console.log(`🧪 Testing all ${endpoints.length} endpoints for ${integration?.name}`);

    let successCount = 0;
    let failureCount = 0;

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const url = `${integration?.base_url || `${window.location.origin}/api/v1/${selectedIntegration}`}${endpoint.external_path}`;
        
        const response = await fetch(url, {
          method: endpoint.method.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            ...(endpoint.requires_authentication ? { 'Authorization': 'Bearer test-token' } : {})
          }
        });

        const responseTime = Date.now() - startTime;

        const testResult: TestResult = {
          id: `test_${Date.now()}_${endpoint.id}`,
          integrationId: selectedIntegration,
          endpointId: endpoint.id,
          method: endpoint.method.toUpperCase(),
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          timestamp: new Date(),
          success: response.ok
        };

        setTestResults(prev => [testResult, ...prev.slice(0, 49)]);

        if (response.ok) {
          successCount++;
        } else {
          failureCount++;
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        failureCount++;
        console.error(`Failed to test endpoint ${endpoint.external_path}:`, error);
      }
    }

    setIsTestingAll(false);

    toast({
      title: "🧪 Bulk Test Complete",
      description: `Tested ${endpoints.length} endpoints: ${successCount} successful, ${failureCount} failed`,
      variant: failureCount > 0 ? "destructive" : "default"
    });
  };

  return (
    <div className="space-y-6">
      {/* Testing Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{detailedStats.totalEndpoints}</p>
                <p className="text-sm text-muted-foreground">Total Endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{testingMetrics.successfulTests}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{testingMetrics.failedTests}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{testingMetrics.averageResponseTime}ms</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{testingMetrics.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{testingMetrics.recentTests}</p>
                <p className="text-sm text-muted-foreground">Recent Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList>
          <TabsTrigger value="single">Single Test</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Testing</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Single Endpoint Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration">Integration</Label>
                  <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrations.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          {integration.name} ({integration.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedIntegrationEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          {endpoint.method.toUpperCase()} {endpoint.external_path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select value={testMethod} onValueChange={setTestMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">Custom URL (optional)</Label>
                  <Input
                    id="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="Override default URL"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  placeholder='{"Content-Type": "application/json"}'
                  className="font-mono text-xs"
                />
              </div>

              {testMethod !== 'GET' && testMethod !== 'HEAD' && (
                <div>
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    placeholder='{}'
                    className="font-mono text-xs"
                  />
                </div>
              )}

              <Button 
                onClick={handleSingleTest} 
                disabled={isTesting || !selectedIntegration}
                className="w-full"
              >
                {isTesting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Bulk Endpoint Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-integration">Integration</Label>
                <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration to test all endpoints" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.name} ({selectedIntegrationEndpoints.length} endpoints)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedIntegration && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will test all {selectedIntegrationEndpoints.length} endpoints for the selected integration. 
                    Each endpoint will be called with default parameters.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleTestAllEndpoints} 
                disabled={isTestingAll || !selectedIntegration}
                className="w-full"
                variant="outline"
              >
                {isTestingAll ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                {isTestingAll ? 'Testing All Endpoints...' : `Test All ${selectedIntegrationEndpoints.length} Endpoints`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Test Results ({testResults.length})</h3>
            <Button 
              variant="outline" 
              onClick={() => setTestResults([])}
              disabled={testResults.length === 0}
            >
              Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            {testResults.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                  <p className="text-muted-foreground text-center">
                    Run some tests to see results here
                  </p>
                </CardContent>
              </Card>
            ) : (
              testResults.map((result) => (
                <Card key={result.id} className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant="outline">{result.method}</Badge>
                        <span className="font-mono text-sm">{result.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.status} {result.statusText}
                        </Badge>
                        <Badge variant="outline">{result.responseTime}ms</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleString()}
                    </div>
                    {result.error && (
                      <Alert className="mt-2 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
