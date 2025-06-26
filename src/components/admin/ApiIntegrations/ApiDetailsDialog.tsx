
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
  Activity
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

  // Generate real examples based on actual endpoints
  const generateRealExamples = () => {
    const baseUrl = apiDetails.base_url;
    const sampleEndpoint = apiDetails.endpoints[0];
    
    if (!sampleEndpoint) {
      return {
        curl: `# No endpoints available`,
        javascript: `// No endpoints available`,
        python: `# No endpoints available`
      };
    }

    const curlExample = `# ${sampleEndpoint.description}
curl -X ${sampleEndpoint.method} "${baseUrl}${sampleEndpoint.url}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json"${sampleEndpoint.method === 'POST' ? ` \\
  -d '{
    "example": "data"
  }'` : ''}`;

    const jsExample = `// ${sampleEndpoint.description}
const response = await fetch('${baseUrl}${sampleEndpoint.url}', {
  method: '${sampleEndpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }${sampleEndpoint.method === 'POST' ? `,
  body: JSON.stringify({
    example: 'data'
  })` : ''}
});

if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}

const data = await response.json();
console.log('Response:', data);`;

    const pythonExample = `# ${sampleEndpoint.description}
import requests
import json

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

${sampleEndpoint.method === 'POST' ? `data = {
    'example': 'data'
}

response = requests.${sampleEndpoint.method.toLowerCase()}(
    '${baseUrl}${sampleEndpoint.url}',
    headers=headers,
    json=data
)` : `response = requests.${sampleEndpoint.method.toLowerCase()}(
    '${baseUrl}${sampleEndpoint.url}',
    headers=headers
)`}

if response.status_code == 200:
    data = response.json()
    print('Response:', data)
else:
    print(f'Error: {response.status_code} - {response.text}')`;

    return { curl: curlExample, javascript: jsExample, python: pythonExample };
  };

  const examples = generateRealExamples();

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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
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
                    {apiDetails.description && (
                      <div><strong>Description:</strong> {apiDetails.description}</div>
                    )}
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
                    <div><strong>RLS Policies:</strong> {apiDetails.rls_policies.length}</div>
                    <div><strong>Data Mappings:</strong> {apiDetails.data_mappings.length}</div>
                    <div><strong>Database Tables:</strong> {apiDetails.database_schema.tables.length}</div>
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
                    <div><strong>Rate Limit Headers:</strong> {apiDetails.rate_limits.rate_limit_headers.length}</div>
                  </div>
                  <div>
                    <strong>Rate Limit Headers:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {apiDetails.rate_limits.rate_limit_headers.map((header, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{header}</Badge>
                      ))}
                    </div>
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
                        {endpoint.authentication && (
                          <div className="mt-2 text-sm">
                            <strong>Authentication:</strong> {endpoint.authentication.description}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No endpoints configured for this API</p>
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
                    <h4 className="font-medium mb-2">Supported Authentication Methods</h4>
                    <div className="space-y-2">
                      {apiDetails.security_config.authentication_methods.map((method, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{method}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Getting Started</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">1</span>
                        <span>Register for a developer account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2</span>
                        <span>Submit an application for API access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">3</span>
                        <span>Wait for approval (typically 1-2 business days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">4</span>
                        <span>Receive your API key via email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">5</span>
                        <span>Start making API calls with proper authentication headers</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Authentication Header Format</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Include your API key in the Authorization header of every authenticated request.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Encryption & Security
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

                  <div>
                    <h4 className="font-medium mb-2">Data Protection</h4>
                    <div className="space-y-1">
                      {apiDetails.security_config.data_protection.map((protection, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-purple-600" />
                          <span className="text-sm">{protection}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Row-Level Security Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiDetails.rls_policies.map((policy) => (
                      <div key={policy.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{policy.policy_name}</h5>
                          <Badge variant="outline">{policy.operation}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Table:</strong> {policy.table_name}</div>
                          <div><strong>Condition:</strong> <code className="bg-muted px-1 rounded text-xs">{policy.condition}</code></div>
                          {policy.description && (
                            <div><strong>Description:</strong> {policy.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Mappings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiDetails.data_mappings.map((mapping) => (
                      <div key={mapping.id} className="border rounded-lg p-3">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <strong>Mapping:</strong>
                            <code className="bg-blue-50 text-blue-700 px-1 rounded text-xs">{mapping.source_field}</code>
                            <span>→</span>
                            <code className="bg-green-50 text-green-700 px-1 rounded text-xs">{mapping.target_table}.{mapping.target_field}</code>
                          </div>
                          {mapping.transformation && (
                            <div><strong>Transformation:</strong> {mapping.transformation}</div>
                          )}
                          {mapping.validation && (
                            <div><strong>Validation:</strong> {mapping.validation}</div>
                          )}
                        </div>
                      </div>
                    ))}
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
                          <h6 className="text-sm font-medium mb-2">Columns</h6>
                          <div className="space-y-1">
                            {table.columns.map((column) => (
                              <div key={column.name} className="flex items-center gap-2 text-sm">
                                <code className="bg-muted px-1 rounded text-xs">{column.name}</code>
                                <Badge variant="outline" className="text-xs">{column.type}</Badge>
                                {!column.nullable && <Badge variant="secondary" className="text-xs">NOT NULL</Badge>}
                                {column.default && <Badge variant="outline" className="text-xs">DEFAULT: {column.default}</Badge>}
                                {column.description && (
                                  <span className="text-muted-foreground">- {column.description}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {table.foreign_keys.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-sm font-medium mb-2">Foreign Keys</h6>
                            <div className="space-y-1">
                              {table.foreign_keys.map((fk, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Link className="h-3 w-3" />
                                  <code className="bg-muted px-1 rounded text-xs">{fk.column}</code>
                                  <span>→</span>
                                  <code className="bg-muted px-1 rounded text-xs">{fk.references_table}.{fk.references_column}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {table.indexes && table.indexes.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium mb-2">Indexes</h6>
                            <div className="space-y-1">
                              {table.indexes.map((index, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Database className="h-3 w-3" />
                                  <code className="bg-muted px-1 rounded text-xs">{index.name}</code>
                                  <span>({index.columns.join(', ')})</span>
                                  {index.unique && <Badge variant="secondary" className="text-xs">UNIQUE</Badge>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="architecture" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Design Principles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.design_principles.map((principle, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{principle}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Architecture Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.patterns.map((pattern, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Scalability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.scalability.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Reliability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.reliability.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      JavaScript/Node.js Example
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

                <Card>
                  <CardHeader>
                    <CardTitle>SDK Installation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">JavaScript/Node.js</h5>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">npm install @healthcare-api/{apiDetails.name.toLowerCase().replace(/\s+/g, '-')}-sdk</code>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Python</h5>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">pip install healthcare-api-{apiDetails.name.toLowerCase().replace(/\s+/g, '-')}</code>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Usage Example</h5>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">
                          {`// Import the SDK
import { HealthcareApiClient } from '@healthcare-api/${apiDetails.name.toLowerCase().replace(/\s+/g, '-')}-sdk';

// Initialize client
const client = new HealthcareApiClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: '${apiDetails.base_url}'
});

// Make API calls
const result = await client.request('${apiDetails.endpoints[0]?.url || '/api/endpoint'}');`}
                        </code>
                      </div>
                    </div>
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
