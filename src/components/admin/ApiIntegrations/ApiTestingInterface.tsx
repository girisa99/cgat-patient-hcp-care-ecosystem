
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
  AlertTriangle
} from 'lucide-react';
import { ApiIntegration, ApiEndpoint } from '@/utils/api/ApiIntegrationTypes';
import { useToast } from '@/hooks/use-toast';

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
      const headers = {
        ...currentEndpoint.headers,
        ...JSON.parse(customHeaders || '{}')
      };

      const url = new URL(currentEndpoint.fullUrl || currentEndpoint.url);
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        params.forEach((value, key) => {
          url.searchParams.append(key, value);
        });
      }

      const requestOptions: RequestInit = {
        method: currentEndpoint.method,
        headers
      };

      if (currentEndpoint.method !== 'GET' && requestBody) {
        requestOptions.body = requestBody;
      }

      const response = await fetch(url.toString(), requestOptions);
      const responseData = await response.json();

      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Test Completed",
        description: `${currentEndpoint.method} ${currentEndpoint.name} - ${response.status}`,
      });
    } catch (error: any) {
      setTestResponse({
        error: error.message,
        timestamp: new Date().toISOString()
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
    if (!currentEndpoint) return;

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
    a.click();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">API Testing Interface</h3>
          <p className="text-muted-foreground">{integration.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTests}>
            <Download className="h-4 w-4 mr-2" />
            Export Tests
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
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
                      onClick={() => navigator.clipboard.writeText(currentEndpoint.fullUrl || currentEndpoint.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentEndpoint.method}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                      {currentEndpoint.fullUrl || currentEndpoint.url}
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
                    placeholder='{"Authorization": "Bearer token"}'
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

                {currentEndpoint.authentication?.type !== 'none' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Authentication Required</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      This endpoint requires {currentEndpoint.authentication?.type} authentication.
                      Make sure to include the appropriate credentials in your headers.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
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
                        <Badge variant={testResponse.status < 400 ? "default" : "destructive"}>
                          {testResponse.status || 'Error'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {testResponse.statusText || 'Request Failed'}
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
                            <Badge variant={test.response?.status < 400 ? "default" : "destructive"}>
                              {test.response?.status || 'Error'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(test.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No saved tests yet
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
