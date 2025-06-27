
import React from 'react';
import { useExternalApis } from '@/hooks/useExternalApis';
import { useToast } from '@/hooks/use-toast';
import { ApiSectionState } from './ApiSectionState';
import { useApiOperationHandlers } from './ApiOperationHandlers';
import { useDuplicateDetectionHandler } from './DuplicateDetectionHandler';
import { useApiDialogManager } from './ApiDialogManager';

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
  
  // Use custom hooks for different concerns
  const { 
    isProcessing, 
    setIsProcessing, 
    handleRevertToDraft, 
    handleCancelPublication 
  } = useApiOperationHandlers();

  const { handlePublishClick, DuplicateDialog } = useDuplicateDetectionHandler({
    isProcessing,
    setIsProcessing,
    onPublishApi
  });

  const { handleConfigureApi, handleViewAnalytics, ApiDialogs } = useApiDialogManager();

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
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{title}</h3>

        <ApiSectionState
          apis={apis}
          type={type}
          title={title}
          icon={icon}
          isProcessing={isProcessing}
          onPublish={type === 'internal' ? handlePublishClick : undefined}
          onConfigure={handleConfigureApi}
          onViewAnalytics={handleViewAnalytics}
          onRevertToDraft={handleRevertToDraft}
          onCancelPublication={handleCancelPublication}
          onStatusUpdate={handleStatusUpdate}
          onViewDetails={onViewDetails}
          isUpdatingStatus={isUpdatingStatus}
        />
      </div>

      <DuplicateDialog />
      <ApiDialogs />
    </>
  );
};
