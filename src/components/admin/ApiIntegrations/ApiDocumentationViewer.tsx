import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Database, 
  Code, 
  Play,
  Copy,
  ExternalLink,
  FileText,
  MapPin,
  Settings,
  Layers
} from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { ArchitectureDocumentation } from './ArchitectureDocumentation';

interface ApiDocumentationViewerProps {
  integration: ApiIntegration;
  onTestEndpoint: (endpointId: string) => void;
  onCopyCode: (code: string) => void;
}

export const ApiDocumentationViewer: React.FC<ApiDocumentationViewerProps> = ({
  integration,
  onTestEndpoint,
  onCopyCode
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(integration.endpoints[0]?.id);

  const selectedEndpointData = integration.endpoints.find(e => e.id === selectedEndpoint);

  const generateCurlExample = (endpoint: any) => {
    const headers = Object.entries(endpoint.headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ');
    
    const queryParams = endpoint.queryParams 
      ? '?' + Object.entries(endpoint.queryParams).map(([k, v]) => `${k}=${v}`).join('&')
      : '';

    const body = endpoint.method !== 'GET' && endpoint.bodySchema
      ? ` -d '${JSON.stringify(endpoint.bodySchema, null, 2)}'`
      : '';

    return `curl -X ${endpoint.method} "${endpoint.fullUrl || endpoint.url}${queryParams}" ${headers}${body}`;
  };

  const generateJavaScriptExample = (endpoint: any) => {
    const bodyData = endpoint.method !== 'GET' && endpoint.bodySchema
      ? `,\n  body: JSON.stringify(${JSON.stringify(endpoint.bodySchema, null, 2)})`
      : '';

    return `fetch('${endpoint.fullUrl || endpoint.url}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(endpoint.headers, null, 2)}${bodyData}
})
.then(response => response.json())
.then(data => console.log(data));`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{integration.name}</h3>
          <p className="text-muted-foreground">{integration.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={integration.type === 'internal' ? 'default' : 'secondary'}>
            {integration.type}
          </Badge>
          <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
            {integration.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="rls-policies">RLS Policies</TabsTrigger>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <ArchitectureDocumentation />
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {integration.endpoints.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className={`p-3 rounded-lg cursor-pointer border ${
                          selectedEndpoint === endpoint.id 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {endpoint.method}
                          </Badge>
                          {endpoint.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium">{endpoint.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {endpoint.url}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  {selectedEndpointData?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEndpointData && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEndpointData.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Request Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedEndpointData.method}</Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {selectedEndpointData.fullUrl || selectedEndpointData.url}
                          </code>
                        </div>
                        
                        {selectedEndpointData.headers && Object.keys(selectedEndpointData.headers).length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Headers</h5>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(selectedEndpointData.headers, null, 2)}
                            </pre>
                          </div>
                        )}

                        {selectedEndpointData.queryParams && Object.keys(selectedEndpointData.queryParams).length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Query Parameters</h5>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(selectedEndpointData.queryParams, null, 2)}
                            </pre>
                          </div>
                        )}

                        {selectedEndpointData.bodySchema && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Request Body</h5>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(selectedEndpointData.bodySchema, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onTestEndpoint(selectedEndpointData.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Test Endpoint
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCopyCode(generateCurlExample(selectedEndpointData))}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy cURL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCopyCode(generateJavaScriptExample(selectedEndpointData))}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy JS
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rls-policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Row Level Security Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {integration.rlsPolicies.length > 0 ? (
                <div className="space-y-4">
                  {integration.rlsPolicies.map((policy, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{policy.policyName}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{policy.operation}</Badge>
                          <Badge variant="secondary">{policy.tableName}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Condition:</span>
                          <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                            {policy.condition}
                          </code>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Roles:</span>
                          <div className="inline-flex gap-1 ml-2">
                            {policy.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No RLS policies defined for this integration
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Data Mapping Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {integration.mappings.length > 0 ? (
                <div className="space-y-4">
                  {integration.mappings.map((mapping, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Source Field</h4>
                          <code className="text-sm bg-blue-50 px-2 py-1 rounded">
                            {mapping.sourceField}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Target Field</h4>
                          <code className="text-sm bg-green-50 px-2 py-1 rounded">
                            {mapping.targetField}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Target Table</h4>
                          <Badge variant="outline">{mapping.targetTable}</Badge>
                        </div>
                      </div>
                      {mapping.transformation && (
                        <div className="mt-2">
                          <span className="text-sm font-medium">Transformation:</span>
                          <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                            {mapping.transformation}
                          </code>
                        </div>
                      )}
                      {mapping.validation && (
                        <div className="mt-2">
                          <span className="text-sm font-medium">Validation:</span>
                          <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                            {mapping.validation}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data mappings configured for this integration
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Schemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {Object.entries(integration.schemas).map(([schemaName, schema]) => (
                    <div key={schemaName} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{schemaName}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCopyCode(JSON.stringify(schema, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Schema
                        </Button>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(schema, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                API Testing Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Quick Test</h4>
                    <div className="space-y-2">
                      {integration.endpoints.slice(0, 3).map((endpoint) => (
                        <Button
                          key={endpoint.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => onTestEndpoint(endpoint.id)}
                        >
                          <Badge variant="outline" className="mr-2 text-xs">
                            {endpoint.method}
                          </Badge>
                          {endpoint.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Collection Testing</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          window.open('https://web.postman.co/', '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Postman Web
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          // Download and import collection logic
                          const collection = {
                            info: {
                              name: integration.name,
                              description: integration.description
                            },
                            item: integration.endpoints.map(endpoint => ({
                              name: endpoint.name,
                              request: {
                                method: endpoint.method,
                                header: Object.entries(endpoint.headers).map(([key, value]) => ({
                                  key,
                                  value
                                })),
                                url: {
                                  raw: endpoint.fullUrl || endpoint.url
                                }
                              }
                            }))
                          };
                          
                          const blob = new Blob([JSON.stringify(collection, null, 2)], { 
                            type: 'application/json' 
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${integration.name}-collection.json`;
                          a.click();
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Import to Postman
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Testing Guidelines</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Use the provided authentication headers for secured endpoints</p>
                    <p>• Test with sample data that matches the schema requirements</p>
                    <p>• Verify RLS policies by testing with different user roles</p>
                    <p>• Check data mapping by comparing source and target field values</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
