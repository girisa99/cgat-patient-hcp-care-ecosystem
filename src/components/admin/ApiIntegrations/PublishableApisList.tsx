
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Database, 
  Shield, 
  Globe, 
  Code,
  FileText,
  Eye,
  Rocket,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';

interface PublishableApisListProps {
  onPublishApi: (apiId: string, apiName: string) => void;
}

const PublishableApisList: React.FC<PublishableApisListProps> = ({ onPublishApi }) => {
  const { integrations } = useApiIntegrations();
  const { externalApis } = useExternalApis();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const internalApis = integrations?.filter(api => api.type === 'internal') || [];
  
  // Filter out already published APIs
  const unpublishedApis = internalApis.filter(api => 
    !externalApis.some(extApi => extApi.internal_api_id === api.id)
  );

  const getApisByCategory = (category: string) => {
    if (category === 'all') return unpublishedApis;
    return unpublishedApis.filter(api => api.category === category);
  };

  const categories = ['all', ...new Set(unpublishedApis.map(api => api.category))];

  const getReadinessScore = (api: any) => {
    let score = 0;
    if (api.endpoints?.length > 0) score += 25;
    if (api.rlsPolicies?.length > 0) score += 25;
    if (api.mappings?.length > 0) score += 25;
    if (api.description && api.description.length > 50) score += 25;
    return score;
  };

  const getReadinessColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getReadinessText = (score: number) => {
    if (score >= 75) return 'Ready to Publish';
    if (score >= 50) return 'Needs Review';
    return 'Incomplete';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Available APIs for Publishing</h3>
          <p className="text-muted-foreground">
            {unpublishedApis.length} internal APIs ready for external publishing
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All APIs' : category}
              {category !== 'all' && (
                <Badge variant="secondary" className="ml-1">
                  {getApisByCategory(category).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {getApisByCategory(selectedCategory).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium mb-2">No APIs Available</h4>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'All your internal APIs have already been published or there are no APIs registered yet.'
                    : `No APIs available in the ${selectedCategory} category.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getApisByCategory(selectedCategory).map((api) => {
                const readinessScore = getReadinessScore(api);
                return (
                  <Card key={api.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Globe className="h-5 w-5 text-blue-500" />
                              <h4 className="text-lg font-semibold">{api.name}</h4>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {api.category}
                            </Badge>
                            <Badge 
                              className={`${getReadinessColor(readinessScore)} border-0`}
                            >
                              {getReadinessText(readinessScore)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {api.description || 'No description available'}
                          </p>
                          
                          {/* API Statistics */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Code className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{api.endpoints?.length || 0}</span>
                              <span className="text-muted-foreground">endpoints</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{api.rlsPolicies?.length || 0}</span>
                              <span className="text-muted-foreground">policies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Database className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">{api.mappings?.length || 0}</span>
                              <span className="text-muted-foreground">mappings</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">v{api.version}</span>
                            </div>
                          </div>

                          {/* Key Endpoints Preview */}
                          {api.endpoints && api.endpoints.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-2">Key Endpoints:</h5>
                              <div className="flex flex-wrap gap-2">
                                {api.endpoints.slice(0, 3).map((endpoint: any, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {endpoint.method} {endpoint.url}
                                  </Badge>
                                ))}
                                {api.endpoints.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{api.endpoints.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Base URL */}
                          {api.baseUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <ExternalLink className="h-3 w-3" />
                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {api.baseUrl}
                              </code>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => onPublishApi(api.id, api.name)}
                            disabled={readinessScore < 50}
                            className="min-w-[120px]"
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Publish API
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api-integrations?view=${api.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                      
                      {/* Readiness Checklist for incomplete APIs */}
                      {readinessScore < 75 && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Publishing Readiness Checklist:
                          </h5>
                          <div className="space-y-1 text-sm">
                            {(!api.endpoints || api.endpoints.length === 0) && (
                              <div className="flex items-center gap-2 text-red-600">
                                <span>•</span>
                                <span>Add at least one endpoint</span>
                              </div>
                            )}
                            {(!api.rlsPolicies || api.rlsPolicies.length === 0) && (
                              <div className="flex items-center gap-2 text-red-600">
                                <span>•</span>
                                <span>Configure security policies</span>
                              </div>
                            )}
                            {(!api.mappings || api.mappings.length === 0) && (
                              <div className="flex items-center gap-2 text-red-600">
                                <span>•</span>
                                <span>Define data mappings</span>
                              </div>
                            )}
                            {(!api.description || api.description.length < 50) && (
                              <div className="flex items-center gap-2 text-red-600">
                                <span>•</span>
                                <span>Add detailed description</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {unpublishedApis.filter(api => getReadinessScore(api) >= 75).length}
                </p>
                <p className="text-sm text-muted-foreground">Ready to Publish</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {unpublishedApis.filter(api => getReadinessScore(api) >= 50 && getReadinessScore(api) < 75).length}
                </p>
                <p className="text-sm text-muted-foreground">Need Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {unpublishedApis.reduce((acc, api) => acc + (api.endpoints?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Endpoints</p>
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
                  {unpublishedApis.reduce((acc, api) => acc + (api.rlsPolicies?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Security Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublishableApisList;
