
import React, { useState } from 'react';
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
  AlertTriangle
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
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [configApi, setConfigApi] = useState<any>(null);
  const [analyticsApi, setAnalyticsApi] = useState<any>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

  const handlePublishClick = async (api: any) => {
    if (type !== 'internal') return;
    
    console.log('🚀 Publishing from overview:', api);
    
    try {
      const existingApi = await externalApiSyncManager.checkForDuplicateApi(api.id, api.name);
      
      if (existingApi) {
        setDuplicateInfo({
          existingApi,
          internalApiId: api.id,
          proposedName: api.name,
          sourceApi: api
        });
        setIsDuplicateDialogOpen(true);
        return;
      }
    } catch (error) {
      console.error('❌ Error checking duplicates:', error);
    }
    
    // If no duplicate, proceed with publishing
    if (onPublishApi) {
      onPublishApi(api.id, api.name);
    }
  };

  const handleDuplicateSync = async () => {
    if (!duplicateInfo) return;
    
    try {
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
    } catch (error: any) {
      console.error('❌ Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
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
      await externalApiSyncManager.revertPublication(api.id);
      toast({
        title: "API Reverted",
        description: `${api.external_name || api.name} has been reverted to draft status.`,
      });
    } catch (error: any) {
      console.error('❌ Revert failed:', error);
      toast({
        title: "Revert Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelPublication = async (api: any) => {
    try {
      await externalApiSyncManager.cancelPublication(api.id);
      toast({
        title: "Publication Canceled",
        description: `${api.external_name || api.name} has been completely removed.`,
      });
    } catch (error: any) {
      console.error('❌ Cancel failed:', error);
      toast({
        title: "Cancel Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (apis.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {apis.slice(0, 3).map((api) => (
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
                    {type === 'published' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Synced
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
                    {type === 'published' && api.published_at && (
                      <>
                        <span>•</span>
                        <span>Published {new Date(api.published_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  {type === 'internal' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePublishClick(api)}
                      className="bg-blue-50 hover:bg-blue-100"
                    >
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  )}
                  
                  {type === 'published' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleConfigureApi(api)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewAnalytics(api)}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onViewDetails?.(api.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {apis.length > 3 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              +{apis.length - 3} more {title.toLowerCase()}
            </p>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={handleDuplicateSync}
              className="bg-blue-50 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Endpoints Only
            </Button>
            <AlertDialogAction onClick={handleForceRepublish}>
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
