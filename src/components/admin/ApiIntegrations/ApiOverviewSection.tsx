
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Globe, 
  Server, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Eye, 
  Settings, 
  TrendingUp,
  RotateCcw,
  Trash2,
  RefreshCw,
  Rocket,
  AlertTriangle,
  Bug
} from 'lucide-react';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useExternalApis } from '@/hooks/useExternalApis';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import { useToast } from '@/hooks/use-toast';
import ExternalApiConfigDialog from './ExternalApiConfigDialog';
import ExternalApiAnalyticsDialog from './ExternalApiAnalyticsDialog';

interface ApiOverviewSectionProps {
  title: string;
  apis: any[];
  type: 'internal' | 'external' | 'published';
  icon: React.ReactNode;
  onViewDetails?: (apiId: string) => void;
  onPublishApi?: (apiId: string, apiName: string) => void;
}

export const ApiOverviewSection = ({ 
  title, 
  apis, 
  type, 
  icon, 
  onViewDetails,
  onPublishApi 
}: ApiOverviewSectionProps) => {
  const { toast } = useToast();
  const { updateApiStatus, isUpdatingStatus } = useExternalApis();
  const [showConfigDialog, setShowConfigDialog] = useState<boolean>(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState<boolean>(false);
  const [configApi, setConfigApi] = useState<any>(null);
  const [analyticsApi, setAnalyticsApi] = useState<any>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState<boolean>(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Debug effect to log all incoming data
  useEffect(() => {
    console.log('🐛 [DEBUG] ApiOverviewSection Props:', {
      title,
      type,
      apiCount: apis.length,
      apis: apis.map(api => ({
        id: api.id,
        name: api.name || api.external_name,
        status: api.status,
        type: api.type,
        visibility: api.visibility,
        published_at: api.published_at,
        hasEndpoints: !!api.endpoints?.length
      }))
    });
  }, [title, type, apis]);

  // Debug function to check button visibility conditions
  const debugButtonVisibility = (api: any) => {
    const conditions = {
      isPublishedType: type === 'published',
      isExternalType: type === 'external',
      isInternalType: type === 'internal',
      apiStatus: api.status,
      isDraftOrReview: api.status === 'draft' || api.status === 'review',
      hasPublishedAt: !!api.published_at,
      shouldShowManageButtons: (type === 'published' || type === 'external'),
      shouldShowPublishButton: (type === 'external' && (api.status === 'draft' || api.status === 'review')),
      shouldShowInternalPublish: type === 'internal'
    };

    console.log(`🐛 [DEBUG] Button visibility for API "${api.name || api.external_name}":`, conditions);
    return conditions;
  };

  const handlePublishClick = async (api: any) => {
    if (type !== 'internal') return;
    
    console.log('🚀 Publishing from overview:', api);
    
    try {
      setIsProcessing(`publish-${api.id}`);
      const existingApi = await externalApiSyncManager.checkForDuplicateApi(api.id, api.name);
      
      if (existingApi) {
        setDuplicateInfo({
          existingApi,
          internalApiId: api.id,
          proposedName: api.name,
          sourceApi: api
        });
        setIsDuplicateDialogOpen(true);
        setIsProcessing(null);
        return;
      }
    } catch (error) {
      console.error('❌ Error checking duplicates:', error);
      setIsProcessing(null);
    }
    
    // If no duplicate, proceed with publishing
    if (onPublishApi) {
      onPublishApi(api.id, api.name);
    }
    setIsProcessing(null);
  };

  const handleDuplicateSync = async () => {
    if (!duplicateInfo) return;
    
    try {
      setIsProcessing('sync');
      const result = await externalApiSyncManager.syncEndpointsOnly(
        duplicateInfo.existingApi.id,
        duplicateInfo.internalApiId
      );
      
      toast({
        title: "Endpoints Synchronized",
        description: `${result.new_endpoints} new endpoints added to existing API.`,
      });
      
      setIsDuplicateDialogOpen(false);
      setDuplicateInfo(null);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleForceRepublish = () => {
    if (!duplicateInfo || !onPublishApi) return;
    
    onPublishApi(duplicateInfo.internalApiId, duplicateInfo.proposedName);
    setIsDuplicateDialogOpen(false);
    setDuplicateInfo(null);
  };

  const handleConfigureApi = (api: any) => {
    console.log('⚙️ Configuring API from overview:', api);
    setConfigApi(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: any) => {
    console.log('📊 Viewing analytics from overview:', api);
    setAnalyticsApi(api);
    setShowAnalyticsDialog(true);
  };

  const handleRevertToDraft = async (api: any) => {
    try {
      setIsProcessing(`revert-${api.id}`);
      await externalApiSyncManager.revertPublication(api.id);
      toast({
        title: "API Reverted",
        description: `${api.external_name || api.name} has been reverted to draft status.`,
      });
      
      // Force a refresh of the data
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
      setIsProcessing(`cancel-${api.id}`);
      await externalApiSyncManager.cancelPublication(api.id);
      toast({
        title: "Publication Canceled",
        description: `${api.external_name || api.name} has been completely removed.`,
      });
      
      // Force a refresh of the data
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

  const handleStatusUpdate = async (apiId: string, newStatus: string) => {
    try {
      setIsProcessing(`status-${apiId}`);
      await updateApiStatus({ externalApiId: apiId, status: newStatus as any });
      
      toast({
        title: "Status Updated",
        description: `API status has been updated to ${newStatus}.`,
      });
      
      // Force a refresh of the data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Status update failed:', error);
      toast({
        title: "Status Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Debug Toggle - Always Visible */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
          >
            <Bug className="h-3 w-3 mr-1" />
            Debug: {debugMode ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div><strong>Section Type:</strong> {type}</div>
                <div><strong>API Count:</strong> {apis.length}</div>
                <div><strong>Title:</strong> {title}</div>
                <div><strong>Should Show Management Buttons for {type}:</strong> {(type === 'published' || type === 'external') ? '✅ YES' : '❌ NO'}</div>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Raw API Data</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                    {JSON.stringify(apis, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {apis.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                {icon}
                <div>
                  <h4 className="text-lg font-medium mb-2">No {title}</h4>
                  <p className="text-muted-foreground">
                    {type === 'internal' && "No internal APIs detected yet."}
                    {type === 'external' && "No external APIs configured yet."}
                    {type === 'published' && "No APIs published yet."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {apis.slice(0, 3).map((api) => {
              const debugInfo = debugButtonVisibility(api);
              
              return (
                <Card key={api.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{api.external_name || api.name}</h4>
                          {api.status && (
                            <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                              {api.status}
                            </Badge>
                          )}
                          {(type === 'published' || type === 'external') && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Synced
                            </Badge>
                          )}
                          {debugMode && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              DEBUG: {type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {api.external_description || api.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Version {api.version || '1.0.0'}</span>
                          {api.endpoints?.length && (
                            <>
                              <span>•</span>
                              <span>{api.endpoints.length} endpoints</span>
                            </>
                          )}
                          {(type === 'published' || type === 'external') && api.published_at && (
                            <>
                              <span>•</span>
                              <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>

                        {/* Debug Info Panel */}
                        {debugMode && (
                          <div className="mt-2 p-2 bg-gray-50 border rounded text-xs">
                            <div className="font-medium mb-1">Button Visibility Logic:</div>
                            <div className="grid grid-cols-2 gap-1">
                              <div>Type: {type}</div>
                              <div>Status: {api.status}</div>
                              <div>Show Manage: {debugInfo.shouldShowManageButtons ? '✅' : '❌'}</div>
                              <div>Show Publish: {debugInfo.shouldShowPublishButton ? '✅' : '❌'}</div>
                              <div>Show Internal Publish: {debugInfo.shouldShowInternalPublish ? '✅' : '❌'}</div>
                              <div>Is Draft/Review: {debugInfo.isDraftOrReview ? '✅' : '❌'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        {/* Internal API Publish Button */}
                        {type === 'internal' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePublishClick(api)}
                              className="bg-blue-50 hover:bg-blue-100"
                              disabled={isProcessing !== null}
                            >
                              {isProcessing === `publish-${api.id}` ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                              )}
                              Publish
                            </Button>
                            {debugMode && (
                              <Badge variant="outline" className="text-xs">INT-PUB</Badge>
                            )}
                          </>
                        )}
                        
                        {/* Published/External API Management Buttons */}
                        {(type === 'published' || type === 'external') && (
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
                            {debugMode && (
                              <Badge variant="outline" className="text-xs">PUB-MGMT</Badge>
                            )}
                          </>
                        )}
                        
                        {/* External API Publish Button (for draft/review status) */}
                        {(type === 'external' && (api.status === 'draft' || api.status === 'review')) && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(api.id, 'published')}
                              disabled={isProcessing !== null || isUpdatingStatus}
                              className="bg-green-50 hover:bg-green-100"
                            >
                              {isProcessing === `status-${api.id}` || isUpdatingStatus ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Rocket className="h-3 w-3 mr-1" />
                              )}
                              Publish
                            </Button>
                            {debugMode && (
                              <Badge variant="outline" className="text-xs">EXT-PUB</Badge>
                            )}
                          </>
                        )}
                        
                        {/* View Details Button */}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onViewDetails?.(api.id)}
                          disabled={isProcessing !== null}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {debugMode && (
                          <Badge variant="outline" className="text-xs">VIEW</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {apis.length > 3 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  +{apis.length - 3} more {title.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Detection Dialog */}
      <AlertDialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Duplicate API Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>An API with similar properties already exists:</p>
              {duplicateInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <div><strong>Existing API:</strong> {duplicateInfo.existingApi.external_name}</div>
                  <div><strong>Version:</strong> {duplicateInfo.existingApi.version}</div>
                  <div><strong>Status:</strong> {duplicateInfo.existingApi.status}</div>
                  <div><strong>Created:</strong> {new Date(duplicateInfo.existingApi.created_at).toLocaleDateString()}</div>
                </div>
              )}
              <p>You can either sync new endpoints to the existing API or force republish as a new API.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing === 'sync'}>Cancel</AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={handleDuplicateSync}
              className="bg-blue-50 hover:bg-blue-100"
              disabled={isProcessing === 'sync'}
            >
              {isProcessing === 'sync' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Endpoints Only
            </Button>
            <AlertDialogAction 
              onClick={handleForceRepublish}
              disabled={isProcessing === 'sync'}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Force Republish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Configuration Dialog */}
      <ExternalApiConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        api={configApi}
      />

      {/* Analytics Dialog */}
      <ExternalApiAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
        api={analyticsApi}
      />
    </>
  );
};
