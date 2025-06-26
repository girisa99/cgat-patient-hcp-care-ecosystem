
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
  Shield
} from 'lucide-react';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';

interface InternalApiEndpointsListProps {
  apis: ApiIntegration[];
  searchTerm: string;
  onDownloadCollection: (integrationId: string) => void;
  onViewDetails: (integrationId: string) => void;
  onViewDocumentation: (integrationId: string) => void;
  onCopyUrl: (url: string) => void;
}

const getTopicIcon = (topic: string) => {
  switch (topic.toLowerCase()) {
    case 'users':
    case 'user':
      return <Users className="h-4 w-4" />;
    case 'patients':
    case 'patient':
      return <UserPlus className="h-4 w-4" />;
    case 'facilities':
    case 'facility':
      return <Building className="h-4 w-4" />;
    case 'auth':
    case 'authentication':
      return <Shield className="h-4 w-4" />;
    case 'audit':
      return <FileText className="h-4 w-4" />;
    case 'modules':
    case 'module':
      return <Database className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const organizeEndpointsByTopic = (api: ApiIntegration) => {
  const topics: Record<string, any[]> = {};
  
  api.endpoints.forEach(endpoint => {
    // Extract topic from URL path
    const pathParts = endpoint.url.split('/').filter(p => p);
    const topic = pathParts[1] || pathParts[0] || 'general';
    
    if (!topics[topic]) {
      topics[topic] = [];
    }
    topics[topic].push(endpoint);
  });
  
  return topics;
};

export const InternalApiEndpointsList: React.FC<InternalApiEndpointsListProps> = ({
  apis,
  searchTerm,
  onDownloadCollection,
  onViewDetails,
  onViewDocumentation,
  onCopyUrl
}) => {
  const [expandedTopics, setExpandedTopics] = React.useState<Record<string, boolean>>({});

  const toggleTopic = (apiId: string, topic: string) => {
    const key = `${apiId}-${topic}`;
    setExpandedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
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
        const topicGroups = organizeEndpointsByTopic(api);
        
        return (
          <Card key={api.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    {api.name}
                    <Badge variant="outline">Internal</Badge>
                    <Badge variant="secondary">v{api.version}</Badge>
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
                      {Object.keys(api.schemas).length} schemas
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {api.rlsPolicies.length} RLS policies
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
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(topicGroups).map(([topic, endpoints]) => {
                  const isExpanded = expandedTopics[`${api.id}-${topic}`];
                  
                  return (
                    <Collapsible key={topic} open={isExpanded} onOpenChange={() => toggleTopic(api.id, topic)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors">
                          <div className="flex items-center gap-2">
                            {getTopicIcon(topic)}
                            <span className="font-medium capitalize">{topic}</span>
                            <Badge variant="outline" className="text-xs">
                              {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-2">
                          {endpoints.map((endpoint, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge className={`${getMethodColor(endpoint.method)} border font-mono text-xs`}>
                                  {endpoint.method}
                                </Badge>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                      {endpoint.url}
                                    </code>
                                    {!endpoint.isPublic && (
                                      <Badge variant="secondary" className="text-xs">
                                        Auth Required
                                      </Badge>
                                    )}
                                  </div>
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
