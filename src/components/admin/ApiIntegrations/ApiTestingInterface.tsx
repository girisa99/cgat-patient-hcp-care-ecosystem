
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Copy, 
  Save, 
  Download,
  ExternalLink,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ApiIntegration, ApiEndpoint } from '@/utils/api/ApiIntegrationTypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ApiTestingInterfaceProps {
  integration: ApiIntegration;
  onClose: () => void;
}

export const ApiTestingInterface: React.FC<ApiTestingInterfaceProps> = ({
  integration,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(integration.endpoints[0]?.id || '');
  const [requestBody, setRequestBody] = useState('{}');
  const [customHeaders, setCustomHeaders] = useState('{}');
  const [queryParams, setQueryParams] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedTests, setSavedTests] = useState<any[]>([]);

  const currentEndpoint = integration.endpoints.find(e => e.id === selectedEndpoint);

  const handleTestEndpoint = async () => {
    if (!currentEndpoint) return;

    setIsLoading(true);
    try {
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...currentEndpoint.headers
      };

      // Parse custom headers
      try {
        const customHeadersObj = JSON.parse(customHeaders || '{}');
        headers = { ...headers, ...customHeadersObj };
      } catch (e) {
        console.warn('Invalid custom headers JSON, using default headers');
      }

      // Get authentication token if available
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && !currentEndpoint.isPublic) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Build URL with query parameters
      let url = currentEndpoint.fullUrl || 
                `${integration.baseUrl}${currentEndpoint.url}`;

      if (queryParams) {
        const separator = url.includes('?') ? '&' : '?';
        url += separator + queryParams;
      }

      const requestOptions: RequestInit = {
        method: currentEndpoint.method,
        headers
      };

      // Add body for non-GET requests
      if (currentEndpoint.method !== 'GET' && requestBody && requestBody !== '{}') {
        try {
          JSON.parse(requestBody); // Validate JSON
          requestOptions.body = requestBody;
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      console.log('Testing endpoint:', {
        url,
        method: currentEndpoint.method,
        headers,
        body: requestOptions.body
      });

      const response = await fetch(url, requestOptions);
      let responseData;
      
      try {
        const responseText = await response.text();
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        responseData = await response.text();
      }

      const testResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString(),
        success: response.ok
      };

      setTestResponse(testResult);

      toast({
        title: response.ok ? "Test Successful" : "Test Failed",
        description: `${currentEndpoint.method} ${currentEndpoint.name} - ${response.status} ${response.statusText}`,
        variant: response.ok ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('Endpoint test error:', error);
      
      setTestResponse({
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      });
      
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTest = () => {
    if (!currentEndpoint || !testResponse) return;

    const testCase = {
      id: Date.now().toString(),
      endpointId: currentEndpoint.id,
      endpointName: currentEndpoint.name,
      method: currentEndpoint.method,
      requestBody,
      customHeaders,
      queryParams,
      response: testResponse,
      createdAt: new Date().toISOString()
    };

    setSavedTests(prev => [...prev, testCase]);
    
    toast({
      title: "Test Saved",
      description: `Test case for ${currentEndpoint.name} has been saved`,
    });
  };

  const handleExportTests = () => {
    const exportData = {
      integration: integration.name,
      tests: savedTests,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${integration.name}-test-cases.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const populateWithSampleData = () => {
    if (currentEndpoint?.bodySchema) {
      setRequestBody(JSON.stringify(currentEndpoint.bodySchema, null, 2));
    }
    if (currentEndpoint?.queryParams) {
      const params = new URLSearchParams(currentEndpoint.queryParams).toString();
      setQueryParams(params);
    }
  };

  const resetForm = () => {
    setRequestBody('{}');
    setCustomHeaders('{}');
    setQueryParams('');
    setTestResponse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">API Testing Interface</h3>
          <p className="text-muted-foreground">{integration.name} - Real Endpoint Testing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTests} disabled={savedTests.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Tests ({savedTests.length})
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Request Configuration
              <Button size="sm" variant="ghost" onClick={resetForm}>
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Endpoint</label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {integration.endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.method}
                        </Badge>
                        {endpoint.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentEndpoint && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Request URL</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(currentEndpoint.fullUrl || `${integration.baseUrl}${currentEndpoint.url}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentEndpoint.method}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                      {currentEndpoint.fullUrl || `${integration.baseUrl}${currentEndpoint.url}`}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Query Parameters</label>
                  <Input
                    placeholder="key1=value1&key2=value2"
                    value={queryParams}
                    onChange={(e) => setQueryParams(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Headers (JSON)</label>
                  <Textarea
                    placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
                    value={customHeaders}
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    rows={3}
                  />
                </div>

                {currentEndpoint.method !== 'GET' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Request Body (JSON)</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={populateWithSampleData}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Sample Data
                      </Button>
                    </div>
                    <Textarea
                      placeholder="{}"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={8}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestEndpoint} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      "Testing..."
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Endpoint
                      </>
                    )}
                  </Button>
                  {testResponse && (
                    <Button variant="outline" onClick={handleSaveTest}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Test
                    </Button>
                  )}
                </div>

                {currentEndpoint.authentication?.type !== 'none' && !currentEndpoint.isPublic && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Authentication Required</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      This endpoint requires authentication. Make sure you're logged in or include proper credentials.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Response
              {testResponse?.success === true && <CheckCircle className="h-4 w-4 text-green-500" />}
              {testResponse?.success === false && <XCircle className="h-4 w-4 text-red-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="response" className="space-y-4">
              <TabsList>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="saved-tests">Saved Tests ({savedTests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="response">
                <ScrollArea className="h-96 w-full">
                  {testResponse ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={testResponse.success ? "default" : "destructive"}>
                          {testResponse.status || 'Error'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {testResponse.statusText || 'Request Failed'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {testResponse.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      
                      {testResponse.headers && (
                        <div>
                          <h4 className="font-medium mb-2">Response Headers</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(testResponse.headers, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Response Body</h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                        </pre>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Tested at: {new Date(testResponse.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Select an endpoint and click "Test Endpoint" to see the response
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="saved-tests">
                <ScrollArea className="h-96 w-full">
                  {savedTests.length > 0 ? (
                    <div className="space-y-3">
                      {savedTests.map((test) => (
                        <div key={test.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {test.method}
                              </Badge>
                              <span className="text-sm font-medium">{test.endpointName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={test.response?.success ? "default" : "destructive"}>
                                {test.response?.status || 'Error'}
                              </Badge>
                              {test.response?.success ? 
                                <CheckCircle className="h-3 w-3 text-green-500" /> : 
                                <XCircle className="h-3 w-3 text-red-500" />
                              }
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(test.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No saved tests yet. Run some tests and save them for future reference.
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
