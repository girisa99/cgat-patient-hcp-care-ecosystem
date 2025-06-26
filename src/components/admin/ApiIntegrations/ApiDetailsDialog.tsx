
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Shield, 
  Database, 
  Code, 
  Copy,
  BookOpen,
  Key,
  FileText,
  Link,
  Lock,
  Zap,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiIntegrationDetails } from '@/hooks/usePublishedApiDetails';

interface ApiDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiDetails: ApiIntegrationDetails | null;
  isLoading: boolean;
}

const ApiDetailsDialog = ({ open, onOpenChange, apiDetails, isLoading }: ApiDetailsDialogProps) => {
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard",
    });
  };

  if (!apiDetails) return null;

  // Generate examples only if we have actual endpoints
  const generateExamples = () => {
    if (!apiDetails.endpoints || apiDetails.endpoints.length === 0) {
      return {
        curl: '# No endpoints available - Configure endpoints first',
        javascript: '// No endpoints available - Configure endpoints first',
        python: '# No endpoints available - Configure endpoints first'
      };
    }

    const sampleEndpoint = apiDetails.endpoints[0];
    const baseUrl = apiDetails.base_url;

    const curlExample = `# ${sampleEndpoint.description}
curl -X ${sampleEndpoint.method} "${baseUrl}${sampleEndpoint.url}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${sampleEndpoint.method === 'POST' ? ` \\
  -d '{
    "data": "example"
  }'` : ''}`;

    const jsExample = `// ${sampleEndpoint.description}
const response = await fetch('${baseUrl}${sampleEndpoint.url}', {
  method: '${sampleEndpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${sampleEndpoint.method === 'POST' ? `,
  body: JSON.stringify({
    data: 'example'
  })` : ''}
});

const data = await response.json();
console.log('Response:', data);`;

    const pythonExample = `# ${sampleEndpoint.description}
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

${sampleEndpoint.method === 'POST' ? `data = {'data': 'example'}

response = requests.${sampleEndpoint.method.toLowerCase()}(
    '${baseUrl}${sampleEndpoint.url}',
    headers=headers,
    json=data
)` : `response = requests.${sampleEndpoint.method.toLowerCase()}(
    '${baseUrl}${sampleEndpoint.url}',
    headers=headers
)`}

if response.status_code == 200:
    print('Response:', response.json())
else:
    print(f'Error: {response.status_code}')`;

    return { curl: curlExample, javascript: jsExample, python: pythonExample };
  };

  const examples = generateExamples();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {apiDetails.name}
            <Badge variant="outline">v{apiDetails.version}</Badge>
            <Badge variant="secondary">{apiDetails.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">Loading API details...</div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      API Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Name:</strong> {apiDetails.name}</div>
                    <div><strong>Version:</strong> {apiDetails.version}</div>
                    <div><strong>Category:</strong> {apiDetails.category}</div>
                    <div><strong>Base URL:</strong> <code className="bg-muted px-1 rounded text-sm">{apiDetails.base_url}</code></div>
                    <div><strong>Description:</strong> {apiDetails.description}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      API Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Endpoints:</strong> {apiDetails.endpoints.length}</div>
                    <div><strong>Database Tables:</strong> {apiDetails.database_schema.tables.length}</div>
                    <div><strong>Auth Methods:</strong> {apiDetails.security_config.authentication_methods.length}</div>
                    <div><strong>Rate Limit:</strong> {apiDetails.rate_limits.requests_per_hour}/hour</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rate Limits & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Requests/Hour:</strong> {apiDetails.rate_limits.requests_per_hour.toLocaleString()}</div>
                    <div><strong>Requests/Day:</strong> {apiDetails.rate_limits.requests_per_day.toLocaleString()}</div>
                    <div><strong>Burst Limit:</strong> {apiDetails.rate_limits.burst_limit}</div>
                    <div><strong>Rate Headers:</strong> {apiDetails.rate_limits.rate_limit_headers.length}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              {apiDetails.endpoints.length > 0 ? (
                <div className="space-y-3">
                  {apiDetails.endpoints.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              endpoint.method === 'GET' ? 'bg-green-50 text-green-700' :
                              endpoint.method === 'POST' ? 'bg-blue-50 text-blue-700' :
                              endpoint.method === 'PUT' ? 'bg-yellow-50 text-yellow-700' :
                              endpoint.method === 'DELETE' ? 'bg-red-50 text-red-700' :
                              'bg-gray-50 text-gray-700'
                            }>{endpoint.method}</Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{endpoint.url}</code>
                          </div>
                          <div className="flex gap-1">
                            {endpoint.is_public && (
                              <Badge variant="secondary" className="text-xs">Public</Badge>
                            )}
                            {endpoint.authentication?.required && (
                              <Badge variant="outline" className="text-xs">Auth Required</Badge>
                            )}
                          </div>
                        </div>
                        <h5 className="font-medium">{endpoint.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Endpoints Configured</h3>
                    <p className="text-muted-foreground">
                      This API has been published but no endpoints have been configured yet. 
                      Please add endpoints to make this API functional.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Authentication Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Supported Methods</h4>
                    <div className="space-y-2">
                      {apiDetails.security_config.authentication_methods.map((method, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{method}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Encryption Methods</h4>
                    <div className="space-y-1">
                      {apiDetails.security_config.encryption_methods.map((method, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Authorization Policies</h4>
                    <div className="space-y-1">
                      {apiDetails.security_config.authorization_policies.map((policy, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-blue-600" />
                          <span className="text-sm">{policy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiDetails.database_schema.tables.map((table) => (
                      <div key={table.name} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {table.name}
                        </h5>
                        
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-2">Columns ({table.columns.length})</h6>
                          <div className="space-y-1">
                            {table.columns.map((column) => (
                              <div key={column.name} className="flex items-center gap-2 text-sm">
                                <code className="bg-muted px-1 rounded text-xs">{column.name}</code>
                                <Badge variant="outline" className="text-xs">{column.type}</Badge>
                                {!column.nullable && <Badge variant="secondary" className="text-xs">NOT NULL</Badge>}
                                {column.default && <Badge variant="outline" className="text-xs">DEFAULT</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      cURL Example
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.curl)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.curl}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      JavaScript Example
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.javascript)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.javascript}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Python Example
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.python)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.python}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiDetailsDialog;
