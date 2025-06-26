
/**
 * Hook for managing external API publishing workflow
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { externalApiPublishingWorkflow, PublishingWorkflowConfig } from '@/utils/api/ExternalApiPublishingWorkflow';

export const useExternalApiPublishing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDraftMutation = useMutation({
    mutationFn: async ({ internalApiId, config }: {
      internalApiId: string;
      config: PublishingWorkflowConfig;
    }) => {
      return await externalApiPublishingWorkflow.createDraft(internalApiId, config);
    },
    onSuccess: (result) => {
      console.log('✅ Draft creation result:', result);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      
      toast({
        title: result.success ? "Draft Created" : "Draft Creation Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('❌ Draft creation failed:', error);
      toast({
        title: "Draft Creation Failed",
        description: error.message || "Failed to create draft API.",
        variant: "destructive",
      });
    }
  });

  const moveToReviewMutation = useMutation({
    mutationFn: async (externalApiId: string) => {
      return await externalApiPublishingWorkflow.moveToReview(externalApiId);
    },
    onSuccess: (result) => {
      console.log('✅ Move to review result:', result);
      
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      
      toast({
        title: result.success ? "Moved to Review" : "Move to Review Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('❌ Move to review failed:', error);
      toast({
        title: "Move to Review Failed",
        description: error.message || "Failed to move API to review.",
        variant: "destructive",
      });
    }
  });

  const publishApiMutation = useMutation({
    mutationFn: async (externalApiId: string) => {
      return await externalApiPublishingWorkflow.publishApi(externalApiId);
    },
    onSuccess: (result) => {
      console.log('✅ Publish API result:', result);
      
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      
      toast({
        title: result.success ? "API Published" : "Publishing Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('❌ API publishing failed:', error);
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish API.",
        variant: "destructive",
      });
    }
  });

  const completeWorkflowMutation = useMutation({
    mutationFn: async ({ internalApiId, config }: {
      internalApiId: string;
      config: PublishingWorkflowConfig;
    }) => {
      return await externalApiPublishingWorkflow.completePublishingWorkflow(internalApiId, config);
    },
    onSuccess: (result) => {
      console.log('✅ Complete workflow result:', result);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      
      toast({
        title: result.success ? "API Published Successfully" : "Publishing Workflow Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('❌ Complete workflow failed:', error);
      toast({
        title: "Publishing Workflow Failed",
        description: error.message || "Failed to complete publishing workflow.",
        variant: "destructive",
      });
    }
  });

  return {
    // Individual workflow steps
    createDraft: createDraftMutation.mutate,
    isCreatingDraft: createDraftMutation.isPending,
    
    moveToReview: moveToReviewMutation.mutate,
    isMovingToReview: moveToReviewMutation.isPending,
    
    publishApi: publishApiMutation.mutate,
    isPublishing: publishApiMutation.isPending,
    
    // Complete workflow
    completeWorkflow: completeWorkflowMutation.mutate,
    isCompletingWorkflow: completeWorkflowMutation.isPending,
    
    // Status checks
    isAnyActionPending: (
      createDraftMutation.isPending ||
      moveToReviewMutation.isPending ||
      publishApiMutation.isPending ||
      completeWorkflowMutation.isPending
    )
  };
};
