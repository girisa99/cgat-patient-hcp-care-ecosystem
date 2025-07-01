
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Server, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Download, 
  Eye,
  Users,
  UserPlus,
  Building,
  FileText,
  Settings,
  Database,
  Shield,
  Globe,
  Code,
  Zap
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

const getServiceIcon = (category: string, type: string) => {
  switch (category.toLowerCase()) {
    case 'healthcare':
      return <Shield className="h-4 w-4" />;
    case 'user':
    case 'users':
      return <Users className="h-4 w-4" />;
    case 'patient':
    case 'patients':
      return <UserPlus className="h-4 w-4" />;
    case 'facility':
    case 'facilities':
      return <Building className="h-4 w-4" />;
    case 'authentication':
    case 'auth':
      return <Shield className="h-4 w-4" />;
    case 'integration':
      return <Globe className="h-4 w-4" />;
    case 'development':
      return <Code className="h-4 w-4" />;
    case 'api':
      return <Zap className="h-4 w-4" />;
    default:
      return <Server className="h-4 w-4" />;
  }
};

const getDirectionBadge = (direction: string) => {
  switch (direction) {
    case 'inbound':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Inbound</Badge>;
    case 'outbound':
      return <Badge variant="outline" className="text-green-600 border-green-200">Outbound</Badge>;
    case 'bidirectional':
      return <Badge variant="outline" className="text-purple-600 border-purple-200">Bidirectional</Badge>;
    default:
      return <Badge variant="outline" className="text-gray-600 border-gray-200">{direction}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    case 'deprecated':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Deprecated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const InternalApiEndpointsList: React.FC<InternalApiEndpointsListProps> = ({
  apis,
  searchTerm,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const [expandedApis, setExpandedApis] = React.useState<Record<string, boolean>>({});

  const toggleApi = (apiId: string) => {
    setExpandedApis(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
  };

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
        const serviceIcon = getServiceIcon(api.category, api.type);
        
        return (
          <Card key={api.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    {serviceIcon}
                    {api.name}
                    <Badge variant="outline">Internal</Badge>
                    <Badge variant="secondary">v{api.version}</Badge>
                    {getStatusBadge(api.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">
                    {api.description || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Type: {api.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Category: {api.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      Purpose: {api.purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDirectionBadge(api.direction)}
                    {api.endpoints_count && (
                      <Badge variant="outline" className="text-xs">
                        {api.endpoints_count} endpoints
                      </Badge>
                    )}
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
                      <span className="font-medium">API Configuration</span>
                    </div>
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-4 border rounded-lg bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <span className="text-muted-foreground">Not configured</span>
                          )}</div>
                          <div><strong>Version:</strong> {api.version}</div>
                          <div><strong>Status:</strong> {api.status}</div>
                          {api.endpoints_count && (
                            <div><strong>Endpoints:</strong> {api.endpoints_count}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Purpose & Usage</h4>
                      <p className="text-sm text-muted-foreground">
                        {api.purpose || 'General API service for internal healthcare operations'}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Timestamps</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><strong>Created:</strong> {new Date(api.created_at).toLocaleDateString()}</div>
                        <div><strong>Updated:</strong> {new Date(api.updated_at).toLocaleDateString()}</div>
                      </div>
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
