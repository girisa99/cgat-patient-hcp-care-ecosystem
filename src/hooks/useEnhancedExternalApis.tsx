
/**
 * Enhanced External APIs Hook with Real-time Sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { externalApiSyncManager } from '@/utils/api/ExternalApiSyncManager';
import { useExternalApis } from './useExternalApis';

export const useEnhancedExternalApis = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const baseHook = useExternalApis();

  // Enhanced publish mutation with full sync
  const publishWithSyncMutation = useMutation({
    mutationFn: async ({ internalApiId, config }: {
      internalApiId: string;
      config: any;
    }) => {
      console.log('🚀 Enhanced publishing with sync:', { internalApiId, config });
      return await externalApiSyncManager.publishWithFullSync(internalApiId, config);
    },
    onSuccess: (data) => {
      console.log('✅ Enhanced API published successfully:', data);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      
      toast({
        title: "API Published with Full Sync",
        description: `Your API has been published with ${data.synced_endpoints_count} endpoints synchronized.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Enhanced API publishing failed:', error);
      toast({
        title: "Enhanced Publishing Failed",
        description: error.message || "Failed to publish API with sync. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Query for sync status
  const useSyncStatus = (externalApiId: string) => {
    return useQuery({
      queryKey: ['external-api-sync-status', externalApiId],
      queryFn: () => externalApiSyncManager.getSyncStatus(externalApiId),
      enabled: !!externalApiId,
      staleTime: 30000
    });
  };

  return {
    // Include all base functionality
    ...baseHook,
    
    // Enhanced publishing with sync
    publishWithSync: publishWithSyncMutation.mutate,
    isPublishingWithSync: publishWithSyncMutation.isPending,
    
    // Add the missing isLoadingPublished property
    isLoadingPublished: baseHook.isLoading,
    
    // Sync status utilities
    useSyncStatus
  };
};
