
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
  Zap,
  Globe,
  Server,
  Copy,
  Share,
  Eye
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { apiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
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
  const [activeTab, setActiveTab] = useState('overview');

  const internalApis = integrations?.filter(i => i.type === 'internal') || [];
  const externalApis = integrations?.filter(i => i.type === 'external') || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">API Integration Center</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading API integrations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Integration Center</h2>
          <p className="text-muted-foreground">
            Comprehensive view of internal platform APIs and external integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              const docs = apiIntegrationManager.exportApiDocumentation();
              const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'api-documentation.json';
              a.click();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Docs
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add External Integration
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{internalApis.length}</p>
                <p className="text-sm text-muted-foreground">Internal APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{externalApis.length}</p>
                <p className="text-sm text-muted-foreground">External APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations?.reduce((acc, i) => acc + i.endpoints.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Endpoints</p>
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
                <p className="text-sm text-muted-foreground">Collections Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internal">Internal APIs</TabsTrigger>
          <TabsTrigger value="external">External APIs</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Internal APIs Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-blue-500" />
              <h3 className="text-xl font-semibold">Internal Platform APIs</h3>
              <Badge variant="secondary">{internalApis.length} APIs</Badge>
            </div>
            
            <div className="grid gap-4">
              {internalApis.map((integration) => (
                <Card key={integration.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          {integration.name}
                          <Badge variant="outline">Internal</Badge>
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
                          onClick={() => copyToClipboard(integration.baseUrl)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Base URL
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
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{integration.endpoints.length}</p>
                        <p className="text-muted-foreground">Endpoints</p>
                      </div>
                      <div>
                        <p className="font-medium">{integration.category}</p>
                        <p className="text-muted-foreground">Category</p>
                      </div>
                      <div>
                        <p className="font-medium">{integration.sla?.uptime || 'N/A'}</p>
                        <p className="text-muted-foreground">SLA Uptime</p>
                      </div>
                      <div>
                        <p className="font-medium">{integration.sla?.responseTime || 'N/A'}</p>
                        <p className="text-muted-foreground">Response Time</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-4">
                      {integration.endpoints.slice(0, 8).map((endpoint, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {endpoint.method}
                        </Badge>
                      ))}
                      {integration.endpoints.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.endpoints.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* External APIs Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-green-500" />
              <h3 className="text-xl font-semibold">External Integrations</h3>
              <Badge variant="secondary">{externalApis.length} APIs</Badge>
            </div>
            
            <div className="grid gap-4">
              {externalApis.map((integration) => (
                <Card key={integration.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {integration.name}
                          <Badge variant="outline">External</Badge>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">{integration.endpoints.length}</p>
                        <p className="text-muted-foreground">Endpoints</p>
                      </div>
                      <div>
                        <p className="font-medium">{integration.mappings.length}</p>
                        <p className="text-muted-foreground">Data Mappings</p>
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
                  </CardContent>
                </Card>
              ))}
              
              {externalApis.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No External Integrations</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect external APIs to extend platform functionality.
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First External Integration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="internal">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Internal Platform APIs</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const internal = internalApis[0];
                    if (internal) copyToClipboard(internal.baseUrl);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Base URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const internal = internalApis[0];
                    if (internal) downloadPostmanCollection(internal.id);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Collection
                </Button>
              </div>
            </div>
            
            {internalApis.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">{integration.name}</h4>
                    <div className="grid gap-2">
                      {integration.endpoints.map((endpoint, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-4">
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {endpoint.url}
                            </code>
                            <span className="text-sm text-muted-foreground">
                              {endpoint.description}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {!endpoint.isPublic && <Badge variant="outline">Auth Required</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.fullUrl || endpoint.url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="external">
          <div className="space-y-4">
            {externalApis.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {integration.name}
                    <Badge variant="outline">External</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Base URL: </span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {integration.baseUrl}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Version: </span>
                        <span>{integration.version}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {integration.endpoints.map((endpoint, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{endpoint.method}</Badge>
                            <span className="text-sm">{endpoint.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIntegration(integration.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                API Documentation Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Export comprehensive API documentation for external sharing, including OpenAPI specifications, 
                  Postman collections, and detailed endpoint information.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const docs = apiIntegrationManager.exportApiDocumentation();
                      const blob = new Blob([JSON.stringify(docs.internal, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'internal-api-openapi.json';
                      a.click();
                    }}
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Internal APIs (OpenAPI)
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const docs = apiIntegrationManager.exportApiDocumentation();
                      const blob = new Blob([JSON.stringify(docs.external, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'external-integrations.json';
                      a.click();
                    }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    External Integrations
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Documentation Includes:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Complete OpenAPI 3.0 specifications</li>
                    <li>• Authentication requirements and examples</li>
                    <li>• Request/response schemas with validation rules</li>
                    <li>• Rate limiting and SLA information</li>
                    <li>• Contact information and support details</li>
                    <li>• Postman collections ready for import</li>
                  </ul>
                </div>
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
