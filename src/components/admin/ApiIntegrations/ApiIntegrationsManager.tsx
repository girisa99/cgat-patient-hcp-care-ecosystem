
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Download, 
  Play, 
  Settings, 
  Database, 
  Code, 
  FileText,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { CreateIntegrationDialog } from './CreateIntegrationDialog';
import { IntegrationDetailView } from './IntegrationDetailView';

const ApiIntegrationsManager = () => {
  const {
    integrations,
    isLoading,
    selectedIntegration,
    setSelectedIntegration,
    executeIntegration,
    isExecuting,
    downloadPostmanCollection
  } = useApiIntegrations();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">API Integrations</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading integrations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Integration Manager</h2>
          <p className="text-muted-foreground">
            Standardized external API integrations with auto-generated schemas and Postman collections
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{integrations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations?.reduce((acc, i) => acc + i.mappings.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Data Mappings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations?.reduce((acc, i) => acc + i.rlsPolicies.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">RLS Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{integrations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Postman Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="mappings">Data Mappings</TabsTrigger>
          <TabsTrigger value="collections">Postman Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations?.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {integration.name}
                        <Badge variant="secondary">v{integration.version}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {integration.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeIntegration({
                          integrationId: integration.id,
                          operation: 'manual'
                        })}
                        disabled={isExecuting}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Execute
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPostmanCollection(integration.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Collection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">{integration.endpoints.length}</p>
                      <p className="text-muted-foreground">Endpoints</p>
                    </div>
                    <div>
                      <p className="font-medium">{integration.mappings.length}</p>
                      <p className="text-muted-foreground">Mappings</p>
                    </div>
                    <div>
                      <p className="font-medium">{integration.rlsPolicies.length}</p>
                      <p className="text-muted-foreground">RLS Policies</p>
                    </div>
                    <div>
                      <p className="font-medium">{Object.keys(integration.schemas).length}</p>
                      <p className="text-muted-foreground">Schemas</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-4">
                    {integration.endpoints.slice(0, 5).map((endpoint, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {endpoint.method}
                      </Badge>
                    ))}
                    {integration.endpoints.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.endpoints.length - 5} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!integrations || integrations.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No API Integrations</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first API integration with automated schema generation.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schemas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Auto-Generated Schemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations?.map((integration) => (
                  <div key={integration.id}>
                    <h4 className="font-medium mb-2">{integration.name}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(integration.schemas).map(([name, schema]) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Mappings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations?.map((integration) => (
                  <div key={integration.id}>
                    <h4 className="font-medium mb-2">{integration.name}</h4>
                    <div className="space-y-2">
                      {integration.mappings.map((mapping, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-4">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {mapping.sourceField}
                            </code>
                            <span>→</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {mapping.targetTable}.{mapping.targetField}
                            </code>
                          </div>
                          <Badge variant="secondary">{mapping.transformation}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Postman Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {integrations?.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">{integration.name} Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        {integration.endpoints.length} endpoints • Auto-generated
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => downloadPostmanCollection(integration.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateIntegrationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedIntegration && (
        <IntegrationDetailView
          integrationId={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  );
};

export default ApiIntegrationsManager;
