
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useApiServiceDetails } from '@/hooks/useApiServiceDetails';
import { 
  Server, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Download, 
  Eye,
  FileText,
  Settings,
  Database,
  Shield,
  Code,
  Zap,
  Key
} from 'lucide-react';

interface ApiService {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  base_url?: string;
  version: string;
  status: string;
  direction: string;
  purpose: string;
  endpoints_count?: number;
  documentation_url?: string;
  created_at: string;
  updated_at: string;
}

interface InternalApiEndpointsListProps {
  apis: ApiService[];
  searchTerm: string;
  onDownloadCollection: (integrationId: string) => void;
  onViewDetails: (integrationId: string) => void;
  onViewDocumentation: (integrationId: string) => void;
  onCopyUrl: (url: string) => void;
}

export const InternalApiEndpointsList: React.FC<InternalApiEndpointsListProps> = ({
  apis,
  searchTerm,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const [expandedApis, setExpandedApis] = React.useState<Record<string, boolean>>({});
  const { apiEndpoints, getDetailedApiStats } = useApiServiceDetails();

  const toggleApi = (apiId: string) => {
    setExpandedApis(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
  };

  // Get detailed stats for all APIs
  const detailedStats = getDetailedApiStats(apis);

  if (apis.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Internal APIs Found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'No APIs match your search criteria.' : 'Internal APIs will appear here automatically.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {apis.map((api) => {
        const isExpanded = expandedApis[api.id];
        const apiDetail = detailedStats.apiBreakdown[api.id];
        const apiEndpointsForThisApi = apiEndpoints.filter(endpoint => 
          endpoint.external_api_id === api.id
        );
        
        return (
          <Card key={api.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4" />
                    {api.name}
                    <Badge variant="outline">Internal</Badge>
                    <Badge variant="secondary">v{api.version}</Badge>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">
                    {api.description || 'No description provided'}
                  </p>
                  
                  {/* Real Data Metrics */}
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {apiEndpointsForThisApi.length} endpoints
                    </span>
                    <span className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      {apiEndpointsForThisApi.filter(e => e.request_schema || e.response_schema).length} schemas
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {apiEndpointsForThisApi.filter(e => e.requires_authentication).length} secured
                    </span>
                    {api.documentation_url && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Documentation
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {api.direction}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {api.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyUrl(api.base_url || `${window.location.origin}/api/v1/${api.id}`)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownloadCollection(api.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Collection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(api.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Collapsible open={isExpanded} onOpenChange={() => toggleApi(api.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">API Details & Endpoints</span>
                      <Badge variant="outline">{apiEndpointsForThisApi.length} endpoints</Badge>
                    </div>
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-4 border rounded-lg bg-background">
                    {/* Service Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Service Information</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>ID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{api.id}</code></div>
                          <div><strong>Type:</strong> {api.type}</div>
                          <div><strong>Direction:</strong> {api.direction}</div>
                          <div><strong>Category:</strong> {api.category}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Technical Details</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Base URL:</strong> {api.base_url ? (
                            <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">{api.base_url}</code>
                          ) : (
                            <span className="text-muted-foreground">Auto-configured</span>
                          )}</div>
                          <div><strong>Version:</strong> {api.version}</div>
                          <div><strong>Status:</strong> {api.status}</div>
                          <div><strong>Documentation:</strong> {api.documentation_url ? (
                            <a href={api.documentation_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Available
                            </a>
                          ) : (
                            <span className="text-muted-foreground">Not configured</span>
                          )}</div>
                        </div>
                      </div>
                    </div>

                    {/* Endpoints List */}
                    {apiEndpointsForThisApi.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">API Endpoints ({apiEndpointsForThisApi.length})</h4>
                        <div className="space-y-2">
                          {apiEndpointsForThisApi.map((endpoint) => (
                            <div key={endpoint.id} className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {endpoint.method?.toUpperCase()}
                                  </Badge>
                                  <code className="text-sm">{endpoint.external_path}</code>
                                  {endpoint.requires_authentication && (
                                    <Shield className="h-3 w-3 text-orange-500" title="Requires Authentication" />
                                  )}
                                  {endpoint.is_public && (
                                    <Badge variant="outline" className="text-xs text-green-600">Public</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {endpoint.request_schema && <span>Request Schema</span>}
                                  {endpoint.response_schema && <span>Response Schema</span>}
                                </div>
                              </div>
                              {endpoint.summary && (
                                <p className="text-sm text-muted-foreground mt-1">{endpoint.summary}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Purpose & Usage</h4>
                      <p className="text-sm text-muted-foreground">
                        {api.purpose || 'General API service for internal healthcare operations'}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
