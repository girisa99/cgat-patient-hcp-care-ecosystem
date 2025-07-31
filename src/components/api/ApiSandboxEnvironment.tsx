import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, Settings, Code, Copy, 
  Send, FileText, AlertCircle, CheckCircle
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';
import { useMasterToast } from '@/hooks/useMasterToast';

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
  timestamp: string;
}

const ApiSandboxEnvironment: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [request, setRequest] = useState<SandboxRequest>({
    method: 'GET',
    endpoint: '',
    headers: { 'Content-Type': 'application/json' }
  });
  const [response, setResponse] = useState<SandboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { apiServices } = useMasterApiServices();
  const { showSuccess, showError } = useMasterToast();

  const activeApis = apiServices?.filter(api => api.status === 'active') || [];

  const handleMethodChange = (method: string) => {
    setRequest(prev => ({ ...prev, method }));
  };

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: { ...prev.headers, '': '' }
    }));
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      if (oldKey !== newKey) {
        delete newHeaders[oldKey];
      }
      newHeaders[newKey] = value;
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const executeRequest = async () => {
    if (!request.endpoint.trim()) {
      showError('Please enter an endpoint');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call for sandbox
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse: SandboxResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': '123ms'
        },
        data: {
          message: 'Sandbox response',
          endpoint: request.endpoint,
          method: request.method,
          timestamp: new Date().toISOString(),
          data: request.method === 'GET' ? { id: 1, name: 'Sample Data' } : { success: true }
        },
        timestamp: new Date().toISOString()
      };

      setResponse(mockResponse);
      showSuccess('Sandbox request executed successfully');
    } catch (error) {
      showError('Sandbox request failed');
      setResponse({
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: { error: 'Sandbox execution failed' },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* API Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sandbox Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select API</label>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an API to test" />
              </SelectTrigger>
              <SelectContent>
                {activeApis.map((api) => (
                  <SelectItem key={api.id} value={api.id}>
                    {api.name} - {api.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Request Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method and Endpoint */}
          <div className="flex space-x-2">
            <Select value={request.method} onValueChange={handleMethodChange}>
              <SelectTrigger className="w-32">
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
            <Input
              placeholder="/api/v1/endpoint"
              value={request.endpoint}
              onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
              className="flex-1"
            />
            <Button onClick={executeRequest} disabled={isLoading}>
              {isLoading ? (
                <PlayCircle className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
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
                    Remove
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
                value={request.body || ''}
                onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Display */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={response.status < 400 ? "default" : "destructive"}>
                  {response.status} {response.statusText}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response Headers */}
            <div>
              <h4 className="font-medium mb-2">Headers</h4>
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-blue-600">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Response Body */}
            <div>
              <h4 className="font-medium mb-2">Response Body</h4>
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-auto max-h-96">
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              </div>
            </div>

            {/* Response Info */}
            <div className="flex items-center text-sm text-gray-600">
              {response.status < 400 ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              )}
              Response received at {new Date(response.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiSandboxEnvironment;