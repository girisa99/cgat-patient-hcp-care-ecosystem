import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  PlayCircle, Code, Copy, Download, Settings, 
  CheckCircle, AlertCircle, Clock, FileText
} from "lucide-react";
import { useMasterToast } from '@/hooks/useMasterToast';

interface ApiEndpoint {
  id: string;
  endpoint_path: string;
  method: string;
  description?: string;
  category: string;
}

interface SandboxRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: string;
}

interface SandboxResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

interface ApiSandboxManagerProps {
  endpoint?: ApiEndpoint;
  onClose?: () => void;
}

const ApiSandboxManager: React.FC<ApiSandboxManagerProps> = ({ endpoint, onClose }) => {
  const [request, setRequest] = useState<SandboxRequest>({
    method: endpoint?.method || 'GET',
    endpoint: endpoint?.endpoint_path || '/api/v1/',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-api-key'
    },
    body: ''
  });
  
  const [response, setResponse] = useState<SandboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const executeRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const mockResponse: SandboxResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${Date.now() - startTime}ms`
        },
        data: {
          success: true,
          message: 'API call successful',
          data: {
            id: '12345',
            timestamp: new Date().toISOString(),
            endpoint: request.endpoint,
            method: request.method
          }
        },
        duration: Date.now() - startTime
      };
      
      setResponse(mockResponse);
      showSuccess('API request executed successfully');
    } catch (error) {
      const errorResponse: SandboxResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          error: 'Internal server error',
          message: 'An error occurred while processing the request'
        },
        duration: Date.now() - startTime
      };
      
      setResponse(errorResponse);
      showError('API request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        '': ''
      }
    }));
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      if (oldKey !== newKey) {
        delete newHeaders[oldKey];
      }
      newHeaders[newKey] = value;
      return {
        ...prev,
        headers: newHeaders
      };
    });
  };

  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return {
        ...prev,
        headers: newHeaders
      };
    });
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      showSuccess('Response copied to clipboard');
    }
  };

  const generateCodeSnippet = (language: string) => {
    const snippets = {
      curl: `curl -X ${request.method} \\
  "${request.endpoint}" \\
  ${Object.entries(request.headers).map(([key, value]) => `-H "${key}: ${value}"`).join(' \\\n  ')}${request.body ? ` \\\n  -d '${request.body}'` : ''}`,
      
      javascript: `fetch('${request.endpoint}', {
  method: '${request.method}',
  headers: ${JSON.stringify(request.headers, null, 2)},${request.body ? `\n  body: ${JSON.stringify(request.body)}` : ''}
})
.then(response => response.json())
.then(data => console.log(data));`,
      
      python: `import requests

response = requests.${request.method.toLowerCase()}(
    '${request.endpoint}',
    headers=${JSON.stringify(request.headers, null, 2).replace(/"/g, "'")},${request.body ? `\n    json=${request.body}` : ''}
)
print(response.json())`
    };
    
    return snippets[language as keyof typeof snippets] || '';
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
    if (status >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <PlayCircle className="h-6 w-6" />
            <span>API Sandbox</span>
          </h2>
          <p className="text-gray-600">Test API endpoints in a safe environment</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and Endpoint */}
            <div className="flex space-x-2">
              <Select value={request.method} onValueChange={(method) => setRequest(prev => ({ ...prev, method }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {httpMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="/api/v1/endpoint"
                value={request.endpoint}
                onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                className="flex-1"
              />
            </div>

            {/* Headers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Headers</label>
                <Button variant="outline" size="sm" onClick={addHeader}>
                  Add Header
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(request.headers).map(([key, value]) => (
                  <div key={key} className="flex space-x-2">
                    <Input
                      placeholder="Header name"
                      value={key}
                      onChange={(e) => updateHeader(key, e.target.value, value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header value"
                      value={value}
                      onChange={(e) => updateHeader(key, key, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHeader(key)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(request.method) && (
              <div>
                <label className="text-sm font-medium mb-2 block">Request Body</label>
                <Textarea
                  placeholder='{"key": "value"}'
                  value={request.body}
                  onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            )}

            <Button 
              onClick={executeRequest} 
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Response</span>
              </div>
              {response && (
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(response.status)}>
                    {response.status} {response.statusText}
                  </Badge>
                  <Badge variant="outline">
                    {response.duration}ms
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                {/* Response Headers */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Response Headers</label>
                  <div className="bg-gray-50 rounded p-2 text-sm font-mono">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-gray-600 w-32">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Response Body</label>
                    <Button variant="outline" size="sm" onClick={copyResponse}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded p-4 text-sm font-mono max-h-64 overflow-auto">
                    <pre>{JSON.stringify(response.data, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Execute a request to see the response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Generation */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Code Examples</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['curl', 'javascript', 'python'].map(language => (
                <div key={language}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium capitalize">{language}</label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generateCodeSnippet(language));
                        showSuccess(`${language} code copied to clipboard`);
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 rounded p-4 text-sm font-mono overflow-x-auto">
                    <pre>{generateCodeSnippet(language)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiSandboxManager;