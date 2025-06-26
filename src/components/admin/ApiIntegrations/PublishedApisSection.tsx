import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Globe, 
  Clock, 
  Zap, 
  Key, 
  Bell,
  BookOpen,
  TestTube,
  RefreshCw,
  Settings,
  TrendingUp,
  RotateCcw,
  Trash2,
  Bug
} from 'lucide-react';
import { usePublishedApiIntegration, PublishedApiForDevelopers } from '@/hooks/usePublishedApiIntegration';
import { useEnhancedPublishedApiDetails, ApiIntegrationDetails } from '@/hooks/useEnhancedPublishedApiDetails';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import ApiDetailsDialog from './ApiDetailsDialog';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

interface PublishedApisSectionProps {
  showInDeveloperPortal?: boolean;
}

const PublishedApisSection = ({ showInDeveloperPortal = false }: PublishedApisSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApiDetails, setSelectedApiDetails] = useState<ApiIntegrationDetails | null>(null);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Dialog states
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [selectedApiForConfig, setSelectedApiForConfig] = useState<PublishedApiForDevelopers | null>(null);
  const [selectedApiForAnalytics, setSelectedApiForAnalytics] = useState<PublishedApiForDevelopers | null>(null);

  const {
    publishedApisForDevelopers,
    isLoadingPublishedApis,
    generateDocumentation,
    isGeneratingDocs,
    notifyDevelopers,
    isNotifyingDevelopers
  } = usePublishedApiIntegration();

  const { getEnhancedApiDetails } = useEnhancedPublishedApiDetails();

  const handleViewApi = async (api: PublishedApiForDevelopers) => {
    console.log('🔍 Loading API details for:', api.external_name);
    setIsLoadingDetails(true);
    setShowApiDialog(true);
    
    try {
      // Force invalidate any cached data before fetching
      await queryClient.invalidateQueries({ 
        queryKey: ['enhanced-api-details', api.id] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['external-api-endpoints', api.id] 
      });
      
      const details = await getEnhancedApiDetails(api.id);
      console.log('✅ Enhanced API details loaded:', details?.name);
      console.log('📊 Endpoints in details:', details?.endpoints?.length || 0);
      
      setSelectedApiDetails(details);
    } catch (error) {
      console.error('❌ Error fetching enhanced API details:', error);
      toast({
        title: "Error",
        description: "Failed to load enhanced API details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleConfigureApi = (api: PublishedApiForDevelopers) => {
    console.log('⚙️ Opening config dialog for API:', api.external_name);
    setSelectedApiForConfig(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: PublishedApiForDevelopers) => {
    console.log('📊 Opening analytics dialog for API:', api.external_name);
    setSelectedApiForAnalytics(api);
    setShowAnalyticsDialog(true);
  };

  const handleRevertToDraft = async (api: PublishedApiForDevelopers) => {
    try {
      console.log('🔄 Reverting API to draft:', api.external_name);
      setIsProcessing(`revert-${api.id}`);
      await externalApiSyncManager.revertPublication(api.id);
      toast({
        title: "API Reverted",
        description: `${api.external_name} has been reverted to draft status.`,
      });
      
      // Force a refresh of the data
      await queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      await queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      
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

  const handleCancelPublication = async (api: PublishedApiForDevelopers) => {
    try {
      console.log('🗑️ Canceling publication for API:', api.external_name);
      setIsProcessing(`cancel-${api.id}`);
      await externalApiSyncManager.cancelPublication(api.id);
      toast({
        title: "Publication Canceled",
        description: `${api.external_name} has been completely removed.`,
      });
      
      // Force a refresh of the data
      await queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      await queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      
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

  const handleRefreshData = async () => {
    console.log('🔄 Manually refreshing published APIs data...');
    
    // Invalidate all related queries
    await queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
    await queryClient.invalidateQueries({ queryKey: ['external-apis'] });
    await queryClient.invalidateQueries({ queryKey: ['enhanced-api-details'] });
    
    toast({
      title: "Data Refreshed",
      description: "API data has been refreshed with latest sync information",
    });
  };

  const handleForceSync = async (apiId: string) => {
    setIsForceRefreshing(true);
    try {
      console.log('🔄 Force syncing endpoints for API:', apiId);
      
      await externalApiSyncManager.forceRefreshSync(apiId);
      
      // Invalidate all related queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      await queryClient.invalidateQueries({ queryKey: ['enhanced-api-details'] });
      await queryClient.invalidateQueries({ queryKey: ['external-api-endpoints'] });
      
      toast({
        title: "Sync Completed",
        description: "API endpoints have been force-synced successfully",
      });
    } catch (error) {
      console.error('❌ Error force syncing:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to force sync endpoints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForceRefreshing(false);
    }
  };

  const handleGenerateDocs = (apiId: string) => {
    console.log('📚 Generating documentation for API:', apiId);
    generateDocumentation(apiId);
  };

  const handleNotifyDevelopers = (apiId: string) => {
    console.log('📢 Notifying developers about API:', apiId);
    notifyDevelopers(apiId);
  };

  if (isLoadingPublishedApis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          Loading enhanced published APIs...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            {showInDeveloperPortal ? 'Available APIs' : 'Published APIs'}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <RefreshCw className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            {showInDeveloperPortal 
              ? 'Enhanced APIs with real-time sync available for integration in your applications'
              : 'Enhanced APIs with real-time synchronization published and available to developers'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{publishedApisForDevelopers.length} APIs</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug: {debugMode ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div><strong>Component:</strong> PublishedApisSection</div>
              <div><strong>Show In Developer Portal:</strong> {showInDeveloperPortal ? 'YES' : 'NO'}</div>
              <div><strong>Total Published APIs:</strong> {publishedApisForDevelopers.length}</div>
              <div><strong>Loading:</strong> {isLoadingPublishedApis ? 'YES' : 'NO'}</div>
              <div><strong>Processing:</strong> {isProcessing || 'None'}</div>
              <div><strong>Config Dialog Open:</strong> {showConfigDialog ? 'YES' : 'NO'}</div>
              <div><strong>Analytics Dialog Open:</strong> {showAnalyticsDialog ? 'YES' : 'NO'}</div>
              <div><strong>Selected API for Config:</strong> {selectedApiForConfig?.external_name || 'None'}</div>
              <div><strong>Selected API for Analytics:</strong> {selectedApiForAnalytics?.external_name || 'None'}</div>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">View APIs Data</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(publishedApisForDevelopers.map(api => ({
                    id: api.id,
                    name: api.external_name,
                    endpoints: api.endpoints?.length || 0
                  })), null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedApisForDevelopers.map((api) => (
          <Card key={api.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {api.external_name}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {api.external_description || 'Enhanced API with real-time synchronization capabilities'}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  v{api.version}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-1">
                {api.category && (
                  <Badge variant="secondary" className="text-xs">
                    {api.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {api.pricing_model}
                </Badge>
                {api.endpoints && api.endpoints.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {api.endpoints.length} synced endpoints
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  Real-time
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-3 w-3" />
                  <span>{api.authentication_methods.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-3 w-3" />
                  <span>
                    {api.rate_limits?.requests || 1000} requests/{api.rate_limits?.period || 'hour'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <RefreshCw className="h-3 w-3" />
                  <span>Live Sync Active</span>
                </div>
                {api.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Debug Info Panel */}
              {debugMode && (
                <div className="mt-2 p-2 bg-gray-50 border rounded text-xs">
                  <div className="font-medium mb-1">API Debug Info:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>ID: {api.id}</div>
                    <div>Endpoints: {api.endpoints?.length || 0}</div>
                    <div>Published: {api.published_at ? 'YES' : 'NO'}</div>
                    <div>Category: {api.category || 'None'}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-2">
                <Button size="sm" onClick={() => handleViewApi(api)} className="bg-blue-600 hover:bg-blue-700">
                  <Globe className="h-3 w-3 mr-1" />
                  Details
                </Button>
                
                {!showInDeveloperPortal && (
                  <>
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

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateDocs(api.id)}
                      disabled={isGeneratingDocs}
                    >
                      <BookOpen className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNotifyDevelopers(api.id)}
                      disabled={isNotifyingDevelopers}
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleForceSync(api.id)}
                      disabled={isForceRefreshing}
                      title="Force sync endpoints"
                    >
                      <RefreshCw className={`h-3 w-3 ${isForceRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {publishedApisForDevelopers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Enhanced Published APIs</h3>
            <p className="text-sm text-muted-foreground">
              {showInDeveloperPortal 
                ? 'No enhanced APIs with real-time sync are currently available for development.'
                : 'Publish your first API with enhanced real-time sync to make it available to developers.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced API Details Dialog */}
      <ApiDetailsDialog
        open={showApiDialog}
        onOpenChange={setShowApiDialog}
        apiDetails={selectedApiDetails}
        isLoading={isLoadingDetails}
      />

      {/* Configuration Dialog */}
      <ExternalApiConfigDialog
        open={showConfigDialog}
        onOpenChange={(open) => {
          setShowConfigDialog(open);
          if (!open) {
            setSelectedApiForConfig(null);
          }
        }}
        api={selectedApiForConfig}
      />

      {/* Analytics Dialog */}
      <ExternalApiAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={(open) => {
          setShowAnalyticsDialog(open);
          if (!open) {
            setSelectedApiForAnalytics(null);
          }
        }}
        api={selectedApiForAnalytics}
      />
    </div>
  );
};

export default PublishedApisSection;
