
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { X, ExternalLink, Download } from 'lucide-react';

interface IntegrationDetailViewProps {
  integrationId: string;
  onClose: () => void;
}

export const IntegrationDetailView: React.FC<IntegrationDetailViewProps> = ({
  integrationId,
  onClose
}) => {
  const { integrations, downloadPostmanCollection } = useApiIntegrations();
  
  const integration = integrations?.find(i => i.id === integrationId);

  if (!integration) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Integration not found</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>The requested integration could not be found.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{integration.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Integration Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {integration.type}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="ml-2">
                    {integration.category}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={integration.status === 'active' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {integration.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Version:</span>
                  <span className="ml-2">{integration.version}</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>

              <div>
                <span className="font-medium">Base URL:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {integration.baseUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(integration.baseUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints ({integration.endpoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integration.endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {endpoint.method}
                        </Badge>
                        <span className="font-medium">{endpoint.name}</span>
                      </div>
                      <Badge variant={endpoint.isPublic ? 'secondary' : 'default'}>
                        {endpoint.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <code className="text-sm text-muted-foreground">
                      {endpoint.url}
                    </code>
                    <p className="text-sm mt-1">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RLS Policies */}
          {integration.rlsPolicies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>RLS Policies ({integration.rlsPolicies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.rlsPolicies.map((policy, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{policy.policyName}</span>
                        <Badge variant="outline">{policy.operation}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Table: </span>
                        {policy.tableName}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Condition: </span>
                        <code className="text-xs">{policy.condition}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Mappings */}
          {integration.mappings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Mappings ({integration.mappings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.mappings.map((mapping, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{mapping.sourceField}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{mapping.targetTable}.{mapping.targetField}</span>
                        </div>
                        {mapping.transformation && (
                          <Badge variant="outline" className="text-xs">
                            {mapping.transformation}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => downloadPostmanCollection(integration.id)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Postman Collection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
