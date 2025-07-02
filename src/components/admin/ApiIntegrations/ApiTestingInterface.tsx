
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Copy, Download, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiQueryParam {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}

interface ApiTestingInterfaceProps {
  selectedApi?: any;
  selectedEndpoint?: any;
}

export const ApiTestingInterface: React.FC<ApiTestingInterfaceProps> = ({
  selectedApi,
  selectedEndpoint
}) => {
  const { toast } = useToast();
  const [testUrl, setTestUrl] = useState('');
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestHeaders, setRequestHeaders] = useState('{}');
  const [requestBody, setRequestBody] = useState('{}');
  const [queryParams, setQueryParams] = useState<Record<string, ApiQueryParam>>({});
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'success' | 'error' | 'warning' | null>(null);

  // Initialize form when endpoint changes
  useEffect(() => {
    if (selectedEndpoint && selectedApi) {
      setTestUrl(`${selectedApi.base_url || ''}${selectedEndpoint.path || ''}`);
      setRequestMethod(selectedEndpoint.method || 'GET');
      
      // Initialize query parameters
      const params: Record<string, ApiQueryParam> = {};
      if (selectedEndpoint.parameters) {
        selectedEndpoint.parameters.forEach((param: any) => {
          params[param.name] = {
            name: param.name,
            value: param.default || '',
            type: param.type || 'string',
            required: param.required || false,
            description: param.description
          };
        });
      }
      setQueryParams(params);
    }
  }, [selectedEndpoint, selectedApi]);

  const updateQueryParam = (name: string, field: keyof ApiQueryParam, value: string) => {
    setQueryParams(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value
      }
    }));
  };

  const addQueryParam = () => {
    const newParamName = `param_${Object.keys(queryParams).length + 1}`;
    setQueryParams(prev => ({
      ...prev,
      [newParamName]: {
        name: newParamName,
        value: '',
        type: 'string',
        required: false
      }
    }));
  };

  const removeQueryParam = (name: string) => {
    setQueryParams(prev => {
      const newParams = { ...prev };
      delete newParams[name];
      return newParams;
    });
  };

  const executeTest = async () => {
    setIsLoading(true);
    setResponse(null);
    setResponseStatus(null);

    try {
      console.log('🧪 Executing API test:', {
        url: testUrl,
        method: requestMethod,
        headers: requestHeaders,
        body: requestBody,
        queryParams
      });

      // Convert query params to URLSearchParams format
      const urlParams = new URLSearchParams();
      Object.values(queryParams).forEach(param => {
        if (param.value.trim()) {
          urlParams.append(param.name, param.value);
        }
      });

      const finalUrl = urlParams.toString() ? `${testUrl}?${urlParams.toString()}` : testUrl;

      let headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      try {
        const parsedHeaders = JSON.parse(requestHeaders);
        headers = { ...headers, ...parsedHeaders };
      } catch (e) {
        console.warn('Invalid headers JSON, using defaults');
      }

      const requestOptions: RequestInit = {
        method: requestMethod,
        headers
      };

      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBody.trim()) {
        try {
          JSON.parse(requestBody); // Validate JSON
          requestOptions.body = requestBody;
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      const startTime = Date.now();
      const response = await fetch(finalUrl, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text();
        }
      } else {
        responseData = await response.text();
      }

      const testResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime,
        timestamp: new Date().toISOString(),
        url: finalUrl,
        method: requestMethod
      };

      setResponse(testResult);
      
      if (response.ok) {
        setResponseStatus('success');
        toast({
          title: "Test Successful",
          description: `Request completed in ${responseTime}ms`,
        });
      } else {
        setResponseStatus('error');
        toast({
          title: "Test Failed",
          description: `HTTP ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('❌ API test failed:', error);
      setResponse({
        error: error.message || 'Network error occurred',
        timestamp: new Date().toISOString(),
        url: testUrl,
        method: requestMethod
      });
      setResponseStatus('error');
      toast({
        title: "Test Error",
        description: error.message || 'Failed to execute test',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    }
  };

  const downloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-test-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "Response saved as JSON file",
      });
    }
  };

  if (!selectedApi || !selectedEndpoint) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Select an API and endpoint to start testing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            API Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL and Method */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <Select value={requestMethod} onValueChange={setRequestMethod}>
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
            <div className="col-span-3">
              <Input
                placeholder="API endpoint URL"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Query Parameters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Query Parameters</h3>
              <Button size="sm" variant="outline" onClick={addQueryParam}>
                Add Parameter
              </Button>
            </div>
            
            {Object.entries(queryParams).map(([key, param]) => (
              <div key={key} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Input
                    placeholder="Parameter name"
                    value={param.name}
                    onChange={(e) => updateQueryParam(key, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Parameter value"
                    value={param.value}
                    onChange={(e) => updateQueryParam(key, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={param.type}
                    onValueChange={(value) => updateQueryParam(key, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Badge variant={param.required ? "default" : "secondary"}>
                    {param.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeQueryParam(key)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Request Tabs */}
          <Tabs defaultValue="headers">
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>
            
            <TabsContent value="headers" className="space-y-2">
              <Textarea
                placeholder='{"Authorization": "Bearer your-token", "Content-Type": "application/json"}'
                value={requestHeaders}
                onChange={(e) => setRequestHeaders(e.target.value)}
                rows={6}
              />
            </TabsContent>
            
            <TabsContent value="body" className="space-y-2">
              <Textarea
                placeholder='{"key": "value"}'
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={8}
                disabled={!['POST', 'PUT', 'PATCH'].includes(requestMethod)}
              />
            </TabsContent>
          </Tabs>

          {/* Execute Button */}
          <Button 
            onClick={executeTest} 
            disabled={isLoading || !testUrl.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {responseStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {responseStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                Response
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyResponse}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadResponse}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Info */}
              {response.status && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant={response.status < 400 ? "default" : "destructive"}>
                    {response.status} {response.statusText}
                  </Badge>
                  {response.responseTime && (
                    <span className="text-muted-foreground">
                      Response time: {response.responseTime}ms
                    </span>
                  )}
                </div>
              )}

              {/* Response Data */}
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
