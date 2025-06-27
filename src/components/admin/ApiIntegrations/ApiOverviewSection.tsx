
import React, { useState } from 'react';
import { useExternalApis } from '@/hooks/useExternalApis';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import { useToast } from '@/hooks/use-toast';
import { ApiCard } from './ApiCard';
import { ApiEmptyState } from './ApiEmptyState';
import { DuplicateDetectionDialog } from './DuplicateDetectionDialog';
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

  const handlePublishClick = async (api: any) => {
    if (type !== 'internal') return;
    
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
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
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
    setConfigApi(api);
    setShowConfigDialog(true);
  };

  const handleViewAnalytics = (api: any) => {
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
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
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
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
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
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
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
        <h3 className="text-lg font-semibold">{title}</h3>

        {/* Empty State */}
        {apis.length === 0 ? (
          <ApiEmptyState title={title} type={type} icon={icon} />
        ) : (
          <div className="grid gap-4">
            {apis.slice(0, 3).map((api) => (
              <ApiCard
                key={api.id}
                api={api}
                type={type}
                isProcessing={isProcessing}
                onPublish={handlePublishClick}
                onConfigure={handleConfigureApi}
                onViewAnalytics={handleViewAnalytics}
                onRevertToDraft={handleRevertToDraft}
                onCancelPublication={handleCancelPublication}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={onViewDetails}
                isUpdatingStatus={isUpdatingStatus}
              />
            ))}
            
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
      <DuplicateDetectionDialog
        isOpen={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        duplicateInfo={duplicateInfo}
        isProcessing={isProcessing}
        onSyncEndpoints={handleDuplicateSync}
        onForceRepublish={handleForceRepublish}
      />

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
