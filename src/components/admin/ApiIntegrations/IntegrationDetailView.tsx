
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { Code, Database, Shield, FileText } from 'lucide-react';

interface IntegrationDetailViewProps {
  integrationId: string;
  onClose: () => void;
}

export const IntegrationDetailView: React.FC<IntegrationDetailViewProps> = ({
  integrationId,
  onClose
}) => {
  const { integrations } = useApiIntegrations();
  const integration = integrations?.find(i => i.id === integrationId);

  if (!integration) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {integration.name}
            <Badge variant="secondary">v{integration.version}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="endpoints">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
            <TabsTrigger value="mappings">Mappings</TabsTrigger>
            <TabsTrigger value="policies">RLS Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints">
            <div className="space-y-4">
              {integration.endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                        {endpoint.method}
                      </Badge>
                      {endpoint.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">URL: </span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {integration.baseUrl}{endpoint.url}
                        </code>
                      </div>
                      {endpoint.description && (
                        <div>
                          <span className="text-sm font-medium">Description: </span>
                          <span className="text-sm">{endpoint.description}</span>
                        </div>
                      )}
                      {Object.keys(endpoint.headers).length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Headers: </span>
                          <div className="mt-1">
                            {Object.entries(endpoint.headers).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="mr-2 mb-1">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schemas">
            <div className="space-y-4">
              {Object.entries(integration.schemas).map(([name, schema]) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Code className="h-4 w-4" />
                      {name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(schema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mappings">
            <div className="space-y-4">
              {integration.mappings.map((mapping, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Database className="h-4 w-4 text-blue-500" />
                        <div>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {mapping.sourceField}
                          </code>
                          <span className="mx-2">→</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {mapping.targetTable}.{mapping.targetField}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{mapping.transformation}</Badge>
                        {mapping.validation && (
                          <Badge variant="outline">{mapping.validation}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies">
            <div className="space-y-4">
              {integration.rlsPolicies.map((policy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      {policy.policyName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <span className="text-sm font-medium">Table:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {policy.tableName}
                        </code>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-sm font-medium">Operation:</span>
                        <Badge variant="outline">{policy.operation}</Badge>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-sm font-medium">Condition:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {policy.condition}
                        </code>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-sm font-medium">Roles:</span>
                        <div>
                          {policy.roles.map(role => (
                            <Badge key={role} variant="secondary" className="mr-1">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
