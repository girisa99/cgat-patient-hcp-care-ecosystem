
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Download, 
  Eye, 
  Settings,
  Play,
  Database,
  FileText,
  Shield
} from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';

interface ExternalApiEndpointsListProps {
  apis: ApiIntegration[];
  searchTerm: string;
  onDownloadCollection: (integrationId: string) => void;
  onViewDetails: (integrationId: string) => void;
  onCopyUrl: (url: string) => void;
}

export const ExternalApiEndpointsList: React.FC<ExternalApiEndpointsListProps> = ({
  apis,
  searchTerm,
  onDownloadCollection,
  onViewDetails,
  onCopyUrl
}) => {
  const [expandedApis, setExpandedApis] = React.useState<Record<string, boolean>>({});

  const toggleApi = (apiId: string) => {
    setExpandedApis(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (apis.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No External APIs Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No external APIs match your search criteria.' : 'Connect external APIs to extend platform functionality.'}
          </p>
          {!searchTerm && (
            <Button>
              <Globe className="h-4 w-4 mr-2" />
              Add External Integration
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {apis.map((api) => {
        const isExpanded = expandedApis[api.id];
        
        return (
          <Card key={api.id} className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    {api.name}
                    <Badge variant="outline">External</Badge>
                    <Badge variant="secondary">v{api.version}</Badge>
                    <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">
                    {api.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {api.endpoints.length} endpoints
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {api.mappings.length} mappings
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {api.rlsPolicies.length} policies
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyUrl(api.baseUrl)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Base URL
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
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Collapsible open={isExpanded} onOpenChange={() => toggleApi(api.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">API Endpoints</span>
                      <Badge variant="outline" className="text-xs">
                        {api.endpoints.length} endpoint{api.endpoints.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-2">
                    {api.endpoints.map((endpoint, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge className={`${getMethodColor(endpoint.method)} border font-mono text-xs`}>
                            {endpoint.method}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{endpoint.name}</span>
                              {endpoint.authentication && endpoint.authentication.type !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  {endpoint.authentication.type}
                                </Badge>
                              )}
                            </div>
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono block mt-1">
                              {endpoint.url}
                            </code>
                            <p className="text-sm text-muted-foreground mt-1">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyUrl(endpoint.fullUrl || `${api.baseUrl}${endpoint.url}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(api.id)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Data Mappings Summary */}
              {api.mappings.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    Data Mappings ({api.mappings.length})
                  </h4>
                  <div className="text-xs text-muted-foreground">
                    {api.mappings.slice(0, 3).map((mapping, idx) => (
                      <div key={idx}>
                        {mapping.sourceField} → {mapping.targetTable}.{mapping.targetField}
                      </div>
                    ))}
                    {api.mappings.length > 3 && (
                      <div>... and {api.mappings.length - 3} more mappings</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
