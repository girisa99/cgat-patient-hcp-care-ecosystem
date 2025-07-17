import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  TestTube, Play, RefreshCw, Copy, Download,
  Code, FileText, Settings, Clock, CheckCircle,
  AlertCircle, ExternalLink
} from "lucide-react";

const SandboxTab: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState('healthcare-core');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/patients');
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock sandbox environments
  const sandboxEnvironments = [
    {
      id: 'healthcare-core',
      name: 'Healthcare Core API',
      version: 'v1.0.0',
      baseUrl: 'https://sandbox-api.example.com/v1',
      status: 'active',
      endpoints: [
        { path: '/patients', method: 'GET', description: 'Get patient list' },
        { path: '/patients/{id}', method: 'GET', description: 'Get patient by ID' },
        { path: '/patients', method: 'POST', description: 'Create new patient' },
        { path: '/facilities', method: 'GET', description: 'Get facilities list' }
      ]
    },
    {
      id: 'twilio-sms',
      name: 'SMS Communication API',
      version: 'v2.0.0',
      baseUrl: 'https://sandbox-sms.example.com/v2',
      status: 'active',
      endpoints: [
        { path: '/send-sms', method: 'POST', description: 'Send SMS message' },
        { path: '/verify-phone', method: 'POST', description: 'Verify phone number' },
        { path: '/message-status/{id}', method: 'GET', description: 'Get message status' }
      ]
    },
    {
      id: 'ai-processing',
      name: 'AI Document Processing',
      version: 'v1.2.0',
      baseUrl: 'https://sandbox-ai.example.com/v1',
      status: 'beta',
      endpoints: [
        { path: '/extract-text', method: 'POST', description: 'Extract text from document' },
        { path: '/analyze-document', method: 'POST', description: 'Analyze document structure' },
        { path: '/job-status/{id}', method: 'GET', description: 'Get processing job status' }
      ]
    }
  ];

  const currentApi = sandboxEnvironments.find(api => api.id === selectedApi);

  const handleApiTest = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        GET: {
          '/patients': {
            data: [
              { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' }
            ],
            total: 2,
            page: 1
          },
          '/facilities': {
            data: [
              { id: 1, name: 'General Hospital', type: 'hospital', location: 'New York' },
              { id: 2, name: 'Family Clinic', type: 'clinic', location: 'Boston' }
            ],
            total: 2
          }
        },
        POST: {
          '/send-sms': {
            message_id: 'msg_123456',
            status: 'sent',
            to: '+1234567890',
            timestamp: new Date().toISOString()
          },
          '/patients': {
            id: 3,
            name: 'New Patient',
            email: 'newpatient@example.com',
            status: 'active',
            created_at: new Date().toISOString()
          }
        }
      };

      const responseData = mockResponse[requestMethod]?.[selectedEndpoint] || { 
        error: 'Endpoint not found',
        message: 'This is a mock response for testing purposes'
      };

      setResponse(JSON.stringify(responseData, null, 2));
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
          <h2 className="text-2xl font-bold">API Sandbox Environment</h2>
          <p className="text-gray-600">Test APIs in a safe sandbox environment with mock data</p>
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

      {/* Sandbox Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Available Sandbox Environments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sandboxEnvironments.map((env) => (
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
                    <p className="text-sm text-gray-600">Version {env.version}</p>
                    <p className="text-xs text-gray-500">{env.endpoints.length} endpoints available</p>
                    <Badge variant="outline" className="text-xs">
                      {env.baseUrl}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                disabled={isLoading}
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
                      245ms
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
                  <p>No response yet. Click "Test API" to see the results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Code Examples */}
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

      {/* Sandbox Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Sandbox Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Purpose:</strong> Test API functionality without affecting production data</p>
            <p><strong>Data:</strong> All sandbox environments use mock data that resets daily</p>
            <p><strong>Rate Limits:</strong> More lenient rate limits for testing (1000 requests/hour)</p>
            <p><strong>Authentication:</strong> Use sandbox API keys (prefix: sk_test_)</p>
            <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
              <p className="text-blue-800 font-medium">💡 Tip:</p>
              <p>Use Postman collections for comprehensive API testing and documentation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SandboxTab;