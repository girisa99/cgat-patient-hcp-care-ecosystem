
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';

export const useApiOperationHandlers = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

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

  return {
    isProcessing,
    setIsProcessing,
    handleRevertToDraft,
    handleCancelPublication
  };
};
