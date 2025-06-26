
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Globe, 
  Server, 
  TrendingUp, 
  Users, 
  Database,
  ExternalLink,
  Eye,
  Settings,
  Activity
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';

const ApiOverviewDashboard = () => {
  const { integrations } = useApiIntegrations();
  const { externalApis, publishedApis, marketplaceStats } = useExternalApis();
  
  const [selectedView, setSelectedView] = useState<'overview' | 'consuming' | 'publishing'>('overview');

  // Separate APIs by type
  const consumedApis = integrations?.filter(api => api.type === 'external') || [];
  const internalApis = integrations?.filter(api => api.type === 'internal') || [];
  const publishedInternalApis = externalApis || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'published': return 'bg-blue-500';
      case 'draft': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{consumedApis.length}</p>
              <p className="text-sm text-muted-foreground">APIs Consuming</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{publishedInternalApis.length}</p>
              <p className="text-sm text-muted-foreground">APIs Publishing</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Server className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{internalApis.length}</p>
              <p className="text-sm text-muted-foreground">Internal APIs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{marketplaceStats?.approvedApplications || 0}</p>
              <p className="text-sm text-muted-foreground">Developer Apps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ConsumingAPIsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-green-500" />
            External APIs We're Consuming
          </h3>
          <p className="text-sm text-muted-foreground">
            Third-party APIs integrated into our platform
          </p>
        </div>
      </div>
      
      {consumedApis.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No External APIs</h4>
            <p className="text-muted-foreground">No external APIs are currently being consumed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {consumedApis.map((api) => (
            <Card key={api.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">{api.name}</h4>
                      <Badge variant="outline">External</Badge>
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {api.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {api.endpoints?.length || 0} endpoints
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        v{api.version}
                      </span>
                      {api.baseUrl && (
                        <a 
                          href={api.baseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          API Docs
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const PublishingAPIsView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-blue-500" />
            Internal APIs We're Publishing Externally
          </h3>
          <p className="text-sm text-muted-foreground">
            Our internal APIs exposed for external consumption
          </p>
        </div>
      </div>
      
      {publishedInternalApis.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No Published APIs</h4>
            <p className="text-muted-foreground">No internal APIs are currently published externally.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {publishedInternalApis.map((api) => (
            <Card key={api.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">{api.external_name}</h4>
                      <Badge variant="outline">Published</Badge>
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                      <Badge variant="secondary">{api.visibility}</Badge>
                      <Badge variant="outline">{api.pricing_model}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {api.external_description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        v{api.version}
                      </span>
                      <span>•</span>
                      <span>Category: {api.category}</span>
                      {api.published_at && (
                        <>
                          <span>•</span>
                          <span>Published: {new Date(api.published_at).toLocaleDateString()}</span>
                        </>
                      )}
                      {api.documentation_url && (
                        <a 
                          href={api.documentation_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Documentation
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Integration Overview</h2>
        <p className="text-muted-foreground">
          Comprehensive view of all API integrations - consuming external APIs and publishing internal APIs
        </p>
      </div>

      <OverviewStats />

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consuming" className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4" />
            Consuming ({consumedApis.length})
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Publishing ({publishedInternalApis.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  Consuming External APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">{consumedApis.length}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Third-party APIs integrated into our platform
                </p>
                <div className="space-y-2">
                  {consumedApis.slice(0, 3).map((api) => (
                    <div key={api.id} className="flex items-center justify-between text-sm">
                      <span>{api.name}</span>
                      <Badge variant="outline" size="sm">{api.status}</Badge>
                    </div>
                  ))}
                  {consumedApis.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{consumedApis.length - 3} more APIs
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                  Publishing Internal APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">{publishedInternalApis.length}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Our APIs exposed for external consumption
                </p>
                <div className="space-y-2">
                  {publishedInternalApis.slice(0, 3).map((api) => (
                    <div key={api.id} className="flex items-center justify-between text-sm">
                      <span>{api.external_name}</span>
                      <Badge variant="outline" size="sm">{api.status}</Badge>
                    </div>
                  ))}
                  {publishedInternalApis.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{publishedInternalApis.length - 3} more APIs
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consuming">
          <ConsumingAPIsView />
        </TabsContent>

        <TabsContent value="publishing">
          <PublishingAPIsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiOverviewDashboard;
