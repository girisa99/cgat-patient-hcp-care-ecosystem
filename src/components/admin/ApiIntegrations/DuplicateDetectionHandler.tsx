
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import { DuplicateDetectionDialog } from './DuplicateDetectionDialog';

interface DuplicateDetectionHandlerProps {
  isProcessing: string | null;
  setIsProcessing: (value: string | null) => void;
  onPublishApi?: (apiId: string, apiName: string) => void;
}

export const useDuplicateDetectionHandler = ({
  isProcessing,
  setIsProcessing,
  onPublishApi
}: DuplicateDetectionHandlerProps) => {
  const { toast } = useToast();
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState<boolean>(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

  const handlePublishClick = async (api: any) => {
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

  const DuplicateDialog = () => (
    <DuplicateDetectionDialog
      isOpen={isDuplicateDialogOpen}
      onOpenChange={setIsDuplicateDialogOpen}
      duplicateInfo={duplicateInfo}
      isProcessing={isProcessing}
      onSyncEndpoints={handleDuplicateSync}
      onForceRepublish={handleForceRepublish}
    />
  );

  return {
    handlePublishClick,
    DuplicateDialog
  };
};
