
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code2, Database, Shield, Zap } from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';

interface ApiDocumentationViewerProps {
  integration: ApiIntegration;
}

export const ApiDocumentationViewer: React.FC<ApiDocumentationViewerProps> = ({ integration }) => {
  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {integration.name}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                {integration.status}
              </Badge>
              <Badge variant="outline">{integration.type}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{integration.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Base URL</p>
              <p className="text-sm">{integration.baseUrl}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Version</p>
              <p className="text-sm">{integration.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-sm">{integration.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Endpoints</p>
              <p className="text-sm">{integration.endpoints.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Tabs */}
      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data-mappings">Data Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {integration.endpoints.map((endpoint) => (
                    <Card key={endpoint.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 
                                          endpoint.method === 'POST' ? 'destructive' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {endpoint.url}
                            </code>
                          </div>
                          <Badge variant={endpoint.isPublic ? 'outline' : 'default'}>
                            {endpoint.isPublic ? 'Public' : 'Protected'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{endpoint.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                        
                        {endpoint.parameters.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Parameters:</p>
                            <div className="flex flex-wrap gap-1">
                              {endpoint.parameters.map((param) => (
                                <Badge key={param} variant="outline" className="text-xs">
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Responses:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(endpoint.responses).map(([code, description]) => (
                              <div key={code} className="text-xs">
                                <Badge variant="outline" className="mr-1">{code}</Badge>
                                <span className="text-gray-600">{description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Schemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(integration.schemas).length > 0 ? (
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(integration.schemas, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No schemas defined for this integration.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & RLS Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.rlsPolicies.length > 0 ? (
                  integration.rlsPolicies.map((policy) => (
                    <Card key={policy.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{policy.policyName}</h4>
                          <Badge variant="outline">{policy.operation}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Table:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded">{policy.tableName}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Condition:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{policy.condition}</code>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-gray-700 mb-1">Roles:</p>
                          <div className="flex flex-wrap gap-1">
                            {policy.roles.map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No RLS policies defined for this integration.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-mappings">
          <Card>
            <CardHeader>
              <CardTitle>Data Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.mappings.length > 0 ? (
                  integration.mappings.map((mapping) => (
                    <Card key={mapping.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Source Field:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded">{mapping.sourceField}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Target Field:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded">{mapping.targetField}</code>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Target Table:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded">{mapping.targetTable}</code>
                          </div>
                        </div>
                        {mapping.transformation && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700">Transformation:</p>
                            <Badge variant="outline">{mapping.transformation}</Badge>
                          </div>
                        )}
                        {mapping.validation && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Validation:</p>
                            <div className="text-xs space-y-1">
                              <div>Required: {mapping.validation.required ? 'Yes' : 'No'}</div>
                              <div>Type: {mapping.validation.type}</div>
                              <div>Rules: {mapping.validation.rules.join(', ')}</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No data mappings defined for this integration.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
