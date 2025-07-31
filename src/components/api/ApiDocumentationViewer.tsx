import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, ExternalLink, Download, Copy, 
  Globe, Lock, PlayCircle, Code
} from "lucide-react";
import { useMasterToast } from '@/hooks/useMasterToast';

interface ApiEndpoint {
  id: string;
  endpoint_path: string;
  method: string;
  description?: string;
  category: string;
  is_public: boolean;
  requires_authentication: boolean;
  sandbox_available: boolean;
  testing_status: string;
}

interface ApiDocumentationViewerProps {
  endpoint: ApiEndpoint;
  isOpen: boolean;
  onClose: () => void;
  onTest?: () => void;
}

const ApiDocumentationViewer: React.FC<ApiDocumentationViewerProps> = ({
  endpoint,
  isOpen,
  onClose,
  onTest
}) => {
  const { showSuccess } = useMasterToast();

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint.endpoint_path);
    showSuccess('Endpoint path copied to clipboard');
  };

  const generateCurlExample = () => {
    const authHeader = endpoint.requires_authentication ? '-H "Authorization: Bearer YOUR_API_KEY" ' : '';
    const baseUrl = 'https://api.yourdomain.com';
    
    return `curl -X ${endpoint.method} \\
  "${baseUrl}${endpoint.endpoint_path}" \\
  ${authHeader}-H "Content-Type: application/json"`;
  };

  const generateJavaScriptExample = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (endpoint.requires_authentication) {
      headers['Authorization'] = 'Bearer YOUR_API_KEY';
    }

    return `fetch('https://api.yourdomain.com${endpoint.endpoint_path}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(headers, null, 2)}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const copyCodeExample = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    showSuccess(`${language} example copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>API Documentation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Endpoint Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
                    {endpoint.endpoint_path}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyEndpoint}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                {onTest && (
                  <Button onClick={onTest}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Test in Sandbox
                  </Button>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                {endpoint.description || 'No description available for this endpoint.'}
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {endpoint.is_public ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">
                    {endpoint.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {endpoint.requires_authentication ? 'Auth Required' : 'No Auth'}
                  </span>
                </div>
                
                <Badge variant="outline">
                  {endpoint.category}
                </Badge>
                
                <Badge variant={endpoint.testing_status === 'passed' ? 'default' : 'secondary'}>
                  {endpoint.testing_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">URL</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  https://api.yourdomain.com{endpoint.endpoint_path}
                </code>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Method</h4>
                <Badge className={getMethodColor(endpoint.method)}>
                  {endpoint.method}
                </Badge>
              </div>
              
              {endpoint.requires_authentication && (
                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    This endpoint requires authentication. Include your API key in the Authorization header.
                  </p>
                  <code className="bg-gray-100 p-2 rounded block text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Headers</h4>
                <div className="space-y-1">
                  <code className="bg-gray-100 p-2 rounded block text-sm">
                    Content-Type: application/json
                  </code>
                  {endpoint.requires_authentication && (
                    <code className="bg-gray-100 p-2 rounded block text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Details */}
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Success Response (200 OK)</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "12345",
    "timestamp": "2024-01-01T00:00:00Z",
    "result": "Operation completed successfully"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Error Response (400/401/404/500)</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
{`{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": "Missing required field: 'name'"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Code Examples</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">cURL</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyCodeExample(generateCurlExample(), 'cURL')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {generateCurlExample()}
                  </pre>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">JavaScript</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyCodeExample(generateJavaScriptExample(), 'JavaScript')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {generateJavaScriptExample()}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  This endpoint is subject to rate limiting to ensure fair usage.
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Free tier:</strong> 1,000 requests per hour</li>
                    <li>• <strong>Pro tier:</strong> 10,000 requests per hour</li>
                    <li>• <strong>Enterprise:</strong> Custom limits available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiDocumentationViewer;