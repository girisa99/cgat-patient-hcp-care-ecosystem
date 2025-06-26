
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Server, 
  Globe, 
  Download, 
  FileText, 
  Database,
  Shield,
  Code,
  Eye,
  Copy
} from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { InternalApiEndpointsList } from './InternalApiEndpointsList';
import { ExternalApiEndpointsList } from './ExternalApiEndpointsList';

interface ApiOverviewSectionProps {
  internalApis: ApiIntegration[];
  externalApis: ApiIntegration[];
  onDownloadCollection: (integrationId: string) => void;
  onViewDetails: (integrationId: string) => void;
  onCopyUrl: (url: string) => void;
}

export const ApiOverviewSection: React.FC<ApiOverviewSectionProps> = ({
  internalApis,
  externalApis,
  onDownloadCollection,
  onViewDetails,
  onCopyUrl
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('internal');

  const filteredInternalApis = internalApis.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.endpoints.some(endpoint => 
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredExternalApis = externalApis.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.endpoints.some(endpoint => 
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalEndpoints = [...internalApis, ...externalApis].reduce(
    (acc, api) => acc + api.endpoints.length, 0
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search APIs, endpoints, or methods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              {internalApis.length} Internal
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {externalApis.length} External
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {totalEndpoints} Endpoints
            </Badge>
          </div>
        </div>
      </div>

      {/* API Endpoints Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Internal APIs
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            External APIs
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-4">
          <InternalApiEndpointsList
            apis={filteredInternalApis}
            searchTerm={searchTerm}
            onDownloadCollection={onDownloadCollection}
            onViewDetails={onViewDetails}
            onCopyUrl={onCopyUrl}
          />
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <ExternalApiEndpointsList
            apis={filteredExternalApis}
            searchTerm={searchTerm}
            onDownloadCollection={onDownloadCollection}
            onViewDetails={onViewDetails}
            onCopyUrl={onCopyUrl}
          />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Auto-Generated Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    Internal API Documentation
                  </h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        // Generate OpenAPI spec
                        const spec = {
                          openapi: '3.0.0',
                          info: {
                            title: 'Healthcare Admin Internal API',
                            version: '1.0.0',
                            description: 'HIPAA-compliant healthcare administration platform APIs'
                          },
                          servers: [{ url: window.location.origin }],
                          paths: internalApis.reduce((acc, api) => {
                            api.endpoints.forEach(endpoint => {
                              acc[endpoint.url] = {
                                [endpoint.method.toLowerCase()]: {
                                  summary: endpoint.name,
                                  description: endpoint.description,
                                  responses: {
                                    '200': { description: 'Success' }
                                  }
                                }
                              };
                            });
                            return acc;
                          }, {} as any)
                        };
                        
                        const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'internal-api-openapi.json';
                        a.click();
                      }}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      OpenAPI Specification
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        if (internalApis[0]) {
                          onDownloadCollection(internalApis[0].id);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Postman Collection
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const schemas = internalApis.reduce((acc, api) => {
                          return { ...acc, ...api.schemas };
                        }, {});
                        
                        const blob = new Blob([JSON.stringify(schemas, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'internal-api-schemas.json';
                        a.click();
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Data Schemas
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        const policies = internalApis.reduce((acc, api) => {
                          return [...acc, ...api.rlsPolicies];
                        }, [] as any[]);
                        
                        const blob = new Blob([JSON.stringify(policies, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'internal-api-rls-policies.json';
                        a.click();
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      RLS Policies
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    External API Documentation
                  </h4>
                  <div className="space-y-2">
                    {externalApis.map((api) => (
                      <div key={api.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{api.name}</span>
                          <Badge variant="outline">v{api.version}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onDownloadCollection(api.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Collection
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewDetails(api.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {externalApis.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No external APIs configured yet
                      </div>
                    )}
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
