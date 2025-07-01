import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Activity,
  RotateCcw,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

const ApiOverviewDashboard = () => {
  const { integrations } = useApiIntegrations();
  const { externalApis, publishedApis, marketplaceStats } = useExternalApis();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedView, setSelectedView] = useState<'overview' | 'consuming' | 'publishing'>('overview');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [selectedApiForConfig, setSelectedApiForConfig] = useState<any>(null);
  const [selectedApiForAnalytics, setSelectedApiForAnalytics] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Separate APIs by type using integrationType property
  const consumedApis = integrations?.filter(api => 
    (api as any).integrationType === 'internal' && (api as any).type === 'external'
  ) || [];
  const internalApis = integrations?.filter(api => 
    (api as any).integrationType === 'internal' && (api as any).type === 'internal'
  ) || [];
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

  const handleConfigureApi = (api: any) => {
    console.log('⚙️ Opening config dialog for published API:', api.external_name);
    setSelectedApiForConfig(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: any) => {
    console.log('📊 Opening analytics dialog for published API:', api.external_name);
    setSelectedApiForAnalytics(api);
    setShowAnalyticsDialog(true);
  };

  const handleRevertToDraft = async (api: any) => {
    try {
      console.log('🔄 Reverting published API to draft:', api.external_name);
      setIsProcessing(`revert-${api.id}`);
      await externalApiSyncManager.revertPublication(api.id);
      toast({
        title: "API Reverted",
        description: `${api.external_name} has been reverted to draft status.`,
      });
      
      // Force a refresh of the data
      await queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      await queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Revert failed:', error);
      toast({
        title: "Revert Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelPublication = async (api: any) => {
    try {
      console.log('🗑️ Canceling publication for API:', api.external_name);
      setIsProcessing(`cancel-${api.id}`);
      await externalApiSyncManager.cancelPublication(api.id);
      toast({
        title: "Publication Canceled",
        description: `${api.external_name} has been completely removed.`,
      });
      
      // Force a refresh of the data
      await queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      await queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Cancel failed:', error);
      toast({
        title: "Cancel Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
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
          {consumedApis.map((api) => {
            const apiData = api as any;
            return (
              <Card key={api.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold">{apiData.name || 'API Service'}</h4>
                        <Badge variant="outline">External</Badge>
                        <Badge className={getStatusColor(apiData.status || 'active')}>
                          {apiData.status || 'active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {apiData.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {apiData.endpoints_count || 0} endpoints
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          v{apiData.version || '1.0.0'}
                        </span>
                        {apiData.base_url && (
                          <a 
                            href={apiData.base_url} 
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
            );
          })}
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleConfigureApi(api)}
                      disabled={isProcessing !== null}
                      className="bg-gray-50 hover:bg-gray-100"
                    >
                      {isProcessing !== null ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Settings className="h-3 w-3 mr-1" />
                      )}
                      Manage
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewAnalytics(api)}
                      disabled={isProcessing !== null}
                      className="bg-blue-50 hover:bg-blue-100"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isProcessing !== null}
                          className="bg-orange-50 hover:bg-orange-100"
                        >
                          {isProcessing === `revert-${api.id}` ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3 mr-1" />
                          )}
                          Revert
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revert to Draft?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will change the status back to draft and unpublish the API. 
                            The API will no longer be accessible to external developers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevertToDraft(api)}>
                            Revert to Draft
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={isProcessing !== null}
                        >
                          {isProcessing === `cancel-${api.id}` ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3 mr-1" />
                          )}
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Publication?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the external API and all its data. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep API</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleCancelPublication(api)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                  {consumedApis.slice(0, 3).map((api) => {
                    const apiData = api as any;
                    return (
                      <div key={api.id} className="flex items-center justify-between text-sm">
                        <span>{apiData.name || 'API Service'}</span>
                        <Badge variant="outline">{apiData.status || 'active'}</Badge>
                      </div>
                    );
                  })}
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
                      <Badge variant="outline">{api.status}</Badge>
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

      {/* Fixed dialog components - removed onClose props */}
      <ExternalApiConfigDialog
        api={selectedApiForConfig}
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
      />

      <ExternalApiAnalyticsDialog
        api={selectedApiForAnalytics}
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
      />
    </div>
  );
};

export default ApiOverviewDashboard;
