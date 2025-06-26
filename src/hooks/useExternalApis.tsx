
/**
 * Hook for managing external API publishing and marketplace functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { externalApiManager, ExternalApiRegistry, DeveloperPortalApplication, MarketplaceListing } from '@/utils/api/ExternalApiManager';

export const useExternalApis = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: externalApis,
    isLoading: isLoadingExternalApis
  } = useQuery({
    queryKey: ['external-apis'],
    queryFn: () => externalApiManager.getExternalApis(),
    staleTime: 30000
  });

  const {
    data: publishedApis,
    isLoading: isLoadingPublishedApis
  } = useQuery({
    queryKey: ['published-external-apis'],
    queryFn: () => externalApiManager.getPublishedExternalApis(),
    staleTime: 60000
  });

  const {
    data: developerApplications,
    isLoading: isLoadingApplications
  } = useQuery({
    queryKey: ['developer-applications'],
    queryFn: () => externalApiManager.getDeveloperApplications(),
    staleTime: 30000
  });

  const {
    data: marketplaceListings,
    isLoading: isLoadingListings
  } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => externalApiManager.getMarketplaceListings(),
    staleTime: 60000
  });

  const {
    data: marketplaceStats
  } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: () => externalApiManager.getMarketplaceStats(),
    staleTime: 300000 // 5 minutes
  });

  const publishApiMutation = useMutation({
    mutationFn: async ({ internalApiId, config }: {
      internalApiId: string;
      config: Omit<ExternalApiRegistry, 'id' | 'internal_api_id' | 'created_at' | 'updated_at' | 'created_by'>;
    }) => {
      return await externalApiManager.publishInternalApi(internalApiId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      toast({
        title: "API Published",
        description: "Your internal API has been successfully published as an external API.",
      });
    },
    onError: (error: any) => {
      console.error('API publishing failed:', error);
      toast({
        title: "Publishing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (application: Omit<DeveloperPortalApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      return await externalApiManager.submitDeveloperApplication(application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-applications'] });
      toast({
        title: "Application Submitted",
        description: "Your developer application has been submitted for review.",
      });
    },
    onError: (error: any) => {
      console.error('Application submission failed:', error);
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const reviewApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, decision, notes }: {
      applicationId: string;
      decision: 'approved' | 'rejected';
      notes?: string;
    }) => {
      return await externalApiManager.reviewDeveloperApplication(applicationId, decision, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-applications'] });
      toast({
        title: "Application Reviewed",
        description: "Developer application has been reviewed successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Application review failed:', error);
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateApiStatusMutation = useMutation({
    mutationFn: async ({ externalApiId, status }: {
      externalApiId: string;
      status: ExternalApiRegistry['status'];
    }) => {
      return await externalApiManager.updateExternalApiStatus(externalApiId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-apis'] });
      queryClient.invalidateQueries({ queryKey: ['published-external-apis'] });
      toast({
        title: "Status Updated",
        description: "External API status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Status update failed:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createListingMutation = useMutation({
    mutationFn: async (listing: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>) => {
      return await externalApiManager.createMarketplaceListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      toast({
        title: "Listing Created",
        description: "Marketplace listing has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Listing creation failed:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    externalApis: externalApis || [],
    publishedApis: publishedApis || [],
    developerApplications: developerApplications || [],
    marketplaceListings: marketplaceListings || [],
    marketplaceStats,

    // Loading states
    isLoadingExternalApis,
    isLoadingPublishedApis,
    isLoadingApplications,
    isLoadingListings,

    // Mutations
    publishApi: publishApiMutation.mutate,
    isPublishing: publishApiMutation.isPending,
    
    submitApplication: submitApplicationMutation.mutate,
    isSubmittingApplication: submitApplicationMutation.isPending,
    
    reviewApplication: reviewApplicationMutation.mutate,
    isReviewingApplication: reviewApplicationMutation.isPending,
    
    updateApiStatus: updateApiStatusMutation.mutate,
    isUpdatingStatus: updateApiStatusMutation.isPending,
    
    createListing: createListingMutation.mutate,
    isCreatingListing: createListingMutation.isPending
  };
};
