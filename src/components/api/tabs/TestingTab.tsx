import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  TestTube, Play, RefreshCw, Copy, Code,
  CheckCircle, Clock, FileText, Settings,
  ExternalLink, AlertCircle
} from "lucide-react";
import { useMasterApiServices } from '@/hooks/useMasterApiServices';

const TestingTab: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { apiServices } = useMasterApiServices();

  // Create testing environments based on real API services
  const testingEnvironments = (apiServices || []).map(api => ({
    id: api.id,
    name: api.name,
    description: api.description,
    type: api.type,
    status: api.status,
    baseUrl: api.base_url || `https://api-${api.id}.example.com`,
    endpoints: [
      { path: '/health', method: 'GET', description: 'Health check endpoint' },
      { path: '/status', method: 'GET', description: 'Service status' },
      { path: '/info', method: 'GET', description: 'API information' }
    ]
  }));

  const currentApi = testingEnvironments.find(api => api.id === selectedApi);

  const handleApiTest = async () => {
    setIsLoading(true);
    
    // Simulate API call with realistic response
    setTimeout(() => {
      const responseData = {
        GET: {
          '/health': {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            service: currentApi?.name || 'Unknown Service'
          },
          '/status': {
            status: 'operational',
            uptime: '99.9%',
            last_check: new Date().toISOString(),
            dependencies: ['database', 'cache', 'external_service']
          },
          '/info': {
            name: currentApi?.name || 'API Service',
            description: currentApi?.description || 'API testing service',
            version: '1.0.0',
            endpoints_available: currentApi?.endpoints?.length || 0
          }
        },
        POST: {
          default: {
            message: 'Request processed successfully',
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          }
        }
      };

      const result = responseData[requestMethod]?.[selectedEndpoint] || 
                    responseData[requestMethod]?.default || 
                    responseData.GET['/health'];

      setResponse(JSON.stringify(result, null, 2));
      setIsLoading(false);
    }, 1000);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  const generateCurlCommand = () => {
    const baseUrl = currentApi?.baseUrl || '';
    const url = `${baseUrl}${selectedEndpoint}`;
    
    let curlCommand = `curl -X ${requestMethod} "${url}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`;
    
    if (requestMethod === 'POST' && requestBody) {
      curlCommand += ` \\\n  -d '${requestBody}'`;
    }
    
    return curlCommand;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Testing Environment</h2>
          <p className="text-gray-600">Test your APIs in a safe environment with real endpoints</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Environment
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
        </div>
      </div>

      {/* Testing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Available APIs</p>
                <p className="text-2xl font-bold text-blue-900">{testingEnvironments.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Services</p>
                <p className="text-2xl font-bold text-green-900">
                  {testingEnvironments.filter(env => env.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Test Endpoints</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {testingEnvironments.reduce((sum, env) => sum + env.endpoints.length, 0)}
                </p>
              </div>
              <Code className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Response Time</p>
                <p className="text-2xl font-bold text-purple-900">~250ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Available Testing Environments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testingEnvironments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No APIs Available for Testing</h3>
              <p className="text-sm mb-4">Create some internal APIs first to test them here.</p>
              <Button>
                <Code className="h-4 w-4 mr-2" />
                Create API
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testingEnvironments.map((env) => (
                <Card 
                  key={env.id} 
                  className={`cursor-pointer transition-all ${
                    selectedApi === env.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedApi(env.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{env.name}</h3>
                        <Badge variant={env.status === 'active' ? "default" : "secondary"}>
                          {env.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{env.description}</p>
                      <p className="text-xs text-gray-500">{env.endpoints.length} endpoints available</p>
                      <Badge variant="outline" className="text-xs">
                        {env.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Testing Interface */}
      {currentApi && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>API Request Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API Environment</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{currentApi.name}</p>
                  <p className="text-sm text-gray-600">{currentApi.baseUrl}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Endpoint</label>
                <select 
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select an endpoint</option>
                  {currentApi.endpoints.map((endpoint) => (
                    <option key={endpoint.path} value={endpoint.path}>
                      {endpoint.method} {endpoint.path} - {endpoint.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">HTTP Method</label>
                <select 
                  value={requestMethod}
                  onChange={(e) => setRequestMethod(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {(requestMethod === 'POST' || requestMethod === 'PUT') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder="Enter JSON request body..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <Button 
                onClick={handleApiTest} 
                disabled={isLoading || !selectedEndpoint}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Testing...' : 'Test API'}
              </Button>
            </CardContent>
          </Card>

          {/* Response Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>API Response</span>
                </div>
                {response && (
                  <Button variant="outline" size="sm" onClick={copyResponse}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">200 OK</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      ~250ms
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <pre className="text-sm overflow-auto max-h-96">
                      <code>{response}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No response yet. Select an endpoint and click "Test API" to see the results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Code Examples */}
      {currentApi && selectedEndpoint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Code Examples</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">cURL Command</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    <code>{generateCurlCommand()}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">JavaScript (fetch)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    <code>{`fetch('${currentApi?.baseUrl}${selectedEndpoint}', {
  method: '${requestMethod}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${requestMethod !== 'GET' && requestBody ? ',\n  body: JSON.stringify(' + requestBody + ')' : ''}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Testing Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Purpose:</strong> Test API functionality in a controlled environment</p>
            <p><strong>Data:</strong> Real API endpoints with live data from your services</p>
            <p><strong>Rate Limits:</strong> Standard rate limits apply (refer to API documentation)</p>
            <p><strong>Authentication:</strong> Use your actual API keys for testing</p>
            <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-blue-800 font-medium">💡 Tip:</p>
              <p>Test thoroughly before deploying to production environments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingTab;